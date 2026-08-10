import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ListingCard } from '@/components/listings/listing-card'
import { SearchFilters } from '@/components/search/search-filters'
import { MobileFilterDrawer } from '@/components/search/mobile-filter-drawer'
import { createServerClient } from '@/lib/supabase/server'

// Canonical always points at the bare /search URL regardless of filter params —
// every make/price/mileage/sort combination is the same underlying page from
// Google's perspective, not a separate indexable landing page. Fixes Search
// Console's "Duplicate without user-selected canonical" (found 10 Aug 2026,
// zero canonical tags existed anywhere on the site before this).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const params = await searchParams
  const supabase = createServerClient()

  // Lightweight existence check mirroring the main query's filters (see below) —
  // a zero-result filtered search returns 200 with a "No cars found" message,
  // which Google flags as a Soft 404. noindex tells it this specific
  // combination has no unique content, without faking a real 404 on a page
  // that's still a working search UI.
  let countQuery = supabase.from('public_listings').select('id', { count: 'exact', head: true })
  if (params.q) {
    const { data: ranked } = await supabase.rpc('search_listings_relevance', { search_term: params.q })
    const ids = (ranked ?? []).map(r => r.id)
    countQuery = countQuery.in('id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
  }
  if (params.make)         countQuery = countQuery.ilike('make', params.make)
  if (params.bodyType)     countQuery = countQuery.ilike('body_type', params.bodyType)
  if (params.fuelType)     countQuery = countQuery.ilike('fuel_type', params.fuelType)
  if (params.transmission) countQuery = countQuery.ilike('transmission', params.transmission)
  if (params.minPrice)     countQuery = countQuery.gte('price', parseInt(params.minPrice))
  if (params.maxPrice)     countQuery = countQuery.lte('price', parseInt(params.maxPrice))
  if (params.yearMin)      countQuery = countQuery.gte('year', parseInt(params.yearMin))
  if (params.yearMax)      countQuery = countQuery.lte('year', parseInt(params.yearMax))
  if (params.minMileage)   countQuery = countQuery.gte('mileage', parseInt(params.minMileage))
  if (params.maxMileage)   countQuery = countQuery.lte('mileage', parseInt(params.maxMileage))
  if (params.sellerType === 'dealer')  countQuery = countQuery.not('dealer_id', 'is', null)
  if (params.sellerType === 'private') countQuery = countQuery.is('dealer_id', null)

  const { count } = await countQuery
  const hasResults = (count ?? 0) > 0

  return {
    title: 'Search Cars',
    description: 'Search used cars across the UK. Filter by make, model, price, mileage, and more.',
    alternates: {
      canonical: '/search',
    },
    ...(hasResults ? {} : { robots: { index: false, follow: true } }),
  }
}

type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc' | 'year_asc'

const sortConfig: Record<SortKey, { col: string; asc: boolean }> = {
  newest:      { col: 'created_at', asc: false },
  oldest:      { col: 'created_at', asc: true },
  price_asc:   { col: 'price',      asc: true },
  price_desc:  { col: 'price',      asc: false },
  mileage_asc: { col: 'mileage',    asc: true },
  year_desc:   { col: 'year',       asc: false },
  year_asc:    { col: 'year',       asc: true },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const {
    q, make, bodyType, fuelType, transmission, sellerType, sort,
    minPrice, maxPrice, yearMin, yearMax, minMileage, maxMileage,
  } = params

  const supabase = createServerClient()

  const { data: makesData } = await supabase
    .from('public_listings')
    .select('make')
    .not('make', 'is', null)

  const availableMakes = [...new Set((makesData ?? []).map(l => l.make as string))].sort()

  let query = supabase
    .from('public_listings')
    .select('*')

  // Ranked by trigram similarity (see supabase/migrations/20260713_search_trigram.sql)
  // instead of a plain ilike substring match — gives typo-tolerance and lets a
  // short query like "BMW" score correctly against a long description field.
  let relevanceIds: string[] | null = null
  if (q) {
    const { data: ranked } = await supabase.rpc('search_listings_relevance', { search_term: q })
    relevanceIds = (ranked ?? []).map(r => r.id)
    query = query.in('id', relevanceIds.length > 0 ? relevanceIds : ['00000000-0000-0000-0000-000000000000'])
  }
  if (make)         query = query.ilike('make', make)
  if (bodyType)     query = query.ilike('body_type', bodyType)
  if (fuelType)     query = query.ilike('fuel_type', fuelType)
  if (transmission) query = query.ilike('transmission', transmission)
  if (minPrice)     query = query.gte('price', parseInt(minPrice))
  if (maxPrice)     query = query.lte('price', parseInt(maxPrice))
  if (yearMin)       query = query.gte('year', parseInt(yearMin))
  if (yearMax)       query = query.lte('year', parseInt(yearMax))
  if (minMileage)    query = query.gte('mileage', parseInt(minMileage))
  if (maxMileage)    query = query.lte('mileage', parseInt(maxMileage))
  if (sellerType === 'dealer')  query = query.not('dealer_id', 'is', null)
  if (sellerType === 'private') query = query.is('dealer_id', null)

  // Default view for a search term is relevance order (from the RPC above);
  // an explicit sort choice from the dropdown always overrides it.
  const useRelevanceOrder = Boolean(q) && !sort
  if (!useRelevanceOrder) {
    const { col, asc } = sortConfig[sort as SortKey] ?? sortConfig.newest
    query = query.order(col, { ascending: asc })
  }

  const { data } = await query
  let listings = data ?? []
  if (useRelevanceOrder && relevanceIds) {
    const rankIndex = new Map(relevanceIds.map((id, i) => [id, i]))
    listings = [...listings].sort((a, b) => (rankIndex.get(a.id) ?? 0) - (rankIndex.get(b.id) ?? 0))
  }

  // Encode current filters for breadcrumb back-link on car detail pages
  const fromQuery = Object.keys(params).length > 0
    ? `/search?${new URLSearchParams(params).toString()}`
    : '/search'

  const sortLabel = useRelevanceOrder
    ? 'Best match'
    : sortConfig[sort as SortKey]
      ? sortOptions.find(o => o.value === sort)?.label ?? 'Most recent'
      : 'Most recent'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#0A0A0F] tracking-tight">
            {q ? `Results for "${q}"` : 'Search Results'}
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1">
            {listings.length} {listings.length === 1 ? 'car' : 'cars'} found · {sortLabel}
          </p>
        </div>

        {/* Mobile filter button — desktop filters are in the sidebar */}
        <Suspense>
          <MobileFilterDrawer makes={availableMakes} />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <Suspense fallback={<div className="h-96 bg-white rounded-xl border border-[#E5E5E7] animate-pulse" />}>
              <SearchFilters makes={availableMakes} />
            </Suspense>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-[#E5E5E7]">
              <p className="text-[#6E6E73] text-lg font-light">No cars found</p>
              <p className="text-[#A8AAB0] text-sm mt-1">Try adjusting your filters or clearing some options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} fromQuery={fromQuery} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const sortOptions = [
  { value: 'newest',      label: 'Most recent' },
  { value: 'price_asc',   label: 'Price: low to high' },
  { value: 'price_desc',  label: 'Price: high to low' },
  { value: 'mileage_asc', label: 'Lowest mileage' },
  { value: 'year_desc',   label: 'Age: newest first' },
  { value: 'year_asc',    label: 'Age: oldest first' },
]
