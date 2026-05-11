-- À exécuter dans Supabase : SQL Editor → New query → Run
-- Table séparée des réservations (booking_submissions).

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  message text not null
);

comment on table public.contact_submissions is
  'Messages envoyés depuis le formulaire de la page Contact uniquement.';

alter table public.contact_submissions enable row level security;

-- Insert depuis le site (clé anon) — même usage que booking_submissions
create policy "contact_submissions_insert_anon"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- Empêche la lecture publique des messages (dashboard / service role OK)
create policy "contact_submissions_select_anon_deny"
  on public.contact_submissions
  for select
  to anon
  using (false);
