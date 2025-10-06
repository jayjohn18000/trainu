# INTEGRATIONS_GHL_SYNC.md

## Overview

Bi‑directional, idempotent synchronization between TrainU (Supabase) and GoHighLevel (GHL) for **contacts, tags, appointments, opportunities**. Webhook‑first with REST backfills.

## Objects & Directionality

* **Contact** (Person): GHL ⇄ TrainU (source of truth: latest write wins; email/phone as natural keys).
* **Appointment/Booking:** GHL → TrainU (schedule lives in GHL for v1; TrainU enriches).
* **Opportunity/Pipeline Stage:** GHL → TrainU for reporting.
* **Tag/Custom Field:** GHL → TrainU for segmentation.

## Keys & Idempotency

* `external_id` columns: `ghl_contact_id`, `ghl_appointment_id`, `ghl_opportunity_id`.
* Idempotency key = upstream id + lastUpdatedAt. Upserts only.

## Webhooks Consumed

* `contact.created`, `contact.updated`
* `appointment.created`, `appointment.updated`, `appointment.deleted`
* `opportunity.*`, `task.*` (optional)

## Retry & DLQ

* Exponential backoff (1m, 5m, 15m, 1h, 6h). After 5 tries → **DLQ** table with reason + repair playbook.

## Field Mapping (sample)

| GHL Field               | TrainU Table.Field            | Notes                                |
| ----------------------- | ----------------------------- | ------------------------------------ |
| `id`                    | `contacts.ghl_contact_id`     | string                               |
| `email`                 | `contacts.email`              | unique nullable                      |
| `phone`                 | `contacts.phone`              | E.164                                |
| `firstName`             | `contacts.first_name`         |                                      |
| `lastName`              | `contacts.last_name`          |                                      |
| `tags[]`                | `contact_tags[]`              | normalized                           |
| `appointment.id`        | `bookings.ghl_appointment_id` |                                      |
| `appointment.startTime` | `bookings.starts_at`          | ISO8601 UTC                          |
| `appointment.status`    | `bookings.status`             | scheduled/confirmed/no_show/canceled |

## Pseudocode (inbound appointment)

```pseudo
onWebhook(appointment.created as evt){
  if exists(bookings where ghl_appointment_id=evt.id) return OK
  upsert contact (by email/phone)
  insert booking (status='scheduled', starts_at, meta)
  emit event 'booking_scheduled'
}
```

## Security

* HMAC verify webhook signatures; IP allowlist where possible.
* Store only minimum necessary PII; encrypt at rest (Supabase default) + TLS.

## Observability

* Log every sync op with `correlation_id`.
* PostHog events: `sync_ok`, `sync_retry`, `sync_dropped`.
