/* eslint-disable no-console */

/**
 * Creates RCS-compatible Twilio Content templates for the deterministic demo.
 *
 * This script intentionally does NOT modify RCS sender webhook configuration,
 * phone numbers, messaging services, or any other Twilio routing settings.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const CONTENT_API_URL = 'https://content.twilio.com/v1/Content';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const brandName = process.env.BRAND_NAME || 'WorkOnward';
const supportEmail = process.env.RCS_HELP_EMAIL || 'help@workonward.com';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://workonward.com';
const rcsAssetBaseUrl = process.env.RCS_ASSET_BASE_URL || publicBaseUrl;
const rcsAssetBase = rcsAssetBaseUrl.replace(/\/+$/, '');
const termsUrl = process.env.MESSAGING_TERMS_URL || 'https://www.workonward.com/en/terms';
const privacyUrl = process.env.MESSAGING_PRIVACY_URL || 'https://www.workonward.com/en/privacy';

const brand = {
  orange: '#ED6600',
  green: '#72A400',
  darkGray: '#3D3D3D',
  lightOrange: '#FFD3B3',
  lightGreen: '#DEF1B1',
  gray: '#909090',
  font: 'Open Sans'
};

const shouldForce = process.argv.includes('--force');
const shouldDryRun = process.argv.includes('--dry-run');

function assetUrl(fileName) {
  return `${rcsAssetBase}/assets/rcs/${fileName}`;
}

function quickReply(title, id, chipList = true) {
  const action = { type: 'QUICK_REPLY', title, id };
  if (chipList) {
    action.chip_list = true;
  }
  return action;
}

function urlAction(title, id, url, chipList = true) {
  const action = {
    type: 'URL',
    title,
    id,
    url,
    webview_size: 'FULL'
  };
  if (chipList) {
    action.chip_list = true;
  }
  return action;
}

const cardTemplates = [
  {
    envKey: 'RCS_CONTENT_CONSENT_SID',
    friendlyName: 'workonward_rcs_category_opt_in_carousel',
    textBody: `Choose which ${brandName} RCS messages you want to receive. You can opt in one category at a time. Msg freq varies. Msg & data rates may apply. Reply HELP for help. Reply STOP to cancel. Terms: ${termsUrl} Privacy: ${privacyUrl}`,
    carousel: {
      body: `Choose which ${brandName} RCS messages you want to receive. You can opt in one category at a time. Msg freq varies. Msg & data rates may apply. Reply HELP for help. Reply STOP to cancel. Terms: ${termsUrl} Privacy: ${privacyUrl}`,
      cards: [
        {
          title: 'Application & interview updates',
          body: 'Get updates about applications, interviews, and hiring steps.',
          media: assetUrl('apply-followup.png'),
          actions: [
            quickReply('Opt in', 'OPT_IN_TO_APPLICATION_UPDATES', false),
            quickReply('Not now', 'NOT_NOW_FOR_APPLICATION_UPDATES', false)
          ]
        },
        {
          title: 'Job matches & job alerts',
          body: 'Receive relevant local job matches and alerts.',
          media: assetUrl('job-warehouse.png'),
          actions: [
            quickReply('Opt in', 'OPT_IN_TO_JOB_MATCHES', false),
            quickReply('Not now', 'NOT_NOW_FOR_JOB_MATCHES', false)
          ]
        },
        {
          title: 'Recruiting outreach',
          body: 'Hear from WorkOnward recruiting about roles that may fit your background.',
          media: assetUrl('actions.png'),
          actions: [
            quickReply('Opt in', 'OPT_IN_TO_RECRUITING_OUTREACH', false),
            quickReply('Not now', 'NOT_NOW_FOR_RECRUITING_OUTREACH', false)
          ]
        }
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_LANGUAGE_SID',
    friendlyName: 'workonward_rcs_language_card',
    textBody: `Welcome to ${brandName} local hiring messages. Msg freq varies. Msg & data rates may apply. Reply HELP for help, STOP to cancel. Choose a language: English, Spanish, or Korean.`,
    card: {
      title: `Welcome to ${brandName}`,
      body: 'Local hiring messages are on. Msg freq varies. Msg & data rates may apply. Reply HELP for help, STOP to cancel. Choose a language.',
      media: [assetUrl('language.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('English', 'LANG_EN'),
        quickReply('Spanish', 'LANG_ES'),
        quickReply('Korean', 'LANG_KO')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_ROLE_SID',
    friendlyName: 'workonward_rcs_role_card',
    textBody: 'Choose a demo job category: Warehouse, Restaurant, Retail, or Caregiving.',
    card: {
      title: 'Job category',
      body: 'Choose one demo job category. Results are scripted for approval testing.',
      media: [assetUrl('role.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Warehouse', 'ROLE_WAREHOUSE'),
        quickReply('Restaurant', 'ROLE_RESTAURANT'),
        quickReply('Retail', 'ROLE_RETAIL'),
        quickReply('Caregiving', 'ROLE_CAREGIVING')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_LOCATION_SID',
    friendlyName: 'workonward_rcs_location_card',
    textBody: 'Choose a demo location: Los Angeles 90011, Koreatown 90020, or Long Beach 90802.',
    card: {
      title: 'Job location',
      body: 'Choose one demo work location.',
      media: [assetUrl('location.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('LA 90011', 'LOC_LA'),
        quickReply('Koreatown', 'LOC_KTOWN'),
        quickReply('Long Beach', 'LOC_LONG_BEACH')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_SHIFT_SID',
    friendlyName: 'workonward_rcs_shift_card',
    textBody: 'Choose a demo shift: Morning, Evening, Weekend, or Flexible.',
    card: {
      title: 'Shift preference',
      body: 'Choose a demo shift preference.',
      media: [assetUrl('shift.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Morning', 'SHIFT_MORNING'),
        quickReply('Evening', 'SHIFT_EVENING'),
        quickReply('Weekend', 'SHIFT_WEEKEND'),
        quickReply('Flexible', 'SHIFT_FLEX')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_JOBS_CAROUSEL_SID',
    friendlyName: 'workonward_rcs_jobs_carousel',
    textBody: `Here are scripted ${brandName} demo job matches. Reply APPLY, STATUS, INTERVIEW, JOBS, HELP, AGENT, or STOP to cancel.`,
    carousel: {
      body: `${brandName} demo job matches`,
      cards: [
        {
          title: 'Warehouse Associate',
          body: 'LA Fresh Logistics. Los Angeles, CA. $19-$22/hr. Verified, no candidate fees.',
          media: assetUrl('job-warehouse.png'),
          actions: [
            quickReply('Apply', 'ACTION_APPLY', false),
            quickReply('Status', 'ACTION_STATUS', false)
          ]
        },
        {
          title: 'Restaurant Crew',
          body: 'Civic Center Kitchen. Los Angeles, CA. $18-$21/hr. Verified, no candidate fees.',
          media: assetUrl('job-restaurant.png'),
          actions: [
            quickReply('Apply', 'ACTION_APPLY', false),
            quickReply('Interview', 'ACTION_INTERVIEW', false)
          ]
        },
        {
          title: 'Caregiving Assistant',
          body: 'Neighbor Care Partners. Los Angeles, CA. $20-$24/hr. Verified, no candidate fees.',
          media: assetUrl('job-caregiving.png'),
          actions: [
            quickReply('Apply', 'ACTION_APPLY', false),
            quickReply('HELP', 'HELP_MENU', false)
          ]
        }
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_ACTIONS_SID',
    friendlyName: 'workonward_rcs_actions_card',
    textBody: 'Choose a demo action: Apply, Status, Interview, Jobs, Help, Agent, or STOP to cancel.',
    card: {
      title: 'Next action',
      body: 'Choose what you want to test next. Every response is scripted. Reply STOP to cancel.',
      media: [assetUrl('actions.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Apply', 'ACTION_APPLY'),
        quickReply('Status', 'ACTION_STATUS'),
        quickReply('Interview', 'ACTION_INTERVIEW'),
        quickReply('Jobs', 'ACTION_JOBS'),
        quickReply('HELP', 'HELP_MENU'),
        quickReply('Agent', 'HUMAN_AGENT')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_APPLY_FOLLOWUP_SID',
    friendlyName: 'workonward_rcs_apply_followup_card',
    textBody: `Thank you for applying through ${brandName}. This is a scripted demo confirmation. A verified employer coordinator would confirm next steps here. Do you need more help? Reply HELP, NO, or JOBS.`,
    card: {
      title: 'Thank you',
      body: 'Your demo application step is recorded. Do you need more help?',
      media: [assetUrl('apply-followup.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('HELP', 'HELP_MENU'),
        quickReply('No', 'APPLY_NO_HELP'),
        quickReply('Jobs', 'ACTION_JOBS')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_APPLY_CLOSING_SID',
    friendlyName: 'workonward_rcs_apply_closing_card',
    textBody: `You're welcome. Please feel free to explore more jobs anytime. Reply JOBS to see demo job matches again, HELP for support, or STOP to cancel.`,
    card: {
      title: "You're welcome",
      body: 'Please feel free to explore more jobs anytime.',
      media: [assetUrl('apply-closing.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Jobs', 'ACTION_JOBS'),
        quickReply('HELP', 'HELP_MENU'),
        quickReply('STOP', 'STOP')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_HELP_SID',
    friendlyName: 'workonward_rcs_help_card',
    textBody: `${brandName} help: email ${supportEmail}. Reply STOP to cancel or AGENT for a person.`,
    card: {
      title: `${brandName} help`,
      body: `Email ${supportEmail}. Msg freq varies. Msg & data rates may apply. We never ask candidates for payment by message.`,
      media: [assetUrl('help.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Agent', 'HUMAN_AGENT'),
        quickReply('Jobs', 'ACTION_JOBS'),
        quickReply('STOP', 'STOP')
      ]
    }
  },
  {
    envKey: 'RCS_CONTENT_HANDOFF_SID',
    friendlyName: 'workonward_rcs_handoff_card',
    textBody: `A ${brandName} team member has been requested. Reply STOP to opt out.`,
    card: {
      title: 'Support requested',
      body: `A ${brandName} team member has been requested. We will review this conversation and follow up when available.`,
      media: [assetUrl('handoff.png')],
      orientation: 'VERTICAL',
      height: 'SHORT',
      actions: [
        quickReply('Jobs', 'ACTION_JOBS'),
        quickReply('HELP', 'HELP_MENU'),
        quickReply('STOP', 'STOP')
      ]
    }
  }
];

function requireEnv() {
  const missing = [];
  if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
  if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

function contentPayload(template) {
  const types = {
    'twilio/text': {
      body: template.textBody
    }
  };

  if (template.card) {
    types['twilio/card'] = template.card;
  }

  if (template.carousel) {
    types['twilio/carousel'] = template.carousel;
  }

  return {
    friendly_name: template.friendlyName,
    language: 'en',
    types
  };
}

async function createContent(template) {
  const response = await axios.post(CONTENT_API_URL, contentPayload(template), {
    auth: {
      username: accountSid,
      password: authToken
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return response.data.sid;
}

function mediaUrlsFor(template) {
  const urls = [];

  if (template.card?.media) {
    urls.push(...template.card.media);
  }

  if (template.carousel?.cards) {
    for (const card of template.carousel.cards) {
      if (card.media) {
        urls.push(card.media);
      }
    }
  }

  return urls;
}

async function validateMediaUrls() {
  const urls = [...new Set(cardTemplates.flatMap(mediaUrlsFor))];

  for (const url of urls) {
    const response = await axios.head(url, {
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(`RCS media URL did not return an image content type: ${url} (${contentType})`);
    }

    console.log(`Verified media ${url} (${contentType})`);
  }
}

function setEnvValue(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }

  const separator = contents.endsWith('\n') ? '' : '\n';
  return `${contents}${separator}${line}\n`;
}

function updateEnv(results) {
  let contents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, value] of Object.entries(results)) {
    contents = setEnvValue(contents, key, value);
  }

  fs.writeFileSync(envPath, contents);
}

async function main() {
  requireEnv();

  if (shouldDryRun) {
    console.log(`Using ${brand.font} with sender accent ${brand.darkGray}, orange ${brand.orange}, and green ${brand.green}`);
    console.log(`Using RCS media base ${rcsAssetBase}`);
  } else {
    await validateMediaUrls();
  }

  const created = {};

  for (const template of cardTemplates) {
    const existingSid = process.env[template.envKey];
    if (existingSid && !shouldForce) {
      console.log(`Skipping ${template.envKey}; already set to ${existingSid}`);
      continue;
    }

    if (shouldDryRun) {
      const type = template.carousel ? 'twilio/carousel' : 'twilio/card';
      console.log(`Would create ${template.friendlyName} (${type}) for ${template.envKey}`);
      continue;
    }

    console.log(`Creating ${template.friendlyName}...`);
    created[template.envKey] = await createContent(template);
    console.log(`Created ${template.envKey}=${created[template.envKey]}`);
  }

  if (!shouldDryRun && Object.keys(created).length > 0) {
    updateEnv(created);
    console.log(`Updated ${envPath}`);
  }

  if (Object.keys(created).length === 0 && !shouldDryRun) {
    console.log('No new templates created. Use --force to recreate and overwrite existing card SIDs.');
  }
}

main().catch((error) => {
  const detail = error.response?.data || error.message;
  console.error('Failed to create RCS card templates:', detail);
  process.exit(1);
});
