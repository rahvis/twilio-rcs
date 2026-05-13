/**
 * Type definitions for the Twilio SMS/RCS local hiring demo.
 */

/**
 * Twilio webhook request body structure
 * See: https://www.twilio.com/docs/messaging/guides/webhook-request
 */
export interface TwilioWebhookBody {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;  // E.164 format: +1234567890
  To: string;    // E.164 format: +1234567890
  Body: string;
  NumMedia: string;  // String number: "0", "1", "2", etc.
  OptOutType?: 'STOP' | 'START' | 'HELP';
  ButtonText?: string;
  ButtonPayload?: string;

  // Media attachments (indexed)
  MediaContentType0?: string;
  MediaUrl0?: string;
  MediaContentType1?: string;
  MediaUrl1?: string;
  MediaContentType2?: string;
  MediaUrl2?: string;
  MediaContentType3?: string;
  MediaUrl3?: string;
  MediaContentType4?: string;
  MediaUrl4?: string;
  MediaContentType5?: string;
  MediaUrl5?: string;
  MediaContentType6?: string;
  MediaUrl6?: string;
  MediaContentType7?: string;
  MediaUrl7?: string;
  MediaContentType8?: string;
  MediaUrl8?: string;
  MediaContentType9?: string;
  MediaUrl9?: string;

  // Optional geographic information
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;

  // Additional metadata
  SmsMessageSid?: string;
  SmsSid?: string;
  SmsStatus?: string;
}

/**
 * Message content types used by optional multimodal services.
 */
export interface MessageContent {
  type: 'text' | 'image_url' | 'image_file';
  text?: string;
  image_url?: {
    url: string;
  };
  image_file?: {
    file_id: string;
  };
}

/**
 * Chat message in conversation history
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

/**
 * Session data structure
 * Maps phone numbers to conversation history
 */
export interface Session {
  phoneNumber: string;
  conversationHistory: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

export type ConsentStatus =
  | 'unknown'
  | 'pending_opt_in'
  | 'opted_in'
  | 'opted_out';

export type CandidateFlowStage =
  | 'not_started'
  | 'awaiting_language'
  | 'awaiting_role'
  | 'awaiting_location'
  | 'awaiting_shift'
  | 'ready_for_matches'
  | 'post_apply_help'
  | 'handoff_requested';

export interface ConversationState {
  role?: string;
  location?: string;
  shiftPreference?: string;
  latestPresentedJobIds: string[];
}

export type DemoTemplateKey =
  | 'consent'
  | 'language'
  | 'role'
  | 'location'
  | 'shift'
  | 'jobsCarousel'
  | 'actions'
  | 'applyFollowup'
  | 'applyClosing'
  | 'help'
  | 'handoff';

export interface OutboundDemoMessage {
  response: string;
  category: string;
  templateKey?: DemoTemplateKey;
}

export interface UserProfile {
  phoneNumber: string;
  consentStatus: ConsentStatus;
  preferredLanguage?: string;
  flowStage: CandidateFlowStage;
  handoffRequested: boolean;
  conversationState: ConversationState;
  createdAt: string;
  updatedAt: string;
  lastInboundAt?: string;
  lastOutboundAt?: string;
}

export type ConsentRecordType =
  | 'pending_opt_in'
  | 'opt_in'
  | 'opt_out'
  | 'help'
  | 'handoff';

export interface ConsentRecord {
  id: string;
  phoneNumber: string;
  type: ConsentRecordType;
  keyword?: string;
  messageSid?: string;
  source: 'webhook';
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  phoneNumber: string;
  type: string;
  messageSid?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  createdAt: string;
}

export interface DemoJob {
  id: string;
  title: string;
  employer: string;
  city: string;
  state: string;
  zip: string;
  languages: string[];
  shifts: string[];
  payRange: string;
  summary: string;
  verifiedEmployer: boolean;
  noFees: boolean;
}

/**
 * Processed media item result
 */
export interface ProcessedMedia {
  originalUrl: string;
  contentType: string;
  buffer?: Buffer;
  geminiFileUri?: string;
  error?: string;
  valid: boolean;
}

/**
 * Environment configuration interface
 */
export interface Environment {
  PORT: number;
  NODE_ENV: 'development' | 'production';

  // Twilio
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER?: string; // Optional: fallback if messaging service not used
  TWILIO_MESSAGING_SERVICE_SID?: string; // Optional: preferred for sending

  // Gemini is optional for the deterministic approval demo.
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;

  // Optional
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  MAX_IMAGE_SIZE_MB: number;
  DATA_DIR: string;
  SUPPORT_EMAIL: string;
  BRAND_NAME: string;
  PUBLIC_BASE_URL: string;
  RCS_CONTENT_CONSENT_SID?: string;
  RCS_CONTENT_LANGUAGE_SID?: string;
  RCS_CONTENT_ROLE_SID?: string;
  RCS_CONTENT_LOCATION_SID?: string;
  RCS_CONTENT_SHIFT_SID?: string;
  RCS_CONTENT_JOBS_CAROUSEL_SID?: string;
  RCS_CONTENT_ACTIONS_SID?: string;
  RCS_CONTENT_APPLY_FOLLOWUP_SID?: string;
  RCS_CONTENT_APPLY_CLOSING_SID?: string;
  RCS_CONTENT_HELP_SID?: string;
  RCS_CONTENT_HANDOFF_SID?: string;
}
