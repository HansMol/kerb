create table advertiser_clicks (
  id          uuid        default gen_random_uuid() primary key,
  advertiser_id uuid      not null references advertisers(id) on delete cascade,
  clicked_at  timestamptz default now() not null
);

create index on advertiser_clicks (advertiser_id, clicked_at);
