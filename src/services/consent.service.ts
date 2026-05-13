import { ConsentRecord, TwilioWebhookBody, UserProfile } from '../types';
import auditService from './audit.service';
import messageTemplates from './message-template.service';
import userStoreService from './user-store.service';
import { randomUUID } from 'crypto';

export type InboundCommand =
  | 'opt_out'
  | 'opt_in'
  | 'help'
  | 'handoff'
  | 'none';

const optOutKeywords = new Set([
  'STOP',
  'STOPALL',
  'UNSUBSCRIBE',
  'CANCEL',
  'END',
  'QUIT',
  'REVOKE',
  'OPTOUT'
]);

const optInKeywords = new Set(['START', 'YES', 'UNSTOP']);
const helpKeywords = new Set(['HELP', 'INFO']);
const handoffKeywords = new Set(['AGENT', 'SUPPORT', 'HUMAN', 'PERSON']);

class ConsentService {
  classify(body: string, optOutType?: TwilioWebhookBody['OptOutType']): InboundCommand {
    if (optOutType === 'STOP') {
      return 'opt_out';
    }

    if (optOutType === 'START') {
      return 'opt_in';
    }

    if (optOutType === 'HELP') {
      return 'help';
    }

    const normalized = this.normalize(body);

    if (optOutKeywords.has(normalized)) {
      return 'opt_out';
    }

    if (optInKeywords.has(normalized)) {
      return 'opt_in';
    }

    if (helpKeywords.has(normalized)) {
      return 'help';
    }

    if (handoffKeywords.has(normalized) || normalized.includes('TALK TO A PERSON')) {
      return 'handoff';
    }

    return 'none';
  }

  ensurePendingOptIn(phoneNumber: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);

    if (user.consentStatus === 'unknown') {
      user.consentStatus = 'pending_opt_in';
      user.flowStage = 'not_started';
      userStoreService.saveUser(user);
      this.recordConsent(phoneNumber, 'pending_opt_in', undefined, messageSid);
      auditService.record(phoneNumber, 'consent_prompted', messageSid);
    }

    return user;
  }

  optIn(phoneNumber: string, keyword: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    user.consentStatus = 'opted_in';
    user.flowStage = 'awaiting_language';
    user.handoffRequested = false;
    user.conversationState = {
      latestPresentedJobIds: []
    };
    userStoreService.saveUser(user);
    this.recordConsent(phoneNumber, 'opt_in', this.normalize(keyword), messageSid);
    auditService.record(phoneNumber, 'opted_in', messageSid);
    return user;
  }

  optOut(phoneNumber: string, keyword: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    user.consentStatus = 'opted_out';
    user.flowStage = 'not_started';
    user.handoffRequested = false;
    user.conversationState = {
      latestPresentedJobIds: []
    };
    userStoreService.saveUser(user);
    this.recordConsent(phoneNumber, 'opt_out', this.normalize(keyword), messageSid);
    auditService.record(phoneNumber, 'opted_out', messageSid);
    return user;
  }

  help(phoneNumber: string, messageSid?: string): void {
    this.recordConsent(phoneNumber, 'help', 'HELP', messageSid);
    auditService.record(phoneNumber, 'help_requested', messageSid);
  }

  handoff(phoneNumber: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    user.handoffRequested = true;
    user.flowStage = 'handoff_requested';
    userStoreService.saveUser(user);
    this.recordConsent(phoneNumber, 'handoff', 'AGENT', messageSid);
    auditService.record(phoneNumber, 'handoff_requested', messageSid);
    return user;
  }

  canReceiveApplicationMessage(user: UserProfile): boolean {
    return user.consentStatus === 'opted_in';
  }

  responseFor(command: Exclude<InboundCommand, 'none'>): string {
    if (command === 'opt_in') {
      return messageTemplates.optInConfirmation();
    }

    if (command === 'opt_out') {
      return messageTemplates.optOutConfirmation();
    }

    if (command === 'help') {
      return messageTemplates.help();
    }

    return messageTemplates.handoff();
  }

  normalize(body: string): string {
    return body.trim().replace(/\s+/g, ' ').toUpperCase();
  }

  private recordConsent(
    phoneNumber: string,
    type: ConsentRecord['type'],
    keyword?: string,
    messageSid?: string
  ): void {
    userStoreService.recordConsent({
      id: randomUUID(),
      phoneNumber,
      type,
      keyword,
      messageSid,
      source: 'webhook',
      createdAt: new Date().toISOString()
    });
  }
}

export default new ConsentService();
