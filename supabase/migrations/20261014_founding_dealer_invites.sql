-- Founding dealer invites
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
--
-- Hans, 14 Oct 2026: dealers Kerb approaches join free, through a private
-- invite link that skips the plan and pricing step and is never set up in
-- Stripe. "Free" has no end date by default (free_until null); a date can be
-- set per invite if that ever changes. The monthly billing cron skips a
-- founding dealer while free_until is null or still in the future, so they
-- never reach awaiting_payment_method and their listings are never paused.

create table if not exists dealer_invites (
  code               text        primary key,
  label              text        not null,          -- who it is for, e.g. "Scott James Of Lytham"
  free_until         timestamptz,                   -- null = no end date
  created_at         timestamptz not null default now(),
  used_at            timestamptz,
  used_by_dealer_id  uuid        references dealers(id)
);

-- Service role only: no policies, so the anon key can neither list nor read codes.
alter table dealer_invites enable row level security;

alter table dealers
  add column if not exists founding_dealer boolean not null default false,
  add column if not exists free_until      timestamptz,
  add column if not exists invite_code     text;
