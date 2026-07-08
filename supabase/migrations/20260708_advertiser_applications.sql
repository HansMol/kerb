create table advertiser_applications (
  id              uuid        default gen_random_uuid() primary key,
  business_name   text        not null,
  website         text        not null,
  contact_name    text        not null,
  email           text        not null,
  phone           text,
  what_they_offer text        not null,
  why_relevant    text,
  status          text        not null default 'pending',
  created_at      timestamptz default now() not null
);
