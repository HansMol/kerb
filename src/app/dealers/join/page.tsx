import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'For Dealers — Kerb',
  description: 'Real Kerb Appeal. The UK car marketplace built for dealers. Every enquiry goes direct to you. No platform inbox, no reservation gates, no intermediation. Free to list.',
}

const PROBLEMS = [
  {
    label: 'Deal Builder',
    title: 'Your buyer is intercepted before they reach you',
    body: 'A compulsory £99 reservation and mandatory account creation sits between your buyer and your number. Stock tied up. Lead control gone. The platform is now in your deal.',
  },
  {
    label: 'The Algorithm',
    title: 'Your pricing is publicly judged without context',
    body: "The \"High Price\" badge appears on your listing regardless of what you spent on preparation, what warranty you're including, or what the market actually looks like. Your professional judgement, overruled publicly.",
  },
  {
    label: 'Fee Increases',
    title: '8% up in 2025. More to come. Take it or leave it.',
    body: "No negotiation. No justification. No alternative — or so you've been told. Kerb was built because that's not acceptable.",
  },
  {
    label: 'Account Walls',
    title: 'Buyers abandon before they ever reach you',
    body: 'Mandatory account registration and email verification before an enquiry is submitted. A significant proportion of genuinely interested buyers give up. You never know they were there.',
  },
]

const STANDARDS = [
  {
    num: 'Standard 01',
    title: 'Direct leads. Every time.',
    body: 'Your phone number is visible on your listing without the buyer creating an account. Every enquiry routes to you directly. Kerb is never in the middle of your conversation.',
  },
  {
    num: 'Standard 02',
    title: 'No algorithm judges your pricing.',
    body: "We don't badge, grade, or publicly score your listings. You know your stock. You set your price. Buyers see your listing — not a platform's verdict on it.",
  },
  {
    num: 'Standard 03',
    title: 'No compulsory tools. No forced flow.',
    body: "There is no Deal Builder. There is no reservation system you're opted into by default. You run the deal from first contact to handover. As you always have.",
  },
]

const CHARTER = [
  {
    num: 'Commitment 01',
    title: 'Lead Ownership',
    body: 'Every buyer enquiry is delivered directly to you. Kerb does not intercept, qualify, re-route, or monetise your leads. This is not a policy that can be changed by a product update.',
  },
  {
    num: 'Commitment 02',
    title: 'Search Integrity',
    body: 'Organic search results are ordered by relevance and recency only. No dealer can pay to rank above another. Dealers may spotlight vehicles on their own profile page — this never affects search position.',
  },
  {
    num: 'Commitment 03',
    title: 'Exit With Your Data',
    body: 'Your listing history, enquiry records, and contact data belong to you. Request a full export at any time. Leaving Kerb costs nothing and loses nothing.',
  },
]

const SOLO_FEATURES = [
  'Up to 20 active listings',
  'Every enquiry goes direct to you — no platform inbox',
  'Verified dealer badge',
  'Listing performance dashboard',
  'Annual option — 2 months free',
]

const PRO_FEATURES = [
  'Unlimited active listings',
  'Every enquiry goes direct to you — no platform inbox',
  'Spotlight showcase — pin 3 vehicles to the top of your profile',
  'Verified dealer badge',
  'Listing performance dashboard',
  'Annual option — 2 months free',
]

const PRICING_FOOTNOTES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    text: 'Founding rate is locked for life. The first 50 dealers on the platform keep their rate regardless of future pricing changes.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 2v3M11 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    text: 'Annual billing saves 2 months. Pay for 10, list for 12. Switch to monthly before your renewal date — no forced rollover.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    text: 'No payment details required to register. Billing only begins when your first buyer enquiry arrives.',
  },
]

function ScreenChrome({ url }: { url: string }) {
  return (
    <div className="bg-[#1C1C1E] px-4 py-2.5 flex items-center gap-3 border-b border-[#2A2A2E]">
      <div className="flex gap-1.5 flex-shrink-0">
        {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#3A3A3E] block" />)}
      </div>
      <span className="text-[11px] text-[#6E6E73] bg-[#0A0A0F] border border-[#2A2A2E] rounded px-3 py-1 flex-1 text-center">{url}</span>
    </div>
  )
}

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`text-[12px] font-semibold tracking-[0.1em] uppercase mb-5 flex items-center gap-2.5 before:content-[''] before:block before:w-5 before:h-px ${
      light ? 'text-[#A8AAB0] before:bg-[#A8AAB0]' : 'text-[#C4C6CC] before:bg-[#C4C6CC]'
    }`}>
      {children}
    </p>
  )
}

function FeatureCheck({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-[14px] text-[#6E6E73] leading-[1.5]">
      <span className="w-[18px] h-[18px] rounded-full bg-[#0A0A0F] flex-shrink-0 mt-0.5 flex items-center justify-center">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {text}
    </li>
  )
}

export default function DealersPage() {
  return (
    <div className="bg-[#0A0A0F] text-white">

      {/* ── Hero ── */}
      <section className="px-6 sm:px-10 lg:px-16 pt-[76px] pb-20 min-h-screen flex flex-col justify-between gap-16">
        <div className="flex items-start gap-16 flex-col lg:flex-row">
          <div className="max-w-[520px] flex-shrink-0">
            <p className="text-[13px] font-semibold tracking-[0.04em] text-[#A0714A] mb-4">Real Kerb Appeal.</p>
            <SectionLabel>The UK car marketplace built for dealers</SectionLabel>
            <h1 className="text-[clamp(52px,6vw,80px)] font-light leading-[1.06] tracking-[-0.01em] mb-9">
              Your buyer calls you.<br />
              <span className="text-[#C4C6CC]">Not the platform.</span>
            </h1>
            <p className="text-[18px] text-[#6E6E73] leading-[1.75] max-w-[540px] mb-13">
              Kerb puts your phone number on every listing. Every enquiry routes directly to you — no platform inbox, no reservation gates, no intermediation. Free to list.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="#signup" className="bg-[#A0714A] hover:bg-[#8A6040] text-white text-[14px] font-semibold tracking-[0.04em] px-8 py-4 rounded-md transition-colors">
                List your inventory free
              </Link>
              <Link href="#charter" className="text-[#6E6E73] hover:text-white text-[14px] font-medium py-4 transition-colors flex items-center gap-2">
                See the commitment →
              </Link>
            </div>
          </div>

          <div className="flex-1 min-w-0 rounded-[10px] overflow-hidden border border-[#C4C6CC] mt-2 opacity-[0.92] hidden lg:block">
            <ScreenChrome url="kerb.autos" />
            <Image src="/screenshots/detail.png" alt="Kerb — buyer contacts dealer directly" width={1920} height={1080} className="w-full h-auto block" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 border-t border-[#1C1C1E]">
          {[
            { label: 'Cost at launch',          value: 'Free' },
            { label: 'Lead ownership',           value: '100%' },
            { label: 'Platform cut',             value: '£0' },
            { label: 'Commitment required',      value: 'None' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-2.5">{label}</p>
              <p className="text-[32px] font-light text-white tracking-[-0.02em] leading-none">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-white px-6 sm:px-10 lg:px-16 py-[72px]">
        <SectionLabel light>The problem</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-[#0A0A0F] leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          The platform you depend on has stopped working for you.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-16">
          Dealer subscription fees up 8% in 2025. Compulsory tools that intercept your buyers. Algorithms that publicly mark your stock "High Price" without understanding your preparation, warranty, or service record. You know this already. So do we.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E5E7] border border-[#E5E5E7] rounded-lg overflow-hidden">
          {PROBLEMS.map(({ label, title, body }) => (
            <div key={label} className="bg-white p-10">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#A0714A] mb-3.5">{label}</p>
              <h3 className="text-[18px] font-semibold text-[#0A0A0F] leading-[1.3] mb-2.5">{title}</h3>
              <p className="text-[15px] text-[#6E6E73] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Proposition ── */}
      <section className="bg-[#F8F8FA] px-6 sm:px-10 lg:px-16 py-[72px]">
        <SectionLabel light>What we do instead</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-[#0A0A0F] leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          Every decision we've made is the opposite.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-16">
          Three things every dealer should expect from a marketplace.{' '}
          <span className="whitespace-nowrap">Not features — standards.</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STANDARDS.map(({ num, title, body }) => (
            <div key={num} className="bg-white border border-[#E5E5E7] rounded-lg p-9">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#C4C6CC] mb-5">{num}</p>
              <h3 className="text-[20px] font-semibold text-[#0A0A0F] leading-[1.25] mb-3">{title}</h3>
              <p className="text-[15px] text-[#6E6E73] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Buyer experience ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-[72px]" id="buyer-experience">
        <SectionLabel>The buyer experience</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-white leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          This is what your customers see.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-14">
          Kerb is a live consumer marketplace. Buyers search, browse, and enquire directly — no account walls, no platform inbox, no intermediation.
        </p>

        <div className="rounded-[10px] overflow-hidden border border-[#2A2A2E] mb-6">
          <ScreenChrome url="kerb.autos" />
          <Image src="/screenshots/hero.png" alt="Kerb — consumer homepage" width={1920} height={1080} className="w-full h-auto block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[10px] overflow-hidden border border-[#2A2A2E]">
            <ScreenChrome url="kerb.autos/search" />
            <Image src="/screenshots/listings.png" alt="Kerb — listing results" width={1920} height={1080} className="w-full h-auto block" />
          </div>
          <div className="rounded-[10px] overflow-hidden border border-[#2A2A2E]">
            <ScreenChrome url="kerb.autos/cars/porsche-911…" />
            <Image src="/screenshots/detail.png" alt="Kerb — car detail and enquiry" width={1920} height={1080} className="w-full h-auto block" />
          </div>
        </div>
      </section>

      {/* ── Charter ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-[72px]" id="charter">
        <SectionLabel>The Founding Charter</SectionLabel>
        <h2 className="text-[clamp(32px,3.5vw,48px)] font-normal text-white leading-[1.15] tracking-[-0.01em] max-w-[640px] mb-4">
          Three commitments. Written into every dealer agreement.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.75] max-w-[600px] mb-14">
          Not a marketing promise. Binding terms at signup — part of the operating agreement every dealer receives.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1C1C1E] border border-[#1C1C1E] rounded-lg overflow-hidden">
          {CHARTER.map(({ num, title, body }) => (
            <div key={num} className="bg-[#0A0A0F] p-11">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#C4C6CC] mb-5">{num}</p>
              <h3 className="text-[20px] font-medium text-white leading-[1.25] mb-3.5">{title}</h3>
              <p className="text-[15px] text-[#6E6E73] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Honest ── */}
      <section className="bg-[#F8F8FA] px-6 sm:px-10 lg:px-16 py-[72px] grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div>
          <SectionLabel light>Straight with you</SectionLabel>
          <h2 className="text-[clamp(32px,3vw,44px)] font-normal text-[#0A0A0F] leading-[1.2] tracking-[-0.01em]">
            We're building this. We're not pretending otherwise.
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-[16px] text-[#6E6E73] leading-[1.8]">
            Kerb is a new platform. We don't have ten years of traffic data and we won't claim to. What we have is a commitment to building something the industry actually needs — and the willingness to earn your trust over time, not demand it on day one.
          </p>
          <p className="text-[16px] text-[#6E6E73] leading-[1.8]">
            Listing is free at launch. When we begin charging — which we will — you'll have months of real data on what the platform delivered before you pay a penny. We grow when you grow.
          </p>
          <p className="text-[16px] text-[#0A0A0F] font-medium leading-[1.8]">
            If that sounds like the kind of platform you've been waiting for, list your cars today.
          </p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-[#F8F8FA] px-6 sm:px-10 lg:px-16 py-[72px]" id="pricing">
        <div className="max-w-[1040px]">
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-light text-[#0A0A0F] leading-[1.1] tracking-[-0.01em] mb-4">
            No surprises.
          </h2>
          <p className="text-[#A0714A] text-[13px] font-semibold tracking-[0.04em] mb-6">
            Billing starts with your first buyer enquiry
          </p>
          <p className="text-[17px] text-[#6E6E73] leading-[1.7] max-w-[520px] mb-14">
            List free. When your first buyer enquiry arrives, billing begins on the 1st of the following month — not immediately. If a buyer enquires in June, your first charge is 1 July. No enquiry, no charge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* SOLO */}
            <div className="bg-white border border-[#E5E5E7] rounded-xl p-6 flex flex-col">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-1">Solo</p>
              <p className="text-[13px] text-[#6E6E73] leading-[1.5] mb-5">Up to 20 cars in stock. The right plan for most independent dealers.</p>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A0714A] mb-1.5">Founding rate — first 50 dealers</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[22px] font-medium text-[#0A0A0F]">£</span>
                <span className="text-[44px] font-light text-[#0A0A0F] tracking-[-0.02em] leading-none">55</span>
                <span className="text-[15px] text-[#6E6E73]">/mo</span>
              </div>
              <p className="text-[13px] text-[#6E6E73] mb-5 pb-5 border-b border-[#E5E5E7]">
                Standard rate <span className="line-through text-[#A8AAB0]">£79/mo</span> after founding places are filled
              </p>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {SOLO_FEATURES.map(f => <FeatureCheck key={f} text={f} />)}
              </ul>
              <Link href="/dealers/register?plan=solo" className="block text-center bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[14px] font-semibold tracking-[0.04em] py-4 rounded-md transition-colors">
                Claim a founding place
              </Link>
            </div>

            {/* PRO */}
            <div className="bg-white border border-[#E5E5E7] rounded-xl p-6 flex flex-col">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73] mb-1">Pro</p>
              <p className="text-[13px] text-[#6E6E73] leading-[1.5] mb-5">More than 20 cars, or you want a showcase. No listing cap.</p>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A0714A] mb-1.5">Founding rate — first 50 dealers</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[22px] font-medium text-[#0A0A0F]">£</span>
                <span className="text-[44px] font-light text-[#0A0A0F] tracking-[-0.02em] leading-none">132</span>
                <span className="text-[15px] text-[#6E6E73]">/mo</span>
              </div>
              <p className="text-[13px] text-[#6E6E73] mb-5 pb-5 border-b border-[#E5E5E7]">
                Standard rate <span className="line-through text-[#A8AAB0]">£189/mo</span> after founding places are filled
              </p>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {PRO_FEATURES.map(f => <FeatureCheck key={f} text={f} />)}
              </ul>
              <Link href="/dealers/register?plan=pro" className="block text-center bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[14px] font-semibold tracking-[0.04em] py-4 rounded-md transition-colors">
                Claim a founding place
              </Link>
            </div>

          </div>

          <div className="flex flex-wrap gap-6">
            {PRICING_FOOTNOTES.map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] text-[#6E6E73] leading-[1.6] flex-1 min-w-[220px]">
                <span className="flex-shrink-0 mt-0.5 text-[#6E6E73]">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signup CTA ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-[72px] text-center" id="signup">
        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#C4C6CC] mb-5">List with Kerb</p>
        <h2 className="text-[clamp(36px,4vw,52px)] font-light text-white leading-[1.1] tracking-[-0.01em] mb-4">
          Get your inventory<br />in front of buyers.
        </h2>
        <p className="text-[17px] text-[#6E6E73] leading-[1.7] mb-13 max-w-lg mx-auto">
          No payment details required. Ltd companies verified instantly via Companies House. Sole traders verified via ID — takes minutes.
        </p>
        <Link
          href="/dealers/register"
          className="inline-block bg-[#A0714A] hover:bg-[#8A6040] text-white text-[15px] font-semibold tracking-[0.04em] px-10 py-4 rounded-md transition-colors"
        >
          Register your dealership →
        </Link>
        <p className="text-[13px] text-[#6E6E73] mt-4">No payment required. No commitment.</p>
      </section>

    </div>
  )
}
