-- Add slug column for public dealer profile URLs
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Backfill slugs for any existing dealers
UPDATE dealers
SET slug = lower(
  regexp_replace(
    regexp_replace(trim(business_name), '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
