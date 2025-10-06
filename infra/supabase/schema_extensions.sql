-- Schema extensions for AI Inbox, Messaging, Insights, and Contacts
-- Run this after applying the main schema.sql

-- Contacts (non-app users from GHL)
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  ghl_contact_id text unique not null,
  trainer_user_id uuid references public.trainers(user_id),
  email text,
  phone text,
  first_name text,
  last_name text,
  tags text[],
  custom_fields jsonb,
  pipeline_stage text,
  last_activity_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_contacts_ghl_id on public.contacts(ghl_contact_id);
create index idx_contacts_trainer on public.contacts(trainer_user_id);
create index idx_contacts_email on public.contacts(email) where email is not null;
create index idx_contacts_phone on public.contacts(phone) where phone is not null;

-- Insights (AI-generated suggestions for trainers)
create table if not exists public.insights (
  id uuid default gen_random_uuid() primary key,
  trainer_user_id uuid references public.trainers(user_id) on delete cascade,
  client_user_id uuid references public.clients(user_id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  type text not null,                    -- 'at_risk', 'no_show_recovery', 'celebration', 'booking_confirmation'
  risk_score numeric,                    -- 0-100, higher = more urgent
  timeliness_score numeric,              -- 0-100, higher = more time-sensitive
  impact_score numeric generated always as (coalesce(risk_score, 50) * coalesce(timeliness_score, 50) / 100) stored,
  reason text,                           -- Human-readable explanation
  suggested_action text,                 -- What the trainer should do
  context jsonb,                         -- Supporting data (booking IDs, goal progress, etc.)
  status text default 'pending',         -- 'pending', 'actioned', 'snoozed', 'dismissed'
  created_at timestamptz default now(),
  actioned_at timestamptz,
  snoozed_until timestamptz
);

create index idx_insights_trainer on public.insights(trainer_user_id);
create index idx_insights_client on public.insights(client_user_id);
create index idx_insights_status on public.insights(status);
create index idx_insights_impact on public.insights(impact_score desc);

-- Messages (thread-based messaging with approval workflow)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid not null,               -- Group messages into conversations
  insight_id uuid references public.insights(id) on delete set null,
  sender_user_id uuid references public.users_ext(user_id),
  recipient_user_id uuid references public.users_ext(user_id),
  recipient_contact_id uuid references public.contacts(id),
  subject text,
  body text not null,
  status text not null default 'draft',  -- 'draft', 'needs_review', 'approved', 'queued', 'sent', 'failed'
  is_ai_generated boolean default false,
  requires_approval boolean default true,
  approved_by_user_id uuid references public.users_ext(user_id),
  approved_at timestamptz,
  approval_note text,
  sent_at timestamptz,
  sent_via text,                         -- 'ghl_sms', 'ghl_email', 'in_app'
  ghl_message_id text,
  error_message text,
  metadata jsonb,                        -- Additional context (deep links, reschedule options, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_messages_thread on public.messages(thread_id);
create index idx_messages_sender on public.messages(sender_user_id);
create index idx_messages_recipient on public.messages(recipient_user_id);
create index idx_messages_status on public.messages(status);
create index idx_messages_insight on public.messages(insight_id);
create index idx_messages_needs_review on public.messages(status) where status = 'needs_review';

-- Message Audit Trail
create table if not exists public.message_audit (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade,
  action text not null,                  -- 'created', 'edited', 'approved', 'sent', 'failed', 'snoozed'
  actor_user_id uuid references public.users_ext(user_id),
  changes jsonb,                         -- Before/after for edits
  note text,
  created_at timestamptz default now()
);

create index idx_message_audit_message on public.message_audit(message_id);

-- Sync Queue (Dead Letter Queue for failed syncs)
create table if not exists public.sync_queue (
  id uuid default gen_random_uuid() primary key,
  provider text not null,                -- 'ghl'
  operation text not null,               -- 'contact_sync', 'appointment_sync', 'message_send'
  external_id text,
  payload jsonb not null,
  error_message text,
  retry_count integer default 0,
  max_retries integer default 5,
  next_retry_at timestamptz,
  status text default 'pending',         -- 'pending', 'processing', 'failed', 'completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sync_queue_status on public.sync_queue(status);
create index idx_sync_queue_next_retry on public.sync_queue(next_retry_at) where status = 'pending';
create index idx_sync_queue_provider on public.sync_queue(provider, operation);

-- Events (immutable event log for analytics and replay)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  type text not null,                    -- 'lead_created', 'booking_scheduled', 'no_show', 'message_drafted', etc.
  user_id uuid references public.users_ext(user_id),
  entity_type text,                      -- 'booking', 'message', 'goal', etc.
  entity_id uuid,
  payload jsonb,
  correlation_id text,
  created_at timestamptz default now()
);

create index idx_events_type on public.events(type);
create index idx_events_user on public.events(user_id);
create index idx_events_created on public.events(created_at desc);
create index idx_events_correlation on public.events(correlation_id) where correlation_id is not null;

-- Row Level Security Policies
alter table public.contacts enable row level security;
alter table public.insights enable row level security;
alter table public.messages enable row level security;
alter table public.message_audit enable row level security;
alter table public.sync_queue enable row level security;
alter table public.events enable row level security;

-- Contacts: trainers can see their own contacts
create policy "Trainers can view own contacts"
  on public.contacts for select
  using (trainer_user_id = auth.uid());

-- Insights: trainers can see their own insights
create policy "Trainers can view own insights"
  on public.insights for select
  using (trainer_user_id = auth.uid());

create policy "Trainers can update own insights"
  on public.insights for update
  using (trainer_user_id = auth.uid());

-- Messages: users can see messages they sent or received
create policy "Users can view own messages"
  on public.messages for select
  using (
    sender_user_id = auth.uid() or 
    recipient_user_id = auth.uid()
  );

create policy "Users can create messages"
  on public.messages for insert
  with check (sender_user_id = auth.uid());

create policy "Users can update own messages"
  on public.messages for update
  using (sender_user_id = auth.uid());

-- Message Audit: users can view audit trail for their messages
create policy "Users can view message audit for own messages"
  on public.message_audit for select
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_audit.message_id
      and (m.sender_user_id = auth.uid() or m.recipient_user_id = auth.uid())
    )
  );

-- Sync Queue: admin only (service role)
create policy "Service role can manage sync queue"
  on public.sync_queue for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Events: users can view their own events
create policy "Users can view own events"
  on public.events for select
  using (user_id = auth.uid());

-- Triggers for updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_contacts_updated_at before update on public.contacts
  for each row execute function public.update_updated_at_column();

create trigger update_messages_updated_at before update on public.messages
  for each row execute function public.update_updated_at_column();

create trigger update_sync_queue_updated_at before update on public.sync_queue
  for each row execute function public.update_updated_at_column();

