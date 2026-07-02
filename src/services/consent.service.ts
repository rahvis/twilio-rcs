import { ConsentRecord, DemoTemplateKey, OutboundDemoMessage, RcsCategoryKey, TwilioWebhookBody, UserProfile } from '../types';
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

export interface CategoryDecision {
  category: RcsCategoryKey;
  optedIn: boolean;
  decisionText: string;
}

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
const categoryOrder: RcsCategoryKey[] = ['applicationUpdates', 'jobMatches', 'recruitingOutreach'];
const categoryLabels: Record<RcsCategoryKey, string> = {
  applicationUpdates: 'application and interview updates',
  jobMatches: 'job matches and job alerts',
  recruitingOutreach: 'recruiting outreach'
};

function categoryDecision(category: RcsCategoryKey, optedIn: boolean): CategoryDecision {
  const action = optedIn ? 'opt in to' : 'not now for';
  return {
    category,
    optedIn,
    decisionText: `${action} ${categoryLabels[category]}`
  };
}

const categoryPayloads: Record<string, CategoryDecision> = {
  RCS_APPLICATION_UPDATES_OPT_IN: categoryDecision('applicationUpdates', true),
  RCS_APPLICATION_UPDATES_NOT_NOW: categoryDecision('applicationUpdates', false),
  RCS_JOB_MATCHES_OPT_IN: categoryDecision('jobMatches', true),
  RCS_JOB_MATCHES_NOT_NOW: categoryDecision('jobMatches', false),
  RCS_RECRUITING_OUTREACH_OPT_IN: categoryDecision('recruitingOutreach', true),
  RCS_RECRUITING_OUTREACH_NOT_NOW: categoryDecision('recruitingOutreach', false),
  OPT_IN_TO_APPLICATION_UPDATES: categoryDecision('applicationUpdates', true),
  NOT_NOW_FOR_APPLICATION_UPDATES: categoryDecision('applicationUpdates', false),
  OPT_IN_TO_JOB_MATCHES: categoryDecision('jobMatches', true),
  NOT_NOW_FOR_JOB_MATCHES: categoryDecision('jobMatches', false),
  OPT_IN_TO_RECRUITING_OUTREACH: categoryDecision('recruitingOutreach', true),
  NOT_NOW_FOR_RECRUITING_OUTREACH: categoryDecision('recruitingOutreach', false)
};

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
      user.flowStage = 'awaiting_category_opt_in';
      user.conversationState = {
        ...user.conversationState,
        rcsCategoryOptIns: {},
        latestPresentedJobIds: user.conversationState.latestPresentedJobIds || []
      };
      userStoreService.saveUser(user);
      this.recordConsent(phoneNumber, 'pending_opt_in', undefined, messageSid);
      auditService.record(phoneNumber, 'consent_prompted', messageSid);
    }

    return user;
  }

  startCategoryOptIn(phoneNumber: string, keyword: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    user.consentStatus = 'pending_opt_in';
    user.flowStage = 'awaiting_category_opt_in';
    user.handoffRequested = false;
    user.conversationState = {
      ...user.conversationState,
      rcsCategoryOptIns: {},
      latestPresentedJobIds: []
    };
    userStoreService.saveUser(user);
    this.recordConsent(phoneNumber, 'pending_opt_in', this.normalize(keyword), messageSid);
    auditService.record(phoneNumber, 'category_opt_in_started', messageSid);
    return user;
  }

  optIn(phoneNumber: string, keyword: string, messageSid?: string): UserProfile {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    user.consentStatus = 'opted_in';
    user.flowStage = 'ready_for_matches';
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

  parseCategoryDecision(body: string, buttonPayload?: string): CategoryDecision | undefined {
    const payload = buttonPayload?.trim().toUpperCase();
    if (payload && categoryPayloads[payload]) {
      return categoryPayloads[payload];
    }

    const normalized = this.normalize(body);
    const optedIn = normalized.includes('OPT IN') || normalized.includes('YES');
    const optedOut = normalized.includes('NOT NOW') || normalized.includes('NO');
    if (!optedIn && !optedOut) {
      return undefined;
    }

    if (normalized.includes('APPLICATION') || normalized.includes('INTERVIEW')) {
      return categoryDecision('applicationUpdates', optedIn);
    }

    if (normalized.includes('MATCH') || normalized.includes('ALERT')) {
      return categoryDecision('jobMatches', optedIn);
    }

    if (normalized.includes('RECRUIT')) {
      return categoryDecision('recruitingOutreach', optedIn);
    }

    return undefined;
  }

  applyCategoryDecision(phoneNumber: string, decision: CategoryDecision, messageSid?: string): OutboundDemoMessage {
    const user = userStoreService.getOrCreateUser(phoneNumber);
    const existingPreferences = user.conversationState.rcsCategoryOptIns || {};

    if (typeof existingPreferences[decision.category] === 'boolean') {
      auditService.record(phoneNumber, 'duplicate_category_opt_in_decision_ignored', messageSid, {
        category: decision.category,
        attemptedOptIn: decision.optedIn,
        existingOptIn: existingPreferences[decision.category],
        decisionText: decision.decisionText
      });

      if (this.hasAllCategoryDecisions(existingPreferences)) {
        return {
          response: messageTemplates.optInConfirmation(existingPreferences),
          category: 'category_opt_in_summary'
        };
      }

      return {
        response: messageTemplates.consentPrompt(),
        category: 'category_opt_in_prompt',
        templateKey: this.templateKeyForRemaining(existingPreferences)
      };
    }

    const preferences = {
      ...existingPreferences,
      [decision.category]: decision.optedIn
    };

    user.conversationState = {
      ...user.conversationState,
      rcsCategoryOptIns: preferences,
      latestPresentedJobIds: user.conversationState.latestPresentedJobIds || []
    };

    auditService.record(phoneNumber, 'category_opt_in_decision', messageSid, {
      category: decision.category,
      optedIn: decision.optedIn,
      decisionText: decision.decisionText
    });

    if (this.hasAllCategoryDecisions(preferences)) {
      const hasAnyOptIn = categoryOrder.some((category) => preferences[category] === true);
      user.consentStatus = hasAnyOptIn ? 'opted_in' : 'pending_opt_in';
      user.flowStage = hasAnyOptIn ? 'ready_for_matches' : 'awaiting_category_opt_in';
      userStoreService.saveUser(user);

      if (hasAnyOptIn) {
        this.recordConsent(phoneNumber, 'opt_in', this.formatCategoryKeyword(preferences), messageSid);
        auditService.record(phoneNumber, 'opted_in', messageSid);
      }

      return {
        response: messageTemplates.optInConfirmation(preferences),
        category: 'category_opt_in_summary'
      };
    }

    user.consentStatus = 'pending_opt_in';
    user.flowStage = 'awaiting_category_opt_in';
    userStoreService.saveUser(user);

    return {
      response: messageTemplates.consentPrompt(),
      category: 'category_opt_in_prompt',
      templateKey: this.templateKeyForRemaining(preferences)
    };
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

  private hasAllCategoryDecisions(preferences: UserProfile['conversationState']['rcsCategoryOptIns']): boolean {
    return categoryOrder.every((category) => typeof preferences?.[category] === 'boolean');
  }

  private formatCategoryKeyword(preferences: UserProfile['conversationState']['rcsCategoryOptIns']): string {
    return categoryOrder
      .map((category) => `${category}:${preferences?.[category] === true ? 'opt_in' : 'not_now'}`)
      .join(',');
  }

  private templateKeyForRemaining(preferences: UserProfile['conversationState']['rcsCategoryOptIns']): DemoTemplateKey {
    const remaining = categoryOrder.filter((category) => typeof preferences?.[category] !== 'boolean');
    const key = remaining.join('|');

    switch (key) {
      case 'applicationUpdates|jobMatches':
        return 'consentApplicationJob';
      case 'applicationUpdates|recruitingOutreach':
        return 'consentApplicationRecruiting';
      case 'jobMatches|recruitingOutreach':
        return 'consentJobRecruiting';
      case 'applicationUpdates':
        return 'consentApplication';
      case 'jobMatches':
        return 'consentJob';
      case 'recruitingOutreach':
        return 'consentRecruiting';
      default:
        return 'consent';
    }
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
