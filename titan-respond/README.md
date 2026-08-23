# Titan Respond — Production-Ready Foundation

Titan Respond is a multi-tenant lead-conversion platform for service businesses. It captures leads, queues rapid AI callbacks, lets a voice agent qualify or book them, and records commercial outcomes in a secure CRM.

## Product flow

`Lead → secure intake → callback job → AI voice call → qualification / booking → CRM → won/lost revenue`

## Included

- PostgreSQL persistence and SQL migrations
- Multi-tenant organisation isolation
- Password authentication and server-side sessions
- Role-ready user model
- Secure public lead-capture API for server-to-server integrations
- Lead pipeline with won/lost/do-not-contact states
- Queue table with retries for outbound calls
- Vapi outbound-call adapter plus demo provider
- Authenticated + idempotent Vapi webhook processing
- Voice-agent tools: qualify lead, book appointment, do-not-contact
- Conflict-safe internal appointment booking
- Call records and end-of-call summaries
- Consent/contact-basis fields and do-not-contact enforcement
- Audit log
- PostgreSQL-backed API rate limiting for login and public intake
- Health endpoint
- Security headers
- Dockerfile + local PostgreSQL compose file
- GitHub Actions build pipeline
- Optional Twilio SMS and Resend email provider helpers

## What “production-ready” means here

This code is hardened enough to deploy as a real foundation, but production still requires **your own provider accounts, secrets, domain, legal/privacy configuration and operational monitoring**. No software can make UK marketing/AI calling compliance automatic: your actual calling use case, lawful basis/consent, privacy notice, call recording policy, suppression process and data-retention rules must be reviewed for the businesses you onboard.

The recommended launch use case is **calling people who have just asked that business to contact them**, not mass AI cold-calling.

## 1. Local setup

Requirements: Node 20+, Docker, npm.

```bash
cp .env.example .env.local
docker compose up -d
set -a; source .env.local; set +a
npm install --no-audit --no-fund
npm run db:migrate
npm run db:seed
npm run dev
```

The seed command prints a lead-capture token once. Store it securely.

Open: `http://localhost:3000`

## 2. Environment

Required in production:

- `DATABASE_URL`
- `CRON_SECRET`
- `VAPI_WEBHOOK_BEARER_TOKEN`
- `VOICE_PROVIDER=vapi`
- `VAPI_API_KEY`
- `VAPI_ASSISTANT_ID`
- `VAPI_PHONE_NUMBER_ID`

Optional notification providers:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Generate secrets with a cryptographically secure generator. Never commit `.env*` files.

## 3. Public lead capture

Use this from a trusted server, not directly from browser JavaScript because the API key must remain private.

```http
POST /api/public/leads
X-Titan-Api-Key: <client lead-capture token>
Content-Type: application/json
```

```json
{
  "organizationSlug": "titan-demo",
  "name": "Alex Smith",
  "phone": "+447700900000",
  "email": "alex@example.com",
  "service": "Boiler repair",
  "source": "Website",
  "estimatedValue": 350,
  "consentBasis": "requested_callback"
}
```

The business website backend can then call the authenticated Titan API immediately after its own form submission.

## 4. Voice agent

Configure Vapi to POST server events to:

`https://YOUR_DOMAIN/api/webhooks/vapi`

Configure Vapi Server Authentication to send:

`Authorization: Bearer <VAPI_WEBHOOK_BEARER_TOKEN>`

Create these custom tools:

- `qualifyLead({ notes: string })`
- `bookAppointment({ appointmentAt: string, durationMinutes?: number })`
- `doNotContact({ reason?: string })`

Suggested system instruction:

> You are the automated customer-response assistant for {{businessName}}. The person recently asked the business to contact them about {{service}}. Clearly identify yourself as an automated assistant, confirm it is a convenient time, understand what they need, and never invent price or availability. Use tools for qualification and booking. If the person asks not to be contacted, call doNotContact immediately. If they ask for a human or you cannot safely handle the request, arrange human follow-up.

## 5. Worker / scheduler

Calling is asynchronous. A trusted scheduler should invoke:

```http
POST /api/internal/worker
Authorization: Bearer <CRON_SECRET>
```

Run this every minute or on an equivalent managed cron. Jobs are locked and retried up to three times.

## 6. Deployment

Recommended architecture:

- App: Vercel, Render, Fly.io, Railway, AWS, Azure or equivalent Node host
- DB: managed PostgreSQL
- Voice: Vapi
- Telephony: provider connected through Vapi
- SMS: Twilio (optional)
- Email: Resend (optional)
- Scheduler: hosting-provider cron or managed scheduler
- Monitoring: platform logs + Sentry/Datadog/etc.

Deployment order:

1. Create managed PostgreSQL.
2. Configure all production secrets.
3. Run `npm run db:migrate` against the production DB.
4. Seed only the initial owner account, then rotate/remove seed password variables.
5. Deploy app behind HTTPS.
6. Configure Vapi webhook authentication and URL.
7. Configure scheduler to call `/api/internal/worker`.
8. Test with demo/fake numbers first.
9. Run an end-to-end test with a consented real lead.
10. Add monitoring/alerts before accepting paying clients.

## 7. Security / operational checklist before real customers

- [ ] Unique production secrets generated and stored in secret manager
- [ ] Database backups and point-in-time recovery enabled
- [ ] HTTPS-only production domain
- [ ] Vapi webhook bearer/HMAC authentication configured
- [ ] Real provider credentials never exposed client-side
- [ ] Privacy notice and client data-processing terms completed
- [ ] Retention/deletion policy implemented operationally
- [ ] Do-not-contact requests tested end to end
- [ ] Call recording/transcription settings reviewed
- [ ] AI disclosure wording reviewed
- [ ] Human escalation process defined
- [ ] Provider outage/error alerts configured
- [ ] Admin password changed from seed value
- [ ] Production call caps / spending alerts configured
- [ ] Backups restored in a test environment at least once

## 8. Remaining commercial features for the full Titan product

The foundation is ready for these next product layers without redesigning the database boundary:

- Automated SMS/email lead follow-up sequences
- Missed-call webhook recovery
- Human transfer during AI calls
- Google/Microsoft calendar OAuth + live availability
- Per-client automation settings and working hours
- Client onboarding wizard
- Revenue attribution from source → lead → won job
- Funnel analytics and conversion-rate reports
- Multi-location businesses
- Staff permissions
- Billing/subscriptions
- Self-service API-key rotation
- Data export/deletion controls
- Sentry/observability integration

## Validation note

The sandbox used to assemble this package could not complete `npm install` because package downloads repeatedly timed out. CI is included so a normal GitHub/network environment will type-check and build it automatically. Treat a green CI build plus an end-to-end staging call as mandatory before live traffic.

## Automated GitHub → Vercel deployment

This release includes `.github/workflows/deploy-vercel.yml` and `vercel.json`. Once the repository is connected to Vercel and the three Vercel GitHub secrets are configured, every successful merge/push to `main` can deploy production automatically after validation.

See `docs/DEPLOYMENT_PATH.md` for the exact setup and release gates.
