# incident_triage.md

## Severity Levels

* **SEV1:** Data loss or mass send error → stop all outbound, notify owner.
* **SEV2:** Sync backlog > 1h or 5% failure → throttle drafts, work DLQ.
* **SEV3:** Minor UI bugs, non‑blocking.

## Playbooks

* **GHL Webhook Down:** switch to polling (15m), alert, backfill last 24h.
* **LLM Errors:** auto‑retry 2×, mark draft failed, surface to AI Inbox.
* **Rate Limits:** exponential backoff; reduce batch size.
