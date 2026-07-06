import { Suspense } from 'react'
import { ListingCard } from '@/components/listings/listing-card'
import { SearchFilters } from '@/components/search/search-filters'
import { MobileFilterDrawer } from '@/components/search/mobile-filter-drawer'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Search Cars',
  description: 'Search used cars across the UK. Filter by make, model, price, mileage, and more.',
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
    minPrice, maxPrice, yearMin, yearMax,
  } = params

  const supabase = createServerClient()

  const { data: makesData } = await supabase
    .from('listings')
    .select('make')
    .eq('status', 'live')
    .not('photos', 'eq', '{}')
    .not('make', 'is', null)

  const availableMakes = [...new Set((makesData ?? []).map(l => l.make as string))].sort()

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'live')
    .not('photos', 'eq', '{}')

  if (q)            query = query.or(`make.ilike.%${q}%,model.ilike.%${q}%,description.ilike.%${q}%`)
  if (make)         query = query.ilike('make', make)
  if (bodyType)     query = query.ilike('body_type', bodyType)
  if (fuelType)     query = query.ilike('fuel_type', fuelType)
  if (transmission) query = query.ilike('transmission', transmission)
  if (minPrice)     query = query.gte('price', parseInt(minPrice))
  if (maxPrice)     query = query.lte('price', parseInt(maxPrice))
  if (yearMin)      query = query.gte('year', parseInt(yearMin))
  if (yearMax)      query = query.lte('year', parseInt(yearMax))
  if (sellerType === 'dealer')  query = query.not('dealer_id', 'is', null)
  if (sellerType === 'private') query = query.is('dealer_id', null)

  const { col, asc } = sortConfig[sort as SortKey] ?? sortConfig.newest
  query = query.order(col, { ascending: asc })

  const { data } = await query
  const listings = data ?? []

  // Encode current filters for breadcrumb back-link on car detail pages
  const fromQuery = Object.keys(params).length > 0
    ? `/search?${new URLSearchParams(params).toString()}`
    : '/search'

  const sortLabel = sortConfig[sort as SortKey]
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
