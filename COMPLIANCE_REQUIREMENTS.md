RCS Compliance Onboarding Guide (US)

    Overview
    Part 1: Sender profile setup
    Part 2: Privacy Policy & Terms of Service
    Part 3: Eligibility & Acceptable Use
    Part 4: Messaging Use Case & Campaign Details
    Part 5: Opt-In & Consent Requirements
    Part 6: Sample Messages
    Part 7: Data Consistency & Common Rejection Reasons

Overview

This guide walks you through the compliance requirements for launching RCS messaging. If you're still getting set up, the RCS onboarding guide covers creating your sender and sending your first test messages.

Before you go live, carriers need to verify that the right business is behind your sender and that your users have genuinely opted in. RCS senders are branded and verified by design. That's what makes the channel so effective, and it's also why this step matters.

As part of the compliance requirements for RCS, you'll need to provide information about your brand and business identity, your opt-in process, your Terms of Service, your Privacy Policy, and sample messages. The guide covers both recurring messages (marketing, promotional, and transactional messages sent on an ongoing basis) and single messages (one-time passwords (OTP), multi-factor authentication (MFA), and two-factor authentication (2FA)). 

A Twilio onboarding specialist will review everything before it's submitted. If anything needs adjusting, they'll work through it with you before it goes for approval. You won't be charged for verification until your submission info is vetted by Twilio, and you won't be charged for carrier onboarding unless your submission is approved.

Before you start, have this information ready:

    Your brand logo (224x224px, max 50 KB) and banner image (1440x448px, max 200 KB)
    Authorized representative contact details
    Business registration number (EIN or FTIN)
    Legal business address
    A publicly accessible URL for a hosted image of your opt-in experience
    A description of your opt-in and opt-out processes
    A description of your messaging use case
    A publicly accessible URL for a video showing your sender in action
    Sample HELP and STOP messages
    Monthly website traffic figures and estimated message volume
    Current SMS phone number(s) and estimated traffic volume (if applicable)

Part 1: Sender profile setup

Before you register, you'll need to set up your sender's public profile in Twilio Console. This is the brand identity your recipients will see when they receive messages from you.
Field	Requirements
Sender display name	Your brand name as you want it to appear. Max 100 characters. Each sender must have a unique display name.
Description	What this sender does, from the user's perspective. Max 100 characters. Don't just name your company or describe your industry. Describe the messages users will actually receive.
Logo image	Appears next to your sender display name in conversations. 224x224 pixels, max 50 KB, JPEG or PNG.
Banner image	Appears on your sender profile when recipients view it. 1440x448 pixels, max 200 KB, JPEG or PNG.
Accent color	Hex code used for button borders and highlights on your sender profile. Must meet a minimum contrast ratio of 4.5:1 relative to white.
Contact details	At minimum, one phone number or email address. Phone numbers must be in E.164 format (e.g., +14085980387). You can add multiple contact types.
Privacy Policy URL	Public URL for your Privacy Policy. Must be live and accessible without logging in. See Part 2 for content requirements.
Terms of Service URL	Public URL for your Terms of Service. Must be live and accessible without logging in. See Part 2 for content requirements.

Both URLs must match the links you include on your opt-in page. Test them before submitting. A broken URL, non-public page, or a looping redirect will fail review.
Sender Description

Your sender description should describe what messages users will actually receive, not your company or industry.
This works	This doesn't
“One-Time Passcode (OTP) for authentication from [Brand].” (Describes the specific message type) 	“We are a technology company.” (Describes the business, not the messages)
“Real-time updates on the delivery status of your order.” (Clear and specific) 	“Transactional messages.” (Too vague, no brand context)
“Alerts for the best deals and discounts of the season.” (Describes what users get) 	“Marketing and promotions.” (Generic, doesn't describe what users will actually see)
“Order confirmation, delivery status, and seasonal discount alerts from [Brand].” (Multi-use, still specific) 	“Various business communications.” (Doesn't tell the user anything useful)
 
Part 2: Privacy Policy & Terms of Service

Your Privacy Policy and Terms of Service are required for approval. Both must be live, publicly accessible without logging in, and hosted on your primary customer-facing domain. They must match the URLs you include on your opt-in page.
Privacy Policy Requirements

What your Privacy Policy must include

Your Privacy Policy must disclose what data you collect and how it's used. It must also include an explicit statement that messaging opt-in data and consent will not be shared with third parties. Carriers check specifically for this language.

Suggested no-sharing language

Use one of the following statements (or similar language that your legal counsel approves):

"All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties."

"All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties, excluding aggregators and providers of the Text Message services."

Accessibility requirements

    Must be accessible from your main public-facing website (usually found in the footer)
    URL must be live and accessible without logging in
    Must match the Privacy Policy URL on your opt-in page
    Must match the Privacy Policy URL in your sender profile

Cart reminders (if applicable)

If your program includes shopping cart reminders, your Privacy Policy must explicitly state how cart abandonment information is captured by the e-commerce site (e.g., website cookies, plugins, etc.).

Example language:

"Our website uses cookies to keep track of items you place in your shopping cart, including when you abandon your cart. This information may be used to determine when to send cart reminder messages via SMS, where you have opted into such communications."
This works	This doesn't
Privacy Policy includes an explicit no-sharing statement for messaging opt-in data and consent	Privacy Policy mentions sharing consumer PII with third parties for marketing purposes
Privacy Policy is accessible from the main website footer	Privacy Policy is behind a login or requires account creation to view
Privacy Policy URL matches the link on your opt-in page and sender profile	Different Privacy Policy URLs on the opt-in page, sender profile, and website
Cart reminder program: Privacy Policy describes how cart abandonment is detected (cookies, plugins)	Cart reminder program: No mention of how cart abandonment data is captured
Terms of Service Requirements

Required elements checklist

Your Terms of Service must include all of the following:

    Program or brand name: Identifies who is sending the messages
    Program description: Specific message types your sender will deliver (e.g., "order confirmations, shipping updates, and promotional offers"), not just "transactional messages"
    Message frequency: Must match what you stated in your opt-in (e.g., "Message frequency varies" or "3 messages per month")
    Rates disclosure: "Message and data rates may apply"
    Opt-out instructions: How to unsubscribe (STOP keyword for recurring programs), displayed in bold
    Customer care information: HELP keyword plus a support email or phone number
    Link to Privacy Policy: Must match the Privacy Policy on your opt-in page
    Carrier liability disclaimer: "Carriers are not liable for any delayed or undelivered messages"
    Deactivation clause: Must NOT suggest the end user is held liable if they fail to opt out from the program in case of a number change
    Cart reminders (if applicable): Must mention that the program includes shopping cart reminders

Accessibility requirements:

    Must be on your main public-facing website
    URL must be live and accessible without logging in
    Must match the Terms of Service URL on your opt-in page and sender profile

Pro tip: Consider creating messaging-specific Privacy Policies and Terms of Service rather than updating your main company documents. Dedicated messaging policies are easier to keep current if requirements change.
This works	This doesn't
Terms include a specific program description: "Service-related messages may include updates, alerts, and information (e.g., order updates, account alerts). Promotional messages may include promotions, specials, and other marketing offers."	Terms describe the program as "transactional messages" with no further detail (Too vague)
Message frequency in Terms matches the opt-in: "Message frequency varies"	Terms say "3 messages per month" but opt-in says "Message frequency varies" (Mismatch)
Opt-out instructions displayed in bold: "Reply STOP to cancel" 	Opt-out instructions in regular text buried in a paragraph (Must be bold and prominent)
Terms include HELP keyword AND a support email or phone number	Terms only include the HELP keyword with no other contact method
"Carriers are not liable for any delayed or undelivered messages" included	No carrier liability disclaimer (Required element missing)
Deactivation clause is neutral: "If you change your mobile number, please update your preferences"	"You are responsible for opting out before changing your number" (Puts liability on end user)
Terms of Service URL matches the link on opt-in page and sender profile	Different ToS URLs across your opt-in, sender profile, and website

 
Part 3: Eligibility & Acceptable Use

Before you register, confirm that your business meets the eligibility requirements. Your business vertical must not violate Google's Acceptable Use Policy (AUP), and your messaging use case must comply with carrier messaging guidelines, which follow CTIA standards.

You can read more about prohibited message categories in this Help Center article.
Digital Footprint & Website Requirements

Your business must have a legitimate, publicly accessible online presence. Reviewers will search for your brand and verify that your website matches what you've submitted.
This works	This doesn't
A live, functional website that matches the brand name you registered	A website that returns errors, isn't live yet, or is still under construction
Website URL clearly connected to your business name and registration	A URL that redirects to a different brand or unrelated business
Corporate email domain matching your brand (e.g., name@yourbrand.com)	Gmail, Yahoo, or other free email addresses for corporate brand registrations
Consistent branding across your website, registration, and sender profile	Brand name, website, and email domain all pointing to different entities

 
Part 4: Messaging Use Case & Campaign Details

Your use case description and campaign details are where reviewers assess whether your program is legitimate and properly scoped. A compliant use case is one where your messages are directly tied to your relationship with the user, triggered by something the user did or an event related to your product or service, and matching what users consented to receive.
Describing Your Use Case

What makes a compliant use case:

    Messages are directly tied to your relationship with the user
    They're triggered by a user action or an event related to your product or service
    The content matches what users consented to receive

What gets rejected:

    Sharing personal data with affiliates (lead generation or affiliate marketing doesn't pass)
    Collecting opt-in on behalf of a third party
    Opt-in must come directly from your own users

Compliant use case examples
Use Case	Compliant Description
OTP / MFA	"A one-time passcode is sent when a user initiates login or a sensitive account action. The code is triggered by the user's request and expires after 10 minutes."
Transactional	"Order confirmation and shipping updates are sent after a customer completes a purchase. Messages are triggered by purchase and fulfillment events in our order management system."
Marketing / Promotional	"Promotional offers and seasonal discounts are sent to customers who opted in at checkout. Messages go out 2-3 times per month based on our promotional calendar."
Customer Service	"Account alerts and service notifications are sent when account activity requires user attention, such as a failed payment or an upcoming renewal."
This works	This doesn't
"This campaign will send updates on scheduled moves, confirmations, real-time alerts, responses to inquiries, and special offers on moving or storage services." (Specific, describes real interactions) 	"We send messages to customers." (Too vague, no context, no purpose)
"Promotional offers and seasonal discounts are sent to customers who opted in at checkout." (Clear first-party relationship, described trigger) 	"Messages are sent to contacts in our database." (No description of how consent was obtained)
"Order confirmation and shipping updates sent after a customer completes a purchase." (Specific trigger, clear message type) 	"Transactional messages." (Too vague, no description of what transactions)
"Account alerts sent when account activity requires user attention, such as a failed payment." (Describes the specific trigger) 	"We send messages on behalf of our clients to their customers." (Third-party opt-in collection, will be rejected)
Campaign Description

Your campaign description needs to answer three questions:

    Who is sending the message?
    Who is receiving it?
    Why are they receiving it?

Your description must match the campaign type you selected and your sample messages. Keeping these consistent helps your registration get approved. If your brand name, website, or other details have changed since you registered your brand, make sure your campaign description reflects the current registered info to avoid rejection.

Don't include any Personal Identifiable Information (PII) in the campaign description field. Publicly available info like brand names and phone numbers is fine.
This works	This doesn't
"Messages are sent by [Brand Name] to existing customers who have opted in. Messages include OTP codes for MFA logging into our online portal and security alerts regarding profile changes."	"We send texts to people." (Too vague, no brand, no recipient info, no purpose)
"Messages are sent by [Brand Name] to patients with upcoming appointments. Messages include appointment reminders, rescheduling options, and post-visit care instructions."	"John Smith at 555-123-4567 receives appointment reminders from our dental office." (Contains PII)
"Messages are sent by [Brand Name] to customers who schedule service. Messages include appointment confirmations and vehicle ready notifications."	"Messages are sent by [ISV Name] to auto repair customers." (Platform/ISV name instead of the actual end business)

If you're a financial institution engaged in direct, first-party lending, you must mention "Direct Lending" in your description, even if you're only sending OTP/2FA messages.
What Triggers Messages

Describe the actions or events that cause your sender to send a message. Include:

    When the first message is sent after opt-in
    Whether messages go out on a consistent schedule
    Whether user actions (like a purchase) or external triggers (like a package delivery) initiate messages

Business Information

You'll need to provide the following business details:

    Legal business name: Enter the exact company name shown on your CP 575 EIN Confirmation Letter from the IRS. For non-US entities, use the name as registered with your local tax authority.
    Business registration number: Your Employer Identification Number (EIN) or Federal Tax Identification Number (FTIN)
    Company type: Select the type that most closely matches your business
    Business industry: Select the industry that most closely matches your business
    Brand contact phone number: A mobile phone number for the brand, in E.164 format (e.g., +14085980387)
    Business address: The legal address associated with your business registration number
    Stock exchange and stock symbol: Required for publicly traded companies only

Traffic Estimates

    Monthly organic website traffic: The average monthly website traffic associated with this use case
    Existing short code traffic (if applicable): Provide the short code number(s) and estimated monthly traffic volume
    Expected monthly RCS sender traffic volume: Your estimated monthly message volume for this RCS sender

Part 5: Opt-In & Consent Requirements

This is where most rejections happen. Carriers use this information to verify your opt-in process and make sure your sender is trustworthy. Take the time to get this right.

You'll need to provide a full description of every opt-in method your program uses, whether it uses online forms, verbal scripts, QR codes, paper forms, account settings, or any other method. For each, explain where the user starts, what steps they take, and what they see at each stage. Reviewers need to be able to follow your description and verify that required disclosures appear at the point of opt-in.
What Makes a Compliant Opt-In

The consent language at your opt-in point must name your brand explicitly and describe the specific types of messages the user is agreeing to receive. "Transactional messages" alone doesn't pass. It's too vague.
This works	This doesn't
“I'd like to receive newsletters and updates about [Brand] by text message.” (Names the brand, describes the messages) 	“I agree to receive text messages.” (No brand name, no description of message types)
“By checking this box, I agree to receive text message reminders, updates, and alerts about upcoming events from [Brand].” (Specific message types, named brand) 	“By agreeing to our Terms of Service, you consent to receive messages.” (Consent bundled with ToS)
“I want to receive information about the best deals and offers from [Brand] by text message." (Clear promotional consent) 	“We may contact you via SMS.” (Passive, no brand, no specifics)
“I agree to receive text messages from [Brand] regarding promotions and seasonal offers.” (Promotional, specific) 	“Transactional messages from our platform.” (Too vague, no brand name)
Message Frequency

Message frequency must be stated at the point of opt-in. Use a specific number or "Message frequency varies." The phrase "up to X messages per month" is not accepted.
This works	This doesn't
“3 messages per month” (Specific number) 	"Up to 5 messages per month” (Not accepted by carriers)
“Message frequency varies” (Accepted general statement) 	"Occasional messages” (Too vague)
“One message per request” (Good for OTP/single-message programs) 	"We'll text you sometimes” (Not a valid frequency disclosure)
“Msg freq varies” (Accepted abbreviation) 	No frequency mentioned at all (Will be rejected)
Required Disclosures (Recurring Messages)

The following disclosures must appear on the same screen where users opt in. They can't be hidden behind a link, tooltip, or separate page.
Disclosure	Required Language
Rates disclosure	“Message and data rates may apply.” Also accepted: “Msg and data rates may apply.” / “Msg & data rates may apply.” / “Message & data rates may apply.”
Help instructions	“Reply HELP for help.”
Opt-out instructions	“Reply STOP to cancel.”
Terms of Service link	Must point to a public-facing URL on your primary customer-facing domain
Privacy Policy link	Must point to a public-facing URL on your primary customer-facing domain

Important: Both the Terms of Service and Privacy Policy links must appear at the point of opt-in, pointing to the public-facing URLs on your primary customer-facing domain (e.g., yourcompany.com, not an internal tool, subdomain used for another purpose, or a third-party hosted page).
For OTP/MFA/2FA programs: HELP and STOP disclosures aren't required for single-message programs, but the rates disclosure is a best practice, so it’s best to include it.
Opt-In Rules

These rules apply across all opt-in methods, regardless of how consent is collected.

    Channel-specific consent only:  If your consent language covers multiple channels (email, calls, texts), each needs its own separate opt-in. They can be on the same page but must use separate checkboxes or toggles.

    No pre-checked boxes: All checkboxes, toggles, and radio buttons must be unchecked or off by default. Users must actively choose to opt in.

    Pop-ups need an exit option: If your opt-in appears in a modal or pop-up, it must include a visible close button (an X or "No thanks") so users can decline without being forced to complete the opt-in.

    Separate use cases need separate opt-ins: If your sender covers both transactional and marketing messages, each needs its own opt-in with language that describes what that specific program sends. One checkbox for billing alerts, one for marketing. A single opt-in that enrolls users in both won't pass review.

    Consent must be voluntary: Users can't be required to opt in as a condition for completing unrelated actions like creating an account, making a purchase, or accessing services. Messaging consent must be separate from terms of service, privacy policies, or other agreements. Enrolling a customer into multiple campaigns based on a single opt-in will get your registration rejected. Consent also isn't transferable, can't be assigned to others, and can't be buried in general terms and conditions.

    All disclosures must be visible on the same screen: CTIA disclaimers can't be hidden, placed on a separate page, or revealed only when a user hovers over a tooltip or icon. Everything must appear clearly and explicitly on the same screen as the opt-in.

This works	This doesn't
☐ "Yes, I'd like to receive order updates from Acme Corp by text." (Unchecked by default, text-specific) 	☑ "I agree to receive messages from Acme Corp." (Pre-checked box)
Two separate checkboxes: one for billing alerts, one for marketing promotions	A single checkbox that enrolls users in both billing and marketing messages
Disclaimers ("Msg & data rates may apply. Reply STOP to cancel.") visible on the same page as the opt-in	"See our Terms of Service for full messaging details." (Required disclosures hidden behind a link)
Pop-up with a visible X or "No thanks" option to close	Full-screen modal with no way to dismiss without completing the opt-in
Separate checkbox for SMS consent, distinct from Terms of Service agreement	"By agreeing to our Terms of Service, you consent to receive promotional messages." (Consent bundled with ToS)
"Add my mobile number for delivery updates (optional)" (Clearly voluntary) 	"Phone number required to complete purchase" with mandatory SMS opt-in (Forced consent)
Separate opt-in for order updates vs. marketing messages	Single opt-in that enrolls customer in both transactional AND marketing campaigns
Each communication channel (SMS, email, voice) has its own checkbox on the same form	One checkbox that opts the user in to SMS, email, and phone calls simultaneously
Providing Proof When Opt-In Isn't Publicly Visible

Reviewers need to be able to verify the opt-in method you're describing. If your opt-in happens in any of the following situations, you'll need to provide a publicly accessible link to a screenshot (for example, via Google Drive or OneDrive) directly in your opt-in description:

    Behind a login or gated page
    On a paper form
    Via verbal script (IVR or agent)
    Not yet published publicly
    Part of an in-app flow

For text (keyword) opt-in, you must also submit proof showing where users see the phone number and keyword opt-in instructions. You can provide any of the following along with the opt-in disclaimer:

    Screenshot of the webpage or app where the number is shown
    Copy of the sign-up form or landing page
    Email or message where the number was shared with users
    Screenshot of the ad where the number appears

Host a screenshot of the campaign collateral on a publicly accessible website (like OneDrive or Google Drive) and provide the URL in the opt-in description field.
Opt-Out Requirements

Your opt-out description should include the message a user receives when they opt out. It must confirm the user has been unsubscribed and won't receive further messages.
This works	This doesn't
"You've successfully unsubscribed from Acme Corp texts. You will no longer receive messages from this number. Reply START to resubscribe." (Names brand, confirms unsubscription, offers re-subscribe) 	"You've been removed." (No brand name, no confirmation of what was removed)
"You have been successfully unsubscribed from [Program Name]. No further messages will be sent." (Clear confirmation, brand identified) 	"OK" (Doesn't confirm anything)
"You've been opted out of [Program Name]. No further messages will be sent." (Simple, complete) 	No opt-out response at all (System must acknowledge the STOP)
Cart Reminder Double Opt-In

If your RCS sender includes shopping cart reminders, double opt-in is required. This means that in addition to the standard opt-in described above, an additional confirmation message must be sent that explicitly tells users they're being enrolled in a program that includes shopping cart reminders.

Here's what compliant double opt-in messages look like:

"Reply YES to confirm your [Program Name] subscription (incl. Cart Reminders). Msg & data rates may apply. Msg freq varies. Reply HELP for help, STOP to cancel."

"Welcome to [Program Name] (incl. Cart Reminders). Msg & data rates may apply. Msg freq varies. Reply HELP for help, STOP to cancel."
Configure Advanced Opt-Out for RCS

To ensure your RCS sender is approved, you must have a functional opt-in/out flow. T-Mobile will also verify this prior to approval.

You can manage your START, STOP, and HELP  keywords using Twilio’s Advanced Opt-Out feature. Follow these steps to configure Advanced Opt Out for your RCS sender:

    Create a Messaging Service in the Twilio Console.
    Enable Advanced Opt-Out within the Messaging service settings.
    Add your RCS Sender to the Messaging Service.
    Define your replies for the mandatory keywords (HELP, STOP, and START).

For detailed instructions, refer to the Twilio Advanced Opt-Out Documentation.
OTP/MFA/2FA Programs

Single-message verification programs have lighter disclosure requirements, but a few specific rules apply:

    Alternative delivery method required: Carriers require that you also offer an alternative to text messages for verification codes (phone call, email, or push notification). That alternative option must be reflected in the opt-in experience itself.
    Rates disclosure is best practice: Include "Message and data rates may apply" even though it's not strictly required for single-message programs.
    HELP and STOP disclosures aren't mandatory for single-message programs per CTIA, but your system should still support these keywords.
    Opt-in confirmation is the only required sample message. It should include the brand name and describe what the message will contain. Example: "Your verification code for [Brand] will be sent to your number ending in XXXX."

Part 6: Sample Messages

Provide sample messages so reviewers can see exactly what your customers will receive. Use your real brand name consistently throughout. Don't use placeholder company names, and don't include real consumer names or phone numbers. Use brackets for any dynamic content: [Name], [1234], [Date].
Recurring messages

Submit at least 3 sample messages. If your sender covers multiple use cases, include at least one sample per use case. If your program includes cart reminders, include a cart reminder sample.

For recurring message programs, opt-out instructions (STOP) must appear at regular intervals (e.g. “at least once every 3 days” or “at least once every fifth message”) within the normal flow of messages, not just in the opt-in confirmation.
Single messages (OTP/MFA/2FA)

Submit at least 1 sample message showing the verification code format.
Opt-In Confirmation (Welcome Message)

Every sender needs an opt-in confirmation message that goes out immediately when a user subscribes. Include this as one of your samples.
Required Element	What to Include
Brand or program name	Identify who the message is from
Message description	Briefly describe what messages the user signed up for
Message frequency	Must match what you stated in the opt-in
Rates disclosure	"Msg & data rates may apply." (or an accepted variant)
Opt-out instructions	STOP keyword or program-specific opt-out steps
Customer care contact	At minimum, the HELP keyword; a toll-free number or support email is preferred

Example (recurring): "Welcome to [Program Name]. Msg & data rates may apply. Msg freq varies. Reply HELP for help, STOP to cancel."

Example (OTP/MFA/2FA): "Your verification code for [Brand] will be sent to your number ending in XXXX."
This works	This doesn't
"Welcome to Acme Alerts! Msg freq varies. Msg & data rates may apply. Reply HELP for help, STOP to cancel." (All required elements included) 	"You're subscribed." (No brand name, no frequency, no rates, no opt-out)
"Welcome to [Program Name] (incl. Cart Reminders). Msg & data rates may apply. Msg freq varies. Reply HELP for help, STOP to cancel." (Cart reminders disclosed) 	"Welcome! Text STOP to unsubscribe." (Missing rates disclosure, frequency, and brand name)
"Your verification code for [Brand] will be sent to your number ending in XXXX." (OTP: brand name + describes what's coming) 	"Your code is on the way." (No brand name, no program context)
HELP Response

The response your sender sends when a user texts HELP.
Required Element	What to Include
Brand or program name	Identify who the message is from
Customer care contact	A toll-free support number or customer support email address

Example: "[Program Name] help: Call us at 1-800-XXX-XXXX or email support@brand.com. Msg & data rates may apply. Reply STOP to cancel."
This works	This doesn't
"Acme Alerts: For support, call 1-800-555-0100 or email help@acme.com. Reply STOP to unsubscribe." (Brand name + real contact method) 	"For help, visit our website." (No brand name, no direct contact method)
"[Program Name]: Help at support@brand.com. Msg & data rates may apply. Msg freq varies. Reply STOP to cancel." (All elements present) 	"Text STOP to stop." (Doesn't identify the program or provide support contact)
STOP Response

The response your sender sends when a user texts STOP.
Required Element	What to Include
Brand or program name	Identify who the message is from
Opt-out confirmation	Confirm the user has been unsubscribed and won't receive further messages

Example: "You've been unsubscribed from [Program Name]. No further messages will be sent. Reply START to resubscribe."
This works	This doesn't
"You've been opted out of Acme Alerts. No further messages will be sent." (Brand name + clear confirmation) 	"OK, stopped." (No brand name, no confirmation of what was stopped)
"You have successfully been unsubscribed from [Program Name]. No further messages will be sent. Reply START to resubscribe." (Confirms opt-out, offers resubscribe path) 	"You've been removed from our list." (No brand name, vague about what list)

 
Part 7: Data Consistency & Common Rejection Reasons

Before you submit, take a few minutes to check for these common issues. Inconsistencies are one of the most frequent causes of rejection and the easiest to avoid.
Keep PII out of registration fields

Don't include real consumer names or phone numbers in your descriptions or sample messages. Use placeholders like [Name] or [555-555-5555] instead.
Make sure your data matches up

Reviewers will check that all the information you submit lines up consistently. If anything points to different entities or looks contradictory, your registration will be flagged.

    Brand name: If you register as "Acme Inc" but your messages say "Contoso," reviewers will flag that mismatch
    Email domain: Corporate brands should use matching email domains, not gmail or yahoo addresses
    Website: The URL you provide must be functional and represent the brand you're registering. Sites that don't load, return errors, or aren't live yet won't pass review
    Third-party URLs: Links within your messaging content must represent the registered brand. Third-party redirects aren't permitted
    ISVs: If you provide software for dental practices, don't register your software company. Register the specific dental practice that's actually sending the messages
    Duplicate registrations: Creating multiple brands with the same EIN or duplicate campaigns can delay your approval

This works	This doesn't
Brand name "Acme Inc," messages signed "Acme Inc," website at acme.com (All three match) 	Brand name "Acme Inc," messages signed "Contoso," website at a third-party platform (Three different identities)
Corporate brand uses authorized.rep@acme.com (Domain matches the registered brand) 	Corporate brand uses authorized.rep@gmail.com (Personal email for a corporate registration)
Website loads, is publicly accessible, and clearly represents the brand	Website returns a 404 or redirects to a different brand (Will fail review)
ISV registers the dental practice that sends the messages	ISV registers their own company instead of the dental practice (Wrong entity)
One brand registration per EIN for a given use case	Multiple brand registrations with the same EIN (Creates duplicates that slow approval)
Shortened links use a branded domain (e.g., acme.co/track)	Shortened links redirect through a generic third-party domain (Not permitted)
# RCS Demo Compliance Requirements

Status: working checklist for the MVP demo. Replace or extend this file with the final carrier/platform compliance requirements before submission.

## Consent

- Users are treated as not opted in by default.
- First contact returns a consent prompt before any hiring workflow starts.
- The consent prompt identifies WorkOnward and the message purpose.
- The consent prompt includes opt-in, help, opt-out, message frequency, message/data rate, Terms, and Privacy language.
- The opt-in prompt must show the WorkOnward policy URLs exactly: `https://www.workonward.com/en/terms` and `https://www.workonward.com/en/privacy`.
- Supported opt-in keywords: `YES`, `START`, `UNSTOP`.
- Consent events are stored with phone number, timestamp, source, keyword, and message SID when available.

## Opt-Out

- Supported opt-out keywords: `STOP`, `STOPALL`, `UNSUBSCRIBE`, `CANCEL`, `END`, `QUIT`, `REVOKE`, `OPTOUT`.
- Opt-out keywords are matched case-insensitively.
- Opt-out is checked before any other business logic.
- Opted-out users cannot receive job search, application, interview, or marketing messages from the app.
- Opt-out events are persisted in the local audit store.
- Replying `START`, `YES`, or `UNSTOP` reactivates the local app state.

## Help

- Supported help keywords: `HELP`, `INFO`.
- Help responses identify WorkOnward.
- Help responses include opt-out instructions.
- Help responses include a human support path.
- Help responses state that candidates are never asked for payment by message.

## Demo Behavior

- The demo uses predefined actions and predefined responses.
- The demo does not use free-form AI to decide consent, opt-out, help, escalation, or candidate workflow state.
- Free text is accepted only as structured input for demo fields such as language, role, city/ZIP, and shift.
- Demo job matches come from seeded local data.
- Demo responses must not imply guaranteed employment, guaranteed interviews, or real application submission.

## Trust and Safety

- Public trust and safety information must be available at `/trust-safety`.
- Public privacy information must be available at `/privacy`.
- Privacy copy must state that text messaging originator opt-in data and consent are not shared with third parties except messaging service providers.
- Public terms must be available at `/terms`.
- Terms copy must include program name, program description, message frequency, rates disclosure, bold STOP instruction, HELP/support contact, Privacy link, carrier liability disclaimer, and neutral number-change language.
- Public support information must be available at `/support`.
- Public consent details must be available at `/consent-info`.
- The app must state that candidates are not charged application, placement, interview, equipment, or onboarding fees by message.
- Human escalation must be available with `AGENT`, `SUPPORT`, `HUMAN`, or `PERSON`.

## Auditability

- The app stores user consent status across server restarts.
- The app stores consent records separately from conversational state.
- The app stores audit events for consent prompts, opt-ins, opt-outs, help, handoff, outbound sends, and outbound failures.
- Application logs must mask phone numbers.

## Twilio / Messaging Service Configuration

- Production must use a Twilio Messaging Service configured for the approved RCS sender.
- The RCS Sender accent color should be `#3D3D3D`, which meets Twilio's contrast requirement against white.
- The WorkOnward orange `#ED6600` and green `#72A400` should appear in branded media and public pages, not as the official sender accent.
- Generated sender review assets are available at `/assets/rcs/workonward-logo.png` and `/assets/rcs/workonward-banner.png`.
- `RCS_ASSET_BASE_URL` should point Twilio Content templates to the public app host serving `/assets/rcs`; for Railway production use `https://twilio-rcs-production.up.railway.app`.
- Webhook signature validation must remain enabled in production.
- Advanced Opt-Out should be reviewed for the Messaging Service so Twilio can forward `OptOutType` values where available.
- The application must still handle keyword text directly when Twilio forwards the inbound message body.
- When Twilio sends `OptOutType`, the application records the event and does not send a duplicate keyword confirmation message.

## Reviewer Demo Script

- Send `Hi` and verify consent prompt.
- Send `YES` and verify opt-in confirmation.
- Send `Spanish`, `warehouse`, `90011`, and `morning` to complete candidate intake.
- Send `APPLY`, `STATUS`, and `INTERVIEW` to verify predefined next-step actions.
- Send `HELP` to verify support and opt-out instructions.
- Send `AGENT` to verify human escalation.
- Send `STOP` to verify local opt-out persistence.
