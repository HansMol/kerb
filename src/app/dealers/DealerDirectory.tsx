'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin } from 'lucide-react'

export type DealerWithCount = {
  id: string
  business_name: string
  city: string
  postcode: string
  makes: string[]
  slug: string | null
  listingCount: number
}

export function DealerDirectory({ dealers }: { dealers: DealerWithCount[] }) {
  const [q, setQ] = useState('')

  const filtered = q.trim()
    ? dealers.filter(d =>
        d.business_name.toLowerCase().includes(q.toLowerCase()) ||
        d.city.toLowerCase().includes(q.toLowerCase()) ||
        d.postcode.toLowerCase().includes(q.toLowerCase())
      )
    : dealers

  return (
    <div>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8AAB0]" size={16} />
        <input
          type="text"
          placeholder="Search by name or location…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E5E7] rounded-lg text-[14px] text-[#0A0A0F] placeholder-[#A8AAB0] focus:outline-none focus:ring-2 focus:ring-[#A0714A]/20 focus:border-[#A0714A] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#E5E5E7]">
          <p className="text-[#6E6E73] font-light">
            {q ? 'No dealers match your search.' : 'No dealers listed yet — check back soon.'}
          </p>
          {q && (
            <button
              onClick={() => setQ('')}
              className="mt-3 text-sm text-[#A0714A] hover:text-[#8A6040] transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(dealer => (
            <Link
              key={dealer.id}
              href={dealer.slug ? `/dealers/${dealer.slug}` : '#'}
              className="group block bg-white border border-[#E5E5E7] rounded-xl p-6 hover:border-[#C4C6CC] hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A0714A] flex-shrink-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {dealer.business_name[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#0A0A0F] leading-snug group-hover:text-[#1C1C1E] truncate">
                    {dealer.business_name}
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {dealer.city}
                  </p>
                </div>
              </div>

              {dealer.makes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dealer.makes.slice(0, 4).map(make => (
                    <span
                      key={make}
                      className="text-[11px] font-medium text-[#6E6E73] bg-[#F8F8FA] border border-[#E5E5E7] px-2 py-0.5 rounded-full"
                    >
                      {make}
                    </span>
                  ))}
                  {dealer.makes.length > 4 && (
                    <span className="text-[11px] text-[#A8AAB0]">
                      +{dealer.makes.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <p className="text-[13px] text-[#A8AAB0]">
                {dealer.listingCount === 0
                  ? 'No cars listed yet'
                  : `${dealer.listingCount} ${dealer.listingCount === 1 ? 'car' : 'cars'} in stock`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
