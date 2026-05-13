/**
 * Winston logger configuration
 * Provides structured logging with appropriate formatting for development and production
 */

import winston from 'winston';

// Default log level (can be overridden by environment variable)
const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'twilio-sms-rcs-ai'
  },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              let msg = `${timestamp} [${level}]: ${message}`;

              // Add metadata if present
              const metaKeys = Object.keys(meta).filter(key => key !== 'service');
              if (metaKeys.length > 0) {
                msg += ` ${JSON.stringify(meta, null, 2)}`;
              }

              return msg;
            })
          )
    })
  ]
});

/**
 * Utility function to mask phone numbers for privacy
 * Converts +1234567890 to +123***7890
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 4) {
    return '***';
  }

  const start = phoneNumber.substring(0, Math.min(4, phoneNumber.length - 3));
  const end = phoneNumber.substring(phoneNumber.length - 3);
  return `${start}***${end}`;
}

/**
 * Utility function to mask sensitive data in objects for logging
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;

  const masked = { ...data };

  // Mask phone numbers
  if (masked.From) masked.From = maskPhoneNumber(masked.From);
  if (masked.To) masked.To = maskPhoneNumber(masked.To);
  if (masked.phoneNumber) masked.phoneNumber = maskPhoneNumber(masked.phoneNumber);

  // Remove sensitive tokens/keys
  if (masked.TWILIO_AUTH_TOKEN) masked.TWILIO_AUTH_TOKEN = '***';
  if (masked.GEMINI_API_KEY) masked.GEMINI_API_KEY = '***';

  // Truncate long message bodies (only log length in production)
  if (masked.Body && isProduction) {
    masked.Body = `[${masked.Body.length} chars]`;
  }

  return masked;
}

export default logger;
