-- Roles
create type user_role as enum ('trainer','client','admin');

-- Auth extension table (maps to supabase auth.users)
create table if not exists public.users_ext (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  ghl_contact_id text unique,
  created_at timestamptz default now()
);

-- Trainers
create table if not exists public.trainers (
  user_id uuid primary key references public.users_ext(user_id) on delete cascade,
  slug text unique not null,
  first_name text,
  last_name text,
  city text, state text, zip text,
  specialties text[],
  certifications text,
  training_modes text[],
  hourly_rate numeric,
  pricing_notes text,
  bio text,
  testimonial_url text,
  profile_photo_url text,
  languages text[],
  accepts_minors boolean default false,
  visibility text default 'public',
  updated_at timestamptz default now()
);

-- Clients
create table if not exists public.clients (
  user_id uuid primary key references public.users_ext(user_id) on delete cascade,
  first_name text,
  last_name text,
  city text, state text, zip text,
  dob date,
  created_at timestamptz default now()
);

-- Appointments snapshot (mirrored from GHL)
create table if not exists public.appointments (
  id text primary key,                -- GHL appointment id
  client_user_id uuid references public.clients(user_id),
  trainer_user_id uuid references public.trainers(user_id),
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  raw jsonb,
  updated_at timestamptz default now()
);

-- Purchases snapshot (GHL offers)
create table if not exists public.purchases (
  id text primary key,                -- GHL invoice/payment id
  ghl_contact_id text,
  amount_cents integer,
  currency text default 'USD',
  status text,
  raw jsonb,
  created_at timestamptz default now()
);

-- Files (Supabase Storage-backed metadata)
create table if not exists public.files (
  id uuid default gen_random_uuid() primary key,
  owner_user_id uuid references public.users_ext(user_id) on delete cascade,
  bucket text not null,
  path text not null,
  mime text,
  size_bytes integer,
  created_at timestamptz default now()
);

-- Goals & Progress
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_ext(user_id) on delete cascade,
  title text not null,
  unit text not null,                -- e.g., kg, reps, minutes, %
  target_value numeric not null,
  baseline_value numeric,
  start_date date not null,
  due_date date,
  created_at timestamptz default now()
);

create table if not exists public.goal_entries (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade,
  entry_date date not null,
  value numeric not null,
  note text,
  created_at timestamptz default now(),
  unique(goal_id, entry_date)
);

-- Computed view: progress percent (baseline -> latest vs target)
create or replace view public.v_goal_progress as
select
  g.id as goal_id,
  g.user_id,
  g.title,
  g.unit,
  g.target_value,
  coalesce(g.baseline_value, (select value from goal_entries ge where ge.goal_id=g.id order by entry_date asc limit 1)) as baseline,
  (select value from goal_entries ge where ge.goal_id=g.id order by entry_date desc limit 1) as latest,
  case when g.target_value is not null and (select value from goal_entries ge where ge.goal_id=g.id order by entry_date desc limit 1) is not null
       then round( greatest(0, least(100, 100 * ((select value from goal_entries ge where ge.goal_id=g.id order by entry_date desc limit 1) - coalesce(g.baseline_value, (select value from goal_entries ge where ge.goal_id=g.id order by entry_date asc limit 1))) / nullif(g.target_value - coalesce(g.baseline_value, (select value from goal_entries ge where ge.goal_id=g.id order by entry_date asc limit 1)),0))) ,2)
       else null end as progress_percent
from goals g;

-- Consents (for minors/guardianship)
create table if not exists public.consents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_ext(user_id) on delete cascade,
  type text not null,                -- e.g., 'minor_parental'
  granted_by text not null,          -- guardian name/email
  granted_at timestamptz default now(),
  document_url text
);

-- Agent observability (PocketFlow + LangGraph)
create table if not exists public.agent_runs (
  id uuid default gen_random_uuid() primary key,
  ticket_id text not null,
  correlation_id text not null,
  status text not null,
  model text,
  prompt_hash text,
  input_checksum text,
  user_id uuid,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists public.agent_events (
  id uuid default gen_random_uuid() primary key,
  run_id uuid references public.agent_runs(id) on delete cascade,
  step text,
  level text,
  message text,
  payload_json jsonb,
  latency_ms integer,
  tokens_in integer,
  tokens_out integer,
  cost_estimate numeric,
  created_at timestamptz default now()
);

create table if not exists public.agent_artifacts (
  id uuid default gen_random_uuid() primary key,
  run_id uuid references public.agent_runs(id) on delete cascade,
  kind text,             -- plan|diff|test|pr|log
  path_or_url text,
  sha256 text,
  created_at timestamptz default now()
);

-- Webhook intake for idempotency
create table if not exists public.webhook_events (
  id text primary key,         -- event id from provider
  provider text not null,
  received_at timestamptz default now(),
  raw jsonb
);
