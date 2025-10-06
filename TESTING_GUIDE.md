# Testing Guide

## Overview

This guide covers testing strategies for the TrainU v1 Agent MVP.

## Manual Testing Checklist

### 1. Authentication Flow
- [ ] User can sign up with email/password
- [ ] User receives confirmation email
- [ ] User can log in with valid credentials
- [ ] User is redirected based on role (trainer/client/admin)
- [ ] User can log out successfully

### 2. Trainer Dashboard
- [ ] Trainer sees their own clients only
- [ ] Trainer can view client profiles
- [ ] Trainer can access AI Inbox
- [ ] Trainer can view goals and progress

### 3. AI Inbox
- [ ] Inbox shows all pending draft messages
- [ ] Messages are sorted by impact score (highest first)
- [ ] Sensitive messages show red warning banner
- [ ] Trainer can edit message subject and body
- [ ] Trainer can approve and send via SMS
- [ ] Trainer can approve and send via Email
- [ ] Trainer can snooze messages (1h, 4h, 24h, 3d)
- [ ] Trainer can dismiss messages
- [ ] Message audit trail is recorded
- [ ] Sent messages appear in "Sent" tab
- [ ] Failed messages appear in "Failed" tab with error

### 4. GHL Webhook Processing
**Setup:** Use Postman or curl to simulate GHL webhooks

#### Contact Created
```bash
curl -X POST http://localhost:3000/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_contact_123",
    "type": "contact.created",
    "id": "contact_123",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

Verify:
- [ ] Response: `{ "ok": true, "correlationId": "..." }`
- [ ] Contact created in `contacts` table
- [ ] Event logged in `events` table with type `contact_created`
- [ ] Duplicate webhook returns `{ "duplicate": true }`

#### Appointment Booked
```bash
curl -X POST http://localhost:3000/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_apt_123",
    "type": "appointment.booked",
    "id": "apt_123",
    "contactId": "contact_123",
    "startTime": "2025-10-08T18:00:00Z",
    "endTime": "2025-10-08T19:00:00Z",
    "status": "scheduled"
  }'
```

Verify:
- [ ] Appointment created in `appointments` table
- [ ] Event logged with type `appointment_scheduled`
- [ ] Booking confirmation nudge scheduled (check messages table)

#### No-Show
```bash
curl -X POST http://localhost:3000/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_noshow_123",
    "type": "appointment.noshow",
    "id": "apt_123",
    "status": "noshow"
  }'
```

Verify:
- [ ] Appointment status updated to `noshow`
- [ ] Event logged with type `no_show_detected`
- [ ] No-show recovery message drafted (needs_review status)
- [ ] Message requires trainer approval

### 5. Reconciliation
```bash
curl -X POST http://localhost:3000/api/reconcile \
  -H "Content-Type: application/json" \
  -d '{
    "since": "2025-10-01T00:00:00Z"
  }'
```

Verify:
- [ ] Contacts synced from GHL
- [ ] Appointments synced from GHL
- [ ] Response includes counts and errors
- [ ] Event logged with type `reconciliation_completed`

### 6. Automated Workflows

#### Booking Confirmation Nudge
**Setup:** Create appointment 24 hours in future

```sql
-- Create test appointment
INSERT INTO appointments (id, starts_at, status, client_user_id, trainer_user_id)
VALUES ('test_apt_1', NOW() + INTERVAL '24 hours', 'scheduled', 'client_id', 'trainer_id');
```

Then trigger cron:
```bash
curl http://localhost:3000/api/cron/booking-nudges \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

Verify:
- [ ] Message drafted with type `booking_confirmation`
- [ ] Message body includes date/time and confirmation options
- [ ] Message does NOT require approval (auto-approve for confirmations)
- [ ] Respects quiet hours (9 PM - 8 AM)
- [ ] Respects rate limit (3 messages/day)

#### Weekly Digest
```bash
curl http://localhost:3000/api/cron/weekly-digest \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

Verify:
- [ ] Insights generated for each trainer
- [ ] Top 5 at-risk clients identified
- [ ] Risk scores calculated correctly
- [ ] Digest message created with summary
- [ ] Event logged with type `weekly_digest_generated`

#### Progress Celebration
**Setup:** Complete a goal or achieve a streak

```typescript
// In your app or script
import { celebrateProgress } from "@/lib/workflows";

await celebrateProgress({
  clientId: "client_id",
  trainerId: "trainer_id",
  achievementType: "streak",
  achievementData: {
    count: 5,
    description: "5 sessions in a row",
  },
});
```

Verify:
- [ ] Celebration message drafted
- [ ] Message is positive and encouraging
- [ ] Message does NOT require approval
- [ ] Respects rate limits

### 7. Analytics Events

Check PostHog dashboard for:
- [ ] Pageview events
- [ ] User identification
- [ ] Custom events (message_drafted, message_sent, etc.)

Check Sentry dashboard for:
- [ ] No unhandled errors in happy path
- [ ] Errors properly categorized (SEV1, SEV2, SEV3)
- [ ] Error fingerprints deduplicate similar errors
- [ ] PII is redacted from error context

### 8. File Storage
```typescript
import { uploadProfilePhoto } from "@/lib/storage";

// Test profile photo upload
const file = new File(["test"], "profile.jpg", { type: "image/jpeg" });
const url = await uploadProfilePhoto(file, userId);
```

Verify:
- [ ] File uploaded to Supabase Storage
- [ ] Metadata recorded in `files` table
- [ ] File accessible via signed URL
- [ ] Invalid file types rejected
- [ ] File size limits enforced (10MB)

### 9. RLS Policies

Test with different user roles:

```sql
-- As trainer, try to access another trainer's clients
SELECT * FROM clients WHERE trainer_user_id != 'current_user_id';
-- Should return 0 rows

-- As client, try to access another client's goals
SELECT * FROM goals WHERE user_id != 'current_user_id';
-- Should return 0 rows

-- As trainer, try to view own contacts
SELECT * FROM contacts WHERE trainer_user_id = 'current_user_id';
-- Should return rows
```

Verify:
- [ ] Trainers can only see their own contacts/clients
- [ ] Clients can only see their own data
- [ ] Service role can access all data
- [ ] Message visibility based on sender/recipient

## Automated Testing

### Unit Tests (TODO)
```bash
# Run unit tests
pnpm test

# With coverage
pnpm test:coverage
```

**Priority Tests:**
- Risk scoring algorithm
- Message parsing
- Rate limiting logic
- Quiet hours checking
- HMAC signature verification

### Integration Tests (TODO)
```bash
# Run integration tests
pnpm test:integration
```

**Priority Tests:**
- GHL webhook → DB sync
- Message draft → approval → send
- Reconciliation with mocked GHL API
- File upload → storage → retrieval

### E2E Tests (TODO)
```bash
# Run Playwright tests
pnpm test:e2e

# In headed mode
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug
```

**Priority Tests:**
1. Complete auth flow
2. Trainer inbox workflow
3. Message approval and sending
4. Client goal tracking
5. Trainer directory search

## Performance Testing

### Load Testing with k6
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  // Test webhook endpoint
  let res = http.post('http://localhost:3000/api/webhooks/ghl', JSON.stringify({
    id: `evt_${Date.now()}`,
    type: 'contact.created',
    email: 'test@example.com',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

Run:
```bash
k6 run load-test.js
```

**Targets:**
- [ ] p95 response time < 500ms
- [ ] p99 response time < 1s
- [ ] 0% error rate under 100 concurrent users
- [ ] Webhook processing < 2s

### Database Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;
```

Verify:
- [ ] All frequently queried columns have indexes
- [ ] RLS policies are performant
- [ ] No N+1 queries in message listing
- [ ] Goal progress view is fast (< 100ms)

## Security Testing

### Authentication
- [ ] Cannot access protected routes without auth
- [ ] JWT tokens expire correctly
- [ ] Role-based routing works
- [ ] Session management is secure

### Authorization
- [ ] RLS policies prevent data leakage
- [ ] API routes check permissions
- [ ] File access requires ownership
- [ ] Webhook signature verification works

### Input Validation
- [ ] SQL injection protection
- [ ] XSS prevention in message bodies
- [ ] File upload validation (type, size)
- [ ] Rate limiting on public endpoints

## Monitoring & Alerting

### PostHog Dashboards
1. **Activation Funnel**
   - Signup → First Login → First Booking

2. **Engagement**
   - DAU/MAU ratio
   - Messages approved per week
   - Client interaction rate

3. **Show-Rate**
   - Bookings scheduled
   - Bookings confirmed
   - No-shows
   - Show-rate %

### Sentry Alerts
- SEV1 errors → PagerDuty
- SEV2 errors → Slack
- Performance degradation > p95 threshold
- Error rate spike (> 5% in 5 min)

## Acceptance Criteria Verification

### PRD A1: Trainer can approve AI-drafted replies
- [ ] Draft appears in inbox
- [ ] Trainer can edit content
- [ ] Trainer can send via SMS or email
- [ ] Audit trail is recorded

### PRD A2: Client receives confirmation nudges
- [ ] 24h before session
- [ ] Includes confirm/reschedule options
- [ ] Respects quiet hours
- [ ] Rate limited

### PRD A3: Weekly digest with at-risk clients
- [ ] Runs Monday 9 AM
- [ ] Lists top 5 clients
- [ ] Includes risk reasons
- [ ] Suggests actions

### PRD A4: Idempotent GHL sync
- [ ] Duplicate webhooks don't create duplicates
- [ ] Retries don't cause issues
- [ ] Failed syncs go to DLQ
- [ ] Reconciliation is safe to rerun

### PRD A5: PostHog dashboards show metrics
- [ ] Activation funnel
- [ ] Engagement metrics
- [ ] Show-rate tracking
- [ ] Custom events captured

### PRD A6: Zero unhandled exceptions (7-day test)
- [ ] Sentry shows no errors in critical paths
- [ ] Known errors are properly caught
- [ ] Error fingerprinting works
- [ ] PII is redacted

## Bug Reporting

When filing bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Correlation ID (from API response)
5. Sentry event ID (if error occurred)
6. Screenshots/videos
7. Environment (dev/staging/prod)

## Continuous Monitoring

Run these checks regularly:
- Daily: Check Sentry for new errors
- Daily: Review sync_queue for stuck items
- Weekly: Review PostHog metrics vs targets
- Weekly: Check database performance
- Monthly: Full security audit
- Monthly: Load testing

---

**Testing is not complete until all acceptance criteria are verified in production! 🧪**

