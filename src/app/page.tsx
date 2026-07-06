import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

const popularMakes = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Toyota', 'Porsche', 'Land Rover']

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'live')
    .not('photos', 'eq', '{}')
    .order('created_at', { ascending: false })
    .limit(6)

  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live')
    .not('photos', 'eq', '{}')

  const totalListings = count ?? 0

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-[#0A0A0F] px-6 sm:px-10 lg:px-20 pt-20 pb-24">
        <div className="max-w-4xl">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[#A0714A] mb-4">
            Real Kerb Appeal.
          </p>
          <h1 className="text-[clamp(36px,5vw,64px)] font-light text-white leading-[1.05] tracking-[-0.03em] mb-6">
            Every car.<br />You choose.
          </h1>
          <p className="text-[16px] text-[#6E6E73] font-light leading-relaxed max-w-md mb-10">
            Clean listings, verified dealers, direct contact. No sponsored slots, no platform inbox.
          </p>

          {/* Search bar */}
          <form action="/search" method="GET" className="flex gap-0 max-w-xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3A3A3E]" />
              <input
                type="text"
                name="q"
                placeholder="Search by make, model, or keyword…"
                className="w-full pl-11 pr-4 py-4 bg-[#1C1C1E] border border-[#2A2A2E] border-r-0 text-white rounded-l-md text-[15px] placeholder:text-[#3A3A3E] focus:outline-none focus:border-[#A0714A] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#A0714A] hover:bg-[#8A6040] text-white font-semibold px-7 py-4 rounded-r-md transition-colors text-[15px] shrink-0"
            >
              Search
            </button>
          </form>

          {/* Popular makes */}
          <div className="flex flex-wrap gap-2 mt-6">
            {popularMakes.map(make => (
              <Link
                key={make}
                href={`/search?make=${make.toLowerCase()}`}
                className="text-[12px] font-medium text-[#6E6E73] hover:text-white bg-[#1C1C1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] px-3 py-1.5 rounded-full transition-colors"
              >
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest listings ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[22px] font-light text-[#0A0A0F] tracking-tight">Latest cars</h2>
            {totalListings > 0 && (
              <p className="text-sm text-[#6E6E73] mt-0.5">{totalListings} cars available</p>
            )}
          </div>
          <Link
            href="/search"
            className="text-sm font-medium text-[#A0714A] hover:text-[#8A6040] transition-colors"
          >
            Browse all →
          </Link>
        </div>

        {(listings ?? []).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E5E5E7]">
            <p className="text-[#6E6E73] font-light text-lg">Cars joining soon</p>
            <p className="text-[#A8AAB0] text-sm mt-1">We&apos;re onboarding our first dealers. Check back shortly.</p>
            <Link
              href="/dealers/register"
              className="inline-block mt-6 text-[14px] font-semibold text-[#A0714A] hover:text-[#8A6040] transition-colors"
            >
              Are you a dealer? List your cars →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {(listings ?? []).map(listing => (
              <ListingCard key={listing.id} listing={listing} fromQuery="/" />
            ))}
          </div>
        )}
      </section>

      {/* ── Why Kerb ── */}
      <section className="bg-[#0A0A0F] px-6 sm:px-10 lg:px-20 py-16">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#2A2A2E] mb-10">
          What&apos;s different
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl">
          {[
            { stat: '£0',     label: 'To enquire',       sub: 'No reservation fees. No lead charges. Ever.' },
            { stat: '100%',   label: 'Verified dealers', sub: 'Every dealer checked through Companies House before listing.' },
            { stat: 'Direct', label: 'Contact always',   sub: 'You call the dealer. No platform inbox, no middleman.' },
          ].map(({ stat, label, sub }) => (
            <div key={label}>
              <p className="text-[clamp(32px,4vw,48px)] font-light text-white leading-none tracking-[-0.03em] mb-2">{stat}</p>
              <p className="text-[#C4C6CC] text-[13px] font-medium mb-1">{label}</p>
              <p className="text-[#6E6E73] text-[12px] leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dealer CTA ── */}
      <section className="px-6 sm:px-10 lg:px-20 py-16 bg-white border-t border-[#E5E5E7]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 max-w-4xl">
          <div>
            <p className="text-[#0A0A0F] text-[16px] font-medium mb-1">Are you a dealer?</p>
            <p className="text-[#6E6E73] text-[14px] font-light">
              You don&apos;t pay a penny until we send you a buyer. Then £55/month.
            </p>
          </div>
          <Link
            href="/dealers/register"
            className="shrink-0 text-[14px] font-semibold bg-[#A0714A] hover:bg-[#8A6040] text-white px-7 py-3.5 rounded-md transition-colors whitespace-nowrap"
          >
            Apply for early access →
          </Link>
        </div>
      </section>

    </div>
  )
}
