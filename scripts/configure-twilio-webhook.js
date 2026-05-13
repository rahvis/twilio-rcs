#!/usr/bin/env node

const http = require('http');
const twilio = require('twilio');
require('dotenv').config();

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Request failed with status ${res.statusCode}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Timed out reading ngrok tunnels'));
    });
  });
}

async function resolveBaseUrl() {
  const argUrl = process.argv[2];
  if (argUrl) {
    return argUrl.replace(/\/$/, '');
  }

  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, '');
  }

  const tunnels = await getJson('http://127.0.0.1:4040/api/tunnels');
  const httpsTunnel = tunnels.tunnels.find((tunnel) => tunnel.proto === 'https');

  if (!httpsTunnel) {
    throw new Error('No HTTPS ngrok tunnel found. Start ngrok or pass a public base URL.');
  }

  return httpsTunnel.public_url.replace(/\/$/, '');
}

async function main() {
  const accountSid = requiredEnv('TWILIO_ACCOUNT_SID');
  const authToken = requiredEnv('TWILIO_AUTH_TOKEN');
  const messagingServiceSid = requiredEnv('TWILIO_MESSAGING_SERVICE_SID');
  const baseUrl = await resolveBaseUrl();
  const webhookUrl = `${baseUrl}/webhook/sms`;
  const client = twilio(accountSid, authToken);

  const service = await client.messaging.v1
    .services(messagingServiceSid)
    .update({
      inboundRequestUrl: webhookUrl,
      inboundMethod: 'POST'
    });

  console.log(JSON.stringify({
    messagingServiceSid: service.sid,
    inboundRequestUrl: service.inboundRequestUrl,
    inboundMethod: service.inboundMethod
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
