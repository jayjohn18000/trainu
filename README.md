# TrainU Interim App (v0)

**Scope:** Authenticated dashboards (trainer & client) + public trainer directory. Marketing remains on WordPress; funnels, calendars, messaging, and purchases run through Go High Level (GHL).

**Stack:** Next.js (App Router) + Supabase (DB/Auth/Storage) + GHL API/Webhooks + PostHog + Sentry + LangGraph (PocketFlow tickets).

**Live targets:**
- App: `app.trainu.online`
- Marketing: `trainu.online` (WP), embedding GHL widgets

## Quickstart
1. Copy `.env.example` → `.env.local` and fill values.
2. Apply SQL: `infra/supabase/schema.sql` (e.g., Supabase SQL editor).
3. Install deps: `pnpm i` (or `npm i`).
4. Dev: `pnpm -C apps/web dev`.
5. Agent worker: `pnpm -C apps/agent dev`.

## High-Level Flows
- **Directory:** trainers table → public pages → CTA to GHL booking.
- **Dashboards:** Supabase auth → role route → client/trainer panels.
- **Sync:** GHL → Webhook → `webhook_events` → upsert snapshots.
- **Goals:** `goals` + `goal_entries` + `v_goal_progress` → UI progress bars.
- **Observability:** PostHog for UX events, Sentry for errors, agent tables for PocketFlow runs.

