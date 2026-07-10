-- Pre-launch buyer waitlist by make / model / area
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Extends the existing /notify email capture into structured demand data —
-- lets Hans show a dealer "N buyers already waiting for stock like yours"
-- before there's any real inventory, and doubles as saved-search seed data
-- once alerts are built.
create table waitlist_entries (
  id          uuid        default gen_random_uuid() primary key,
  email       text        not null,
  make        text,
  model       text,
  max_price   integer,
  area        text,
  created_at  timestamptz default now() not null
);

create index waitlist_entries_make_model_idx on waitlist_entries(make, model);
