-- Auditable log of dealer Yes/No responses to the content-feature outreach
-- (the "1Stop Car Sales x Kerb"-style preview pages sent to independent
-- dealers, /preview/<slug>). These dealers are cold outreach, not existing
-- Kerb marketplace accounts — no dealers(id) row exists for most of them —
-- so identity here is the preview slug + name captured at response time,
-- not a foreign key. Insert-only, like phone_reveal_events: never update a
-- row, a changed mind is a new row: the audit trail is the full history,
-- "current status" is just the most recent row per dealer_slug.
-- Run in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
create table dealer_content_permissions (
  id            uuid        default gen_random_uuid() primary key,
  dealer_slug   text        not null,
  dealer_name   text        not null,
  car_summary   text        not null,   -- snapshot of what was shown when they responded, e.g. "2019 Audi S7"
  decision      text        not null check (decision in ('yes', 'no')),
  source_ip     text,
  user_agent    text,
  created_at    timestamptz default now() not null
);

create index dealer_content_permissions_slug_created_at_idx
  on dealer_content_permissions(dealer_slug, created_at);

create index dealer_content_permissions_source_ip_created_at_idx
  on dealer_content_permissions(source_ip, created_at);
