/**
 * Twilio Service
 * Handles Twilio messaging operations including sending SMS/RCS
 * and webhook signature validation
 */

import twilio from 'twilio';
import { getConfig } from '../config/environment';
import { DemoTemplateKey } from '../types';
import logger, { maskPhoneNumber } from '../utils/logger';

const DEFAULT_RCS_CONSENT_CONTENT_SID = 'HXbbc88ded1e3da6aa68cb0eba9433a407';

class TwilioService {
  private client: twilio.Twilio;
  private messagingServiceSid?: string;
  private fromNumber?: string;
  private authToken: string;
  private contentSids: Partial<Record<DemoTemplateKey, string>>;

  constructor() {
    const config = getConfig();

    this.client = twilio(
      config.TWILIO_ACCOUNT_SID,
      config.TWILIO_AUTH_TOKEN
    );

    this.messagingServiceSid = config.TWILIO_MESSAGING_SERVICE_SID;
    this.fromNumber = config.TWILIO_PHONE_NUMBER;
    this.authToken = config.TWILIO_AUTH_TOKEN;
    this.contentSids = {
      consent: config.RCS_CONTENT_CONSENT_SID || DEFAULT_RCS_CONSENT_CONTENT_SID,
      language: config.RCS_CONTENT_LANGUAGE_SID,
      role: config.RCS_CONTENT_ROLE_SID,
      location: config.RCS_CONTENT_LOCATION_SID,
      shift: config.RCS_CONTENT_SHIFT_SID,
      jobsCarousel: config.RCS_CONTENT_JOBS_CAROUSEL_SID,
      actions: config.RCS_CONTENT_ACTIONS_SID,
      applyFollowup: config.RCS_CONTENT_APPLY_FOLLOWUP_SID,
      applyClosing: config.RCS_CONTENT_APPLY_CLOSING_SID,
      help: config.RCS_CONTENT_HELP_SID,
      handoff: config.RCS_CONTENT_HANDOFF_SID
    };

    logger.info('Twilio service initialized', {
      messagingServiceSid: this.messagingServiceSid || 'not configured',
      fromNumber: this.fromNumber || 'not configured',
      sendingMethod: this.messagingServiceSid ? 'Messaging Service' : 'Phone Number'
    });
  }

  /**
   * Send SMS/RCS message to a phone number
   * Uses Messaging Service SID if configured, otherwise falls back to phone number
   */
  async sendMessage(to: string, message: string): Promise<void> {
    await this.sendMessageInternal(to, {
      body: message
    });
  }

  async sendDemoMessage(
    to: string,
    fallbackText: string,
    templateKey?: DemoTemplateKey
  ): Promise<void> {
    const contentSid = templateKey ? this.contentSids[templateKey] : undefined;

    if (!contentSid) {
      await this.sendMessage(to, fallbackText);
      return;
    }

    await this.sendMessageInternal(to, {
      body: fallbackText,
      contentSid
    });
  }

  private async sendMessageInternal(
    to: string,
    content: { body: string; contentSid?: string }
  ): Promise<void> {
    try {
      // Build message parameters
      const messageParams: any = {
        to: to
      };

      if (content.contentSid) {
        messageParams.contentSid = content.contentSid;
      } else {
        messageParams.body = content.body;
      }

      // Prefer messaging service SID over phone number
      if (this.messagingServiceSid) {
        messageParams.messagingServiceSid = this.messagingServiceSid;
        logger.info('Sending message via Messaging Service', {
          to: maskPhoneNumber(to),
          messageLength: content.body.length,
          contentSid: content.contentSid,
          messagingServiceSid: this.messagingServiceSid
        });
      } else if (this.fromNumber) {
        messageParams.from = this.fromNumber;
        logger.info('Sending message via phone number', {
          to: maskPhoneNumber(to),
          messageLength: content.body.length,
          contentSid: content.contentSid,
          from: this.fromNumber
        });
      } else {
        throw new Error('No messaging service SID or phone number configured');
      }

      const result = await this.client.messages.create(messageParams);

      logger.info('Message sent successfully', {
        to: maskPhoneNumber(to),
        messageSid: result.sid,
        status: result.status,
        contentSid: content.contentSid,
        method: this.messagingServiceSid ? 'Messaging Service' : 'Phone Number'
      });
    } catch (error: any) {
      logger.error('Failed to send message', {
        to: maskPhoneNumber(to),
        error: error.message,
        code: error.code
      });

      // Retry once on failure
      try {
        logger.info('Retrying message send', {
          to: maskPhoneNumber(to)
        });

        const messageParams: any = {
          to: to
        };

        if (content.contentSid) {
          messageParams.contentSid = content.contentSid;
        } else {
          messageParams.body = content.body;
        }

        if (this.messagingServiceSid) {
          messageParams.messagingServiceSid = this.messagingServiceSid;
        } else if (this.fromNumber) {
          messageParams.from = this.fromNumber;
        }

        const result = await this.client.messages.create(messageParams);

        logger.info('Message sent on retry', {
          to: maskPhoneNumber(to),
          messageSid: result.sid
        });
      } catch (retryError: any) {
        logger.error('Failed to send message after retry', {
          to: maskPhoneNumber(to),
          error: retryError.message
        });

        throw new Error('Failed to send message after retry');
      }
    }
  }

  /**
   * Validate Twilio webhook signature
   * Ensures requests are actually from Twilio
   *
   * @param signature - X-Twilio-Signature header value
   * @param url - Full webhook URL (including protocol and host)
   * @param params - Request body parameters
   */
  validateSignature(
    signature: string,
    url: string,
    params: Record<string, any>
  ): boolean {
    try {
      const isValid = twilio.validateRequest(
        this.authToken,
        signature,
        url,
        params
      );

      if (!isValid) {
        logger.warn('Invalid Twilio signature', {
          url,
          hasSignature: !!signature
        });
      }

      return isValid;
    } catch (error) {
      logger.error('Error validating Twilio signature', {
        error,
        url
      });
      return false;
    }
  }
}

// Export singleton instance
export default new TwilioService();
