# Observability

This document outlines our observability strategy for TrainU, focusing on PostHog events, Sentry error tracking, and dashboard requirements.

## PostHog Events

### Core User Journey Events

**Authentication & Onboarding**
- `user_registered` - New user signs up
- `user_logged_in` - User authentication
- `trainer_onboarded` - Trainer completes setup
- `client_onboarded` - Client completes profile

**Directory & Discovery**
- `directory_search` - User searches trainer directory
- `trainer_profile_viewed` - Public trainer profile viewed
- `booking_cta_clicked` - User clicks booking CTA

**Booking & Scheduling**
- `lead_created` - New lead captured in GHL
- `booking_scheduled` - Appointment booked
- `booking_confirmed` - Client confirms appointment
- `booking_rescheduled` - Appointment moved
- `no_show` - Client doesn't show up
- `booking_canceled` - Appointment canceled

**AI Agent Events**
- `message_drafted` - AI creates message draft
- `trainer_approved` - Trainer approves AI message
- `message_sent` - Message sent to client
- `insight_created` - AI generates insight/suggestion
- `weekly_digest_viewed` - Trainer views weekly report

**Goals & Progress**
- `goal_updated` - Client updates goal
- `goal_achieved` - Client reaches milestone
- `progress_logged` - Workout/session logged

**File & Content**
- `file_uploaded` - User uploads document/media
- `template_applied` - Program template used

### Technical Events

**Sync & Integration**
- `sync_ok` - GHL sync successful
- `sync_retry` - Sync retry attempted
- `sync_dropped` - Sync failed after max retries
- `webhook_received` - GHL webhook received

**Performance**
- `page_load_time` - Frontend performance
- `api_response_time` - Backend performance
- `database_query_time` - Query performance

## Dashboard Requirements

### Activation Dashboard
**Purpose:** Track user onboarding and first value realization

**Metrics:**
- Time to first booking (target: < 24h)
- Time to first insight (target: < 7 days)
- Onboarding completion rate
- Feature adoption funnel

**Visualization:**
- Conversion funnel from signup → first booking → first insight
- Cohort analysis by week
- Drop-off points in onboarding

### Engagement Dashboard
**Purpose:** Monitor ongoing user activity and feature usage

**Metrics:**
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- AI Inbox usage (drafts created, approved, sent)
- Message response rates
- Goal tracking engagement

**Visualization:**
- Activity heatmaps
- Feature usage over time
- User engagement scores

### Show-Rate Dashboard
**Purpose:** Track booking success and no-show patterns

**Metrics:**
- Overall show-rate (target: +15-25% vs baseline)
- Show-rate by trainer
- Show-rate by client segment
- No-show recovery rate

**Visualization:**
- Show-rate trends over time
- Before/after comparison charts
- Segment breakdowns

### Sync Health Dashboard
**Purpose:** Monitor GHL integration reliability

**Metrics:**
- Sync success rate (target: > 99.5%)
- Sync latency
- DLQ (Dead Letter Queue) size
- Webhook processing time

**Visualization:**
- Real-time sync status
- Error rate trends
- DLQ backlog monitoring

## Sentry Error Tracking

### Error Categories
- **SEV1:** Data loss or mass send errors
- **SEV2:** Sync failures or performance degradation
- **SEV3:** UI bugs and non-blocking issues

### Alert Thresholds
- **SEV1:** Immediate notification to on-call
- **SEV2:** Alert if > 5% error rate over 15 minutes
- **SEV3:** Daily digest of errors

### Error Fingerprinting
Use stable fingerprints for recurring issues:
- GHL webhook failures
- Database connection issues
- LLM API errors
- Authentication failures

## Retry & Backoff Strategy

### GHL Sync Retries
- Exponential backoff: 1m, 5m, 15m, 1h, 6h
- Max 5 retries before DLQ
- DLQ items require manual intervention

### LLM API Retries
- Auto-retry 2× for transient failures
- Mark draft as failed after max retries
- Surface failed drafts to AI Inbox

### Database Retries
- Connection pool management
- Query timeout handling
- Deadlock detection and retry

## Monitoring & Alerting

### Health Checks
- `/api/health` endpoint for uptime monitoring
- Database connectivity check
- GHL API connectivity check
- PostHog/Sentry service status

### Alert Channels
- Slack notifications for SEV1/SEV2
- Email digest for SEV3
- PagerDuty for critical issues

### Key Metrics to Alert On
- Sync failure rate > 1%
- Show-rate drop > 10% week-over-week
- AI Inbox draft failure rate > 5%
- Database query time > 2s (p95)

## Log Management

### Structured Logging
All logs should include:
- `correlation_id` for request tracing
- `user_id` when available
- `timestamp` in ISO8601 format
- `level` (debug, info, warn, error)
- `service` identifier

### Log Retention
- Application logs: 30 days
- Error logs: 90 days
- Audit logs: 1 year

### PII Redaction
Automatically redact:
- Email addresses (except domain)
- Phone numbers
- API keys and tokens
- Personal names in logs (use user_id instead)

## Related Documents

- [Security & Privacy](Context/SECURITY_PRIVACY.md) - Data handling and compliance
- [Incident Triage](Context/RUNBOOKS/incident_triage.md) - Response procedures
- [GHL Integration](Context/INTEGRATIONS_GHL_SYNC.md) - Sync specifications
