# API Contracts

## Webhooks

### POST /api/webhooks/ghl
Receives webhook events from GoHighLevel.

**Headers:**
- `x-ghl-signature`: HMAC-SHA256 signature for verification

**Body:** GHL event payload
```json
{
  "id": "event_id",
  "type": "contact.created|appointment.booked|invoice.paid|...",
  ...event-specific data
}
```

**Response:**
```json
{
  "ok": true,
  "correlationId": "uuid",
  "duplicate": false // optional, true if already processed
}
```

**Auth:** HMAC signature verification using `GHL_WEBHOOK_SECRET`

**Idempotency:** Event ID is used as primary key in `webhook_events` table

## Reconciliation

### POST /api/reconcile
Triggers manual sync from GHL to Supabase for missed webhooks.

**Body:**
```json
{
  "since": "2024-01-01T00:00:00Z" // optional, defaults to 7 days ago
}
```

**Response:**
```json
{
  "ok": true,
  "correlationId": "uuid",
  "since": "2024-01-01T00:00:00Z",
  "contacts": {
    "totalSynced": 150,
    "errors": []
  },
  "appointments": {
    "totalSynced": 45,
    "errors": []
  }
}
```

**Constraints:** Maximum 30 days lookback

## Messages (Server Actions)

### generateMessageDraft
Generates AI-drafted message for approval.

**Params:**
```typescript
{
  messageType: MessageType;
  trainerId: string;
  clientId?: string;
  contactId?: string;
  context: Record<string, any>;
}
```

**Returns:**
```typescript
{
  messageId: string;
  subject: string;
  body: string;
  requiresApproval: boolean;
}
```

### approveAndSendMessage
Approves draft and sends via GHL.

**Params:**
```typescript
{
  messageId: string;
  trainerId: string;
  editedBody?: string;
  approvalNote?: string;
  channel: "sms" | "email";
}
```

**Returns:**
```typescript
{
  success: boolean;
}
```

### editMessageDraft
Edits existing draft.

**Params:**
```typescript
{
  messageId: string;
  trainerId: string;
  newBody: string;
  newSubject?: string;
}
```

### snoozeMessage
Snoozes message for later review.

**Params:**
```typescript
{
  messageId: string;
  trainerId: string;
  duration: "1h" | "4h" | "24h" | "3d";
}
```

### dismissMessage
Dismisses message without sending.

**Params:**
```typescript
{
  messageId: string;
  trainerId: string;
  reason?: string;
}
```

### listInboxMessages
Lists messages for trainer inbox.

**Params:**
```typescript
{
  trainerId: string;
  status?: string; // "needs_review", "queued", "sent", "failed"
  limit?: number;
}
```

**Returns:** Array of message objects

## Cron Jobs

### GET /api/cron/booking-nudges
Runs hourly to send 24h booking confirmation nudges.

**Auth:** `Bearer ${CRON_SECRET}` header

**Response:**
```json
{
  "ok": true,
  "appointmentsProcessed": 12,
  "errors": 0,
  "correlationId": "uuid"
}
```

### GET /api/cron/weekly-digest
Runs every Monday 9 AM to generate weekly trainer digests.

**Auth:** `Bearer ${CRON_SECRET}` header

**Response:**
```json
{
  "ok": true,
  "trainersProcessed": 45,
  "errors": 1,
  "correlationId": "uuid"
}
```

## Database Tables

### Core Tables
- `users_ext` - Auth extension with roles
- `trainers` - Trainer profiles
- `clients` - Client profiles
- `contacts` - Non-app GHL contacts
- `appointments` - Synced from GHL
- `purchases` - Payment records

### AI & Messaging
- `messages` - Thread-based messaging with approval workflow
- `insights` - AI-generated suggestions for trainers
- `message_audit` - Audit trail for all message actions

### Goals & Progress
- `goals` - Client goal definitions
- `goal_entries` - Progress tracking
- `v_goal_progress` - Computed progress view

### System
- `webhook_events` - Idempotent webhook intake
- `sync_queue` - Dead letter queue for failed syncs
- `events` - Immutable event log
- `agent_runs` - Agent execution tracking
- `agent_events` - Agent operation logs
- `files` - File storage metadata

## Message Types

```typescript
enum MessageType {
  BOOKING_CONFIRMATION = "booking_confirmation",
  BOOKING_REMINDER = "booking_reminder",
  BOOKING_RESCHEDULE = "booking_reschedule",
  NO_SHOW_RECOVERY = "no_show_recovery",
  PROGRESS_CELEBRATION = "progress_celebration",
  WEEKLY_CHECKIN = "weekly_checkin",
  AT_RISK_OUTREACH = "at_risk_outreach",
  GENERAL_REPLY = "general_reply",
}
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "ok": false,
  "error": "Error message",
  "correlationId": "uuid"
}
```

**Status Codes:**
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 500: Server error
