/**
 * Application Entry Point
 * Initializes environment, services, and starts Express server
 */

import { Server } from 'http';
import { getConfig } from './config/environment';
import { createServer } from './server';
import logger from './utils/logger';

/**
 * Main application function
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting Twilio SMS/RCS local hiring demo application');

    // Load and validate environment
    const config = getConfig();

    logger.info('Environment configuration loaded', {
      nodeEnv: config.NODE_ENV,
      port: config.PORT
    });

    // Create Express server
    const app = createServer();

    // Start listening
    const server = app.listen(config.PORT, () => {
      logger.info('Server started successfully', {
        port: config.PORT,
        environment: config.NODE_ENV,
        webhookUrl: `${config.APP_BASE_URL}/webhook/sms`,
        healthCheck: `${config.APP_BASE_URL}/health`,
        localHealthCheck: `http://localhost:${config.PORT}/health`
      });

      logger.info('Ready to receive messages');
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      server.close(() => {
        logger.info('HTTP server closed');

        // Additional cleanup if needed
        // e.g., close database connections, flush logs, etc.

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason,
        promise
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });

      // Exit after logging
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start application', {
      error
    });
    process.exit(1);
  }
}

// Start the application
main();
