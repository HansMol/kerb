import Link from 'next/link'
import { Gauge, Fuel, Settings } from 'lucide-react'
import type { ListingRow } from '@/lib/supabase/types'
import { ListingPhotos } from './listing-photos'

interface Props {
  listing: ListingRow
  fromQuery?: string
}

export function ListingCard({ listing, fromQuery }: Props) {
  const title = `${listing.year} ${listing.make} ${listing.model}`
  const href = fromQuery
    ? `/cars/${listing.id}?from=${encodeURIComponent(fromQuery)}`
    : `/cars/${listing.id}`

  return (
    <article className="group relative bg-white border border-[#E5E5E7] rounded-md overflow-hidden hover:border-[#C4C6CC] hover:shadow-sm transition-all duration-200">
      {/* Photo carousel — z-[2] so arrow buttons sit above the stretched link overlay */}
      <div className="relative z-[2]">
        <ListingPhotos photos={listing.photos ?? []} title={title} />
      </div>

      <div className="p-4">
        {/* Stretched link: ::after covers the entire article at z-[1] */}
        <Link
          href={href}
          className="after:absolute after:inset-0 after:z-[1] after:content-['']"
        >
          <h3 className="font-semibold text-[#0A0A0F] text-base leading-snug mb-1 group-hover:text-[#1C1C1E]">
            {title}
          </h3>
        </Link>

        <p className="text-2xl font-semibold text-[#0A0A0F] mb-3">
          £{listing.price.toLocaleString('en-GB')}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6E6E73]">
          <span className="flex items-center gap-1">
            <Gauge size={13} className="text-[#A8AAB0]" />
            {listing.mileage.toLocaleString('en-GB')} miles
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={13} className="text-[#A8AAB0]" />
            {listing.fuel_type}
          </span>
          <span className="flex items-center gap-1">
            <Settings size={13} className="text-[#A8AAB0]" />
            {listing.transmission}
          </span>
        </div>
      </div>
    </article>
  )
}
