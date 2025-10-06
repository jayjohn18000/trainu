# Development Tasks

> **Source:** Tasks derived from [docs/Context/PRD_v1_Agent_MVP.md](docs/Context/PRD_v1_Agent_MVP.md) acceptance criteria.

## Epic 1: AI Inbox Implementation

### Task 1.1: AI Inbox UI Components
**Description:** Build the core AI Inbox interface for trainers to review, edit, and approve AI-drafted messages.

**Acceptance Tests:**
- [ ] Trainer can view pending drafts in "Needs Review" tab
- [ ] Trainer can edit message content before approval
- [ ] Trainer can approve and send messages
- [ ] Trainer can snooze drafts for later review
- [ ] Messages are sorted by impact (risk score × timeliness)

**Done When:**
- [ ] All UI states implemented (Needs Review, Scheduled, Sent, Failed)
- [ ] Filters work (client, insight type, date, approval status)
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)

### Task 1.2: Message Drafting System
**Description:** Implement the core message drafting engine that creates AI-generated content for trainer review.

**Acceptance Tests:**
- [ ] System generates contextually appropriate message drafts
- [ ] Drafts include suggested time links for rescheduling
- [ ] Safety checks flag sensitive topics requiring approval
- [ ] Rate limiting prevents over-messaging clients

**Done When:**
- [ ] Integration with OpenAI API for content generation
- [ ] Template system for common message types
- [ ] Content safety validation
- [ ] Audit trail for all draft operations

### Task 1.3: Approval Workflow
**Description:** Implement the human-in-the-loop approval system with audit trails and safety controls.

**Acceptance Tests:**
- [ ] All outbound messages require trainer approval by default
- [ ] Red banners appear for sensitive topics
- [ ] Mandatory notes required for sensitive message sends
- [ ] Complete audit trail of approval decisions

**Done When:**
- [ ] Approval state machine implemented
- [ ] Audit logging for all approval actions
- [ ] Safety override mechanisms
- [ ] Integration with PostHog for approval metrics

## Epic 2: Client Nudge System

### Task 2.1: Booking Confirmation Nudges
**Description:** Implement automated nudges for upcoming sessions with confirmation and reschedule options.

**Acceptance Tests:**
- [ ] Client receives 24h pre-session confirmation nudge
- [ ] Nudge includes deep links for confirm/reschedule
- [ ] System respects quiet hours per timezone
- [ ] Frequency caps prevent over-messaging

**Done When:**
- [ ] Scheduling system for nudge delivery
- [ ] Timezone-aware quiet hours enforcement
- [ ] Deep link generation for GHL booking system
- [ ] Response tracking and analytics

### Task 2.2: No-Show Recovery Workflow
**Description:** Implement automated recovery messaging for missed sessions with rescheduling assistance.

**Acceptance Tests:**
- [ ] System detects no-show within 15 minutes of session end
- [ ] Recovery message sent within 2 hours of no-show
- [ ] Message includes easy rescheduling options
- [ ] Follow-up sequence for persistent no-shows

**Done When:**
- [ ] No-show detection logic
- [ ] Recovery message templates
- [ ] Rescheduling workflow integration
- [ ] Escalation rules for repeat no-shows

### Task 2.3: Progress Celebration Messages
**Description:** Implement automated celebration messages for client milestones and achievements.

**Acceptance Tests:**
- [ ] System detects goal completions and streaks
- [ ] Celebration messages sent within 24h of achievement
- [ ] Messages are personalized and encouraging
- [ ] Milestone tracking is accurate

**Done When:**
- [ ] Goal progress monitoring system
- [ ] Achievement detection algorithms
- [ ] Celebration message templates
- [ ] Milestone analytics and reporting

## Epic 3: Weekly Insights Engine

### Task 3.1: At-Risk Client Detection
**Description:** Implement algorithms to identify clients at risk of churning or missing sessions.

**Acceptance Tests:**
- [ ] System identifies top 5 at-risk clients weekly
- [ ] Risk scoring considers booking patterns, response rates, and goal progress
- [ ] Risk reasons are clearly explained to trainers
- [ ] Suggestions are actionable and specific

**Done When:**
- [ ] Risk scoring algorithm implementation
- [ ] Multi-factor risk assessment (bookings, responses, goals)
- [ ] Explanation generation for risk reasons
- [ ] Action suggestion engine

### Task 3.2: Weekly Digest Generation
**Description:** Create automated weekly reports for trainers with client insights and recommended actions.

**Acceptance Tests:**
- [ ] Weekly digest generated every Monday morning
- [ ] Digest includes top 5 at-risk clients with reasons
- [ ] Each client entry includes specific next actions
- [ ] Digest is delivered via email and in-app notification

**Done When:**
- [ ] Digest generation system
- [ ] Email template and delivery
- [ ] In-app notification system
- [ ] Digest analytics and open rates

## Epic 4: GHL Integration & Sync

### Task 4.1: Idempotent Webhook Processing
**Description:** Implement robust webhook handling for GHL events with idempotency and error handling.

**Acceptance Tests:**
- [ ] Contact/booking sync is idempotent (no duplicates after retries)
- [ ] Webhook signatures are verified
- [ ] Failed webhooks are retried with exponential backoff
- [ ] Dead letter queue captures failed syncs for manual repair

**Done When:**
- [ ] Webhook signature verification
- [ ] Idempotency key implementation
- [ ] Retry mechanism with exponential backoff
- [ ] Dead letter queue system

### Task 4.2: Contact and Booking Sync
**Description:** Implement bidirectional sync between GHL and Supabase for contacts and appointments.

**Acceptance Tests:**
- [ ] New GHL contacts are created in Supabase
- [ ] Contact updates are synced within 5 minutes
- [ ] Booking status changes are reflected in real-time
- [ ] Sync errors are logged and reported

**Done When:**
- [ ] Contact upsert logic
- [ ] Booking status synchronization
- [ ] Field mapping between GHL and Supabase
- [ ] Sync health monitoring

### Task 4.3: Reconciliation System
**Description:** Build reconciliation endpoints to handle missed webhooks and data inconsistencies.

**Acceptance Tests:**
- [ ] `/api/reconcile` endpoint can backfill missing data
- [ ] Reconciliation can handle date ranges up to 30 days
- [ ] Process is idempotent and safe to run multiple times
- [ ] Reconciliation results are logged and reported

**Done When:**
- [ ] Reconciliation API endpoint
- [ ] Backfill logic for contacts and bookings
- [ ] Idempotent reconciliation process
- [ ] Reconciliation monitoring and alerting

## Epic 5: Analytics & Observability

### Task 5.1: PostHog Event Instrumentation
**Description:** Implement comprehensive PostHog tracking for all user actions and system events.

**Acceptance Tests:**
- [ ] All key user journeys are tracked (signup, booking, messaging)
- [ ] AI agent events are properly instrumented
- [ ] Sync events are tracked for health monitoring
- [ ] Custom dashboards show activation, engagement, and show-rate metrics

**Done When:**
- [ ] PostHog client integration
- [ ] Event tracking for all user actions
- [ ] Custom dashboard creation
- [ ] Event validation and testing

### Task 5.2: Error Monitoring & Alerting
**Description:** Implement Sentry integration with proper error categorization and alerting.

**Acceptance Tests:**
- [ ] Sentry reports zero unhandled exceptions in happy path for 7 days
- [ ] SEV1/SEV2/SEV3 error categorization works correctly
- [ ] Alert thresholds are properly configured
- [ ] Error fingerprints prevent duplicate alerts

**Done When:**
- [ ] Sentry integration in all applications
- [ ] Error categorization system
- [ ] Alert configuration and routing
- [ ] Error fingerprinting for recurring issues

## Epic 6: Authentication & Authorization

### Task 6.1: Role-Based Access Control
**Description:** Implement RBAC system with owner, trainer, and client roles.

**Acceptance Tests:**
- [ ] Users can only access features appropriate to their role
- [ ] Trainers can only see their own clients
- [ ] Clients can only see their own data
- [ ] Owners have full system access

**Done When:**
- [ ] Supabase RLS policies implemented
- [ ] Role-based route protection
- [ ] Permission checking middleware
- [ ] Role assignment and management UI

### Task 6.2: User Onboarding Flow
**Description:** Implement streamlined onboarding for trainers and clients.

**Acceptance Tests:**
- [ ] Trainer onboarding completes in < 48h from invite to first AI message
- [ ] Client onboarding completes in < 24h from lead to welcome message
- [ ] Onboarding progress is tracked and reported
- [ ] Drop-off points are identified and optimized

**Done When:**
- [ ] Onboarding flow implementation
- [ ] Progress tracking system
- [ ] Onboarding analytics
- [ ] Optimization based on drop-off analysis

## Epic 7: Data Model & Storage

### Task 7.1: Core Database Schema
**Description:** Implement the complete database schema with all tables, relationships, and indices.

**Acceptance Tests:**
- [ ] All tables from data model are created
- [ ] Foreign key relationships are properly established
- [ ] Indices are created for performance
- [ ] RLS policies are applied to all user-facing tables

**Done When:**
- [ ] Database migration scripts
- [ ] Schema validation tests
- [ ] Performance testing with realistic data volumes
- [ ] RLS policy testing and validation

### Task 7.2: File Storage & Embeddings
**Description:** Implement file storage system with vector embeddings for AI capabilities.

**Acceptance Tests:**
- [ ] Users can upload files (documents, images)
- [ ] Files are properly stored and accessible
- [ ] Vector embeddings are generated for AI processing
- [ ] File access is properly secured

**Done When:**
- [ ] Supabase Storage integration
- [ ] File upload UI components
- [ ] Vector embedding generation
- [ ] File security and access controls

## Testing & Quality Assurance

### Task 8.1: End-to-End Testing
**Description:** Implement comprehensive E2E test suite covering all critical user journeys.

**Acceptance Tests:**
- [ ] All acceptance criteria from PRD are covered by tests
- [ ] Tests run in CI/CD pipeline
- [ ] Test coverage > 80% for critical paths
- [ ] Tests are maintainable and reliable

**Done When:**
- [ ] E2E test framework setup
- [ ] Critical user journey tests
- [ ] CI/CD integration
- [ ] Test maintenance documentation

### Task 8.2: Performance Testing
**Description:** Ensure system performance meets requirements under realistic load.

**Acceptance Tests:**
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms (p95)
- [ ] System handles 100 concurrent users
- [ ] Database queries are optimized

**Done When:**
- [ ] Performance testing framework
- [ ] Load testing scenarios
- [ ] Performance monitoring setup
- [ ] Optimization recommendations implemented
