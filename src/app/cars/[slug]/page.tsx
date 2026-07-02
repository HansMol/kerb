import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import {
  MapPin, Gauge, Fuel, Settings, Calendar, ChevronRight,
  ShieldCheck, Phone, Mail, Car,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import type { DealerRow, ListingRow } from '@/lib/supabase/types'
import EnquiryForm from './enquiry-form'

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

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, dealers(*)')
    .eq('id', slug)
    .single() as { data: ListingWithDealer | null }

  if (!listing || listing.status === 'archived') notFound()

  const dealer = listing.dealers
  const title = `${listing.year} ${listing.make} ${listing.model}`
  const jsonLd = buildVehicleJsonLd(listing)
  const photos = listing.photos ?? []

  const specs = [
    { label: 'Year', value: listing.year.toString(), icon: Calendar },
    { label: 'Mileage', value: `${listing.mileage.toLocaleString('en-GB')} miles`, icon: Gauge },
    { label: 'Fuel type', value: listing.fuel_type, icon: Fuel },
    { label: 'Transmission', value: listing.transmission, icon: Settings },
    { label: 'Body type', value: listing.body_type, icon: null },
    { label: 'Doors', value: listing.doors, icon: null },
    { label: 'Engine', value: listing.engine_size ?? '—', icon: null },
    ...(listing.variant ? [{ label: 'Variant', value: listing.variant, icon: null }] : []),
    { label: 'Colour', value: listing.colour, icon: null },
  ]

  return (
    <>
    <Script id="vehicle-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-[#6E6E73] mb-6">
        <Link href="/" className="hover:text-[#0A0A0F] transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/search" className="hover:text-[#0A0A0F] transition-colors">Search</Link>
        <ChevronRight size={14} />
        <span className="text-[#0A0A0F]">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Primary image */}
          <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-[#F8F8FA] flex items-center justify-center">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Car size={64} className="text-[#E5E5E7]" />
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.slice(1).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${title} photo ${i + 2}`}
                  className="h-20 w-28 object-cover rounded shrink-0 border border-[#E5E5E7]"
                />
              ))}
            </div>
          )}

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

        </div>
      </div>
    </div>
    </>
  )
}
