# End-to-end deployment plan — `rcs.workonward.com` on Railway

This deploys the Twilio SMS/RCS demo to Railway and serves it at
`https://rcs.workonward.com`. No code changes needed. No Nginx.
No Let's Encrypt to manage — Railway issues the TLS cert.

Your apex `workonward.com` is untouched by this plan.

---

## What's true before you start

- The app stores consent, audit, and user state in `data/rcs-state.json`
  on disk. Railway's filesystem is **ephemeral by default** — every deploy
  resets the disk. To keep this state across deploys you must attach a
  **persistent volume**. This plan does that. **Without it, every redeploy
  wipes consent records — that is a compliance problem.**
- `PUBLIC_BASE_URL` will be set to `https://rcs.workonward.com`.
- Twilio's signature middleware already reads `x-forwarded-proto` /
  `x-forwarded-host`, which Railway sets correctly. No code change.
- Railway deploys from a GitHub repo — `git push` is the deploy mechanism.
  There is no SSH, no PM2, no systemd.

---

## Phase 0 — Pre-flight (laptop, 10 min)

1. Push this repo to GitHub (private is fine). Railway connects to it.
2. Create a Railway account at <https://railway.app> and link your GitHub
   account.
3. You're on at least the **Hobby** plan ($5/mo). The free trial works
   for testing but doesn't keep services running long-term.
4. Have access to the Cloudflare dashboard for `workonward.com` (you said
   you'll add the DNS record yourself).
5. Have your Twilio Account SID and Auth Token handy (already in your
   local `.env`).

---

## Phase 1 — Create the Railway project (5 min)

In the Railway dashboard:

1. **New Project → Deploy from GitHub repo** → pick the repo for this app.
2. Railway auto-detects Node, runs `npm install`, then `npm run build`,
   then `npm start` (defined in [package.json](package.json)). No
   Dockerfile needed.
3. Wait for the first build to finish. It will fail or crash at runtime
   because env vars and the volume aren't set yet — that's expected.
   Continue to Phase 2.

---

## Phase 2 — Environment variables + persistent volume (10 min)

### 2A. Environment variables

In the Railway service → **Variables** tab, add:

```env
NODE_ENV=production
PORT=3000
PUBLIC_BASE_URL=https://rcs.workonward.com
DISABLE_SIGNATURE_VALIDATION=false

TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_MESSAGING_SERVICE_SID=<your-twilio-messaging-service-sid>

DATA_DIR=/data
BRAND_NAME=WorkOnward
SUPPORT_EMAIL=help@workonward.com

GEMINI_API_KEY=<your gemini key>

RCS_CONTENT_CONSENT_SID=<HX...>
RCS_CONTENT_LANGUAGE_SID=<HX...>
RCS_CONTENT_ROLE_SID=<HX...>
RCS_CONTENT_LOCATION_SID=<HX...>
RCS_CONTENT_SHIFT_SID=<HX...>
RCS_CONTENT_JOBS_CAROUSEL_SID=<HX...>
RCS_CONTENT_ACTIONS_SID=<HX...>
RCS_CONTENT_HELP_SID=<HX...>
RCS_CONTENT_HANDOFF_SID=<HX...>
```

Notes:

- `DATA_DIR=/data` is **critical** — it tells the app to read/write
  state inside the persistent volume we mount next, instead of the
  default `data/` folder inside the ephemeral container.
- Do NOT add `NGROK_AUTH_TOKEN`.
- Do NOT commit any of these to git.

### 2B. Persistent volume

In the same Railway service:

1. **Volumes → New Volume**.
2. Mount path: `/data`
3. Size: 1 GB is more than enough.
4. Attach to this service.

Railway will redeploy the service with the volume mounted. State written
to `/data/rcs-state.json` will now survive deploys, restarts, and rollbacks.

### 2C. Verify

After the redeploy finishes:

1. Open the Railway logs — you should see `Server started successfully`
   and `Ready to receive messages`.
2. In the service → **Settings → Networking → Public Networking →
   Generate Domain** — this gives a temporary URL like
   `your-service-production.up.railway.app`.
3. From your laptop:

   ```bash
   curl https://your-service-production.up.railway.app/health
   ```

   Returns `{"status":"ok",...}`. You'll replace this URL with the
   custom domain in the next phase.

---

## Phase 3 — Custom domain `rcs.workonward.com` (10 min)

You will add the domain in Railway, then manually create the CNAME in
the Cloudflare dashboard yourself.

### 3A. Add the domain in Railway

1. Service → **Settings → Networking → Custom Domain → + Custom Domain**.
2. Enter: `rcs.workonward.com`.
3. Railway shows you a **CNAME target**, something like
   `abc123xy.up.railway.app` (specific to your service — copy what Railway
   shows you, don't reuse this example value).
4. Leave this page open — you need that target for the next step.

### 3B. Create the DNS record in Cloudflare (manually)

1. Log in to your Cloudflare dashboard.
2. Select the **`workonward.com`** zone.
3. Left nav → **DNS → Records → Add record**.
4. Fill in:
   - **Type:** `CNAME`
   - **Name:** `rcs`  (full hostname shown as `rcs.workonward.com`)
   - **Target:** the CNAME target Railway gave you (e.g.
     `abc123xy.up.railway.app`)
   - **Proxy status:** **DNS only** (grey cloud) — important. Railway
     issues its own TLS cert via Let's Encrypt, and the ACME challenge
     needs DNS to point directly at Railway. With the orange cloud on,
     cert provisioning fails.
   - **TTL:** `Auto`
5. Save.

### 3C. Wait for Railway to provision the cert

Back in Railway's Custom Domain page, the status moves from
"Awaiting DNS" → "Issuing certificate" → "Active". This usually takes
1–3 minutes. Refresh the page if it seems stuck.

### 3D. Verify

From your laptop:

```bash
curl https://rcs.workonward.com/health
curl https://rcs.workonward.com/privacy | head
```

- `/health` returns `{"status":"ok",...}`.
- `/privacy` returns HTML.

If you get a TLS error, Railway isn't done issuing the cert yet —
wait another minute and retry. If you get a 404 or "domain not found",
the CNAME is still propagating; `dig rcs.workonward.com` should show
the Railway target.

### 3E. (Optional) Turn on Cloudflare proxy

Only do this **after** the cert is issued and the site works on
DNS-only. If you want Cloudflare's WAF/caching in front of Railway:

1. Cloudflare zone → **SSL/TLS → Overview → Full (strict)**.
2. DNS → flip the `rcs` record to **Proxied** (orange cloud).
3. Re-verify `curl https://rcs.workonward.com/health`.

For a webhook endpoint, leaving it **DNS only** is simpler and works
fine. Skip this unless you have a reason.

---

## Phase 4 — Point Twilio at the new URL (5 min)

From your laptop, in the project folder:

```bash
npm run webhook:configure -- https://rcs.workonward.com
```

This sets the Messaging Service inbound webhook to
`https://rcs.workonward.com/webhook/sms`.

Then in the [Twilio Console](https://console.twilio.com), confirm:

1. **Messaging → Services → your service → Integration tab**
   - Incoming Messages → Send a webhook
   - URL: `https://rcs.workonward.com/webhook/sms`
   - Method: `POST`
2. **Sender Pool tab** — confirm your Twilio number is in the pool.
3. **Opt-Out Management tab** — enable "Advanced Opt-Out" if you want
   Twilio to handle STOP/START/HELP. The app already handles the
   `OptOutType` field; no code change needed.
4. **Messaging → Content & Lookup → Content Templates** — confirm every
   `HX...` SID from your env vars shows status **Approved**. A "Pending"
   template won't render as RCS; the message falls back to text.
5. **Messaging → RCS** — confirm your RCS Agent is approved and attached
   to the **same** Messaging Service. Required for chips/cards on
   RCS-capable phones; otherwise SMS only.

---

## Phase 5 — Test end-to-end (5 min)

1. From your phone, text **HI** to your Twilio number.
2. In Railway → **Deployments → View Logs** — the webhook should fire
   and you'll see `Received webhook` log lines.
3. On your phone, the consent prompt should arrive within a few seconds.
4. Walk the full demo:
   `YES → Spanish → warehouse → 90011 → morning → APPLY → STATUS → HELP → STOP`.

To inspect state stored on the volume (read-only check), you can use
**Railway → service → ⋮ → Shell** to open a shell into the running
container, then `cat /data/rcs-state.json`.

If something is wrong, debug in this order:

1. **Railway logs** — did the request even reach the app?
2. **Cloudflare DNS** — `dig rcs.workonward.com` should still show the
   Railway CNAME target. If it shows a Cloudflare IP, the proxy got
   turned on and Railway cert renewal can break.
3. **Twilio Console → Monitor → Logs → Errors** — did Twilio get a
   200 back? Errors `11200` or `11205` mean signature mismatch, usually
   `PUBLIC_BASE_URL` or `TWILIO_AUTH_TOKEN` is wrong in Railway env vars.

---

## Phase 6 — How you update later

On your laptop:

```bash
git push
```

That's it. Railway watches the repo, rebuilds, and redeploys
automatically. The persistent volume (and the state inside `/data/`)
survives the deploy.

To roll back: Railway → **Deployments** → pick a previous deployment →
**Redeploy**.

---

## Summary checklist

- [ ] Repo pushed to GitHub
- [ ] Railway project created and linked to the repo
- [ ] All environment variables set in Railway
  - [ ] `NODE_ENV=production`
  - [ ] `PUBLIC_BASE_URL=https://rcs.workonward.com`
  - [ ] `DATA_DIR=/data`
  - [ ] `DISABLE_SIGNATURE_VALIDATION=false`
  - [ ] Twilio + Gemini + all `RCS_CONTENT_*` SIDs
  - [ ] `NGROK_AUTH_TOKEN` not present
- [ ] Persistent volume mounted at `/data`
- [ ] Service is healthy on the temporary `.up.railway.app` URL
- [ ] Custom domain `rcs.workonward.com` added in Railway
- [ ] Cloudflare CNAME `rcs` → Railway target, **DNS only** (grey cloud)
- [ ] Railway custom-domain status shows **Active** (cert issued)
- [ ] `https://rcs.workonward.com/health` returns ok from your laptop
- [ ] Twilio Messaging Service inbound URL = `https://rcs.workonward.com/webhook/sms`
- [ ] Sender Pool has your number; RCS Agent attached; Content Templates Approved
- [ ] Real-phone test passes the full demo flow

---

## Things you do NOT need

- A droplet, SSH, or PM2
- Nginx or Let's Encrypt — Railway handles TLS
- Cloudflare Tunnel — Railway exposes the service directly
- Code changes — only environment + volume configuration

---

## Things to watch out for

- **Ephemeral filesystem.** Anything written outside `/data` is lost on
  every deploy. If you later add a feature that writes elsewhere, move
  it under `/data` or it will silently disappear.
- **Cloudflare proxy + Railway cert.** Keep DNS-only during initial cert
  issuance. Only flip to proxied after Railway says "Active" — and only
  with SSL/TLS mode = **Full (strict)**.
- **Restart != redeploy.** A volume survives both, but if you ever
  *detach and recreate* the volume, all state is gone. Treat the volume
  as permanent.
