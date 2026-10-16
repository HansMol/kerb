-- Letters to dealers with no website, and the background check (16 Oct 2026)
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query), once.
--
-- Each letter carries its own founding invite code. The invite now records
-- which Companies House company it was made for, so a daily check can
-- compare what the dealer entered at sign-up without asking them anything.

alter table dealer_invites
  add column if not exists company_number text,
  add column if not exists company_name   text,
  add column if not exists postcode       text,
  add column if not exists source         text;   -- e.g. 'letter NW 1'

alter table dealers
  add column if not exists founding_check_at timestamptz,   -- when the background check ran
  add column if not exists founding_check    text;          -- 'ok' or what needs a look

-- The 3 dealers who already joined by invite before this check existed are
-- marked as checked, so the first run looks only at new sign-ups.
update dealers set founding_check_at = now(), founding_check = 'joined before the check existed'
  where founding_dealer = true and founding_check_at is null;
