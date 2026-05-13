import { OutboundDemoMessage, UserProfile } from '../types';
import auditService from './audit.service';
import consentService from './consent.service';
import jobMatchingService from './job-matching.service';
import messageTemplates from './message-template.service';
import userStoreService from './user-store.service';

class CandidateFlowService {
  handleMessage(user: UserProfile, inboundText: string, messageSid?: string): OutboundDemoMessage {
    if (!consentService.canReceiveApplicationMessage(user)) {
      return {
        response: messageTemplates.consentPrompt(),
        category: 'consent',
        templateKey: 'consent'
      };
    }

    const normalized = consentService.normalize(inboundText);

    if (normalized === 'JOBS' || normalized === 'SEARCH') {
      user.flowStage = 'awaiting_role';
      user.conversationState = {
        latestPresentedJobIds: []
      };
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_search_restarted', messageSid);
      return {
        response: messageTemplates.askRole(user),
        category: 'candidate_search',
        templateKey: 'role'
      };
    }

    if (user.flowStage === 'not_started') {
      user.flowStage = 'awaiting_language';
      userStoreService.saveUser(user);
      return {
        response: messageTemplates.askLanguage(),
        category: 'candidate_intake',
        templateKey: 'language'
      };
    }

    if (user.flowStage === 'awaiting_language') {
      user.preferredLanguage = this.normalizeChoice(inboundText, {
        '1': 'English',
        '2': 'Spanish',
        '3': 'Korean'
      }, 'English');
      user.flowStage = 'awaiting_role';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_language_set', messageSid);
      return {
        response: messageTemplates.askRole(user),
        category: 'candidate_intake',
        templateKey: 'role'
      };
    }

    if (user.flowStage === 'awaiting_role') {
      user.conversationState.role = this.normalizeChoice(inboundText, {
        '1': 'warehouse',
        '2': 'restaurant',
        '3': 'retail',
        '4': 'caregiving'
      }, 'warehouse');
      user.flowStage = 'awaiting_location';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_role_set', messageSid);
      return {
        response: messageTemplates.askLocation(),
        category: 'candidate_intake',
        templateKey: 'location'
      };
    }

    if (user.flowStage === 'awaiting_location') {
      user.conversationState.location = this.normalizeChoice(inboundText, {
        '1': '90011',
        '2': '90020',
        '3': '90802'
      }, '90011');
      user.flowStage = 'awaiting_shift';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_location_set', messageSid);
      return {
        response: messageTemplates.askShift(),
        category: 'candidate_intake',
        templateKey: 'shift'
      };
    }

    if (user.flowStage === 'awaiting_shift') {
      user.conversationState.shiftPreference = this.normalizeChoice(inboundText, {
        '1': 'morning',
        '2': 'evening',
        '3': 'weekend',
        '4': 'flexible'
      }, 'morning');
      const jobs = jobMatchingService.findMatches(user);
      user.conversationState.latestPresentedJobIds = jobs.map((job) => job.id);
      user.flowStage = 'ready_for_matches';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_matches_presented', messageSid, {
        matchCount: jobs.length
      });
      return {
        response: messageTemplates.formatMatches(jobs),
        category: 'job_matches',
        templateKey: 'jobsCarousel'
      };
    }

    if (user.flowStage === 'handoff_requested') {
      return {
        response: messageTemplates.handoff(),
        category: 'handoff',
        templateKey: 'handoff'
      };
    }

    if (normalized === 'APPLY') {
      user.flowStage = 'post_apply_help';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_apply_selected', messageSid);
      return {
        response: messageTemplates.applicationReceived(),
        category: 'application',
        templateKey: 'applyFollowup'
      };
    }

    if (user.flowStage === 'post_apply_help' && this.isNoThanks(normalized)) {
      user.flowStage = 'ready_for_matches';
      userStoreService.saveUser(user);
      auditService.record(user.phoneNumber, 'candidate_apply_no_more_help', messageSid);
      return {
        response: messageTemplates.applicationClosing(),
        category: 'application_closing',
        templateKey: 'applyClosing'
      };
    }

    if (normalized === 'STATUS') {
      auditService.record(user.phoneNumber, 'candidate_status_requested', messageSid);
      return {
        response: messageTemplates.applicationStatus(),
        category: 'application_status',
        templateKey: 'actions'
      };
    }

    if (normalized === 'INTERVIEW') {
      auditService.record(user.phoneNumber, 'candidate_interview_requested', messageSid);
      return {
        response: messageTemplates.interviewHelp(),
        category: 'interview',
        templateKey: 'actions'
      };
    }

    return {
      response: messageTemplates.readyMenu(),
      category: 'candidate_menu',
      templateKey: 'actions'
    };
  }

  private normalizeChoice(
    inboundText: string,
    numericMap: Record<string, string>,
    fallback: string
  ): string {
    const normalized = inboundText.trim().toLowerCase();

    if (numericMap[normalized]) {
      return numericMap[normalized];
    }

    for (const value of Object.values(numericMap)) {
      if (normalized.includes(value.toLowerCase())) {
        return value;
      }
    }

    return fallback;
  }

  private isNoThanks(normalized: string): boolean {
    return ['NO', 'NO THANKS', 'NO THANK YOU', 'NOT NOW', 'DONE'].includes(normalized);
  }
}

export default new CandidateFlowService();
