/**
 * Media Handler Utility
 * Downloads and processes MMS/RCS media from Twilio.
 * The deterministic approval demo does not route media into AI by default.
 */

import axios from 'axios';
import twilio from 'twilio';
import { getConfig } from '../config/environment';
import logger from './logger';
import { ProcessedMedia } from '../types';

class MediaHandler {
  private twilioClient: twilio.Twilio;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private maxImageSizeBytes: number;

  constructor() {
    const config = getConfig();
    this.twilioAccountSid = config.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = config.TWILIO_AUTH_TOKEN;
    this.maxImageSizeBytes = config.MAX_IMAGE_SIZE_MB * 1024 * 1024;

    this.twilioClient = twilio(
      config.TWILIO_ACCOUNT_SID,
      config.TWILIO_AUTH_TOKEN
    );

    logger.info('Media handler initialized', {
      maxImageSizeMB: config.MAX_IMAGE_SIZE_MB
    });
  }

  /**
   * Download media from Twilio using SDK with retry logic
   * Handles timing issues where media isn't immediately available
   */
  async downloadMedia(mediaUrl: string, messageSid: string, mediaSid: string): Promise<Buffer> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug('Downloading media', { mediaUrl, attempt });

        // Use Twilio SDK to fetch media (better handling than direct HTTP)
        const mediaInstance = await this.twilioClient
          .messages(messageSid)
          .media(mediaSid)
          .fetch();

        // Now download the actual content using the SDK's URI
        const contentUrl = `https://api.twilio.com${mediaInstance.uri.replace('.json', '')}`;

        const response = await axios.get(contentUrl, {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken
          },
          responseType: 'arraybuffer',
          timeout: 30000
        });

        const buffer = Buffer.from(response.data);

        logger.debug('Media downloaded successfully', {
          mediaUrl,
          sizeBytes: buffer.length,
          contentType: response.headers['content-type'],
          attempt
        });

        return buffer;
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries;

        logger.warn('Failed to download media', {
          mediaUrl,
          attempt,
          maxRetries,
          error: error.message,
          willRetry: !isLastAttempt
        });

        if (isLastAttempt) {
          logger.error('Failed to download media after all retries', {
            mediaUrl,
            error: error.message
          });
          throw new Error('Failed to download media');
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    throw new Error('Failed to download media');
  }

  /**
   * Validate image buffer
   * Checks size and format
   */
  validateImage(buffer: Buffer): { valid: boolean; error?: string } {
    // Check size
    if (buffer.length > this.maxImageSizeBytes) {
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      const maxMB = (this.maxImageSizeBytes / 1024 / 1024).toFixed(0);

      logger.warn('Image too large', {
        sizeMB,
        maxMB
      });

      return {
        valid: false,
        error: `Image too large (${sizeMB}MB). Maximum size is ${maxMB}MB.`
      };
    }

    // Check image format by magic numbers (file signatures)
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49;
    const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45;

    if (!isJPEG && !isPNG && !isGIF && !isWebP) {
      logger.warn('Unsupported image format', {
        firstBytes: buffer.slice(0, 4).toString('hex')
      });

      return {
        valid: false,
        error: 'Unsupported image format. Please send JPEG, PNG, GIF, or WebP images.'
      };
    }

    return { valid: true };
  }

  /**
   * Extract Message SID and Media SID from Twilio media URL
   * URL format: https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}/Media/{MediaSid}
   */
  private parseMediaUrl(mediaUrl: string): { messageSid: string; mediaSid: string } | null {
    try {
      const urlPattern = /Messages\/([^/]+)\/Media\/([^/]+)/;
      const match = mediaUrl.match(urlPattern);

      if (match && match[1] && match[2]) {
        return {
          messageSid: match[1],
          mediaSid: match[2]
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to parse media URL', { mediaUrl, error });
      return null;
    }
  }

  /**
   * Process media from Twilio webhook
   * Downloads and validates the media
   */
  async processMedia(
    mediaUrl: string,
    contentType: string
  ): Promise<ProcessedMedia> {
    try {
      // Only process images
      if (!contentType.startsWith('image/')) {
        logger.debug('Skipping non-image media', { contentType });

        return {
          originalUrl: mediaUrl,
          contentType,
          valid: false,
          error: 'Only images are supported'
        };
      }

      // Extract message SID and media SID from URL
      const parsedUrl = this.parseMediaUrl(mediaUrl);

      if (!parsedUrl) {
        logger.error('Failed to parse media URL', { mediaUrl });
        return {
          originalUrl: mediaUrl,
          contentType,
          valid: false,
          error: 'Invalid media URL format'
        };
      }

      // Download media with retry logic
      const buffer = await this.downloadMedia(
        mediaUrl,
        parsedUrl.messageSid,
        parsedUrl.mediaSid
      );

      // Validate image
      const validation = this.validateImage(buffer);

      if (!validation.valid) {
        return {
          originalUrl: mediaUrl,
          contentType,
          valid: false,
          error: validation.error
        };
      }

      return {
        originalUrl: mediaUrl,
        contentType,
        buffer,
        valid: true
      };
    } catch (error: any) {
      logger.error('Failed to process media', {
        mediaUrl,
        error: error.message
      });

      return {
        originalUrl: mediaUrl,
        contentType,
        valid: false,
        error: 'Failed to process media'
      };
    }
  }

  /**
   * Process multiple media items from webhook
   * Handles MediaUrl0, MediaUrl1, etc.
   */
  async processMultipleMedia(
    webhookBody: Record<string, any>,
    numMedia: number
  ): Promise<ProcessedMedia[]> {
    const results: ProcessedMedia[] = [];

    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = webhookBody[`MediaUrl${i}`];
      const contentType = webhookBody[`MediaContentType${i}`];

      if (!mediaUrl || !contentType) {
        logger.warn('Missing media URL or content type', { index: i });
        continue;
      }

      const result = await this.processMedia(mediaUrl, contentType);
      results.push(result);
    }

    return results;
  }
}

// Export singleton instance
export default new MediaHandler();
