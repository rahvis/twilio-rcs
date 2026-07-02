import { TwilioWebhookBody } from '../types';

const payloadToText: Record<string, string> = {
  OPT_IN_YES: 'YES',
  START: 'START',
  STOP: 'STOP',
  HELP_MENU: 'HELP',
  HUMAN_AGENT: 'AGENT',
  RCS_APPLICATION_UPDATES_OPT_IN: 'Opt in to application and interview updates',
  RCS_APPLICATION_UPDATES_NOT_NOW: 'Not now for application and interview updates',
  RCS_JOB_MATCHES_OPT_IN: 'Opt in to job matches and job alerts',
  RCS_JOB_MATCHES_NOT_NOW: 'Not now for job matches and job alerts',
  RCS_RECRUITING_OUTREACH_OPT_IN: 'Opt in to recruiting outreach',
  RCS_RECRUITING_OUTREACH_NOT_NOW: 'Not now for recruiting outreach',
  OPT_IN_TO_APPLICATION_UPDATES: 'Opt in to application and interview updates',
  NOT_NOW_FOR_APPLICATION_UPDATES: 'Not now for application and interview updates',
  OPT_IN_TO_JOB_MATCHES: 'Opt in to job matches and job alerts',
  NOT_NOW_FOR_JOB_MATCHES: 'Not now for job matches and job alerts',
  OPT_IN_TO_RECRUITING_OUTREACH: 'Opt in to recruiting outreach',
  NOT_NOW_FOR_RECRUITING_OUTREACH: 'Not now for recruiting outreach',
  LANG_EN: 'English',
  LANG_ES: 'Spanish',
  LANG_KO: 'Korean',
  LANG_OTHER: 'English',
  ROLE_WAREHOUSE: 'warehouse',
  ROLE_RESTAURANT: 'restaurant',
  ROLE_RETAIL: 'retail',
  ROLE_CAREGIVING: 'caregiving',
  LOC_LA: '90011',
  LOC_KTOWN: '90020',
  LOC_LONG_BEACH: '90802',
  SHIFT_MORNING: 'morning',
  SHIFT_EVENING: 'evening',
  SHIFT_WEEKEND: 'weekend',
  SHIFT_FLEX: 'flexible',
  ACTION_APPLY: 'APPLY',
  ACTION_STATUS: 'STATUS',
  ACTION_INTERVIEW: 'INTERVIEW',
  ACTION_JOBS: 'JOBS',
  APPLY_NO_HELP: 'NO'
};

class DemoChoiceService {
  getInboundText(body: TwilioWebhookBody): string {
    const payload = body.ButtonPayload?.trim();

    if (payload && payloadToText[payload]) {
      return payloadToText[payload];
    }

    return body.Body || '';
  }
}

export default new DemoChoiceService();
