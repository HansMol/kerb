-- Fuzzy/relevance search for /search — interim fix ahead of full Typesense build
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Decided with Hans 13 Jul 2026: defer Typesense until listing volume actually
-- strains plain ilike search (see Kanban trigger). This gets typo-tolerance and
-- relevance ranking on the existing Postgres data with no new service to run.

create extension if not exists pg_trgm;

-- GIN trigram indexes let ilike '%term%' (used across the site) and the
-- similarity operators below both hit an index instead of a full table scan
create index if not exists listings_make_trgm_idx on listings using gin (make gin_trgm_ops);
create index if not exists listings_model_trgm_idx on listings using gin (model gin_trgm_ops);
create index if not exists listings_description_trgm_idx on listings using gin (description gin_trgm_ops);

-- Ranked free-text search backing the `q` param on /search.
-- make/model use similarity() (short fields, whole-string comparison suits them).
-- description uses word_similarity()/`<%` instead — similarity() compares whole
-- strings, so a short query like "BMW" would score badly against a long
-- description even when "BMW" appears in it; word_similarity checks the query
-- against the best-matching substring, which is what free-text search needs.
create or replace function search_listings_relevance(search_term text)
returns table (id uuid, rank real)
language sql
stable
as $$
  select l.id,
         greatest(
           similarity(l.make, search_term),
           similarity(l.model, search_term),
           word_similarity(search_term, coalesce(l.description, ''))
         ) as rank
  from public_listings l
  where l.make % search_term
     or l.model % search_term
     or search_term <% coalesce(l.description, '')
  order by rank desc;
$$;

grant execute on function search_listings_relevance(text) to anon, authenticated, service_role;
