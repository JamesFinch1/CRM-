# Titan Respond — Production Deployment Path

## Target architecture

GitHub (`main`) → GitHub Actions validation → Vercel production deploy → managed PostgreSQL → Vapi/Twilio/Resend integrations.

## One-time setup

1. Create a GitHub repository named `titan-respond` and push this project.
2. Import that repository into Vercel and create the `titan-respond` Vercel project.
3. Add production application environment variables in Vercel (`DATABASE_URL`, `APP_ENCRYPTION_KEY`, `CRON_SECRET`, Vapi variables, etc.).
4. Add these GitHub Actions repository secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
5. Run the production database migrations before the first live release.
6. Configure Vapi callbacks to the production `/api/webhooks/vapi` endpoint.
7. Configure a scheduler for `/api/internal/worker` with the cron secret.

## Normal release flow

1. Work on a feature branch.
2. Open a pull request.
3. `ci.yml` validates migrations, TypeScript and Next.js build.
4. Merge to `main`.
5. `deploy-vercel.yml` validates again and deploys to production.
6. Verify `/api/health` and one consented test lead before customer traffic.

## Rollback

Use the Vercel deployment dashboard to promote the previous known-good deployment if the latest release is faulty. Database schema changes must remain backward-compatible across at least one deployment during rollout.

## Required launch gates

- Green GitHub CI
- Managed PostgreSQL backups enabled
- Production secrets configured in Vercel, never committed
- Vapi webhook authentication enabled
- Do-not-contact flow tested
- AI disclosure/human handoff wording configured per client
- UK privacy/direct-marketing configuration reviewed for the actual use case
- End-to-end test: lead capture → callback → qualification → booking → CRM update
