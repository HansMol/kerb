import Image from 'next/image'
import Link from 'next/link'
import { CountdownTimer } from '@/components/countdown-timer'

export const dynamic = 'force-dynamic'

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ notify?: string }>
}) {
  const { notify } = await searchParams
  return (
    <div className="bg-[#0A0A0F] min-h-screen">

      {/* ── Hero ── */}
      <section className="px-6 sm:px-10 lg:px-20 pt-20 pb-20 border-b border-[#1C1C1E]">
        <div className="max-w-5xl">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[#A0714A] mb-3">
            Real Kerb Appeal.
          </p>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#C4C6CC] mb-10 flex items-center gap-3 before:content-[''] before:block before:w-5 before:h-px before:bg-[#C4C6CC]">
            UK Car Marketplace — Launching August 2026
          </p>
          <h1 className="text-[clamp(32px,3.5vw,48px)] font-light text-white leading-[1.1] tracking-[-0.02em] mb-6">
            Every car.<br />You choose.
          </h1>
          <p className="text-[15px] text-[#6E6E73] font-light leading-relaxed max-w-lg mb-16">
            Clean listings, verified dealers, direct contact. No sponsored slots, no reservation fees, no platform inbox. Search, find, call.
          </p>

          {/* Countdown */}
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#2A2A2E] mb-7">
            Launching in
          </p>
          <CountdownTimer targetDate="2026-08-01T00:00:00Z" />

          {/* Buyer email capture */}
          {notify === 'ok' ? (
            <div className="mt-14 max-w-md">
              <p className="text-[#C4C6CC] text-[14px]">You&apos;re on the list. We&apos;ll email you when we go live.</p>
            </div>
          ) : (
            <>
              <form
                action="/api/notify"
                method="POST"
                className="mt-14 flex flex-col sm:flex-row gap-3 max-w-md"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3.5 bg-[#1C1C1E] border border-[#2A2A2E] text-white rounded-md text-sm placeholder:text-[#3A3A3E] focus:outline-none focus:border-[#C4C6CC] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#A0714A] hover:bg-[#8A6040] text-white font-semibold px-6 py-3.5 rounded-md transition-colors text-sm shrink-0"
                >
                  Notify me at launch
                </button>
              </form>
              {notify === 'invalid' && (
                <p className="text-red-400 text-[11px] mt-3">Please enter a valid email address.</p>
              )}
              {notify !== 'invalid' && (
                <p className="text-[#2A2A2E] text-[11px] mt-3">No spam. One email when we go live.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Why it's different ── */}
      <section className="px-6 sm:px-10 lg:px-20 py-16 border-b border-[#1C1C1E]">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#2A2A2E] mb-12">
          What&apos;s different
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl">
          {[
            { stat: '£0',    label: 'To enquire',       sub: 'No reservation fees. No lead charges. Ever.' },
            { stat: '100%',  label: 'Verified dealers', sub: 'Every dealer checked through Companies House before listing.' },
            { stat: 'Direct', label: 'Contact always',  sub: 'You call the dealer. No platform inbox, no middleman.' },
          ].map(({ stat, label, sub }) => (
            <div key={label}>
              <p className="text-[clamp(32px,4vw,48px)] font-light text-white leading-none tracking-[-0.03em] mb-2">{stat}</p>
              <p className="text-[#C4C6CC] text-[13px] font-medium mb-1">{label}</p>
              <p className="text-[#6E6E73] text-[12px] leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product preview ── */}
      <section className="px-6 sm:px-10 lg:px-20 py-20 border-b border-[#1C1C1E]">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#2A2A2E] mb-12">
          Product preview
        </p>

        <div className="flex flex-col gap-5">

          {/* Hero screenshot — full width */}
          <div className="rounded-xl overflow-hidden border border-[#1C1C1E] w-full">
            <Image
              src="/screenshots/hero.png"
              alt="Kerb — consumer homepage"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Listings + Detail — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl overflow-hidden border border-[#1C1C1E]">
              <Image
                src="/screenshots/listings.png"
                alt="Kerb — search results"
                width={1920}
                height={1080}
                className="w-full h-auto"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-[#1C1C1E]">
              <Image
                src="/screenshots/detail.png"
                alt="Kerb — car detail and enquiry"
                width={1920}
                height={1080}
                className="w-full h-auto"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Social amplification ── */}
      <section className="px-6 sm:px-10 lg:px-20 py-20 border-b border-[#1C1C1E]">
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#2A2A2E] mb-12">
          For dealers
        </p>
        <div className="max-w-4xl">
          <h2 className="text-[clamp(24px,2.8vw,36px)] font-light text-white leading-[1.15] tracking-[-0.02em] mb-4">
            Your cars, on our feed.
          </h2>
          <p className="text-[15px] text-[#6E6E73] font-light leading-relaxed max-w-lg mb-14">
            Kerb curates a selection of listed cars into editorial Instagram content. Exceptional cars get featured — no extra charge, no ad budget required.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { label: 'Editorial, not ads',         sub: 'We select on quality — condition, specification, and story. Not who pays most.' },
              { label: 'Reach beyond search',         sub: "Social surfaces your cars to buyers who aren't actively searching yet." },
              { label: 'Included in your listing',    sub: 'No separate fees. If your car qualifies, it gets featured.' },
            ].map(({ label, sub }) => (
              <div key={label}>
                <p className="text-[#C4C6CC] text-[13px] font-medium mb-2">{label}</p>
                <p className="text-[#6E6E73] text-[12px] leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dealer secondary CTA ── */}
      <section className="px-6 sm:px-10 lg:px-20 py-16 border-b border-[#1C1C1E]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 max-w-4xl">
          <div>
            <p className="text-white text-[15px] font-medium mb-1">Are you a dealer?</p>
            <p className="text-[#6E6E73] text-[13px] font-light">List free. No charge until you&apos;ve had 3 real buyer enquiries — then only in months we send you one.</p>
          </div>
          <Link
            href="/dealers/register"
            className="shrink-0 text-[13px] font-semibold bg-[#A0714A] hover:bg-[#8A6040] text-white px-6 py-3 rounded-md transition-colors whitespace-nowrap"
          >
            Apply for early access →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 sm:px-10 lg:px-20 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[#2A2A2E] text-[12px]">© 2026 Kerb</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[#2A2A2E] text-[12px] hover:text-[#6E6E73] transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-[#2A2A2E] text-[12px] hover:text-[#6E6E73] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
