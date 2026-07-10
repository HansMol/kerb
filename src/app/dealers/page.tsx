import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { DealerDirectory } from './DealerDirectory'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Find a Dealer — Kerb',
  description: 'Browse verified car dealers on Kerb. Direct contact, no intermediation, no platform inbox.',
}

export default async function DealersPage() {
  const supabase = createServerClient()

  const [{ data: dealers }, { data: listingData }] = await Promise.all([
    supabase
      .from('dealers')
      .select('id, business_name, city, postcode, makes, slug')
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
    supabase
      .from('public_listings')
      .select('dealer_id'),
  ])

  const countsByDealer = (listingData ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.dealer_id] = (acc[l.dealer_id] ?? 0) + 1
    return acc
  }, {})

  const dealersWithCounts = (dealers ?? []).map(d => ({
    ...d,
    listingCount: countsByDealer[d.id] ?? 0,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#A0714A] mb-3">
          Verified dealers
        </p>
        <h1 className="text-[clamp(28px,3vw,40px)] font-light text-[#0A0A0F] leading-[1.15] tracking-tight mb-2">
          Find a Dealer
        </h1>
        <p className="text-[16px] text-[#6E6E73]">
          {dealersWithCounts.length === 0
            ? 'Dealers joining shortly — check back soon.'
            : `${dealersWithCounts.length} verified ${dealersWithCounts.length === 1 ? 'dealer' : 'dealers'} on Kerb`}
        </p>
      </div>

      <DealerDirectory dealers={dealersWithCounts} />

      <div className="mt-16 pt-10 border-t border-[#E5E5E7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[#0A0A0F] text-[15px]">Are you a dealer?</p>
          <p className="text-[14px] text-[#6E6E73]">
            List your inventory free. No payment required to start.
          </p>
        </div>
        <a
          href="/dealers/join"
          className="inline-block bg-[#A0714A] hover:bg-[#8A6040] text-white text-[14px] font-semibold px-6 py-3 rounded-md transition-colors whitespace-nowrap"
        >
          List your cars →
        </a>
      </div>
    </div>
  )
}
