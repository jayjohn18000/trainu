# PRD_v1_Agent_MVP.md

## Background

Gyms/trainers lose revenue to no‑shows, churn, and admin drag. We deliver Trainer/Client AI agents that nudge, schedule, summarize, and celebrate progress.

## Goals

* Increase show‑rate and adherence via timely nudges and easier reschedules.
* Reduce admin time with auto‑drafted replies and summarized check‑ins.
* Create a measurable feedback loop (events → insights → actions).

## Non‑Goals (v1)

* Pose/motion analysis, mobile app, marketplace, deep 3rd‑party integrations.

## Personas & Jobs‑To‑Be‑Done

* **Trainer:** "Keep my roster consistent and spend time coaching, not admin."
* **Client:** "Have a clear plan and gentle nudges when I'm slipping."
* **Owner/Manager:** "See utilization, leads → bookings, and risk proactively."

## Core User Stories

1. As a trainer, I see an **AI Inbox** with drafted replies to inbound client messages and can approve/edit/send.
2. As a client, I receive **friendly nudges** to confirm, reschedule, or prep for a session.
3. As a trainer, I get a **weekly digest** of at‑risk clients and suggested actions.
4. As an owner, I view **funnel & utilization** metrics with trends.

## Functional Requirements

* **Auth & Roles:** trainer, client, owner (RBAC via Supabase).
* **Messaging:** threads with sender/recipient, status (draft/queued/sent), and audit trail.
* **Insights Engine:** consumes events, emits prioritized suggestions.
* **AI Inbox:** approve/edit/send, templating, safety checks, rate‑limit.
* **GHL Sync:** contacts, bookings, pipeline stage, and tags (idempotent).
* **Analytics:** PostHog events for funnel, adoption, and retention.

## Integrations

* **GoHighLevel (GHL):** contacts/leads/appointments webhooks + REST.
* **Stripe:** payments status (basic), link to invoices/receipts.

## Instrumentation

* Key events: `lead_created`, `booking_scheduled`, `no_show`, `message_drafted`, `message_sent`, `insight_created`, `trainer_approved`, `goal_updated`.

## Acceptance Criteria (high‑level)

* A1: Trainer can approve and send an AI‑drafted reply from AI Inbox.
* A2: Client receives confirmation/reschedule nudges with deep links.
* A3: Weekly trainer digest lists top 5 at‑risk clients with reasons.
* A4: GHL contact/booking sync is idempotent (no duplicates after retries).
* A5: PostHog shows activation, engagement, and show‑rate dashboards.
* A6: Sentry reports zero unhandled exceptions in the happy path for 7 days.

## Release Plan

* Beta with 3–5 trainers, 50–100 clients; instrumented feature flags; weekly review.

## Risks & Mitigations

* Over‑messaging → frequency caps & quiet hours.
* Data mismatch with GHL → mapping table + fallbacks, DLQ and manual repair.
