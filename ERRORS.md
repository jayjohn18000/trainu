# Error Handling & Idempotency
- **Webhooks:** upsert key in `webhook_events` to avoid duplicate processing.
- **External calls:** retry with backoff (GHL), circuit-breaker pattern for rate limit bursts.
- **User actions:** optimistic UI + server validation; show Sentry event ID on fatal errors.
