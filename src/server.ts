/**
 * Express Server Configuration
 * Sets up Express application with routes, middleware, and error handling
 */

import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { validateTwilioSignature } from './middleware/twilio-signature.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { handleIncomingMessage } from './handlers/webhook.handler';
import { brandTokens } from './content/brand';
import { getRcsAsset, listRcsAssetMetadata } from './content/rcs-assets';
import { staticPages } from './content/static-pages';
import geminiService from './services/gemini.service';
import logger from './utils/logger';

/**
 * Create and configure Express application
 */
export function createServer(): Express {
  const app = express();
  app.set('trust proxy', true);

  // Body parser middleware
  // Use urlencoded for Twilio webhooks (application/x-www-form-urlencoded)
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );

  // JSON body parser for other endpoints
  app.use(bodyParser.json());

  // Log all incoming requests in development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      logger.debug('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: 'Twilio SMS/RCS Local Hiring Demo',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        webhook: '/webhook/sms',
        privacy: '/privacy',
        terms: '/terms',
        trustSafety: '/trust-safety',
        support: '/support',
        consentInfo: '/consent-info',
        demoGuide: '/demo-guide',
        rcsAssets: brandTokens.rcs.assetPath,
        geminiStatus: '/gemini/status'
      }
    });
  });

  app.get(brandTokens.rcs.assetPath, (req, res) => {
    res.json({
      senderAccent: brandTokens.rcs.senderAccent,
      assets: listRcsAssetMetadata()
    });
  });

  app.get(`${brandTokens.rcs.assetPath}/:fileName`, (req, res, next) => {
    const asset = getRcsAsset(req.params.fileName);

    if (!asset) {
      next();
      return;
    }

    res.setHeader('Content-Type', asset.contentType);
    res.setHeader('Content-Length', asset.buffer.length.toString());
    res.setHeader('Content-Disposition', `inline; filename="${asset.fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(asset.buffer);
  });

  app.get('/gemini/status', (req, res) => {
    res.json({
      configured: geminiService.isConfigured(),
      model: geminiService.getModel(),
      usage: 'available for constrained demo assistance; not used for consent or action routing'
    });
  });

  app.get('/privacy', (req, res) => res.type('html').send(staticPages.privacy));
  app.get('/terms', (req, res) => res.type('html').send(staticPages.terms));
  app.get('/trust-safety', (req, res) => res.type('html').send(staticPages.trustSafety));
  app.get('/support', (req, res) => res.type('html').send(staticPages.support));
  app.get('/consent-info', (req, res) => res.type('html').send(staticPages.consentInfo));
  app.get('/demo-guide', (req, res) => res.type('html').send(staticPages.demoGuide));

  // Twilio webhook endpoint
  // Note: In development, you may want to disable signature validation
  // for local testing. Set DISABLE_SIGNATURE_VALIDATION=true in .env
  if (process.env.DISABLE_SIGNATURE_VALIDATION === 'true') {
    logger.warn('Twilio signature validation is DISABLED');
    app.post('/webhook/sms', handleIncomingMessage);
  } else {
    app.post('/webhook/sms', validateTwilioSignature, handleIncomingMessage);
  }

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
