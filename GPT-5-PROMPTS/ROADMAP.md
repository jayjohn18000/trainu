# TrainU Roadmap

> **Source of Truth:** This roadmap is derived from [docs/Context/VISION_SCOPE.md](Context/VISION_SCOPE.md) and [docs/Context/PRD_v1_Agent_MVP.md](Context/PRD_v1_Agent_MVP.md).

## Vision

Scale great coaching—not replace it—by giving every trainer and client a pair of AI agents that reduce admin work, increase show‑rates, and keep people on track.

## Phase Progression

### Phase 0 – GHL Validation (Current)
**Duration:** 4-6 weeks  
**Goal:** Prove funnel, booking, show‑rate, payments work

**Features:**
- WordPress/Dokan as brand shell
- GHL integration for bookings and payments
- Basic trainer directory
- Lead capture and conversion tracking

**Acceptance Criteria:**
- [ ] Lead → booking conversion > 15%
- [ ] Show‑rate baseline established
- [ ] Payment processing functional
- [ ] PostHog instrumentation complete

**Kill Metrics:**
- Show‑rate < 60% (industry baseline)
- Conversion < 10% after 4 weeks

### Phase 1 – WP Shell (Polish)
**Duration:** 3-4 weeks  
**Goal:** Professional presence and SEO

**Features:**
- SEO-optimized trainer directory
- Case study pages
- Enhanced CTAs and conversion flows
- PostHog dashboard setup

**Acceptance Criteria:**
- [ ] Page load speed < 3s
- [ ] SEO score > 85
- [ ] Conversion tracking end-to-end
- [ ] Professional design consistency

### Phase 2 – v1 Agent MVP (8–12 weeks)
**Goal:** Core AI agent functionality with human-in-the-loop

**Features:**
- Supabase auth and storage
- Trainer & Client AI agents
- AI Inbox (approve/edit/send workflow)
- GHL ↔ Supabase sync
- Stripe integration
- Weekly insights and digests

**Acceptance Criteria:**
- [ ] A1: Trainer can approve and send AI‑drafted reply from AI Inbox
- [ ] A2: Client receives confirmation/reschedule nudges with deep links
- [ ] A3: Weekly trainer digest lists top 5 at‑risk clients with reasons
- [ ] A4: GHL contact/booking sync is idempotent (no duplicates after retries)
- [ ] A5: PostHog shows activation, engagement, and show‑rate dashboards
- [ ] A6: Sentry reports zero unhandled exceptions in the happy path for 7 days

**Success Metrics:**
- Show‑rate +15–25% vs baseline
- ≥70% of drafted messages sent with <2 edits median
- Admin time saved: ≥10 hrs/month/trainer
- NSM: % of active clients receiving 1+ useful insight per week

**Kill Metrics:**
- Show‑rate improvement < 10% after 8 weeks
- Trainer adoption < 50% after 4 weeks

### Phase 3 – Custom App (Hardening)
**Duration:** 6-8 weeks  
**Goal:** Production-ready platform

**Features:**
- Deeper dashboards and analytics
- Role-based access control (RBAC)
- Durable job queues
- Program templates and builder
- Advanced AI insights

**Acceptance Criteria:**
- [ ] Multi-tenant isolation
- [ ] 99.9% uptime
- [ ] Advanced analytics dashboard
- [ ] Program template system

### Phase 4 – Motion + Mobile (Future)
**Duration:** 12+ weeks  
**Goal:** Advanced features and mobile presence

**Features:**
- MediaPipe/pose analysis
- React Native mobile app
- Wearable integrations
- Advanced motion tracking

## North‑Star & KPIs

**North Star Metric:** % of active clients receiving **1+ useful insight** from the agent per week

**Key Performance Indicators:**
- Activation: time to first booking < 24h; time to first insight < 7 days
- Show‑rate: +15–25% vs baseline
- Admin time saved: ≥10 hrs/month/trainer
- Retention: churn ↓ 10–20% among engaged clients

## Risk Mitigation

**Top 5 Risks:**
1. **Low show‑rate lift** → iterate on offer, reminders, recovery flows
2. **GHL sync fragility** → idempotent writes, dead‑letter queues, alerts
3. **LLM hallucinations** → strict prompts, retrieval‑first, escalation rules
4. **Trainer adoption** → AI Inbox with approve/edit, not auto‑send by default
5. **Scope creep** → [NON_GOALS.md](Context/NON_GOALS.md) + ADRs; weekly scope review

## What's NOT in v1

See [docs/Context/NON_GOALS.md](Context/NON_GOALS.md) for explicit exclusions:
- Pose/motion analysis
- Mobile app
- Marketplace features
- Deep 3rd-party integrations
- Advanced content generation

## Related Documents

- [Vision & Scope](Context/VISION_SCOPE.md) - Product pillars and decision framework
- [PRD v1 Agent MVP](Context/PRD_v1_Agent_MVP.md) - Detailed requirements and acceptance criteria
- [Data Model](Context/DATA_MODEL.md) - Database schema and relationships
- [GHL Integration](Context/INTEGRATIONS_GHL_SYNC.md) - Sync specifications
- [Security & Privacy](Context/SECURITY_PRIVACY.md) - Data handling and compliance
