import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getDealerPreview, getAllDealerPreviewSlugs } from '@/lib/dealer-previews'
import type { PreviewCar } from '@/lib/dealer-previews'
import { CarouselMockup } from '@/components/preview/carousel-mockup'
import { PermissionButtons } from '@/components/preview/permission-buttons'

const PILLARS = ['Desirability', 'Scarcity', 'Investment potential', 'Reliability', 'Efficiency', 'Cost to run']

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

function carLabel(car: PreviewCar): string {
  return `${car.year} ${car.make} ${car.model}`.trim()
}

function CarDetails({ car, dealerName }: { car: PreviewCar; dealerName: string }) {
  return (
    <div className="w-full max-w-[340px]">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-copper">
        {car.year} &middot; {car.mileage} &middot; {car.price}
      </div>
      <h2 className="text-xl font-bold text-ink">
        {car.make} {car.model}
      </h2>
      {car.trim && <p className="mt-0.5 mb-4 text-sm text-stone">{car.trim}</p>}
      {car.hook && (
        <blockquote className="mb-4 rounded-lg border-l-2 border-copper bg-white px-4 py-3 text-[14px] italic leading-[1.6] text-charcoal shadow-sm">
          &ldquo;{car.hook}&rdquo;
        </blockquote>
      )}
      {car.dealer_website && (
        <a
          href={car.dealer_website}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper hover:text-[#8A6040] hover:underline"
        >
          View on {dealerName} &rarr;
        </a>
      )}
    </div>
  )
}

function CarVisual({ car, dealerName }: { car: PreviewCar; dealerName: string }) {
  if (car.slides && car.slides.length > 0) {
    return <CarouselMockup slides={car.slides} dealerName={dealerName} caption={car.caption} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={car.photo_url}
      alt={`${car.year} ${car.make} ${car.model}`}
      loading="lazy"
      className="h-48 w-full max-w-[340px] rounded-xl bg-silver-line object-cover"
    />
  )
}

export default async function DealerPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const preview = getDealerPreview(slug)
  if (!preview) notFound()

  const carCount = preview.cars.length
  const singleCar = carCount === 1
  const carSummary = preview.cars.map(carLabel).join(', ')
  const decisionHeading = singleCar
    ? `Can we feature your ${carLabel(preview.cars[0])}?`
    : `Can we feature these ${carCount} cars?`

  return (
    <div className="min-h-screen bg-cloud text-ink">
      {/* ── Header / founder intro ── */}
      <header className="px-6 pt-14 pb-8 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-copper">
          An invitation from Kerb
        </p>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">
          {preview.dealer_name} &times; Kerb
        </h1>

        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-left">
          <p className="text-[16px] leading-[1.75] text-charcoal">
            <strong className="text-ink">Kerb</strong> (kerb.autos) is a new marketplace and we
            curate content focused on niche sectors within the second-hand car market in
            the UK. Our interest is creating awareness of cars with specific focus on;
            Desirability, Scarcity, Investment potential, Reliability, Efficiency and Cost to run
            as well as those that may be overlooked, and{' '}
            {singleCar ? (
              <>one of {preview.dealer_name}&rsquo;s cars is</>
            ) : (
              <>
                {carCount} of {preview.dealer_name}&rsquo;s cars are
              </>
            )}{' '}
            exactly what we&rsquo;re building content around.
          </p>
          <p className="text-[16px] leading-[1.75] text-charcoal">
            We&rsquo;d like to feature {singleCar ? 'it' : 'them'} in short-form video and
            carousel content across Kerb&rsquo;s TikTok, Instagram, YouTube and Facebook — real
            dealer stock, real content, no cost to you.
          </p>
        </div>
      </header>

      {/* ── The example ── */}
      <main className="mx-auto max-w-4xl px-6 pb-4">
        <p className="mb-6 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-stone">
          Example
        </p>
        {singleCar ? (
          <div className="flex flex-col items-center gap-10 pb-4 md:flex-row md:items-center md:justify-center md:gap-14">
            <CarVisual car={preview.cars[0]} dealerName={preview.dealer_name} />
            <CarDetails car={preview.cars[0]} dealerName={preview.dealer_name} />
          </div>
        ) : (
          <div className="grid grid-cols-1 place-items-center gap-14 pb-4 md:grid-cols-2">
            {preview.cars.map((car, i) => (
              <div key={i} className="flex flex-col items-center">
                <CarVisual car={car} dealerName={preview.dealer_name} />
                <div className="mt-4">
                  <CarDetails car={car} dealerName={preview.dealer_name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── What we're asking ── */}
      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-2xl">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-copper">
            What we&rsquo;re asking
          </p>
          <ul className="space-y-4">
            {[
              'Permission to use the photos already on your listings — no new photos needed',
              'Zero time from your team — we handle production, start to finish',
              `Every single post credits ${preview.dealer_name} by name, with a link back to you`,
            ].map((text) => (
              <li key={text} className="flex items-start gap-3 text-[16px] leading-[1.6] text-charcoal">
                <span className="mt-0.5 flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-ink">
                  <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Content pillars ── */}
      <section className="px-6 py-12 text-center">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-stone">
          What we look for
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-1.5">
          {PILLARS.map((p) => (
            <span
              key={p}
              className="whitespace-nowrap rounded-full border border-silver-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-charcoal"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── Decision ── */}
      <section className="bg-white px-6 py-16 text-center">
        <h2 className="mx-auto max-w-lg text-xl font-bold text-ink sm:text-2xl">
          {decisionHeading}
        </h2>
        <p className="mx-auto mt-2 mb-8 max-w-md text-[15px] text-charcoal">
          One click either way — no account, no form. You can ask us to take anything down at
          any time, no questions asked.
        </p>

        <PermissionButtons
          dealerSlug={slug}
          dealerName={preview.dealer_name}
          carSummary={carSummary}
        />

        <div className="mx-auto mt-14 max-w-2xl border-t border-silver-line pt-10">
          <p className="text-[15px] leading-[1.6] text-charcoal sm:whitespace-nowrap">
            Or register your dealership with Kerb and we&rsquo;ll promote more than just this one car.
          </p>
          <Link
            href="/dealers/join"
            className="mt-4 inline-block rounded-md bg-copper px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#8A6040]"
          >
            Register free at kerb.autos/dealers/join &rarr;
          </Link>
          <p className="mt-4 text-[13px] leading-[1.6] text-stone">
            Registration and listing your vehicles is free.
            <br />
            All registered dealers are eligible for free content features — for now, we select
            vehicles that fit the pillars above, so not every car will be featured. Either way,
            your full inventory is visible to everyone browsing Kerb once you&rsquo;re registered.
          </p>
        </div>
      </section>
    </div>
  )
}
