import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import {
  MapPin, Gauge, Fuel, Settings, Calendar, ChevronRight,
  ShieldCheck, Phone, Mail,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import type { DealerRow, ListingRow } from '@/lib/supabase/types'
import EnquiryForm from './enquiry-form'
import { CarPhotoGallery } from '@/components/listings/car-photo-gallery'
import { ServicesCard } from '@/components/services/services-card'
import { ListingCard } from '@/components/listings/listing-card'

type ListingWithDealer = ListingRow & { dealers: DealerRow | null }

function buildVehicleJsonLd(listing: ListingWithDealer) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${listing.year} ${listing.make} ${listing.model}`,
    brand: { '@type': 'Brand', name: listing.make },
    model: listing.model,
    vehicleModelDate: listing.year.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: listing.mileage,
      unitCode: 'SMI',
    },
    fuelType: listing.fuel_type,
    vehicleTransmission: listing.transmission,
    bodyType: listing.body_type,
    color: listing.colour,
    image: listing.photos?.[0] ?? undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `https://kerb.autos/cars/${listing.id}`,
      seller: listing.dealers ? {
        '@type': 'AutoDealer',
        name: listing.dealers.business_name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.dealers.city,
          postalCode: listing.dealers.postcode,
          addressCountry: 'GB',
        },
      } : undefined,
    },
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('listings')
    .select('make, model, year, price, colour, fuel_type, photos')
    .eq('id', slug)
    .single()
  if (!data) return { title: 'Car not found' }
  const title = `${data.year} ${data.make} ${data.model}`
  const description = `${data.colour} ${data.fuel_type} · £${data.price.toLocaleString('en-GB')} · Available on Kerb — Real Kerb Appeal.`
  const image = data.photos?.[0]
  return {
    title: `${title} — Kerb`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const supabase = createServerClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, dealers(*)')
    .eq('id', slug)
    .single() as unknown as { data: ListingWithDealer | null }

  if (!listing || listing.status === 'archived') notFound()

  // Related cars — same make, not this listing, max 4
  const { data: related } = await supabase
    .from('public_listings')
    .select('*')
    .eq('make', listing.make)
    .neq('id', listing.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const dealer = listing.dealers
  const title = `${listing.year} ${listing.make} ${listing.model}`
  const jsonLd = buildVehicleJsonLd(listing)
  const photos = listing.photos ?? []

  // Breadcrumb back link — preserved from wherever the user came from
  const fromPath = sp.from ? decodeURIComponent(sp.from) : '/search'
  const backLabel = fromPath === '/' ? 'Home' : fromPath.startsWith('/dealers') ? 'Dealer' : 'Search results'

  const specs = [
    { label: 'Year',         value: listing.year.toString(),                    icon: Calendar },
    { label: 'Mileage',      value: `${listing.mileage.toLocaleString('en-GB')} miles`, icon: Gauge },
    { label: 'Fuel type',    value: listing.fuel_type,                          icon: Fuel },
    { label: 'Transmission', value: listing.transmission,                       icon: Settings },
    { label: 'Body type',    value: listing.body_type,                          icon: null },
    { label: 'Doors',        value: listing.doors,                              icon: null },
    { label: 'Engine',       value: listing.engine_size ?? '—',                 icon: null },
    ...(listing.variant ? [{ label: 'Variant', value: listing.variant, icon: null }] : []),
    { label: 'Colour',       value: listing.colour,                             icon: null },
  ]

  return (
    <>
      <Script id="vehicle-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#6E6E73] mb-6">
          <Link href="/" className="hover:text-[#0A0A0F] transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href={fromPath} className="hover:text-[#0A0A0F] transition-colors">{backLabel}</Link>
          <ChevronRight size={14} />
          <span className="text-[#0A0A0F]">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Photo gallery */}
            <CarPhotoGallery photos={photos} title={title} />

            {/* Title + price */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-light text-[#0A0A0F] tracking-tight">{title}</h1>
                <p className="text-[#6E6E73] mt-1">{listing.colour} · {listing.fuel_type} · {listing.transmission}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-[#0A0A0F]">£{listing.price.toLocaleString('en-GB')}</p>
              </div>
            </div>

            {/* Specs grid */}
            <div>
              <h2 className="font-semibold text-[#0A0A0F] mb-4">Key details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map(spec => (
                  <div key={spec.label} className="bg-[#F8F8FA] rounded-md p-3 border border-[#E5E5E7]">
                    <p className="text-xs text-[#6E6E73] mb-0.5">{spec.label}</p>
                    <p className="font-medium text-[#0A0A0F] text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="font-semibold text-[#0A0A0F] mb-3">Description</h2>
                <div className="space-y-3">
                  {listing.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-[#6E6E73] leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Related cars */}
            {(related ?? []).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0A0A0F]">More {listing.make} cars</h2>
                  <Link
                    href={`/search?make=${encodeURIComponent(listing.make.toLowerCase())}`}
                    className="text-sm text-[#A0714A] hover:text-[#8A6040] transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(related ?? []).map(r => (
                    <ListingCard key={r.id} listing={r} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Enquiry card */}
            <div className="bg-white border border-[#E5E5E7] rounded-md p-5 sticky top-24">
              <h3 className="font-semibold text-[#0A0A0F] mb-4">Enquire with dealer</h3>
              <EnquiryForm
                dealer_id={listing.dealer_id}
                listing_id={listing.id}
                listing_title={title}
              />
              <p className="text-xs text-[#A8AAB0] text-center mt-3">
                Your details go directly to the dealer. Kerb is never in the middle.
              </p>
            </div>

            {/* Dealer card */}
            {dealer && (
              <div className="bg-white border border-[#E5E5E7] rounded-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0A0A0F]">{dealer.business_name}</p>
                    <p className="text-sm text-[#6E6E73] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {dealer.city}, {dealer.postcode}
                    </p>
                  </div>
                  {dealer.status === 'approved' && (
                    <ShieldCheck size={18} className="text-[#C4C6CC] shrink-0" />
                  )}
                </div>
                <div className="space-y-2 text-sm mt-4">
                  <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">
                    <Phone size={14} className="text-[#A8AAB0]" />
                    {dealer.phone}
                  </a>
                  <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">
                    <Mail size={14} className="text-[#A8AAB0]" />
                    {dealer.email}
                  </a>
                </div>
              </div>
            )}

            {/* Services card */}
            <ServicesCard make={listing.make} model={listing.model} year={listing.year} />

          </div>
        </div>
      </div>
    </>
  )
}
