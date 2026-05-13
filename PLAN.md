# RCS MVP Plan

## Objective

Build a simple, approval-oriented RCS MVP on top of the current Twilio + Gemini sample that demonstrates:

1. A clear, useful local hiring workflow.
2. Explicit opt-in and opt-out handling.
3. Human escalation and trust/safety coverage.
4. Enough product and compliance evidence to support carrier/platform approval.

## Current Baseline

The repo already has:

- A Twilio inbound webhook at `/webhook/sms`
- Twilio outbound messaging support
- Optional Gemini-powered constrained assistance
- In-memory session storage
- Basic logging, validation, and media handling

The repo does **not** yet have:

- Consent state or suppression logic
- Opt-in / opt-out keyword handling
- Persistent user state
- Compliance copy or trust/safety pages
- Human escalation workflow
- A structured hiring journey
- Demo job/application data
- Tests for approval-critical behavior

## Critical Blocker

As of **May 12, 2026**, `COMPLIANCE_REQUIREMENTS.md` is empty in this repo. That means we can create a strong engineering plan now, but we cannot claim final compliance readiness until that file is populated with the actual requirements we need to satisfy.

Plan implication:

- We should proceed with a consent-first architecture immediately.
- Before launch or submission, we must convert `COMPLIANCE_REQUIREMENTS.md` into a checklist and verify every item against the implementation.

## Product Recommendation

For the MVP, we should **narrow scope to a candidate-first RCS experience** and defer full employer workflows until the base consent and approval story is solid.

Reason:

- The supplied flow emphasizes a useful, local hiring experience over a generic chatbot.
- Opt-in / opt-out is the highest-risk compliance area and should not compete with multiple product surfaces.
- A focused candidate journey is enough to demonstrate the value proposition:
  nearby jobs, language-aware discovery, interview coordination, application updates, and human support.

## MVP Scope

### In Scope

- First-contact consent flow
- Opt-in confirmation flow
- Opt-out / restart flow
- Help flow
- Human escalation flow
- Candidate intake:
  role, language, location, shift preference
- Demo job matching using seeded mock data
- Demo application status / interview follow-up flow
- Trust & Safety / Privacy / Support pages
- Audit logging for consent events

### Explicitly Out of Scope for v1

- Proactive bulk campaigns
- Employer-side dashboard
- Live ATS or CRM integration
- Real scheduling integration
- Live dynamic recommendations using RCS carousels, chips, or advanced UI
- Production-grade database infrastructure

For approval, the flow can be text-first or rich-template-backed. The important constraint is that actions and responses stay predefined for the demo.

## Core Experience We Should Build

### First Contact

Unknown user sends any inbound message.

System behavior:

- Do **not** drop the user directly into open-ended AI chat.
- Reply with a deterministic consent message that explains:
  - who we are
  - what messages they will receive
  - that this is for hiring/job support
  - how to opt in
  - how to opt out / get help
- Store user as `pending_opt_in`

### Opt-In

User replies with approved consent keywords such as:

- `YES`
- `START`
- `UNSTOP`

System behavior:

- Mark user as `opted_in`
- Store timestamp, source, and keyword used
- Send confirmation message
- Introduce supported actions:
  nearby jobs, language-specific jobs, shifts, application updates, help

### Active Candidate Flow

After opt-in, the assistant guides the user through a deterministic intake flow:

1. Preferred language
2. Job type or role
3. Location / ZIP
4. Shift or schedule preference
5. Show 1-3 relevant demo jobs
6. Offer next step:
   application update, interview help, human support

### Opt-Out

User sends any suppression keyword such as:

- `STOP`
- `UNSUBSCRIBE`
- `CANCEL`
- `END`
- `QUIT`

System behavior:

- Mark user as `opted_out`
- Record suppression event in audit log
- Clear or freeze active conversation state
- Send one confirmation message only
- Block all non-essential future outbound messages until user explicitly opts back in

### Help

User sends `HELP`.

System behavior:

- Return a deterministic support message
- Include brand name, support path, opt-out instructions, and human escalation route

### Human Escalation

User sends `AGENT`, `SUPPORT`, or asks for a person.

System behavior:

- Mark conversation as `handoff_requested`
- Send deterministic fallback copy
- Route the event into a simple queue/log for manual follow-up

## Architecture Plan

## Phase 0: Lock Requirements and Copy

Goal:
Turn the flow and compliance expectations into explicit implementation rules.

Tasks:

- Convert `USER_FLOW.md` into RCS-specific user stories.
- Populate `COMPLIANCE_REQUIREMENTS.md` with the actual approval rules.
- Decide final approved keywords for:
  opt-in, opt-out, help, restart, human support.
- Finalize approved copy for:
  welcome, consent, opt-in confirmation, help, opt-out confirmation, escalation.
- Define the one-sentence business positioning:
  `trusted local workforce messaging layer`

Deliverables:

- Updated `COMPLIANCE_REQUIREMENTS.md`
- Message copy matrix
- State transition table

Exit criteria:

- No implementation begins without agreed consent and suppression copy.

## Phase 1: Add Persistent User State

Goal:
Replace the current in-memory-only model for approval-critical user state.

Recommendation:

- Use a **simple file-backed persistence layer** for the MVP.
- Keep the storage interface abstract so we can later replace it with Redis/Postgres.

Why this approach:

- It keeps the MVP simple.
- It preserves consent state across restarts.
- It avoids unnecessary infrastructure before approval.

Data models to add:

- `UserProfile`
  - phone number
  - consent status
  - preferred language
  - candidate flow stage
  - last inbound/outbound timestamps
  - handoff status
- `ConsentRecord`
  - phone number
  - event type
  - keyword used
  - timestamp
  - source
- `ConversationState`
  - role
  - location
  - job preference
  - shift preference
  - latest presented jobs
- `AuditEvent`
  - event type
  - phone number
  - metadata
  - timestamp

Likely files:

- `src/types/index.ts`
- `src/services/session.service.ts`
- `src/services/consent.service.ts`
- `src/services/user-store.service.ts`
- `src/services/audit.service.ts`
- `src/data/` or `data/`

Exit criteria:

- User consent and suppression status persist across restart.

## Phase 2: Implement a Deterministic Consent State Machine

Goal:
Make compliance logic deterministic and independent of AI behavior.

Key rule:

- AI should never decide whether a user is opted in or opted out.
- Consent, suppression, help, and restart must be handled by code-first rules.

States:

- `unknown`
- `pending_opt_in`
- `opted_in`
- `opted_out`

Journey stages:

- `awaiting_language`
- `awaiting_role`
- `awaiting_location`
- `awaiting_shift`
- `ready_for_matches`
- `handoff_requested`

Handler changes:

- Refactor `src/handlers/webhook.handler.ts` so it:
  - normalizes inbound text
  - checks suppression keywords first
  - checks help keywords second
  - checks restart/opt-in keywords third
  - only allows AI or guided job flow after consent is active

Exit criteria:

- Unknown users always hit consent flow first.
- Opted-out users never re-enter active chat unless they explicitly restart.

## Phase 3: Build the Candidate MVP Flow

Goal:
Turn the generic chatbot into a useful hiring workflow.

Recommended v1 flow:

1. Ask language preference
2. Ask what kind of job the user wants
3. Ask ZIP code or city
4. Ask about shifts or schedule
5. Return 1-3 relevant demo jobs
6. Offer:
   - `APPLY`
   - `STATUS`
   - `INTERVIEW`
   - `HELP`
   - `AGENT`

Implementation note:

- This should be mostly deterministic and form-like.
- Use AI only where it adds value:
  parsing free-text preferences, multilingual assistance, concise natural responses.

Data source:

- Seed a small mock jobs dataset in-repo.
- Seed a small mock application/interview dataset for demos.

Likely files:

- `src/services/job-matching.service.ts`
- `src/services/demo-data.service.ts`
- `src/handlers/webhook.handler.ts`
- `src/types/index.ts`

Exit criteria:

- A new opted-in candidate can complete a basic hiring flow end-to-end using only text messages.

## Phase 4: Add Guardrails to the AI Layer

Goal:
Ensure the assistant supports the approved use case instead of drifting into generic chatbot behavior.

Changes:

- Replace the current generic system prompt with a scoped prompt for local hiring support.
- Instruct the model to:
  - stay within job discovery and coordination tasks
  - keep replies concise
  - avoid marketing language
  - avoid unsupported promises
  - escalate to human support when uncertain
- Reject or redirect disallowed intents:
  - unrelated general chat
  - payment collection
  - suspicious recruiting requests
  - mass outbound behavior

Important:

- Consent logic still stays outside the model.
- AI only handles the conversation inside the allowed consented experience.

Likely files:

- `src/services/gemini.service.ts`
- `src/services/session.service.ts`

Exit criteria:

- The assistant consistently behaves like a hiring support workflow, not a generic assistant.

## Phase 5: Create Compliance and Trust Surfaces

Goal:
Add the non-message artifacts that approval reviewers expect to see.

Pages or endpoints to add:

- `/privacy`
- `/terms`
- `/trust-safety`
- `/support`
- `/consent-info`

Minimum trust/safety content:

- verified employers statement
- anti-fraud statement
- no payment policy
- privacy/data handling summary
- abuse reporting path
- human support escalation path
- opt-out instructions

Implementation approach:

- Serve simple static HTML or text from Express.
- Keep content in versioned source files so legal/compliance copy is reviewable.

Likely files:

- `src/server.ts`
- `src/content/privacy.ts`
- `src/content/support.ts`
- `src/content/trust-safety.ts`
- `src/content/consent-info.ts`

Exit criteria:

- The app exposes public, reviewable trust and support information without requiring a separate frontend app.

## Phase 6: Add Messaging Policy and Auditability

Goal:
Prove that the app can enforce safe messaging behavior.

Rules to implement:

- No outbound job or update messages to `unknown`, `pending_opt_in`, or `opted_out` users.
- Every consent and suppression event is logged.
- All outbound system messages use approved templates.
- Future proactive messaging, if added later, must require explicit eligibility checks.

Logging and audit:

- Log message category:
  consent, help, search, status, handoff, opt-out.
- Log state transitions.
- Mask phone numbers in application logs.

Exit criteria:

- We can show an auditable record of who opted in, who opted out, and why each system message was sent.

## Phase 7: Testing

Goal:
Make approval-critical behavior repeatable and safe to change.

Tests to add:

- Unknown user gets consent prompt
- `YES` changes state to opted in
- `STOP` suppresses future messaging
- `START` reactivates an opted-out user
- `HELP` works in every state
- Human escalation flag is set correctly
- Candidate intake progresses in order
- Demo job matching returns deterministic results
- Trust/safety endpoints respond correctly

Recommended test levels:

- Unit tests for state machine and keyword parsing
- Integration tests for webhook request -> outbound response behavior
- Manual Twilio test script for local/staging validation

Exit criteria:

- Consent and suppression regressions are covered by automated tests.

## Phase 8: Approval Package Artifacts

Goal:
Prepare the evidence needed for submission and review.

Artifacts to produce:

- Flow diagram for the RCS candidate journey
- Screenshot set of:
  consent, opt-in, job search, help, escalation, opt-out
- Message copy matrix
- Compliance checklist mapped to implementation
- Short description of approved use case:
  local hiring assistance for candidates

Important positioning:

- Do not present this as a generic AI chatbot.
- Present it as a guided, trustworthy local hiring messaging experience.

Exit criteria:

- We can hand a reviewer both the app and the supporting materials without extra explanation.

## Proposed File/Module Changes

Existing files likely to change:

- `src/handlers/webhook.handler.ts`
- `src/services/session.service.ts`
- `src/services/gemini.service.ts`
- `src/server.ts`
- `src/types/index.ts`
- `src/config/environment.ts`
- `README.md`
- `.env.example`

New files likely to add:

- `src/services/consent.service.ts`
- `src/services/user-store.service.ts`
- `src/services/audit.service.ts`
- `src/services/job-matching.service.ts`
- `src/services/demo-data.service.ts`
- `src/services/message-template.service.ts`
- `src/content/privacy.ts`
- `src/content/support.ts`
- `src/content/trust-safety.ts`
- `src/content/consent-info.ts`
- `data/*.json` or `src/data/*.ts`
- `tests/*`

## Recommended Execution Order

1. Populate `COMPLIANCE_REQUIREMENTS.md` and finalize message copy.
2. Add persistent user store and audit event store.
3. Implement keyword normalization plus consent state machine.
4. Add opt-in, help, restart, and opt-out flows.
5. Build deterministic candidate intake flow.
6. Add seeded demo jobs and application status flows.
7. Tighten the Gemini prompt and usage boundaries.
8. Add trust/safety/privacy/support endpoints.
9. Add automated tests for all approval-critical states.
10. Create reviewer artifacts and run manual RCS/Twilio validation.

## Definition of Done

We should consider the MVP ready for review when all of the following are true:

- A new user cannot access the experience without hitting consent first.
- Opt-out works immediately and suppresses future messaging.
- Restart/opt-back-in works explicitly.
- Help and human escalation are always available.
- The conversation demonstrates a real local hiring use case.
- Trust/safety and support information is publicly accessible.
- Consent and suppression events are persisted and auditable.
- Automated tests cover the critical flows.
- `COMPLIANCE_REQUIREMENTS.md` has been mapped line-by-line to implemented behavior.

## Immediate Next Step

Before we execute Phase 1, we should do one of these:

1. Paste the actual compliance requirements into `COMPLIANCE_REQUIREMENTS.md`.
2. Confirm that we should proceed with standard consent best practices first, then reconcile the implementation once the compliance document is complete.
