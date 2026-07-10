-- "No leads, no pay" billing engine
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enquiries were previously emailed only, never stored. The monthly billing
-- job needs a persisted record per dealer per month to count against.
create table enquiries (
  id          uuid        default gen_random_uuid() primary key,
  dealer_id   uuid        not null references dealers(id) on delete cascade,
  listing_id  uuid        references listings(id) on delete set null,
  name        text        not null,
  email       text        not null,
  phone       text,
  message     text        not null,
  created_at  timestamptz default now() not null
);

create index enquiries_dealer_id_created_at_idx on enquiries(dealer_id, created_at);

-- Replaces the single permanent "first_lead_received_at" trigger with a
-- monthly-gated model. billing_activated_at marks the moment a dealer first
-- crossed the 3-lead threshold — separate from whether a card is on file yet.
-- leads_invoiced_through is the cursor the billing cron uses: every invoice
-- only counts enquiries after this timestamp, so leads already billed once
-- (e.g. covered by the first invoice at activation) are never counted again
-- in a later month's run.
alter table dealers
  add column if not exists billing_activated_at timestamptz,
  add column if not exists leads_invoiced_through timestamptz;

alter table dealers
  drop column if exists stripe_subscription_id,
  drop column if exists billing_starts_at,
  drop column if exists first_lead_received_at;

alter table dealers
  drop constraint if exists dealers_subscription_status_check;

alter table dealers
  alter column subscription_status set default 'not_activated';

update dealers set subscription_status = 'not_activated' where subscription_status in ('free', 'cancelled');

alter table dealers
  add constraint dealers_subscription_status_check
  check (subscription_status in ('not_activated', 'awaiting_payment_method', 'active', 'past_due'));
