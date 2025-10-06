# DATA_MODEL.md

## Entities

* **users** (auth), **trainers**, **clients**, **contacts**, **bookings**, **messages**, **insights**, **goals**, **programs**, **events**, **embeddings**.

## Tables (core)

**users**

* id (uuid, pk)
* email (text, unique), role (enum: owner, trainer, client)
* created_at, last_login_at

**trainers**

* id (uuid, pk, = users.id FK)
* name, bio, specialties[], timezone

**clients**

* id (uuid, pk, = users.id FK)
* trainer_id (uuid FK), goals_summary, risk_score (int)

**contacts** (for non‑app leads)

* id (uuid pk), ghl_contact_id (text unique), email, phone, first_name, last_name, tags[]

**bookings**

* id (uuid pk), client_id (uuid FK), trainer_id (uuid FK)
* ghl_appointment_id (text unique)
* starts_at (timestamptz), status (enum: scheduled|confirmed|no_show|canceled)

**messages**

* id, thread_id, sender_type (trainer|client|agent), body, status (draft|queued|sent|failed)
* approval_required (bool), approved_by, approved_at

**insights**

* id, client_id, priority (1–5), type (risk|win|suggestion), reason, action_suggestion, created_at

**events** (immutable)

* id, type, actor (system|trainer|client), subject_id, payload (jsonb), occurred_at
* indexed by (type, occurred_at)

**embeddings**

* id, owner_type (message|note), owner_id, vector (pgvector), metadata

## Indices

* bookings(trainer_id, starts_at), messages(thread_id, status), events(type, occurred_at)

## ERD (ASCII)

```
users(1)───(1)trainers
   └──(1)clients──(n)bookings──(n)messages
contacts──(1)bookings (via upserted clients when applicable)
clients──(n)insights
* events reference any subject via (subject_id, type)
```
