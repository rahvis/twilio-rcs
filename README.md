# Twilio RCS Local Hiring Demo

This is a deterministic Twilio SMS/RCS demo for a WorkOnward-style local hiring workflow. It is built for approval review, with explicit opt-in, opt-out, help, human escalation, trust/safety pages, and seeded demo job matches.

The webhook does not use free-form AI for the MVP flow. All consent behavior, commands, state transitions, and responses are predefined.

## Demo Flow

Auditors can test the experience by messaging the Twilio sender:

1. Send `Hi`
2. Receive consent prompt
3. Send `YES`
4. Receive opt-in confirmation and language prompt
5. Send `Spanish`
6. Send `warehouse`
7. Send `90011`
8. Send `morning`
9. Receive seeded local job matches
10. Send `APPLY`, `STATUS`, or `INTERVIEW`
11. Send `HELP`
12. Send `AGENT`
13. Send `STOP`

## Predefined Commands

- Opt in: `YES`, `START`, `UNSTOP`
- Opt out: `STOP`, `STOPALL`, `UNSUBSCRIBE`, `CANCEL`, `END`, `QUIT`, `REVOKE`, `OPTOUT`
- Help: `HELP`, `INFO`
- Human escalation: `AGENT`, `SUPPORT`, `HUMAN`, `PERSON`
- Candidate actions: `JOBS`, `APPLY`, `STATUS`, `INTERVIEW`

## What Is Implemented

- Twilio inbound webhook at `/webhook/sms`
- Twilio webhook signature validation
- File-backed user, consent, and audit state
- First-contact consent gate
- Opt-in and restart flow
- Opt-out suppression flow
- Help flow
- Human escalation flag
- Guided candidate intake
- Seeded local job matching
- Optional Twilio Content Template support for RCS quick replies/cards/carousels
- Public review pages:
  - `/privacy`
  - `/terms`
  - `/trust-safety`
  - `/support`
  - `/consent-info`
  - `/demo-guide`

## Requirements

- Node.js 18 or newer
- Twilio account
- Twilio phone number or Messaging Service SID

Gemini is optional for the approval flow. The webhook remains predefined for auditor testing. The default model is `gemini-3-pro-preview`; use `gemini-2.5-pro` if you need a stable production model instead of the latest preview model.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example` and fill in Twilio values:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATA_DIR=data
BRAND_NAME=WorkOnward
SUPPORT_EMAIL=support@workonward.com
PUBLIC_BASE_URL=https://workonward.com
MESSAGING_TERMS_URL=https://www.workonward.com/en/terms
MESSAGING_PRIVACY_URL=https://www.workonward.com/en/privacy
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3-pro-preview
```

## Rich RCS Templates

The app works without rich templates by sending numbered text menus. To make the same deterministic flow render as RCS chips/cards/carousels, create Twilio Content Templates and add their `HX...` SIDs to `.env`.

For the Twilio RCS Sender profile, use the WorkOnward dark gray accent color:

```text
#3D3D3D
```

The supplied orange `#ED6600` and green `#72A400` are used in card media and public pages, but they do not meet Twilio's documented 4.5:1 contrast requirement against white for the official sender accent. The app serves generated RCS media assets from:

```text
${PUBLIC_BASE_URL}/assets/rcs
${PUBLIC_BASE_URL}/assets/rcs/workonward-logo.png
${PUBLIC_BASE_URL}/assets/rcs/workonward-banner.png
```

The opt-in consent prompt and RCS consent card must display the public WorkOnward policy links exactly:

```text
https://www.workonward.com/en/terms
https://www.workonward.com/en/privacy
```

Keep `PUBLIC_BASE_URL` as the WorkOnward policy/domain URL and set `RCS_ASSET_BASE_URL` to the public app host that serves `/assets/rcs`. For the Railway deployment:

```env
RCS_ASSET_BASE_URL=https://twilio-rcs-production.up.railway.app
```

Recommended template mapping:

```env
RCS_CONTENT_CONSENT_SID=HX...
RCS_CONTENT_LANGUAGE_SID=HX...
RCS_CONTENT_ROLE_SID=HX...
RCS_CONTENT_LOCATION_SID=HX...
RCS_CONTENT_SHIFT_SID=HX...
RCS_CONTENT_JOBS_CAROUSEL_SID=HX...
RCS_CONTENT_ACTIONS_SID=HX...
RCS_CONTENT_APPLY_FOLLOWUP_SID=HX...
RCS_CONTENT_APPLY_CLOSING_SID=HX...
RCS_CONTENT_HELP_SID=HX...
RCS_CONTENT_HANDOFF_SID=HX...
```

For RCS, build the choice screens as `Card` templates with quick-reply actions. Do not use standalone `Quick Reply` templates for RCS; those can fail with Twilio error `19023` because that content type is not an RCS channel type. The jobs screen can remain a `Carousel`.

Use these quick-reply action payload IDs so button taps map back into the scripted flow:

```text
OPT_IN_YES
HELP_MENU
HUMAN_AGENT
LANG_EN
LANG_ES
LANG_KO
LANG_OTHER
ROLE_WAREHOUSE
ROLE_RESTAURANT
ROLE_RETAIL
ROLE_CAREGIVING
LOC_LA
LOC_KTOWN
LOC_LONG_BEACH
SHIFT_MORNING
SHIFT_EVENING
SHIFT_WEEKEND
SHIFT_FLEX
ACTION_APPLY
ACTION_STATUS
ACTION_INTERVIEW
ACTION_JOBS
APPLY_NO_HELP
```

The jobs template should be a `twilio/carousel` with the same three demo jobs every time. This is intentional: it is a scripted approval demo, not a real recommendation engine.

The `content:create-cards` script creates the choice cards and the jobs carousel. It includes `twilio/text` fallbacks for SMS and RCS devices that cannot render the richer experience. Native RCS clients control the exact bubble, font, and button rendering; WorkOnward branding is applied through the sender accent, card media, and concise template copy.

If your `.env` already contains older `RCS_CONTENT_*_SID` values, run the script with `--force` when you are ready to recreate the templates and update those SIDs.

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Twilio Webhook

Configure the inbound message webhook to:

```text
POST https://your-domain.com/webhook/sms
```

For local development with ngrok:

```bash
ngrok http 3000
```

Then configure the Twilio webhook to:

```text
POST https://your-ngrok-domain.ngrok-free.app/webhook/sms
```

Keep `DISABLE_SIGNATURE_VALIDATION=false` in production.

If Twilio Advanced Opt-Out is enabled and the webhook receives `OptOutType`, the app records the opt-in, opt-out, or help event without sending a duplicate keyword reply. Configure the Twilio Advanced Opt-Out replies to match the approved copy for `STOP`, `START`, and `HELP`.

After starting ngrok, configure the Twilio Messaging Service webhook from the CLI:

```bash
npm run webhook:configure
```

Or pass a public base URL explicitly:

```bash
npm run webhook:configure -- https://your-public-domain.example
```

For the Railway deployment:

```bash
npm run webhook:configure -- https://twilio-rcs-production.up.railway.app
```

## State Storage

Runtime state is stored in:

```text
data/rcs-state.json
```

The file contains:

- user consent status
- candidate flow stage
- candidate demo preferences
- consent records
- audit events

The root `data/` directory is ignored by git.

## Verification

Run:

```bash
npm run type-check
npm run build
```

Visit:

```text
http://localhost:3000/health
http://localhost:3000/demo-guide
http://localhost:3000/trust-safety
http://localhost:3000/gemini/status
```

## Compliance Notes

`COMPLIANCE_REQUIREMENTS.md` contains the current working checklist. Replace or extend it with the final carrier/platform requirements before submission.

The implementation follows a conservative structure:

- consent is required before the hiring workflow starts
- opt-out is checked before all other business logic
- opted-out users are suppressed locally
- consent and suppression events are persisted
- public privacy, terms, trust, support, and consent pages are available
- candidate payment requests are explicitly disallowed in copy
