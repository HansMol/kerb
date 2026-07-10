-- Rate limiting for the public enquiry route
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enquiries now trigger the "no leads, no pay" billing engine (see
-- 20260710_billing_engine.sql), so an unthrottled bot on this route can
-- falsely activate a dealer's billing. source_ip lets the route reject
-- bursts from the same source before they're persisted or emailed.
alter table enquiries
  add column if not exists source_ip text;

create index if not exists enquiries_source_ip_created_at_idx
  on enquiries(source_ip, created_at);
