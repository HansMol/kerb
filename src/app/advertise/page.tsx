import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advertise — Kerb',
  description: 'Reach buyers the moment they are deciding. Advertise your automotive service on Kerb — the UK marketplace for classic and prestige car buyers.',
}

const PLACEMENTS = [
  {
    label: 'Homepage',
    title: 'First thing every visitor sees.',
    body: 'Your brand is on the Kerb homepage alongside car listings. Every visitor — whether browsing, searching, or returning — passes your placement.',
  },
  {
    label: 'Car Detail',
    title: 'Shown at the moment of decision.',
    body: "When a buyer is viewing a specific car — the highest-intent moment in their journey — your ad appears on the listing page. Not before they arrive. Not after they leave.",
  },
  {
    label: 'Click Tracking',
    title: 'Every referral is counted.',
    body: 'Every click through to your website is logged with a timestamp. Monthly reports show exactly how many buyers Kerb sent your way. No guesswork, no impressions — referrals only.',
  },
]

const WHO = [
  'Car detailing and protection services',
  'Classic and prestige car storage',
  'Car history and provenance checks',
  'Insurance specialists',
  'Finance providers',
  'Mechanics, MOT centres, and service garages',
  'Car transporters and logistics',
  'Photography and valuation services',
]

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`text-[12px] font-semibold tracking-[0.1em] uppercase mb-5 flex items-center gap-2.5 before:content-[''] before:block before:w-5 before:h-px ${
      light ? 'text-[#A8AAB0] before:bg-[#A8AAB0]' : 'text-[#C4C6CC] before:bg-[#C4C6CC]'
    }`}>
      {children}
    </p>
  )
}

export default function AdvertisePage() {
  return (
    <div className="bg-[#0A0A0F] text-white">

      {/* ── Hero ── */}
      <section className="px-6 sm:px-10 lg:px-16 pt-[76px] pb-20 min-h-screen flex flex-col justify-between gap-16">
        <div className="max-w-[640px]">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[#A0714A] mb-4">Real Kerb Appeal.</p>
          <SectionLabel>Advertising on Kerb</SectionLabel>
          <h1 className="text-[clamp(48px,5.5vw,76px)] font-light leading-[1.06] tracking-[-0.01em] mb-9">
            Your next customer<br />
            <span className="text-[#C4C6CC]">is looking at a car right now.</span>
          </h1>
          <p className="text-[18px] text-[#6E6E73] leading-[1.75] max-w-[540px] mb-13">
            Kerb is a marketplace for classic and prestige car buyers — people actively spending money on vehicles. Your service reaches them at the exact moment they are deciding.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/advertise/apply" className="bg-[#A0714A] hover:bg-[#8A6040] text-white text-[14px] font-semibold tracking-[0.04em] px-8 py-4 rounded-md transition-colors">
              Apply to advertise
            </Link>
            <a href="#placements" className="text-[#6E6E73] hover:text-white text-[14px] font-medium py-4 transition-colors flex items-center gap-2">
              See how it works →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 border-t border-[#1C1C1E]">
          {[
            { label: 'Audience',       value: 'Buyers' },
            { label: 'Intent',         value: 'Active' },
            { label: 'Cost to start',  value: 'Free' },
            { label: 'Platform cut',   value: '£0' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-2.5">{label}</p>
              <p className="text-[32px] font-light text-white tracking-[-0.02em] leading-none">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Placements ── */}
      <section className="bg-white px-6 sm:px-10 lg:px-16 py-[72px]" id="placements">
        <SectionLabel light>What you get</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-[#0A0A0F] leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          Three things. No filler.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-16">
          Your brand appears in two places on Kerb — the homepage and every car listing page. Every click to your website is tracked and reported.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E5E7] border border-[#E5E5E7] rounded-lg overflow-hidden">
          {PLACEMENTS.map(({ label, title, body }) => (
            <div key={label} className="bg-white p-10">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A0714A] mb-3.5">{label}</p>
              <h3 className="text-[18px] font-semibold text-[#0A0A0F] leading-[1.3] mb-2.5">{title}</h3>
              <p className="text-[15px] text-[#6E6E73] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who ── */}
      <section className="bg-[#F8F8FA] px-6 sm:px-10 lg:px-16 py-[72px] grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div>
          <SectionLabel light>Who advertises on Kerb</SectionLabel>
          <h2 className="text-[clamp(32px,3vw,44px)] font-normal text-[#0A0A0F] leading-[1.2] tracking-[-0.01em] mb-6">
            If your business serves car buyers or owners, this is your audience.
          </h2>
          <p className="text-[16px] text-[#6E6E73] leading-[1.8]">
            Kerb buyers are purchasing classic, prestige, and performance vehicles. They spend on protecting, maintaining, financing, and insuring those vehicles — often before the car is even collected.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-[#E5E5E7] mt-2">
          {WHO.map(item => (
            <li key={item} className="flex items-center gap-4 py-4 text-[15px] text-[#0A0A0F]">
              <span className="w-5 h-5 rounded-full bg-[#0A0A0F] flex-shrink-0 flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-[72px]" id="pricing">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-white leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          Fair now. Scales with us.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-16">
          We&apos;re building this together. That means we start at a price you can justify without thinking, and we renegotiate as traffic and referral volume grows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {[
            {
              phase: 'Phase 01 — Now',
              title: 'Free until your first referral.',
              body: "Your listing goes live. No charge until Kerb sends your first click-through. Once that happens, we agree a monthly rate together. No surprises.",
            },
            {
              phase: 'Phase 02 — As we grow',
              title: 'Low flat monthly rate.',
              body: 'A fixed fee that reflects what the platform actually delivers — transparent, predictable, easy to justify on a spreadsheet. You will have real referral data before you pay a penny.',
            },
            {
              phase: 'Phase 03 — At scale',
              title: 'Cost-per-lead. Tied to outcomes.',
              body: "As Kerb scales and we can attribute buyer intent with confidence, we move to cost-per-lead pricing. You pay for qualified interest, not impressions. That's the direction we're building toward.",
            },
          ].map(({ phase, title, body }) => (
            <div key={phase} className="bg-[#0F0F14] border border-[#1C1C1E] rounded-xl p-8">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#C4C6CC] mb-5">{phase}</p>
              <h3 className="text-[18px] font-medium text-white leading-[1.3] mb-3">{title}</h3>
              <p className="text-[14px] text-[#6E6E73] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>

        <p className="text-[14px] text-[#6E6E73] max-w-[540px]">
          We do not sell impressions. We do not charge for eyeballs you cannot verify. Every pricing conversation starts with the click data we can show you.
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#F8F8FA] px-6 sm:px-10 lg:px-16 py-[72px] text-center">
        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#A8AAB0] mb-5">Advertise on Kerb</p>
        <h2 className="text-[clamp(36px,4vw,52px)] font-light text-[#0A0A0F] leading-[1.1] tracking-[-0.01em] mb-4">
          Apply in two minutes.<br />Live within 24 hours.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.7] mb-13 max-w-lg mx-auto">
          Tell us about your business. We review every application and come back to you within one working day. No commitment required to apply.
        </p>
        <Link
          href="/advertise/apply"
          className="inline-block bg-[#A0714A] hover:bg-[#8A6040] text-white text-[15px] font-semibold tracking-[0.04em] px-10 py-4 rounded-md transition-colors"
        >
          Apply to advertise →
        </Link>
        <p className="text-[13px] text-[#6E6E73] mt-4">No payment required. No commitment.</p>
      </section>

    </div>
  )
}
