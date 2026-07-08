# Kerb — Functional Specification

*Last updated: 2026-07-08 (rev 6 — advertiser marketplace + services directory)*

---

## Overview

Kerb is a UK car marketplace. Verified dealers list their vehicles. Buyers search, find, and contact dealers directly. The platform never intermediates between buyer and dealer.

---

## User types

| User | Description |
|---|---|
| **Buyer** | Anonymous visitor. Searches listings, views detail pages, sends enquiry directly to dealer. No account required. |
| **Dealer** | Registered business. Managed via Clerk auth. Lists and manages vehicles. Receives buyer enquiries directly via phone/email. |
| **Admin** | Hans. No admin panel yet — managed via Supabase dashboard. |

---

## Buyer flows

### Search and browse
1. Land on homepage — sees latest live listings, make shortcuts, body type filter
2. Search by keyword (make/model) via hero search bar or `/search`
3. Filter by make, body type (search page)
4. Click listing card → listing detail page
5. Fill in enquiry form → submits to `/api/enquiries` → Resend email to dealer ✅
6. Sees dealer phone + email on detail page — can contact directly

### Listing detail page
- Shows: photos (if uploaded), year/make/model, price, key specs grid, description, dealer card with phone + email
- Enquiry form: name, email, phone (optional), message
- URL structure: `/cars/[id]` (listing UUID)

---

## Dealer flows

### Registration
1. Sign up via Clerk (`/sign-up`)
2. Redirected to `/dealers/register` — 3-step wizard:
   - Step 1: Personal details (name, email, phone)
   - Step 2: Business details — Companies House lookup auto-verifies registered UK companies. Manual entry also allowed.
   - Step 3: Specialisms (makes, inventory size, price range)
3. On submit: server re-verifies company status via Companies House API — never trusts client. `status: approved` only if Companies House confirms `active`. Otherwise `status: pending`.
4. Redirected to `/dashboard`

### Dashboard
- Stats: total listings, live count, average price, top listing
- Listings table: vehicle, price, mileage, status, date, edit link
- Verification badge: Companies House verified status
- Add listing button

### Add listing (`/dashboard/listings/new`)
Multi-step wizard:
- Step 1: Vehicle details (make, model, year, colour, body type, doors, fuel, transmission, engine size)
- Step 2: Description builder (condition, service history, features, MOT, recent work, issues)
- Step 3: Pricing, mileage, status (draft/live)
- Photos: cover slot + 5-column grid, drag-and-drop, bulk select, up to 20 ✅
- On submit: POST `/api/listings` → saved to Supabase

### Edit listing (`/dashboard/listings/[id]/edit`)
- Single-page form: all vehicle fields, pricing, mileage, description, status
- Photos: pre-loaded from database, same cover + grid UI, add more or remove ✅
- Save → PATCH `/api/listings/[id]` (includes updated photo array)
- Delete (with confirm) → DELETE `/api/listings/[id]`
- Both operations enforce dealer ownership — a dealer can only edit/delete their own listings

### Listing statuses
| Status | Visible to buyers? |
|---|---|
| `draft` | No |
| `live` | Yes |
| `sold` | No |
| `archived` | No |

---

## Billing model

- Free until first buyer enquiry
- First enquiry triggers: Stripe checkout session → billing link emailed to dealer
- Trial: free until 1st of following calendar month
- Plans: Solo £55/month · Pro £132/month
- Annual: 10 months paid, 12 listed. Switch to monthly before renewal — no forced rollover.

---

## Advertiser marketplace & services

Two distinct systems, deliberately kept apart:

### 1. Curated functional services (car detail page)
`ServicesCard` on every car detail page — three fixed rows, each a single Kerb-chosen partner, monetised by affiliate/referral commission:
- **Vehicle history check** → CarVertical (pending affiliate signup; placeholder link live)
- **Finance this car** → prequalifying partner link
- **Insure this car** → prequalifying partner link

These are not open advertiser slots and are not solicited via `/advertise` — Hans sets up each partnership directly. Reason: this is the placement earmarked for a future auction/bid facility (Carwow-style, multiple finance/insurance providers competing for the lead). Advertising it as a self-serve category now would create expectations for a program that's intentionally temporary.

A fourth row, **"More services for this car,"** links to `/services`.

### 2. Open advertiser marketplace (homepage + `/services`)
Businesses apply via `/advertise/apply`, reviewed manually, stored in Supabase `advertisers` table. Categories (`AdvertiserCategory`): `detailing_protection`, `storage`, `mechanic_mot`, `transport`, `photography_valuation`. Insurance, finance, and history checks are excluded from this taxonomy — they belong to the curated system above.

Placement:
- **Homepage** — `AdvertiserStrip` component, `show_on_homepage = true`
- **`/services`** — buyer-facing directory, grouped by category, all active advertisers regardless of homepage flag, plus the static pre-purchase inspection entry

Not shown on the car detail page directly — that placement doesn't scale past a couple of advertisers and was replaced by the `/services` link.

### Pricing — founding advertiser rate
- **Now:** free placement, no cost, no card
- **At threshold:** £29/month flat fee begins the moment either happens first — Kerb reaches 5,000 monthly visitors, or a single advertiser's placement generates 50 referral clicks in a month (thresholds are placeholders pending real traffic data; not yet enforced in code — no site-wide analytics table exists)
- Applies to all advertisers at once when it triggers — no permanent founding-rate lock-in
- Click-through tracking (`advertiser_clicks` table) already live; visitor-count tracking does not exist yet; billing itself (Stripe charge for advertisers) is not yet built — threshold trigger is currently a manual/policy commitment, not automated

---

## Business rules

- Dealers must be Companies House verified (or manually approved) before listings go live
- A listing only appears on homepage/search if `status = 'live'` **and** has at least one photo — photo-less listings never surface in public search, regardless of dealer
- Edit and delete operations are scoped to the authenticated dealer's own listings
- All buyer enquiries route directly to the dealer's registered email — Kerb is never in the conversation

### Search integrity rule
Organic search results are ordered by relevance and recency only. No dealer can pay to rank above another. This is a founding charter commitment — never break this rule in code or product decisions.

---

## Security model

| Surface | Control |
|---|---|
| Dashboard + dealer routes | Clerk auth via middleware — hard redirect to `/sign-in` |
| `/api/listings`, `/api/dealers/register` | `auth()` check — 401 if no session |
| `/api/stripe/checkout` | `auth()` + dealer `clerk_user_id` match — prevents cross-account session creation |
| `/api/stripe/identity` | `auth()` — prevents unauthenticated identity session creation |
| `/api/companies-house` | `auth()` — prevents API key drain |
| `/api/listings/[id]` PATCH + DELETE | Ownership check — `dealer_id` must match the authenticated user's dealer |
| Company verification | Server-side Companies House call — client `companyStatus` is never trusted |
| Stripe webhook | Signature verified with `constructEvent` before processing |
| Identity webhook | Matches on `clerk_user_id` (not email) to prevent spoofing |
| Upload file types | Server allowlist: JPEG, PNG, WebP, HEIC only |
| Enquiry email HTML | All user-supplied strings HTML-escaped before insertion |
| Secrets | Service role key + all API keys server-only — never exposed to client |

---

## Background operations

### Companies House monthly monitor
- GitHub Actions cron: 1st of each month at 08:00 UTC
- Checks all approved dealers' company status against Companies House
- Updates `company_status` in Supabase if changed
- Sends alert email to `hans@kerb.autos` via Resend if any status changed
- Silence = all clear

---

## What's built ✅

- Dealer registration with Companies House auto-verify (server-side re-verification)
- Clerk authentication (sign in/up, protected routes, middleware)
- New listing wizard with photo upload (cover + grid, drag-and-drop, up to 20)
- Edit listing with photo management (add/remove, pre-loaded from database)
- Delete listing
- Homepage and search pulling real Supabase data
- Car detail page with dealer card and wired enquiry form
- Buyer enquiry → Resend email direct to dealer (HTML-escaped, UUID-validated)
- Billing trigger on first enquiry → Stripe checkout link emailed to dealer
- Dashboard with stats and listings table
- Analytics: Google Analytics 4, Clarity, Search Console
- Companies House monthly monitoring cron + Resend alert email
- Dealer acquisition landing page with screenshots
- Security hardening: auth on all API routes, HTML injection prevention, server-side verification, file type validation (30 Jun 2026)
- Advertiser marketplace: `/advertise` pitch page, `/advertise/apply` form (category select, Resend notification), homepage placement, click tracking
- Services directory: `/services` hub page grouped by category, curated 3-row `ServicesCard` on car detail pages (history check, finance, insurance)

---

## Not yet built — roadmap

| Feature | Priority | Notes |
|---|---|---|
| Stripe live mode | P0 | Switch secret key to live when first dealer onboards |
| Buyer-facing dealer directory / dealer profile page | P1 | `/dealers` currently shows acquisition page |
| Spotlight feature (dashboard + dealer profile + homepage) | P1 | Schema ready — `spotlighted` column exists |
| Admin panel | P2 | Currently managed via Supabase dashboard |
| CarVertical affiliate signup | P1 | `ServicesCard` history-check link is a placeholder until Hans signs up |
| Finance/insurance prequalifying partners | P1 | `ServicesCard` links are placeholders (Zuto, CompareTheMarket) pending real partner deals |
| Founding advertiser rate enforcement | P2 | £29/month rate + threshold (5,000 visitors / 50 clicks) is policy only — no site-wide analytics table, billing integration, or automated rate switch yet |
| Auction/bid facility for finance, insurance, history checks | P3 | Carwow-style — replaces the single curated partner per slot once volume justifies it |

---

## Analytics

| Tool | Status | ID |
|---|---|---|
| Google Analytics 4 | Live | G-MFCDLJ52QL |
| Microsoft Clarity | Live | x7v8fg28yj |
| Google Search Console | Verified | — |
