import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { AdvertiserCard } from '@/components/advertisers/advertiser-card'
import type { AdvertiserCategory } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Services — Kerb',
  description: 'Detailing, storage, mechanics, transport, and photography services for classic and prestige car owners.',
}

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<AdvertiserCategory, string> = {
  detailing_protection: 'Detailing & Protection',
  storage: 'Storage',
  mechanic_mot: 'Mechanics & MOT',
  transport: 'Transport & Logistics',
  photography_valuation: 'Photography & Valuation',
}

const CATEGORY_ORDER: AdvertiserCategory[] = [
  'detailing_protection',
  'storage',
  'mechanic_mot',
  'transport',
  'photography_valuation',
]

export default async function ServicesPage() {
  const supabase = createServerClient()

  const { data: advertisers } = await supabase
    .from('advertisers')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#A8AAB0] mb-4">Services</p>
      <h1 className="text-[clamp(32px,4vw,48px)] font-light text-[#0A0A0F] leading-[1.15] tracking-[-0.01em] mb-4">
        Everything for owning the car, not just buying it.
      </h1>
      <p className="text-[16px] text-[#6E6E73] leading-[1.75] max-w-[560px] mb-14">
        Detailing, storage, mechanics, transport, and photography — the businesses that look after classic and prestige cars once you own one.
      </p>

      {/* Pre-purchase inspection — curated, not part of the open marketplace */}
      <div className="mb-14">
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A8AAB0] mb-4">Before you buy</p>
        <a
          href="https://www.theaa.com/car-services/inspection"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-white border border-[#E5E5E7] rounded-md p-4 hover:border-[#A0714A] transition-colors group max-w-md"
        >
          <div className="w-10 h-10 rounded bg-[#A0714A]/10 flex items-center justify-center shrink-0">
            <Search size={16} className="text-[#A0714A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#0A0A0F] text-sm">Pre-purchase inspection</p>
            <p className="text-xs text-[#6E6E73] leading-snug mt-0.5">Independent engineer check before you commit.</p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-[#A0714A] group-hover:text-[#8A6040] transition-colors whitespace-nowrap">
            Book →
          </span>
        </a>
      </div>

      {CATEGORY_ORDER.map(category => {
        const inCategory = advertisers?.filter(a => a.category === category) ?? []
        if (inCategory.length === 0) return null

        return (
          <div key={category} className="mb-14">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A8AAB0] mb-4">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inCategory.map(advertiser => (
                <AdvertiserCard key={advertiser.id} advertiser={advertiser} />
              ))}
            </div>
          </div>
        )
      })}

      <p className="text-[13px] text-[#6E6E73] mt-4">
        Run a business that serves car owners?{' '}
        <a href="/advertise" className="text-[#A0714A] font-semibold hover:text-[#8A6040] transition-colors">
          Apply to be listed here →
        </a>
      </p>
    </div>
  )
}
