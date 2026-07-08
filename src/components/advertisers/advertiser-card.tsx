import type { AdvertiserRow } from '@/lib/supabase/types'

interface Props {
  advertiser: AdvertiserRow
}

export function AdvertiserCard({ advertiser }: Props) {
  const { name, tagline, logo_url, cta_text, cta_url } = advertiser
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <a
      href={cta_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-white border border-[#E5E5E7] rounded-md p-4 hover:border-[#A0714A] transition-colors group"
    >
      <div className="w-10 h-10 rounded bg-[#A0714A]/10 flex items-center justify-center shrink-0">
        {logo_url
          ? <img src={logo_url} alt={name} className="w-8 h-8 object-contain" />
          : <span className="text-[#A0714A] font-semibold text-sm">{initials}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#0A0A0F] text-sm">{name}</p>
        <p className="text-xs text-[#6E6E73] leading-snug mt-0.5">{tagline}</p>
      </div>
      <span className="shrink-0 text-[13px] font-semibold text-[#A0714A] group-hover:text-[#8A6040] transition-colors whitespace-nowrap">
        {cta_text} →
      </span>
    </a>
  )
}
