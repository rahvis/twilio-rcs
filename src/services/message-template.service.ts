import { DemoJob, RcsCategoryKey, RcsCategoryOptInPreferences, UserProfile } from '../types';

const brandName = process.env.BRAND_NAME || 'WorkOnward';
const supportEmail = process.env.RCS_HELP_EMAIL || 'help@workonward.com';
const termsUrl = process.env.MESSAGING_TERMS_URL || 'https://www.workonward.com/en/terms';
const privacyUrl = process.env.MESSAGING_PRIVACY_URL || 'https://www.workonward.com/en/privacy';

const rcsCategoryLabels: Record<RcsCategoryKey, string> = {
  applicationUpdates: 'application and interview updates',
  jobMatches: 'job matches and job alerts',
  recruitingOutreach: 'recruiting outreach'
};

class MessageTemplateService {
  consentPrompt(): string {
    return `Choose which ${brandName} RCS messages you want to receive. You can opt in one category at a time. Msg freq varies. Msg & data rates may apply. Reply HELP for help. Reply STOP to cancel. Terms: ${termsUrl} Privacy: ${privacyUrl}`;
  }

  optInConfirmation(preferences?: RcsCategoryOptInPreferences): string {
    const resolved = preferences || {
      applicationUpdates: true,
      jobMatches: true,
      recruitingOutreach: false
    };
    const optedIn = this.formatCategoryList(resolved, true);
    const notOptedIn = this.formatCategoryList(resolved, false);

    return `You are opted in to: ${optedIn}.\n\nYou are not opted in to: ${notOptedIn}.\n\nMsg freq varies. Msg & data rates may apply. Reply HELP for help or STOP to cancel. Terms: ${termsUrl} Privacy: ${privacyUrl}`;
  }

  optOutConfirmation(): string {
    return `${brandName} local hiring messages: You have successfully been unsubscribed. You will not receive any more messages from this number. Reply START to resubscribe.`;
  }

  help(): string {
    return `${brandName} help: email ${supportEmail}. Msg freq varies. Msg & data rates may apply. Reply STOP to cancel or AGENT for a person. We never ask candidates for payment by message.`;
  }

  handoff(): string {
    return `A ${brandName} team member has been requested. We will review this conversation and follow up when available. Reply STOP to opt out.`;
  }

  askLanguage(): string {
    return `Choose a language for this demo:\n1. English\n2. Spanish\n3. Korean`;
  }

  askRole(user: UserProfile): string {
    return `Choose a demo job category:\n1. Warehouse\n2. Restaurant\n3. Retail\n4. Caregiving`;
  }

  askLocation(): string {
    return `Choose a demo location:\n1. Los Angeles 90011\n2. Koreatown 90020\n3. Long Beach 90802`;
  }

  askShift(): string {
    return `Choose a demo shift:\n1. Morning\n2. Evening\n3. Weekend\n4. Flexible`;
  }

  formatMatches(jobs: DemoJob[]): string {
    if (jobs.length === 0) {
      return `I did not find a demo match for that search yet. Reply JOBS to try another role or AGENT for help from a person.`;
    }

    const lines = jobs.map((job, index) => {
      const trust = job.verifiedEmployer && job.noFees ? 'Verified, no candidate fees' : 'Review details before applying';
      return `${index + 1}. ${job.title} at ${job.employer} - ${job.city}, ${job.state}. ${job.payRange}. ${job.shifts.join('/')}. ${trust}.`;
    });

    return `Here is the same scripted demo carousel every time:\n${lines.join('\n')}\nReply APPLY, STATUS, INTERVIEW, JOBS, HELP, AGENT, or STOP to cancel.`;
  }

  applicationReceived(): string {
    return `Thank you for applying through ${brandName}. This is a scripted demo confirmation. A verified employer coordinator would confirm next steps here. Do you need more help? Reply HELP, NO, or JOBS.`;
  }

  applicationClosing(): string {
    return `You're welcome. Please feel free to explore more jobs anytime. Reply JOBS to see demo job matches again, HELP for support, or STOP to cancel.`;
  }

  applicationStatus(): string {
    return `Demo status: your application is ready for employer review. No payment is required from candidates. Reply INTERVIEW for scheduling help or AGENT for support.`;
  }

  interviewHelp(): string {
    return `Demo interview help: we can coordinate a morning, afternoon, evening, or weekend slot with the employer. Reply with your preferred time or AGENT for a person.`;
  }

  readyMenu(): string {
    return `Reply APPLY to start a demo application, STATUS for an update, INTERVIEW for scheduling help, JOBS to search again, HELP for support, AGENT for a person, or STOP to cancel.`;
  }

  private formatCategoryList(preferences: RcsCategoryOptInPreferences, expected: boolean): string {
    const categories = (Object.keys(rcsCategoryLabels) as RcsCategoryKey[])
      .filter((key) => preferences[key] === expected)
      .map((key) => rcsCategoryLabels[key]);

    return categories.length > 0 ? categories.join(', ') : 'none';
  }
}

export default new MessageTemplateService();
