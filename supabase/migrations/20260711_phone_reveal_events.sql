-- Tracked phone reveal events (closes the phone-call billing leak)
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Dealer phone numbers were rendered as plain tel: links in page HTML —
-- a buyer could call a dealer directly with zero record of it, bypassing
-- the enquiries table entirely and the "no leads, no pay" billing engine
-- that counts against it (see 20260710_billing_engine.sql). This table
-- logs every reveal so the number is only ever handed out via a tracked
-- API call, never present in the server-rendered page.
create table phone_reveal_events (
  id          uuid        default gen_random_uuid() primary key,
  dealer_id   uuid        not null references dealers(id),
  listing_id  uuid        references listings(id),
  source_ip   text,
  created_at  timestamptz default now() not null
);

create index phone_reveal_events_dealer_id_created_at_idx
  on phone_reveal_events(dealer_id, created_at);

create index phone_reveal_events_source_ip_created_at_idx
  on phone_reveal_events(source_ip, created_at);
