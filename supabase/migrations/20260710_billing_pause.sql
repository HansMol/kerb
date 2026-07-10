-- "No leads, no pay" — pause mechanism
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Confirmed by Hans 10 Jul 2026: 14-day grace period after a dealer crosses
-- the 3-lead activation threshold, then listings pause from public search
-- until a payment method is added. Reactivation is instant (this view
-- recomputes live — no unpause step needed once subscription_status flips
-- to 'active'). 90-day mark separately flags the dealer for Hans to review
-- manually, handled in application code (/api/cron/billing), not here.

create or replace view public_listings as
select l.*
from listings l
join dealers d on d.id = l.dealer_id
where l.status = 'live'
  and l.photos <> '{}'
  and not (
    d.subscription_status = 'awaiting_payment_method'
    and d.billing_activated_at is not null
    and d.billing_activated_at < now() - interval '14 days'
  );
