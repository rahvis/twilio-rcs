import { TwilioWebhookBody } from '../types';

const payloadToText: Record<string, string> = {
  OPT_IN_YES: 'YES',
  START: 'START',
  STOP: 'STOP',
  HELP_MENU: 'HELP',
  HUMAN_AGENT: 'AGENT',
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
