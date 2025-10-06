# ai_inbox_specs.md

## Purpose

Central place where trainers review AI‑drafted messages, edit, approve, and send.

## Core Objects

* **Thread** (client ↔ trainer), **Message** (draft/queued/sent), **Suggestion** (insight→draft link).

## Workflow

1. Events arrive → Insights engine prioritizes → Drafts created.
2. AI Inbox shows queue sorted by **impact** (risk score × timeliness).
3. Trainer approves/edits or snoozes; audit trail stored.

## UI States

* Tabs: **Needs Review**, **Scheduled**, **Sent**, **Failed**.
* Filters: client, insight type, date, approval status.

## Safety & Governance

* Default **approval required** for outbound to clients.
* Red banners for sensitive topics; mandatory note on send.
* Rate‑limit per client/day; quiet hours per timezone.

## Metrics

* Draft→Send rate, edits per message, time‑to‑respond, outcomes (confirm/reschedule/no‑show).
