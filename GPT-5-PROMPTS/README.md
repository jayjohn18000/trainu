# TrainU v1 Agent MVP

**Vision:** Scale great coaching—not replace it—by giving every trainer and client a pair of AI agents that reduce admin work, increase show‑rates, and keep people on track.

**Current Phase:** v1 Agent MVP - Core AI agent functionality with human-in-the-loop approval

**Stack:** Next.js (App Router) + Supabase (DB/Auth/Storage) + OpenAI (LLM) + PostHog (Analytics) + Sentry (Errors) + GoHighLevel (CRM/Booking)

## Quickstart

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in required values (see .env.example for details)
   ```

2. **Database Setup**
   ```bash
   # Apply SQL schema in Supabase SQL editor
   cat infra/supabase/schema.sql
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Start Development**
   ```bash
   # Web app
   pnpm -C apps/web dev
   
   # Agent worker (for PocketFlow tickets)
   pnpm -C apps/agent dev
   ```

5. **Verify Setup**
   - App: `http://localhost:3000`
   - Health check: `http://localhost:3000/api/health`

## Core Features

### 🤖 AI Agents
- **Trainer Agent:** Drafts replies, generates insights, creates weekly digests
- **Client Agent:** Sends nudges, confirms bookings, celebrates progress
- **AI Inbox:** Human-in-the-loop approval for all outbound messages

### 📊 Goal Tracking
- Simple goal setting and progress tracking
- Weekly insights and momentum tracking
- Risk scoring for at-risk clients

### 🔄 GHL Integration
- Bi-directional sync with GoHighLevel
- Webhook-first architecture with idempotent writes
- Dead letter queue for failed syncs

### 📈 Analytics
- PostHog instrumentation for user journeys
- Show-rate tracking and improvement metrics
- Admin time saved measurement

## Context Pack

All project documentation is organized in `docs/Context/`:

### Core Documents
- [**Vision & Scope**](docs/Context/VISION_SCOPE.md) - Product pillars and decision framework
- [**PRD v1 Agent MVP**](docs/Context/PRD_v1_Agent_MVP.md) - Detailed requirements and acceptance criteria
- [**Roadmap**](docs/ROADMAP.md) - Phase progression and milestones

### Technical Specifications
- [**Data Model**](docs/Context/DATA_MODEL.md) - Database schema and relationships
- [**GHL Integration**](docs/Context/INTEGRATIONS_GHL_SYNC.md) - Sync specifications and field mapping
- [**Architecture**](ARCHITECTURE.md) - System design and boundaries
- [**API Contracts**](API_CONTRACTS.md) - API endpoints and webhook specifications
- [**Error Handling**](ERRORS.md) - Error handling patterns and idempotency

### AI & Agents
- [**Trainer Agent**](docs/Context/AGENTS/trainer_agent_prompt.md) - AI agent capabilities and prompts
- [**Client Agent**](docs/Context/AGENTS/client_agent_prompt.md) - Client-facing agent specifications
- [**AI Inbox**](docs/Context/AGENTS/ai_inbox_specs.md) - Human-in-the-loop approval workflow

### Operations
- [**Trainer Onboarding**](docs/Context/RUNBOOKS/trainer_onboarding.md) - Setup and go-live process
- [**Client Onboarding**](docs/Context/RUNBOOKS/client_onboarding.md) - Lead to client journey
- [**Incident Triage**](docs/Context/RUNBOOKS/incident_triage.md) - Response procedures

### Business & Strategy
- [**Lead Ops Playbook**](docs/Context/LEADOPS_PLAYBOOK.md) - Acquisition strategy and tools
- [**OKRs**](docs/Context/OKRs_Quarter.md) - Quarterly objectives and key results
- [**Security & Privacy**](docs/Context/SECURITY_PRIVACY.md) - Data handling and compliance

### Observability & Development
- [**Observability**](docs/Observability.md) - PostHog events, Sentry tracking, and dashboards
- [**Development Tasks**](TASKS.md) - Detailed task breakdown and acceptance criteria
- [**Contributing**](CONTRIBUTING.md) - Development guidelines and PR process

## What's NOT in v1

See [docs/Context/NON_GOALS.md](docs/Context/NON_GOALS.md) for explicit exclusions:
- Pose/motion analysis (rep counting, form checking)
- Mobile app development
- Marketplace features
- Deep 3rd-party integrations (MindBody, Trainerize, etc.)
- Advanced content generation at scale

## Key Metrics

**North Star:** % of active clients receiving 1+ useful insight from the agent per week

**Success Targets:**
- Show‑rate improvement: +15–25% vs baseline
- Admin time saved: ≥10 hrs/month/trainer
- Activation: Time to first booking < 24h
- Retention: Churn reduction of 10–20% among engaged clients

## Development

### Project Structure
```
apps/
├── web/          # Next.js app (dashboards, directory, API routes)
└── agent/        # LangGraph worker (PocketFlow ticket automation)

packages/
├── types/        # Shared TypeScript types
└── ui/           # Shared UI components

docs/
├── Context/      # Canonical project documentation
├── _archive/     # Deprecated documents
└── ROADMAP.md    # Phase progression
```

### Key Flows
- **Directory:** Public trainer profiles → GHL booking CTAs
- **Dashboards:** Supabase auth → role-based routing → trainer/client panels
- **AI Agents:** Events → insights → drafts → approval → send
- **Sync:** GHL webhooks → idempotent upserts → PostHog events

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and PR requirements.

## Glossary

- **GHL:** GoHighLevel - CRM and booking platform
- **AI Inbox:** Human-in-the-loop approval system for AI-drafted messages
- **NSM:** North Star Metric - primary success measurement
- **DLQ:** Dead Letter Queue - failed sync items requiring manual intervention
- **RBAC:** Role-Based Access Control - permission system
- **RSC:** React Server Components - Next.js rendering strategy

## Security & Privacy

See [docs/Context/SECURITY_PRIVACY.md](docs/Context/SECURITY_PRIVACY.md) for data handling, retention policies, and compliance information.

## License

See [LICENSE](LICENSE) for details.