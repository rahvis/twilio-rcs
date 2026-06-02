const brandName = process.env.BRAND_NAME || 'WorkOnward';
const supportEmail = process.env.SUPPORT_EMAIL || 'help@workonward.com';
const termsUrl = process.env.MESSAGING_TERMS_URL || 'https://www.workonward.com/en/terms';
const privacyUrl = process.env.MESSAGING_PRIVACY_URL || 'https://www.workonward.com/en/privacy';

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | ${brandName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --wo-orange: #ED6600;
      --wo-green: #72A400;
      --wo-dark: #3D3D3D;
      --wo-light-orange: #FFD3B3;
      --wo-light-green: #DEF1B1;
      --wo-gray: #909090;
      --wo-surface: #F6F7F2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Open Sans", Arial, Helvetica, sans-serif;
      color: var(--wo-dark);
      background: #fff;
    }
    body::before {
      content: "";
      display: block;
      height: 10px;
      background: linear-gradient(90deg, var(--wo-orange) 0 52%, var(--wo-green) 52% 100%);
    }
    main { max-width: 820px; margin: 0 auto; padding: 36px 20px 72px; }
    .brandbar {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e4e4e4;
    }
    .brandmark {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #050505;
      position: relative;
      flex: 0 0 auto;
    }
    .brandmark::before,
    .brandmark::after {
      content: "";
      position: absolute;
      top: 13px;
      width: 12px;
      height: 24px;
      border-radius: 8px;
      transform: skew(-14deg);
    }
    .brandmark::before { left: 12px; background: var(--wo-green); }
    .brandmark::after { right: 12px; background: var(--wo-orange); }
    .brandname { font-size: 20px; font-weight: 800; line-height: 1; }
    .brandsub { margin-top: 5px; color: #666; font-size: 13px; font-weight: 600; }
    nav { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 34px; font-size: 14px; }
    nav a {
      color: var(--wo-dark);
      text-decoration: none;
      font-weight: 700;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 8px 10px;
      background: var(--wo-surface);
    }
    nav a:hover { border-color: var(--wo-orange); color: #9e4400; }
    a { color: #4b7200; font-weight: 700; }
    h1 { font-size: clamp(32px, 5vw, 46px); line-height: 1.08; margin: 0 0 20px; color: #111; letter-spacing: 0; }
    h2 { font-size: 22px; margin: 34px 0 10px; color: #111; letter-spacing: 0; }
    p, li { font-size: 17px; line-height: 1.62; }
    code {
      background: var(--wo-light-green);
      color: #263600;
      padding: 2px 6px;
      border-radius: 5px;
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 0.92em;
    }
    strong { color: #111; }
    ol { padding-left: 24px; }
    @media (max-width: 560px) {
      main { padding: 28px 16px 56px; }
      nav { gap: 8px; }
      nav a { flex: 1 1 calc(50% - 8px); text-align: center; }
      p, li { font-size: 16px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="brandbar">
      <div class="brandmark" aria-hidden="true"></div>
      <div>
        <div class="brandname">${brandName}</div>
        <div class="brandsub">Local hiring messages</div>
      </div>
    </div>
    <nav>
      <a href="/trust-safety">Trust & Safety</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/support">Support</a>
      <a href="/consent-info">Consent</a>
      <a href="/demo-guide">Demo Guide</a>
    </nav>
    ${body}
  </main>
</body>
</html>`;
}

export const staticPages = {
  privacy: page(
    'Privacy',
    `<h1>Privacy</h1>
    <p>${brandName} uses messaging to help candidates receive local hiring messages, including application and interview updates, job matches and job alerts, recruiting outreach, and support when requested.</p>
    <h2>Data We Collect</h2>
    <p>For this demo, we store phone number, consent status, selected message categories, message timestamps, and audit events needed to prove opt-in and opt-out behavior.</p>
    <h2>How We Use Data</h2>
    <p>We use this data only to operate the local hiring messaging experience, provide support, prevent misuse, and maintain consent records.</p>
    <h2>Messaging Consent Data</h2>
    <p>All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties, excluding aggregators and providers of the text message services.</p>
    <h2>Candidate Fees</h2>
    <p>${brandName} does not ask candidates to pay application, interview, placement, equipment, or onboarding fees by message.</p>
    <h2>Contact</h2>
    <p>Questions or deletion requests can be sent to <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>`
  ),

  terms: page(
    'Terms',
    `<h1>Terms</h1>
    <p>${brandName} local hiring messages may include application and interview updates, job matches and job alerts, recruiting outreach, and human support responses when requested. This demo is not a guarantee of employment, interview availability, pay, or placement.</p>
    <h2>Messaging</h2>
    <p>${brandName} asks users to choose which RCS message categories they want to receive. Users can opt in one category at a time. Message frequency varies. Message and data rates may apply. <strong>Reply STOP to cancel.</strong> Reply HELP for help or email <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <p>Privacy Policy: <a href="${privacyUrl}">${privacyUrl}</a>.</p>
    <p>Carriers are not liable for any delayed or undelivered messages.</p>
    <p>If you change your mobile number, please update your preferences or contact support so messaging records can be corrected.</p>
    <h2>Safe Use</h2>
    <p>Users should not send sensitive identity documents, banking information, or payment information through this demo messaging flow.</p>`
  ),

  trustSafety: page(
    'Trust & Safety',
    `<h1>Trust & Safety</h1>
    <p>${brandName} is designed as a trusted local workforce messaging layer for candidates and verified hiring workflows.</p>
    <h2>Verified Employers</h2>
    <p>The demo job dataset marks employers as verified and presents only no-fee candidate opportunities.</p>
    <h2>Anti-Fraud</h2>
    <p>The assistant reminds candidates that no payment is required. Suspicious or unsupported requests should be escalated to a person with <code>AGENT</code>.</p>
    <h2>Human Support</h2>
    <p>Users can reply <code>AGENT</code> or contact <a href="mailto:${supportEmail}">${supportEmail}</a> for human review.</p>
    <h2>Opt-Out</h2>
    <p>Users can reply <code>STOP</code>, <code>UNSUBSCRIBE</code>, <code>CANCEL</code>, <code>END</code>, or <code>QUIT</code> to opt out.</p>`
  ),

  support: page(
    'Support',
    `<h1>Support</h1>
    <p>For help with ${brandName} hiring messages, reply <code>HELP</code> in the conversation or email <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <h2>Human Escalation</h2>
    <p>Reply <code>AGENT</code>, <code>SUPPORT</code>, or <code>HUMAN</code> to request review by a person.</p>
    <h2>Opt-Out</h2>
    <p>Reply <code>STOP</code> to stop receiving messages. Reply <code>START</code> to opt back in.</p>`
  ),

  consentInfo: page(
    'Consent Info',
    `<h1>Consent Info</h1>
    <p>${brandName} treats users as not opted in by default. The RCS flow asks users to choose which message categories they want to receive, one category at a time.</p>
    <p>Opt-in language: Choose which ${brandName} RCS messages you want to receive. You can opt in one category at a time. Msg freq varies. Msg & data rates may apply. Reply HELP for help. Reply STOP to cancel. Terms: <a href="${termsUrl}">${termsUrl}</a>. Privacy: <a href="${privacyUrl}">${privacyUrl}</a>.</p>
    <h2>Opt-In</h2>
    <p>Users can choose <code>Opt in</code> or <code>Not now</code> for each category: application and interview updates, job matches and job alerts, and recruiting outreach.</p>
    <h2>Opt-Out</h2>
    <p>Supported opt-out keywords are <code>STOP</code>, <code>STOPALL</code>, <code>UNSUBSCRIBE</code>, <code>CANCEL</code>, <code>END</code>, <code>QUIT</code>, <code>REVOKE</code>, and <code>OPTOUT</code>.</p>
    <h2>Audit Records</h2>
    <p>The demo stores consent records and audit events in a local JSON state file configured by <code>DATA_DIR</code>.</p>`
  ),

  demoGuide: page(
    'Demo Guide',
    `<h1>RCS Demo Guide</h1>
    <p>This demo is interactive but predefined. Auditors can send the following messages to verify the core consent experience.</p>
    <h2>Script</h2>
    <ol>
      <li>Send any first message, such as <code>Hi</code>. Expected: consent prompt.</li>
      <li>Choose <code>Opt in</code> or <code>Not now</code> for each RCS consent category.</li>
      <li>Expected: consent summary showing which categories are opted in and not opted in.</li>
      <li>Send <code>HELP</code>. Expected: support and opt-out instructions.</li>
      <li>Send <code>AGENT</code>. Expected: human escalation confirmation.</li>
      <li>Send <code>STOP</code>. Expected: local suppression record and opt-out behavior.</li>
    </ol>`
  )
};
