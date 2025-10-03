# Architecture

**Boundaries:**
- **GHL (Operational):** Leads, appointments, conversations, offers/payments.
- **Supabase (Product):** Profiles, programs, sessions, goals, files, agent telemetry.

**Apps:**
- `apps/web`: Next.js RSC + server actions for DB and webhook handling.
- `apps/agent`: LangGraph worker that executes PocketFlow tickets with deterministic steps and structured logs.

**Data Sync:**
- Webhook intake is idempotent (writes `webhook_events`).
- Reconciliation job available via `/api/reconcile` for missed events.
- Field map lives in `lib/ghl.ts` (prefix: `tu_`).

**Security:**
- Supabase RLS (enable per table as we expand).
- Signed URLs for Storage; strict CORS to `app.trainu.online`.
- Redaction of PII in logs.

