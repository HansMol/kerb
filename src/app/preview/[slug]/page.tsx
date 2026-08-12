import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDealerPreview, getAllDealerPreviewSlugs } from '@/lib/dealer-previews'

export async function generateStaticParams() {
  return getAllDealerPreviewSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const preview = getDealerPreview(slug)
  return {
    title: preview ? `${preview.dealer_name} x Kerb` : 'Kerb preview',
    robots: { index: false, follow: false },
  }
}

export default async function DealerPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const preview = getDealerPreview(slug)
  if (!preview) notFound()

  return (
    <div className="min-h-screen bg-ink text-cloud">
      <header className="px-6 pt-10 pb-6 text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <svg width="24" height="24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="44" height="14" rx="2" fill="white" />
            <rect x="26" y="42" width="44" height="14" rx="2" fill="white" />
          </svg>
          <span className="text-base font-medium uppercase tracking-[0.32em] text-white">Kerb</span>
        </div>
        <h1 className="text-xl font-bold">{preview.dealer_name} &times; Kerb</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-platinum-deep">
          We&rsquo;d like to feature {preview.cars.length} of your current cars on Kerb&rsquo;s
          TikTok, Instagram, YouTube and Facebook — real dealer stock, real content, no cost to
          you.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {preview.cars.map((car, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-charcoal bg-charcoal">
            {/* Autotrader-hosted photos, not yet Kerb-branded — plate swap happens at production stage */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={car.photo_url}
              alt={`${car.year} ${car.make} ${car.model}`}
              loading="lazy"
              className="h-48 w-full bg-charcoal object-cover"
            />
            <div className="p-4">
              <div className="mb-1 text-xs text-platinum-deep">
                {car.year} &middot; {car.mileage} &middot; {car.price}
              </div>
              <div className="text-base font-bold">
                {car.make} {car.model}
              </div>
              <div className="mb-2 text-sm text-platinum">{car.trim}</div>
              <div className="mb-2 text-sm text-copper-light">{car.hook}</div>
              {car.dealer_website && (
                <a
                  href={car.dealer_website}
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-copper hover:underline"
                >
                  View on {preview.dealer_name} &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-lg border border-charcoal bg-charcoal p-5 text-left text-sm leading-relaxed text-platinum">
          <b className="text-cloud">What happens if you say yes:</b> we use your existing listing
          photos to build short-form video and carousel content. Your real number plate is always
          replaced with a Kerb-branded plate before anything goes live — never shown as-is. Every
          post credits {preview.dealer_name} by name and links back to you. You can ask us to take
          anything down at any time, no questions asked.
        </div>
      </footer>
    </div>
  )
}
