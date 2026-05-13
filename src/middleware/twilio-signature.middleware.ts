/**
 * Twilio Signature Validation Middleware
 * Validates that webhook requests are actually from Twilio
 * Prevents unauthorized requests to the webhook endpoint
 */

import { Request, Response, NextFunction } from 'express';
import twilioService from '../services/twilio.service';
import logger from '../utils/logger';

/**
 * Middleware to validate Twilio webhook signatures
 * Should be applied to all Twilio webhook endpoints
 */
export function validateTwilioSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get signature from header
    const signature = req.headers['x-twilio-signature'] as string;

    if (!signature) {
      logger.warn('Missing Twilio signature header', {
        path: req.path,
        ip: req.ip
      });

      res.status(403).json({ error: 'Forbidden: Missing signature' });
      return;
    }

    // Reconstruct full URL
    // Important: Must include protocol, host, and full path
    const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
    const protocol = forwardedProto || req.protocol;
    const host = forwardedHost || req.get('host');
    const url = `${protocol}://${host}${req.originalUrl}`;

    // Validate signature
    const isValid = twilioService.validateSignature(
      signature,
      url,
      req.body
    );

    if (!isValid) {
      logger.warn('Invalid Twilio signature', {
        url,
        path: req.path,
        ip: req.ip
      });

      res.status(403).json({ error: 'Forbidden: Invalid signature' });
      return;
    }

    // Signature is valid, continue to handler
    logger.debug('Twilio signature validated', { path: req.path });
    next();
  } catch (error) {
    logger.error('Error in signature validation middleware', {
      error,
      path: req.path
    });

    res.status(500).json({ error: 'Internal server error' });
  }
}
