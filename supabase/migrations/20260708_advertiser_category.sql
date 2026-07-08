-- Open marketplace category taxonomy for the /advertise homepage-only advertiser system.
-- Insurance, finance, and vehicle history checks are deliberately excluded — those are
-- curated single-partner integrations on the car detail page (ServicesCard), not open
-- advertiser slots. Kept separate because that slot is earmarked for a future auction/bid
-- facility (Carwow-style), not a self-serve advertiser category.

alter table advertisers
  add column category text
  check (category in ('detailing_protection', 'storage', 'mechanic_mot', 'transport', 'photography_valuation'));

update advertisers set category = 'detailing_protection' where name = 'Ice Clean Works';
update advertisers set category = 'storage' where name = 'Universal Classic Cars';

alter table advertisers
  alter column category set not null;

alter table advertiser_applications
  add column category text
  check (category in ('detailing_protection', 'storage', 'mechanic_mot', 'transport', 'photography_valuation'));

-- show_on_detail is dead: the car detail page no longer renders the open advertiser
-- marketplace (moved to a dedicated /services hub page instead).
alter table advertisers drop column show_on_detail;

