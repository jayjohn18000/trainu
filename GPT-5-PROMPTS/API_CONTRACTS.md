# API Contracts (v0)

## Webhooks
POST /api/webhooks/ghl
- Body: GHL event payload (contact, appointment, purchase)
- Auth: Signature header (to be confirmed), HMAC with `GHL_WEBHOOK_SECRET`
- Response: `{ ok: true }`

## Reconcile
POST /api/reconcile { since?: ISO8601 }
- Triggers a best-effort sync from GHL → Supabase for contacts/appointments.

## Directory
GET /(public) trainers from Supabase (server component).

## Goals
- Tables: `goals`, `goal_entries`, view `v_goal_progress`.
