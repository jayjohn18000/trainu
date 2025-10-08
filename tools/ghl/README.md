# GoHighLevel Tools

Utilities for managing GoHighLevel sub-accounts (locations) for TrainU.

## Prerequisites

```bash
npm install axios
```

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials:
   - `GHL_TOKEN`: Your Private Integration or Location API token
   - `LOCATION_ID`: The sub-account location ID you want to manage

## Scripts

### `ghl-seed.mjs`

**Purpose**: Idempotently seeds a GoHighLevel location with the TrainU "Master Snapshot" assets.

**What it creates**:
- **Pipelines & Stages**: Core Sales, Retention
- **Calendars**: Consult (30min), PT/Session (60min) with reminders
- **Forms**: Lead Capture, Free Intro/Consult, Post-Session Feedback
- **Tags**: Source, Segment, and Stage prefixes
- **Custom Fields**: Program Type, Coach Assigned, Membership Tier, etc.
- **Email Templates**: 10+ templates for booking, reminders, no-shows, etc.
- **Workflow Shells**: 6 workflow placeholders

**Usage**:
```bash
node ghl-seed.mjs
```

**Output**: `ghl_seed_manifest.json` with created asset IDs

---

### `ghl-audit.mjs`

**Purpose**: Audits a GoHighLevel location to verify all expected TrainU assets are present and configured correctly.

**What it checks**:
- Pipeline names and stages
- Calendar names, durations, and reminder configurations
- Forms, workflows, tags, custom fields
- Email template count (minimum 10)

**Usage**:
```bash
node ghl-audit.mjs
```

**Output**: 
- `ghl_audit.json`: Detailed results
- `ghl_audit.csv`: Quick summary checklist

---

## Workflow

1. **Seed a new location**:
   ```bash
   export GHL_TOKEN="your_token"
   export LOCATION_ID="your_location_id"
   node ghl-seed.mjs
   ```

2. **Verify the setup**:
   ```bash
   node ghl-audit.mjs
   ```

3. **Take a Snapshot** (in GHL UI):
   - Go to Settings → Snapshots
   - Create new snapshot: "TrainU Master"
   - Share to marketplace (optional)

4. **Deploy to new clients**: Use the snapshot to provision new trainer accounts

---

## Notes

- All operations are **idempotent**: safe to run multiple times
- Scripts respect GHL rate limits with built-in delays
- Workflow shells are created but triggers/steps must be completed in the GHL UI
- Uses GHL API version `2021-07-28`

