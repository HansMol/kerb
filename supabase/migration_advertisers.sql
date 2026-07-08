create table advertisers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  logo_url text,
  cta_text text not null default 'Find out more',
  cta_url text not null,
  show_on_homepage boolean not null default true,
  show_on_detail boolean not null default true,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into advertisers (name, tagline, logo_url, cta_text, cta_url, show_on_homepage, show_on_detail, active, display_order)
values
  (
    'Ice Clean Works',
    'Professional detailing & graphene protection.',
    null,
    'Book a detail',
    'https://ice-clean-works.com',
    true,
    true,
    true,
    1
  ),
  (
    'Universal Classic Cars',
    'Bristol''s home for prestige classic cars — storage, showroom & sales.',
    null,
    'Visit UCC',
    'https://universalclassiccarsstorage.com',
    true,
    true,
    true,
    2
  );
