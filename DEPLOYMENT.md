# TrainU Deployment Guide

## Prerequisites

- [x] Supabase account and project created
- [x] Vercel account for hosting
- [x] GoHighLevel account with API access
- [x] OpenAI API key
- [x] PostHog account (optional but recommended)
- [x] Sentry account (optional but recommended)
- [x] Domain configured (optional)

## Step 1: Database Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for database to provision
4. Note down:
   - Project URL
   - Anon key
   - Service role key

### 1.2 Apply Database Schema
1. Go to Supabase SQL Editor
2. Copy contents of `infra/supabase/schema.sql`
3. Run the SQL
4. Verify tables are created
5. Copy contents of `infra/supabase/schema_extensions.sql`
6. Run the SQL
7. Verify all extended tables are created

### 1.3 Configure Authentication
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Disable email confirmations for development (optional)

### 1.4 Create Storage Buckets
Run this in your Supabase SQL editor:
```sql
-- Or use the Supabase Storage UI to create these buckets
SELECT storage.create_bucket('profile-photos', '{"public": false}');
SELECT storage.create_bucket('documents', '{"public": false}');
SELECT storage.create_bucket('workout-media', '{"public": false}');
SELECT storage.create_bucket('chat-attachments', '{"public": false}');
```

## Step 2: Environment Configuration

### 2.1 Create `.env.local`
```bash
cp .env.example .env.local
```

### 2.2 Fill in Environment Variables

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**GoHighLevel:**
```
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_ACCESS_TOKEN=your-ghl-token
GHL_LOCATION_ID=your-ghl-location-id
GHL_WEBHOOK_SECRET=generate-random-string
```

**OpenAI:**
```
OPENAI_API_KEY=sk-...
```

**Analytics & Monitoring:**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENV=development
```

**Application:**
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
WP_URL=https://trainu.online
NODE_ENV=development
```

**Cron (generate random secret):**
```
CRON_SECRET=your-random-secret-for-cron-auth
```

## Step 3: Local Development

### 3.1 Install Dependencies
```bash
pnpm install
```

### 3.2 Start Development Server
```bash
pnpm -C apps/web dev
```

### 3.3 Verify Setup
1. Open http://localhost:3000
2. Navigate to /signup
3. Create a test account
4. Verify auth works
5. Check Supabase tables for new user

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub
```bash
git add .
git commit -m "Initial TrainU v1 implementation"
git push origin main
```

### 4.2 Create Vercel Project
1. Go to https://vercel.com
2. Import your GitHub repository
3. Select Next.js framework preset
4. Configure root directory: `apps/web`

### 4.3 Configure Environment Variables
Add all environment variables from `.env.local` to Vercel:
1. Go to Project Settings > Environment Variables
2. Add each variable
3. Mark sensitive variables as "Secret"
4. Set for: Production, Preview, Development

### 4.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL: `https://your-project.vercel.app`

### 4.5 Configure Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for SSL certificate

## Step 5: Configure GHL Webhooks

### 5.1 Generate Webhook Secret
```bash
openssl rand -hex 32
```
Save this as `GHL_WEBHOOK_SECRET` in Vercel environment variables.

### 5.2 Configure in GHL Dashboard
1. Log into GoHighLevel
2. Go to Settings > Integrations > Webhooks
3. Add new webhook:
   - URL: `https://your-app.vercel.app/api/webhooks/ghl`
   - Events: Select all:
     - contact.created
     - contact.updated
     - appointment.created
     - appointment.updated
     - appointment.booked
     - appointment.confirmed
     - appointment.cancelled
     - appointment.noshow
     - invoice.created
     - invoice.paid
     - order.completed
4. Save webhook
5. Copy webhook secret to Vercel env vars

### 5.3 Test Webhook
```bash
curl -X POST https://your-app.vercel.app/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_event_1",
    "type": "contact.created",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Expected response:
```json
{
  "ok": true,
  "correlationId": "..."
}
```

## Step 6: Configure Cron Jobs

Vercel Cron is automatically configured via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/booking-nudges",
      "schedule": "0 * * * *"  // Every hour
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1"  // Monday 9 AM
    }
  ]
}
```

### 6.1 Verify Cron Jobs
1. Go to Vercel Dashboard > Cron Jobs
2. Verify both jobs are listed
3. Manually trigger test run
4. Check logs for success

### 6.2 Test Cron Endpoints Manually
```bash
# Test booking nudges
curl https://your-app.vercel.app/api/cron/booking-nudges \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Test weekly digest
curl https://your-app.vercel.app/api/cron/weekly-digest \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

## Step 7: Configure Analytics

### 7.1 PostHog Setup
1. Create PostHog account at https://posthog.com
2. Create new project
3. Copy Project API Key
4. Add to Vercel env vars:
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`

### 7.2 Sentry Setup
1. Create Sentry account at https://sentry.io
2. Create new Next.js project
3. Copy DSN
4. Add to Vercel env vars:
   - `SENTRY_DSN`
   - `SENTRY_ENV=production`

### 7.3 Verify Tracking
1. Visit your deployed app
2. Perform actions (signup, navigate, etc.)
3. Check PostHog dashboard for events
4. Check Sentry for any errors

## Step 8: Seed Initial Data

### 8.1 Create First Trainer
1. Go to your app: https://your-app.vercel.app/signup
2. Sign up as trainer
3. Go to Supabase > Table Editor > users_ext
4. Update role to `trainer`
5. Add entry in `trainers` table with your user_id

Or run SQL:
```sql
-- Update user role
UPDATE users_ext SET role = 'trainer' WHERE user_id = 'your-user-id';

-- Create trainer profile
INSERT INTO trainers (
  user_id, slug, first_name, last_name, 
  city, state, specialties, visibility
) VALUES (
  'your-user-id', 'your-slug', 'First', 'Last',
  'San Francisco', 'CA', ARRAY['Strength', 'HIIT'], 'public'
);
```

### 8.2 Run Initial Reconciliation
```bash
curl -X POST https://your-app.vercel.app/api/reconcile \
  -H "Content-Type: application/json" \
  -d '{"since": "2024-10-01T00:00:00Z"}'
```

This will backfill contacts and appointments from GHL.

## Step 9: Testing & Verification

### 9.1 Create Test Appointment
1. In GHL, create test appointment 24 hours in future
2. Wait for webhook to fire
3. Check Supabase `appointments` table
4. Wait for hourly cron to run
5. Check `messages` table for booking confirmation nudge

### 9.2 Test AI Inbox
1. Log in as trainer
2. Go to /dashboard/inbox
3. Verify pending message appears
4. Click "Review"
5. Edit message (optional)
6. Approve and send
7. Verify message sends via GHL

### 9.3 Test Weekly Digest
1. Trigger manually:
```bash
curl https://your-app.vercel.app/api/cron/weekly-digest \
  -H "Authorization: Bearer ${CRON_SECRET}"
```
2. Check `insights` table for at-risk clients
3. Check trainer inbox for digest message

## Step 10: Monitoring & Alerting

### 10.1 Set Up Dashboards

**PostHog:**
1. Create "Activation Funnel" dashboard
2. Create "Engagement Metrics" dashboard
3. Create "Show-Rate Tracking" dashboard

**Sentry:**
1. Set up alerts for SEV1 errors
2. Configure Slack integration
3. Set performance thresholds

### 10.2 Health Checks
Add to your monitoring:
- Webhook endpoint: `https://your-app.vercel.app/api/webhooks/ghl`
- Reconcile endpoint: `https://your-app.vercel.app/api/reconcile`
- Homepage: `https://your-app.vercel.app`

## Troubleshooting

### Webhook Not Firing
1. Check GHL webhook configuration
2. Verify webhook URL is correct
3. Check Vercel function logs
4. Test with manual curl request

### Messages Not Sending
1. Check GHL API credentials
2. Verify contact has phone/email
3. Check message audit trail in DB
4. Review Sentry for errors

### Cron Jobs Not Running
1. Check Vercel Cron Jobs dashboard
2. Verify cron schedule is correct
3. Test manual trigger
4. Check CRON_SECRET is set

### Database Errors
1. Check RLS policies are correct
2. Verify service role key is set
3. Check table permissions
4. Review query logs in Supabase

### Authentication Issues
1. Verify Supabase URL and keys
2. Check auth provider is enabled
3. Review middleware configuration
4. Check cookie settings

## Security Checklist

- [x] All environment variables are set
- [x] Webhook signature verification enabled
- [x] RLS policies active on all tables
- [x] Service role key is kept secret
- [x] CRON_SECRET is configured
- [x] PII redaction in logs enabled
- [x] HTTPS enforced (automatic on Vercel)
- [x] Rate limiting configured
- [x] CORS restricted to production domain

## Production Readiness

Before going live with real users:

- [ ] Run full test suite (see TESTING_GUIDE.md)
- [ ] Load test with realistic data
- [ ] 7-day monitoring period (no critical errors)
- [ ] Backup database
- [ ] Document runbooks
- [ ] Train support team
- [ ] Set up on-call rotation
- [ ] Prepare rollback plan

## Post-Deployment

### Daily Tasks
- Review Sentry errors
- Check sync_queue for stuck items
- Monitor webhook success rate

### Weekly Tasks
- Review PostHog metrics
- Check database performance
- Review trainer feedback
- Update AI prompts if needed

### Monthly Tasks
- Full security audit
- Performance review
- Cost optimization
- Feature planning

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review Sentry error reports
3. Check Supabase logs
4. Consult TESTING_GUIDE.md
5. Review IMPLEMENTATION_SUMMARY.md

---

**You're ready to launch! 🚀**

