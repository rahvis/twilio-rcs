/**
 * Environment configuration validation
 * Validates and exports typed environment variables
 * Fails fast on startup if required variables are missing
 */

import dotenv from 'dotenv';
import { Environment } from '../types';
import logger from '../utils/logger';

// Load .env file
dotenv.config();

/**
 * Validates a required environment variable
 * Throws error if missing
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Gets optional environment variable with default value
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function normalizeBaseUrl(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, '');
}

/**
 * Validate and export environment configuration
 */
export function validateEnvironment(): Environment {
  try {
    const port = parseInt(getEnv('PORT', '3000'), 10);
    const appBaseUrl = normalizeBaseUrl(
      process.env.APP_BASE_URL
        || process.env.RAILWAY_PUBLIC_DOMAIN
        || process.env.RCS_ASSET_BASE_URL
        || `http://localhost:${port}`
    );

    const config: Environment = {
      // Server
      PORT: port,
      NODE_ENV: (getEnv('NODE_ENV', 'development') as 'development' | 'production'),

      // Twilio
      TWILIO_ACCOUNT_SID: requireEnv('TWILIO_ACCOUNT_SID'),
      TWILIO_AUTH_TOKEN: requireEnv('TWILIO_AUTH_TOKEN'),
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
      RCS_CONTENT_CONSENT_SID: process.env.RCS_CONTENT_CONSENT_SID,
      RCS_CONTENT_LANGUAGE_SID: process.env.RCS_CONTENT_LANGUAGE_SID,
      RCS_CONTENT_ROLE_SID: process.env.RCS_CONTENT_ROLE_SID,
      RCS_CONTENT_LOCATION_SID: process.env.RCS_CONTENT_LOCATION_SID,
      RCS_CONTENT_SHIFT_SID: process.env.RCS_CONTENT_SHIFT_SID,
      RCS_CONTENT_JOBS_CAROUSEL_SID: process.env.RCS_CONTENT_JOBS_CAROUSEL_SID,
      RCS_CONTENT_ACTIONS_SID: process.env.RCS_CONTENT_ACTIONS_SID,
      RCS_CONTENT_APPLY_FOLLOWUP_SID: process.env.RCS_CONTENT_APPLY_FOLLOWUP_SID,
      RCS_CONTENT_APPLY_CLOSING_SID: process.env.RCS_CONTENT_APPLY_CLOSING_SID,
      RCS_CONTENT_HELP_SID: process.env.RCS_CONTENT_HELP_SID,
      RCS_CONTENT_HANDOFF_SID: process.env.RCS_CONTENT_HANDOFF_SID,

      // Gemini is optional for the deterministic approval demo.
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: getEnv('GEMINI_MODEL', 'gemini-3-pro-preview'),

      // Optional
      LOG_LEVEL: getEnv('LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug',
      MAX_IMAGE_SIZE_MB: parseInt(getEnv('MAX_IMAGE_SIZE_MB', '20'), 10),
      DATA_DIR: getEnv('DATA_DIR', 'data'),
      SUPPORT_EMAIL: getEnv('SUPPORT_EMAIL', 'help@workonward.com'),
      BRAND_NAME: getEnv('BRAND_NAME', 'WorkOnward'),
      APP_BASE_URL: appBaseUrl,
      PUBLIC_BASE_URL: getEnv('PUBLIC_BASE_URL', 'https://workonward.com')
    };

    // Validate Twilio Account SID format
    if (!config.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      throw new Error('Invalid TWILIO_ACCOUNT_SID format (should start with AC)');
    }

    // Require either messaging service SID or phone number
    if (!config.TWILIO_MESSAGING_SERVICE_SID && !config.TWILIO_PHONE_NUMBER) {
      throw new Error('Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER must be set');
    }

    // Validate messaging service SID format if provided
    if (config.TWILIO_MESSAGING_SERVICE_SID && !config.TWILIO_MESSAGING_SERVICE_SID.startsWith('MG')) {
      throw new Error('Invalid TWILIO_MESSAGING_SERVICE_SID format (should start with MG)');
    }

    // Validate phone number format if provided (basic check for E.164)
    if (config.TWILIO_PHONE_NUMBER && !config.TWILIO_PHONE_NUMBER.startsWith('+')) {
      throw new Error('TWILIO_PHONE_NUMBER must be in E.164 format (e.g., +1234567890)');
    }

    // Log successful configuration (mask sensitive data)
    logger.info('Environment configuration validated successfully', {
      PORT: config.PORT,
      NODE_ENV: config.NODE_ENV,
      LOG_LEVEL: config.LOG_LEVEL,
      TWILIO_MESSAGING_SERVICE_SID: config.TWILIO_MESSAGING_SERVICE_SID || 'not set',
      TWILIO_PHONE_NUMBER: config.TWILIO_PHONE_NUMBER || 'not set',
      MAX_IMAGE_SIZE_MB: config.MAX_IMAGE_SIZE_MB,
      DATA_DIR: config.DATA_DIR,
      SUPPORT_EMAIL: config.SUPPORT_EMAIL,
      BRAND_NAME: config.BRAND_NAME,
      APP_BASE_URL: config.APP_BASE_URL,
      PUBLIC_BASE_URL: config.PUBLIC_BASE_URL,
      GEMINI_MODEL: config.GEMINI_MODEL,
      geminiConfigured: !!config.GEMINI_API_KEY,
      richContentConfigured: {
        consent: !!config.RCS_CONTENT_CONSENT_SID,
        language: !!config.RCS_CONTENT_LANGUAGE_SID,
        role: !!config.RCS_CONTENT_ROLE_SID,
        location: !!config.RCS_CONTENT_LOCATION_SID,
        shift: !!config.RCS_CONTENT_SHIFT_SID,
        jobsCarousel: !!config.RCS_CONTENT_JOBS_CAROUSEL_SID,
        actions: !!config.RCS_CONTENT_ACTIONS_SID,
        applyFollowup: !!config.RCS_CONTENT_APPLY_FOLLOWUP_SID,
        applyClosing: !!config.RCS_CONTENT_APPLY_CLOSING_SID
      },
      sendingMethod: config.TWILIO_MESSAGING_SERVICE_SID ? 'Messaging Service (recommended)' : 'Phone Number'
    });

    return config;
  } catch (error) {
    logger.error('Environment validation failed', { error });
    throw error;
  }
}

// Export singleton instance
let envConfig: Environment | null = null;

export function getConfig(): Environment {
  if (!envConfig) {
    envConfig = validateEnvironment();
  }
  return envConfig;
}
