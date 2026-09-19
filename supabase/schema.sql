-- =====================================================================
-- Royal Square Financial — Supabase schema
-- Run in a FRESH Supabase project: SQL Editor → paste → Run.
-- Then run supabase/seed.sql for demo data.
--
-- Contents
--   1. Extensions & shared trigger functions
--   2. Tables (20) + indexes
--   3. updated_at triggers
--   4. Auth → profile trigger (auto-links seeded clients/advisers by email)
--   5. RLS helper functions
--   6. Row Level Security policies
--   7. Storage buckets + storage policies
--
-- Column names match src/services/mappers.js. Change both together.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extensions & shared trigger functions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- One row per auth user. role drives what the user can see.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'client' check (role in ('client', 'adviser', 'admin')),
  full_name   text,
  email       text,
  phone       text,
  -- UI + chatbot language: 'en' (default/fallback), 'af' (Afrikaans), 'zu' (isiZulu).
  language    text not null default 'en' check (language in ('en', 'af', 'zu')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.advisers (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid unique references public.profiles (id) on delete set null,
  full_name       text not null,
  email           text not null unique,
  phone           text,
  region          text,
  fsp_rep_number  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.clients (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid unique references public.profiles (id) on delete set null,
  first_name           text not null,
  last_name            text not null,
  email                text unique,
  phone                text,
  id_number_masked     text,          -- never store full SA ID numbers in the prototype
  date_of_birth        date,
  address_line         text,
  city                 text,
  postal_code          text,
  occupation           text,
  vehicle_description  text,
  total_assets         numeric(14, 2) not null default 0,
  total_liabilities    numeric(14, 2) not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.client_adviser_assignments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  adviser_id  uuid not null references public.advisers (id) on delete cascade,
  is_primary  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, adviser_id)
);
create index idx_assignments_adviser on public.client_adviser_assignments (adviser_id);

create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.household_members (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  client_id     uuid not null references public.clients (id) on delete cascade,
  relationship  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (household_id, client_id)
);
create index idx_household_members_client on public.household_members (client_id);

-- Provider integrations are MOCK in this prototype (integration_mode = 'mock').
create table public.providers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null unique,
  category           text,
  contact_email      text,
  avg_response_days  integer,
  integration_mode   text not null default 'mock' check (integration_mode in ('mock', 'email', 'api')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.client_products (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  provider_id    uuid not null references public.providers (id),
  product_type   text not null,
  policy_number  text,
  description    text,
  status         text not null default 'active' check (status in ('active', 'lapsed', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_client_products_client on public.client_products (client_id);

-- A goal belongs to exactly one client OR one household.
create table public.goals (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references public.clients (id) on delete cascade,
  household_id    uuid references public.households (id) on delete cascade,
  name            text not null,
  category        text,
  current_amount  numeric(14, 2) not null default 0,
  target_amount   numeric(14, 2) not null check (target_amount > 0),
  target_date     date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint goals_single_owner check ((client_id is null) <> (household_id is null))
);
create index idx_goals_client on public.goals (client_id);
create index idx_goals_household on public.goals (household_id);

-- The workflow engine. current_* columns are denormalised from workflow_steps
-- so inboxes can be queried cheaply ("who's holding the ball?").
create table public.workflows (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  provider_id    uuid references public.providers (id),
  type           text not null,  -- key in src/utils/workflowTemplates.js
  title          text not null,
  status         text not null default 'active' check (status in ('active', 'completed', 'cancelled', 'on_hold')),
  current_owner  text not null check (current_owner in ('client', 'adviser', 'provider', 'repairer', 'system')),
  current_step   integer not null default 0,
  next_action    text,
  due_date       timestamptz,
  priority       text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_workflows_client on public.workflows (client_id);
create index idx_workflows_status_owner on public.workflows (status, current_owner);
create index idx_workflows_due on public.workflows (due_date) where status = 'active';

create table public.workflow_steps (
  id            uuid primary key default gen_random_uuid(),
  workflow_id   uuid not null references public.workflows (id) on delete cascade,
  position      integer not null,
  step_key      text not null,
  label         text not null,
  owner         text not null check (owner in ('client', 'adviser', 'provider', 'repairer', 'system')),
  status        text not null default 'upcoming' check (status in ('upcoming', 'current', 'complete', 'skipped')),
  next_action   text,
  due_in_days   integer,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (workflow_id, position)
);

create table public.documents (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  workflow_id     uuid references public.workflows (id) on delete set null,
  doc_type        text not null check (doc_type in ('id_document', 'drivers_licence', 'policy_schedule', 'valuation_certificate', 'proof_of_address', 'investment_statement', 'income_statement', 'other')),
  name            text not null,
  status          text not null default 'under_review' check (status in ('current', 'missing', 'expiring_soon', 'expired', 'under_review')),
  storage_path    text,      -- client-documents/{client_id}/{folder}/{file}
  expiry_date     date,
  extracted_data  jsonb,     -- output of document intelligence (simulated OCR today)
  uploaded_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_documents_client on public.documents (client_id);
create index idx_documents_expiry on public.documents (expiry_date) where expiry_date is not null;

create table public.tasks (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.clients (id) on delete cascade,
  workflow_id          uuid references public.workflows (id) on delete cascade,
  task_key             text,
  assignee_role        text not null check (assignee_role in ('client', 'adviser')),
  assigned_adviser_id  uuid references public.advisers (id) on delete set null,
  kind                 text not null default 'task' check (kind in ('task', 'reminder')),
  title                text not null,
  description          text,
  due_date             timestamptz,
  status               text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  priority             text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  link                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index idx_tasks_client_status on public.tasks (client_id, status);
create index idx_tasks_adviser_status on public.tasks (assigned_adviser_id, status);
create index idx_tasks_workflow on public.tasks (workflow_id);

create table public.reminders (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  document_id  uuid references public.documents (id) on delete cascade,
  task_id      uuid references public.tasks (id) on delete cascade,
  title        text not null,
  remind_at    timestamptz not null,
  channel      text not null default 'email' check (channel in ('email', 'sms', 'push', 'in_app')),
  sent_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_reminders_due on public.reminders (remind_at) where sent_at is null;
create index idx_reminders_client on public.reminders (client_id);

create table public.claims (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.clients (id) on delete cascade,
  workflow_id          uuid unique references public.workflows (id) on delete set null,
  provider_id          uuid references public.providers (id),
  claim_number         text,
  claim_type           text not null default 'motor',
  status               text not null default 'submitted' check (status in ('draft', 'submitted', 'in_progress', 'approved', 'declined', 'closed')),
  incident_at          timestamptz,
  incident_location    text,
  latitude             numeric(9, 6),
  longitude            numeric(9, 6),
  description          text,
  vehicle_description  text,
  other_party          jsonb,   -- { name, registration, insurer, phone }
  witnesses            jsonb,   -- [{ name, phone }]
  captured_offline     boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index idx_claims_client on public.claims (client_id);

create table public.claim_evidence (
  id                uuid primary key default gen_random_uuid(),
  claim_id          uuid not null references public.claims (id) on delete cascade,
  evidence_type     text not null,   -- location | scene | other_vehicle | other_insurer | witness | voice ...
  storage_path      text,            -- claim-evidence/{client_id}/{claim_id}/{file}
  notes             text,
  captured          boolean not null default true,  -- false = on the checklist but still outstanding
  captured_offline  boolean not null default false,
  captured_at       timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_claim_evidence_claim on public.claim_evidence (claim_id);

create table public.service_requests (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  workflow_id   uuid references public.workflows (id) on delete set null,
  request_type  text not null,   -- SERVICE_REQUEST_TYPES in src/utils/workflowTemplates.js
  details       jsonb not null default '{}'::jsonb,
  status        text not null default 'in_progress' check (status in ('submitted', 'in_progress', 'completed', 'cancelled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_service_requests_client on public.service_requests (client_id);

-- Append-only audit trail. No updated_at on purpose.
create table public.activity_events (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  workflow_id  uuid references public.workflows (id) on delete cascade,
  actor_type   text not null check (actor_type in ('client', 'adviser', 'provider', 'repairer', 'system')),
  actor_name   text,
  event_type   text not null default 'workflow',
  message      text not null,
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index idx_activity_workflow on public.activity_events (workflow_id, occurred_at desc);
create index idx_activity_client on public.activity_events (client_id, occurred_at desc);

create table public.chat_conversations (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles (id) on delete cascade,
  client_id   uuid references public.clients (id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_chat_conversations_profile on public.chat_conversations (profile_id);
create index idx_chat_conversations_client on public.chat_conversations (client_id);

create table public.chat_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.chat_conversations (id) on delete cascade,
  role             text not null check (role in ('user', 'assistant', 'system')),
  content          text not null,
  created_at       timestamptz not null default now()
);
create index idx_chat_messages_conversation on public.chat_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------
-- 3. updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'advisers', 'clients', 'client_adviser_assignments', 'households', 'household_members',
    'providers', 'client_products', 'goals', 'workflows', 'workflow_steps', 'documents', 'tasks',
    'reminders', 'claims', 'claim_evidence', 'service_requests', 'chat_conversations'
  ]
  loop
    execute format('create trigger trg_%1$s_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Auth → profile
-- New sign-ups are always 'client', EXCEPT when the email matches a row in
-- public.advisers (a table only admins can write). Seeded client/adviser rows
-- are linked to the new auth user by email so the demo data "belongs" to them.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_adviser boolean;
begin
  select exists (select 1 from public.advisers a where lower(a.email) = lower(new.email)) into is_adviser;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case when is_adviser then 'adviser' else 'client' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  update public.advisers set profile_id = new.id where lower(email) = lower(new.email) and profile_id is null;
  update public.clients  set profile_id = new.id where lower(email) = lower(new.email) and profile_id is null;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. RLS helper functions
-- SECURITY DEFINER so policies can look up roles/assignments without
-- recursing into the RLS of the tables they read.
-- ---------------------------------------------------------------------
create or replace function public.auth_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.auth_role() = 'admin', false);
$$;

create or replace function public.current_client_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.clients where profile_id = auth.uid() limit 1;
$$;

create or replace function public.current_adviser_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.advisers where profile_id = auth.uid() limit 1;
$$;

-- Is the signed-in user an adviser assigned to this client (or an admin)?
create or replace function public.is_staff_for_client(target_client uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1
        from public.client_adviser_assignments caa
        join public.advisers a on a.id = caa.adviser_id
        where caa.client_id = target_client
          and a.profile_id = auth.uid()
      );
$$;

-- Client themself, their assigned adviser, or an admin.
create or replace function public.can_access_client(target_client uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.clients c where c.id = target_client and c.profile_id = auth.uid())
      or public.is_staff_for_client(target_client);
$$;

create or replace function public.can_access_workflow(target_workflow uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.workflows w where w.id = target_workflow and public.can_access_client(w.client_id));
$$;

create or replace function public.can_access_household(target_household uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (select 1 from public.household_members hm where hm.household_id = target_household and public.can_access_client(hm.client_id));
$$;

-- Storage paths start with the client UUID: {client_id}/...
-- Returns null for anything that isn't a UUID, so casts never throw inside policies.
create or replace function public.client_id_from_path(object_name text)
returns uuid
language plpgsql immutable
as $$
declare
  folder text := split_part(object_name, '/', 1);
begin
  if folder ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return folder::uuid;
  end if;
  return null;
end;
$$;

create or replace function public.can_access_client_path(object_name text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.can_access_client(public.client_id_from_path(object_name)), false);
$$;

-- Only admins may change a profile's role (SQL editor / service role bypass: auth.uid() is null).
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change a user role';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------
-- 6. Row Level Security
--
-- Summary
--   Clients  → only rows for their own client record.
--   Advisers → only rows for clients assigned to them (client_adviser_assignments).
--   Admins   → everything.
--   providers is readable by any signed-in user; only admins write reference data.
--   activity_events is append-only for non-admins.
--
-- Starter note: clients may update their own workflows/steps so the prototype's
-- "I've done this" button works. For production, move step transitions into a
-- Postgres function or Edge Function that validates the transition.
-- ---------------------------------------------------------------------
alter table public.profiles                   enable row level security;
alter table public.advisers                   enable row level security;
alter table public.clients                    enable row level security;
alter table public.client_adviser_assignments enable row level security;
alter table public.households                 enable row level security;
alter table public.household_members          enable row level security;
alter table public.providers                  enable row level security;
alter table public.client_products            enable row level security;
alter table public.goals                      enable row level security;
alter table public.workflows                  enable row level security;
alter table public.workflow_steps             enable row level security;
alter table public.documents                  enable row level security;
alter table public.tasks                      enable row level security;
alter table public.reminders                  enable row level security;
alter table public.claims                     enable row level security;
alter table public.claim_evidence             enable row level security;
alter table public.service_requests           enable row level security;
alter table public.activity_events            enable row level security;
alter table public.chat_conversations         enable row level security;
alter table public.chat_messages              enable row level security;

-- profiles
create policy "profiles: read own, assigned adviser, admin" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.clients c where c.profile_id = profiles.id and public.is_staff_for_client(c.id))
  );
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- advisers: yourself, advisers assigned to you (as a client), admins
create policy "advisers: read" on public.advisers
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.client_adviser_assignments caa
      where caa.adviser_id = advisers.id and caa.client_id = public.current_client_id()
    )
  );
create policy "advisers: admin write" on public.advisers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- clients
create policy "clients: read" on public.clients
  for select to authenticated using (public.can_access_client(id));
create policy "clients: update" on public.clients
  for update to authenticated using (public.can_access_client(id)) with check (public.can_access_client(id));
create policy "clients: admin insert" on public.clients
  for insert to authenticated with check (public.is_admin());
create policy "clients: admin delete" on public.clients
  for delete to authenticated using (public.is_admin());

-- client_adviser_assignments
create policy "assignments: read" on public.client_adviser_assignments
  for select to authenticated using (public.can_access_client(client_id));
create policy "assignments: admin write" on public.client_adviser_assignments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- households & members
create policy "households: read" on public.households
  for select to authenticated using (public.can_access_household(id));
create policy "households: admin write" on public.households
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "household_members: read" on public.household_members
  for select to authenticated using (public.can_access_household(household_id));
create policy "household_members: admin write" on public.household_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- providers (reference data)
create policy "providers: read" on public.providers
  for select to authenticated using (true);
create policy "providers: admin write" on public.providers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- client_products: clients read; advisers/admin manage
create policy "client_products: read" on public.client_products
  for select to authenticated using (public.can_access_client(client_id));
create policy "client_products: staff write" on public.client_products
  for all to authenticated using (public.is_staff_for_client(client_id)) with check (public.is_staff_for_client(client_id));

-- goals (client-owned or household-owned)
create policy "goals: read" on public.goals
  for select to authenticated
  using ((client_id is not null and public.can_access_client(client_id)) or (household_id is not null and public.can_access_household(household_id)));
create policy "goals: write" on public.goals
  for all to authenticated
  using ((client_id is not null and public.can_access_client(client_id)) or (household_id is not null and public.can_access_household(household_id)))
  with check ((client_id is not null and public.can_access_client(client_id)) or (household_id is not null and public.can_access_household(household_id)));

-- Client-scoped tables: same shape of policy for each.
do $$
declare
  t text;
begin
  foreach t in array array['workflows', 'documents', 'tasks', 'reminders', 'claims', 'service_requests']
  loop
    execute format('create policy "%1$s: read" on public.%1$I for select to authenticated using (public.can_access_client(client_id))', t);
    execute format('create policy "%1$s: insert" on public.%1$I for insert to authenticated with check (public.can_access_client(client_id))', t);
    execute format('create policy "%1$s: update" on public.%1$I for update to authenticated using (public.can_access_client(client_id)) with check (public.can_access_client(client_id))', t);
    execute format('create policy "%1$s: staff delete" on public.%1$I for delete to authenticated using (public.is_staff_for_client(client_id))', t);
  end loop;
end;
$$;

-- workflow_steps via parent workflow
create policy "workflow_steps: read" on public.workflow_steps
  for select to authenticated using (public.can_access_workflow(workflow_id));
create policy "workflow_steps: insert" on public.workflow_steps
  for insert to authenticated with check (public.can_access_workflow(workflow_id));
create policy "workflow_steps: update" on public.workflow_steps
  for update to authenticated using (public.can_access_workflow(workflow_id)) with check (public.can_access_workflow(workflow_id));

-- claim_evidence via parent claim
create policy "claim_evidence: read" on public.claim_evidence
  for select to authenticated
  using (exists (select 1 from public.claims c where c.id = claim_id and public.can_access_client(c.client_id)));
create policy "claim_evidence: insert" on public.claim_evidence
  for insert to authenticated
  with check (exists (select 1 from public.claims c where c.id = claim_id and public.can_access_client(c.client_id)));

-- activity_events: append-only (no update/delete policies except admin)
create policy "activity_events: read" on public.activity_events
  for select to authenticated using (public.can_access_client(client_id));
create policy "activity_events: insert" on public.activity_events
  for insert to authenticated with check (public.can_access_client(client_id));
create policy "activity_events: admin manage" on public.activity_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- chat: your own conversations; advisers can read their clients' conversations
create policy "chat_conversations: read" on public.chat_conversations
  for select to authenticated
  using (profile_id = auth.uid() or (client_id is not null and public.is_staff_for_client(client_id)));
create policy "chat_conversations: insert own" on public.chat_conversations
  for insert to authenticated
  with check (profile_id = auth.uid() and (client_id is null or public.can_access_client(client_id)));
create policy "chat_conversations: update own" on public.chat_conversations
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "chat_messages: read" on public.chat_messages
  for select to authenticated
  using (exists (
    select 1 from public.chat_conversations cc
    where cc.id = conversation_id
      and (cc.profile_id = auth.uid() or (cc.client_id is not null and public.is_staff_for_client(cc.client_id)))
  ));
create policy "chat_messages: insert own" on public.chat_messages
  for insert to authenticated
  with check (exists (select 1 from public.chat_conversations cc where cc.id = conversation_id and cc.profile_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 7. Storage
-- Paths:
--   client-documents/{client_id}/licences|policies|identity|address|general/{file}
--   claim-evidence/{client_id}/{claim_id}/{file}
-- The first folder is always the client UUID, which is what the policies check.
-- Both buckets are private: read files with signed URLs.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false),
       ('claim-evidence', 'claim-evidence', false)
on conflict (id) do nothing;

create policy "rsf storage: read own client files" on storage.objects
  for select to authenticated
  using (bucket_id in ('client-documents', 'claim-evidence') and public.can_access_client_path(name));

create policy "rsf storage: upload own client files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('client-documents', 'claim-evidence') and public.can_access_client_path(name));

create policy "rsf storage: update own client files" on storage.objects
  for update to authenticated
  using (bucket_id in ('client-documents', 'claim-evidence') and public.can_access_client_path(name))
  with check (bucket_id in ('client-documents', 'claim-evidence') and public.can_access_client_path(name));

create policy "rsf storage: staff delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('client-documents', 'claim-evidence')
    and coalesce(public.is_staff_for_client(public.client_id_from_path(name)), false)
  );
