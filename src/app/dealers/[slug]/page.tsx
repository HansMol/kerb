import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Globe, MapPin } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { PhoneReveal } from '@/components/phone-reveal'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('dealers')
    .select('business_name, city')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (!data) return { title: 'Dealer Not Found — Kerb' }

  return {
    title: `${data.business_name} — Kerb`,
    description: `Browse used cars from ${data.business_name} in ${data.city}. Verified dealer on Kerb. Direct contact, no intermediation.`,
  }
}

export default async function DealerProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const [{ data: dealer }, { data: listings }] = await Promise.all([
    supabase
      .from('dealers')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single(),
    supabase
      .from('public_listings')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (!dealer) notFound()

  // Filter listings to this dealer after fetch (avoids a second round-trip)
  const stock = (listings ?? []).filter(l => l.dealer_id === dealer.id)

  const initial = dealer.business_name[0].toUpperCase()

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white border-b border-[#E5E5E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#A0714A] flex-shrink-0 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-semibold text-white">{initial}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-[#0A0A0F]">{dealer.business_name}</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] uppercase text-[#A0714A] bg-[#A0714A]/10 px-2.5 py-1 rounded-full">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verified Dealer
                </span>
              </div>

              <p className="text-[#6E6E73] mb-4 flex items-center gap-1.5 text-[14px]">
                <MapPin size={13} className="text-[#A8AAB0]" />
                {dealer.city}, {dealer.postcode}
              </p>

              <div className="flex flex-wrap gap-5 text-[14px]">
                <PhoneReveal
                  dealer_id={dealer.id}
                  className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0A0A0F] transition-colors"
                  iconClassName="text-[#A8AAB0]"
                />
                {dealer.website && (
                  <a
                    href={dealer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0A0A0F] transition-colors"
                  >
                    <Globe size={14} className="text-[#A8AAB0]" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>

          {dealer.makes.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#A8AAB0] mr-1">
                Specialises in
              </p>
              {dealer.makes.map(make => (
                <span
                  key={make}
                  className="text-[13px] font-medium text-[#0A0A0F] bg-[#F8F8FA] border border-[#E5E5E7] px-3 py-1 rounded-full"
                >
                  {make}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-[18px] font-semibold text-[#0A0A0F] mb-6">
          {stock.length === 0
            ? 'No cars currently listed'
            : `${stock.length} ${stock.length === 1 ? 'car' : 'cars'} in stock`}
        </h2>

        {stock.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {stock.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E5E5E7]">
            <p className="text-[#6E6E73] font-light">This dealer has no cars listed right now.</p>
            <p className="text-[#A8AAB0] text-sm mt-1">Check back soon or browse other dealers.</p>
            <a
              href="/dealers"
              className="inline-block mt-6 text-[14px] font-medium text-[#A0714A] hover:text-[#8A6040] transition-colors"
            >
              Browse all dealers →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
