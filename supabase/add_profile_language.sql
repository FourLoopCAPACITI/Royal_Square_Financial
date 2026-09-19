-- Run once in the Supabase SQL editor on an EXISTING project (new projects get this from schema.sql).
-- Stores each user's chosen language (clients and advisers share the profiles table).
-- The existing "profiles: update own" policy already lets a user change their own row.
alter table public.profiles
  add column if not exists language text not null default 'en'
  check (language in ('en', 'af', 'zu'));
