# SECURITY_PRIVACY.md

## Data We Hold (v1)

* Identity (name, email, phone), bookings metadata, messages, insights.

## Principles

* Minimum necessary; encrypt in transit/at rest; role‑based access; audit trails.

## Retention

* Drafts/messages retained 18 months (configurable). DLQ items 30 days.

## Processors

* Supabase (DB/Auth/Storage), OpenAI (LLM), GoHighLevel (CRM), PostHog (analytics), Sentry (errors), Stripe (payments).

## Rights & Requests

* Export/Delete upon verified request (within 30 days). Soft‑delete first; hard‑delete after 7 days.

## Messaging Compliance

* Respect quiet hours, frequency caps, STOP/UNSUBSCRIBE keywords. A2P 10DLC registration for SMS when enabled.

## Incident Response

* 4‑hour acknowledgement, 24‑hour preliminary report, 72‑hour full RCA for SEV1.
