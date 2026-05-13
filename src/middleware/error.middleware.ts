/**
 * Error Handling Middleware
 * Global error handler for Express application
 * Logs errors and returns appropriate responses
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 * Must be registered AFTER all routes
 *
 * IMPORTANT: For webhook endpoints, always return 200 to prevent
 * Twilio from retrying and creating retry storms
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with full context
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // For webhook endpoints, return 200 to prevent retries
  if (req.path.includes('/webhook')) {
    logger.info('Returning 200 for webhook error to prevent retries');
    res.status(200).send();
    return;
  }

  // For other endpoints, return appropriate error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

/**
 * 404 Not Found handler
 * Should be registered before the error handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
}
