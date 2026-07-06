import { ExternalLink, ShieldCheck, CreditCard, Shield, Sparkles, Search } from 'lucide-react'

interface Service {
  icon: React.ReactNode
  label: string
  description: string
  href: string
  highlight?: boolean
  badge?: string
}

interface Props {
  make: string
  model: string
  year: number
}

export function ServicesCard({ make, model, year }: Props) {
  const vehicleLabel = `${year} ${make} ${model}`

  const services: Service[] = [
    {
      icon: <ShieldCheck size={16} />,
      label: 'Vehicle history check',
      description: 'Check for finance, write-offs, stolen status, and mileage discrepancies.',
      href: 'https://www.hpicheck.com', // TODO: replace with affiliate link
      highlight: true,
      badge: 'Recommended',
    },
    {
      icon: <CreditCard size={16} />,
      label: 'Finance this car',
      description: 'Get a quote in minutes. No impact on your credit score.',
      href: 'https://www.zuto.com', // TODO: replace with affiliate link
    },
    {
      icon: <Shield size={16} />,
      label: 'Insure this car',
      description: 'Compare quotes from 100+ insurers. Takes 3 minutes.',
      href: 'https://www.comparethemarket.com/car-insurance', // TODO: replace with affiliate link
    },
    {
      icon: <Sparkles size={16} />,
      label: 'Book a professional detail',
      description: `IGL Aegis graphene protection for your ${make} — professional applied.`,
      href: 'https://ice-clean-works.com', // TODO: update with live ICW domain
    },
    {
      icon: <Search size={16} />,
      label: 'Pre-purchase inspection',
      description: 'Independent engineer check before you commit.',
      href: 'https://www.theaa.com/car-services/inspection', // TODO: replace with affiliate link
    },
  ]

  return (
    <div className="bg-white border border-[#E5E5E7] rounded-md p-5">
      <h3 className="font-semibold text-[#0A0A0F] mb-1">Services for your {vehicleLabel}</h3>
      <p className="text-xs text-[#A8AAB0] mb-4">Everything you need before you commit.</p>

      <div className="space-y-1">
        {services.map(service => (
          <a
            key={service.label}
            href={service.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-3 p-3 rounded-md transition-colors group ${
              service.highlight
                ? 'bg-[#A0714A]/6 hover:bg-[#A0714A]/12 border border-[#A0714A]/20'
                : 'hover:bg-[#F8F8FA]'
            }`}
          >
            <span className={`mt-0.5 shrink-0 ${service.highlight ? 'text-[#A0714A]' : 'text-[#A8AAB0]'}`}>
              {service.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-[#0A0A0F] group-hover:text-[#A0714A] transition-colors">
                  {service.label}
                </p>
                {service.badge && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase text-[#A0714A] bg-[#A0714A]/10 px-1.5 py-0.5 rounded">
                    {service.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E6E73] leading-snug">{service.description}</p>
            </div>
            <ExternalLink size={12} className="text-[#C4C6CC] shrink-0 mt-0.5 group-hover:text-[#A0714A] transition-colors" />
          </a>
        ))}
      </div>

      <p className="text-[10px] text-[#A8AAB0] mt-4 text-center">
        Some links are affiliate links. Kerb may earn a small commission at no cost to you.
      </p>
    </div>
  )
}
