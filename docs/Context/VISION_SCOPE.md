# VISION_SCOPE.md

## Vision

Scale great coaching—not replace it—by giving every trainer and client a pair of AI agents that reduce admin work, increase show‑rates, and keep people on track.

## Product Pillars (guides every decision)

1. **Metrics → Momentum:** simple goal tracking → weekly insights → visible progress.
2. **Scheduling → Show‑up:** frictive‑free booking, nudges, and recovery workflows.
3. **Community → Consistency:** light social proof, streaks, and coach feedback loops.

## Scope Levels

* **Phase 0 – GHL Validation (now):** Funnel, booking, show‑rate, payments. WordPress/Dokan as brand shell.
* **Phase 1 – WP Shell (polish):** SEO directory, CTAs, case‑study pages, PostHog instrumentation.
* **Phase 2 – v1 Agent MVP (8–12 wks):** Supabase auth/storage, Trainer & Client agents, AI Inbox (human‑in‑the‑loop), GHL↔Supabase sync, Stripe.
* **Phase 3 – Custom App (hardening):** deeper dashboards, role‑based access, durable job queues, templates.
* **Phase 4 – Motion + Mobile (later):** MediaPipe/pose, React Native, wearables.

## North‑Star & KPIs

* **NSM:** % of active clients receiving **1+ useful insight** from the agent per week.
* Activation: time to first booking < 24h; time to first insight < 7 days.
* Show‑rate: +15–25% vs baseline.
* Admin time saved: ≥10 hrs/month/trainer.
* Retention: churn ↓ 10–20% among engaged clients.

## Tenets (decision guardrails)

* Agent‑first now; motion only when it clearly improves NSM.
* Human‑in‑the‑loop for outbound messages that could cause harm/confusion.
* Instrument everything (PostHog + Sentry). If it's not measured, it didn't ship.
* Ship small, reversible slices; keep acceptance criteria testable.

## Risks & Mitigations (top 5)

* **Low show‑rate lift** → iterate on offer, reminders, recovery flows.
* **GHL sync fragility** → idempotent writes, dead‑letter queues, alerts.
* **LLM hallucinations** → strict prompts, retrieval‑first, escalation rules.
* **Trainer adoption** → AI Inbox with approve/edit, not auto‑send by default.
* **Scope creep** → NON_GOALS.md + ADRs; weekly scope review.
