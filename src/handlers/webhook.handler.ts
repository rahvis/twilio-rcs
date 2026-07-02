/**
 * Webhook Handler
 * Processes inbound Twilio SMS/RCS messages with deterministic consent routing.
 */

import { Request, Response } from 'express';
import { DemoTemplateKey, TwilioWebhookBody } from '../types';
import auditService from '../services/audit.service';
import candidateFlowService from '../services/candidate-flow.service';
import consentService from '../services/consent.service';
import demoChoiceService from '../services/demo-choice.service';
import messageTemplates from '../services/message-template.service';
import sessionService from '../services/session.service';
import twilioService from '../services/twilio.service';
import userStoreService from '../services/user-store.service';
import logger, { maskPhoneNumber, maskSensitiveData } from '../utils/logger';

/**
 * Handle incoming SMS/RCS/MMS message from Twilio.
 *
 * Approval-critical routing order:
 * 1. Opt-out keywords
 * 2. Help keywords
 * 3. Opt-in/restart keywords
 * 4. Human support keywords
 * 5. Consent gate
 * 6. Candidate hiring flow
 */
export async function handleIncomingMessage(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();

  try {
    const body = req.body as TwilioWebhookBody;
    const { From, To, Body: rawMessageBody = '', NumMedia } = body;
    const messageBody = demoChoiceService.getInboundText(body);

    logger.info('Received webhook', {
      from: maskPhoneNumber(From),
      to: maskPhoneNumber(To),
      bodyLength: rawMessageBody.length,
      numMedia: NumMedia,
      messageSid: body.MessageSid,
      optOutType: body.OptOutType,
      buttonPayload: body.ButtonPayload
    });

    if (!From) {
      logger.warn('Missing From field in webhook', {
        body: maskSensitiveData(req.body)
      });
      res.status(200).send();
      return;
    }

    const user = userStoreService.markInbound(From);
    const command = consentService.classify(messageBody, body.OptOutType);

    if (command === 'opt_out') {
      consentService.optOut(From, messageBody, body.MessageSid);
      sessionService.deleteSession(From);
      await userStoreService.flush();
      auditService.record(From, 'twilio_opt_out_response_owned', body.MessageSid, {
        category: 'opt_out'
      });
      res.status(200).send();
      return;
    }

    if (command === 'help') {
      consentService.help(From, body.MessageSid);
      await userStoreService.flush();
      await sendKeywordResponseIfNeeded(
        From,
        messageTemplates.help(),
        'help',
        body.MessageSid,
        body.OptOutType
      );
      res.status(200).send();
      return;
    }

    if (command === 'opt_in') {
      const wasOptedOut = user.consentStatus === 'opted_out';
      consentService.startCategoryOptIn(From, messageBody, body.MessageSid);
      await userStoreService.flush();

      if (body.OptOutType === 'START' && wasOptedOut) {
        auditService.record(From, 'twilio_keyword_response_used', body.MessageSid, {
          category: 'category_opt_in_prompt',
          optOutType: body.OptOutType
        });
        res.status(200).send();
        return;
      }

      await sendResponse(
        From,
        messageTemplates.consentPrompt(),
        'category_opt_in_prompt',
        body.MessageSid,
        'consent'
      );
      res.status(200).send();
      return;
    }

    const categoryDecision = consentService.parseCategoryDecision(messageBody, body.ButtonPayload);
    if (categoryDecision) {
      const result = consentService.applyCategoryDecision(From, categoryDecision, body.MessageSid);
      await userStoreService.flush();
      await sendResponse(From, result.response, result.category, body.MessageSid, result.templateKey);
      res.status(200).send();
      return;
    }
    if (command === 'handoff') {
      consentService.handoff(From, body.MessageSid);
      await userStoreService.flush();
      await sendResponse(From, messageTemplates.handoff(), 'handoff', body.MessageSid, 'handoff');
      res.status(200).send();
      return;
    }

    if (user.consentStatus === 'unknown' || user.consentStatus === 'pending_opt_in') {
      consentService.ensurePendingOptIn(From, body.MessageSid);
      await userStoreService.flush();
      await sendResponse(From, messageTemplates.consentPrompt(), 'consent_prompt', body.MessageSid, 'consent');
      res.status(200).send();
      return;
    }

    if (user.consentStatus === 'opted_out') {
      auditService.record(From, 'inbound_ignored_after_opt_out', body.MessageSid);
      logger.info('Ignored inbound message from opted-out user', {
        from: maskPhoneNumber(From)
      });
      res.status(200).send();
      return;
    }

    const flowResult = candidateFlowService.handleMessage(user, messageBody, body.MessageSid);
    await sendResponse(From, flowResult.response, flowResult.category, body.MessageSid, flowResult.templateKey);

    logger.info('Successfully processed message', {
      from: maskPhoneNumber(From),
      durationMs: Date.now() - startTime,
      category: flowResult.category,
      responseLength: flowResult.response.length
    });

    res.status(200).send();
  } catch (error) {
    logger.error('Unhandled error in webhook handler', {
      error,
      body: maskSensitiveData(req.body)
    });

    res.status(200).send();
  }
}

async function sendResponse(
  to: string,
  message: string,
  category: string,
  messageSid?: string,
  templateKey?: DemoTemplateKey
): Promise<void> {
  try {
    await twilioService.sendDemoMessage(to, message, templateKey);
    userStoreService.markOutbound(to);
    auditService.record(to, 'outbound_sent', messageSid, {
      category,
      messageLength: message.length
    });
  } catch (error) {
    auditService.record(to, 'outbound_failed', messageSid, {
      category
    });
    logger.error('Failed to send RCS/SMS response', {
      to: maskPhoneNumber(to),
      category,
      error
    });
  }
}

async function sendKeywordResponseIfNeeded(
  to: string,
  message: string,
  category: string,
  messageSid?: string,
  optOutType?: TwilioWebhookBody['OptOutType'],
  templateKey?: DemoTemplateKey
): Promise<void> {
  if (optOutType) {
    auditService.record(to, 'twilio_keyword_response_used', messageSid, {
      category,
      optOutType
    });
    return;
  }

  await sendResponse(to, message, category, messageSid, templateKey);
}
