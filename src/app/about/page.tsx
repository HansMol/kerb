import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Kerb',
  description: 'Kerb is a UK car marketplace built for dealers. List without platform fees or algorithm penalties. Buyers contact you directly.',
  openGraph: {
    title: 'About Kerb — Real Kerb Appeal',
    description: 'Kerb is a UK car marketplace built for dealers. List without platform fees or algorithm penalties. Buyers contact you directly.',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'What is Kerb?',
    answer: 'Kerb is a UK car marketplace. Dealers list cars without paying inflated platform fees or being penalised by algorithms that rank or restrict their listings. Buyers search, find a car they like, and contact the dealer directly.',
  },
  {
    question: 'Is Kerb free for buyers?',
    answer: 'Yes. Searching, browsing, and contacting dealers is completely free for buyers.',
  },
  {
    question: 'How are dealers verified on Kerb?',
    answer: 'Registered UK businesses are verified against Companies House — we confirm the company is active before the account is approved. Sole traders go through a manual review process.',
  },
  {
    question: 'What happens when I contact a dealer through Kerb?',
    answer: 'Your enquiry goes directly to the dealer by email or phone. Kerb facilitates the introduction — after that, you deal with the dealer directly. We are never in the middle of the transaction.',
  },
  {
    question: 'Why are there no "Featured" listings?',
    answer: 'Kerb does not allow dealers to pay for prominence. Every listing is shown on equal terms. What you see is based on the car, not on how much the dealer has spent with us.',
  },
  {
    question: 'Where is Kerb available?',
    answer: 'Kerb is launching nationally across the UK.',
  },
  {
    question: 'How do dealers join Kerb?',
    answer: "Dealers sign up at kerb.autos/dealers/join. Listing is free — no payment details required. Dealers only start paying once they've had 3 real buyer enquiries, and even then only in months a new enquiry actually arrives.",
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Kerb',
  url: 'https://kerb.autos',
  foundingDate: '2026',
  foundingLocation: {
    '@type': 'Place',
    addressRegion: 'Dorset',
    addressCountry: 'GB',
  },
  description: 'UK car marketplace. Dealers list without inflated fees or algorithm penalties. Buyers search and contact dealers directly.',
  slogan: 'Real Kerb Appeal.',
}

export default function AboutPage() {
  return (
    <>
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="org-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#A0714A] mb-3">About Kerb</p>
          <h1 className="text-4xl font-light text-[#0A0A0F] tracking-tight leading-snug mb-6">
            Running a dealership in 2026 is harder than it should be.
          </h1>
          <p className="text-[#6E6E73] text-lg leading-relaxed">
            Consumer confidence is soft. Good stock is expensive and hard to find. Energy, staffing, and premises costs keep rising. And on top of all that, the platforms dealers depend on to sell cars are charging more, labelling their cars as overpriced against benchmarks they don't control, and burying standard listings behind paid ads. Kerb exists to take that last part off the table.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E7] mb-14" />

        {/* Origin */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-[#0A0A0F] mb-5">How Kerb started</h2>
          <div className="space-y-4 text-[#6E6E73] leading-relaxed">
            <p>
              Dealers are under real pressure — rising operating costs, cautious buyers, stock that's harder and more expensive to source. The platforms they depend on to sell cars are quietly making things worse: fees going up, algorithms deciding which listings get seen, pricing penalties for dealers who know their own market better than any platform does.
            </p>
            <p>
              Buyers aren't getting a better deal either. More listings, more noise, harder to know who to trust.
            </p>
            <p>
              We built Kerb to fix both sides of that. A marketplace that doesn't squeeze dealers on fees or game their listings — and that gives buyers a cleaner, more trustworthy way to find a car.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E7] mb-14" />

        {/* What we do */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-[#0A0A0F] mb-8">What Kerb actually does</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-[#E5E5E7] rounded-md p-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#A0714A] mb-3">For dealers</p>
              <p className="text-[#0A0A0F] font-medium mb-3">List without the squeeze</p>
              <p className="text-[#6E6E73] text-sm leading-relaxed">
                No inflated platform fees. No algorithm deciding your car is priced too high and burying your listing. You list, buyers find you, and you deal with them directly. Free until you've had 3 real enquiries — after that, only in months we actually send you one.
              </p>
            </div>
            <div className="bg-white border border-[#E5E5E7] rounded-md p-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#A0714A] mb-3">For buyers</p>
              <p className="text-[#0A0A0F] font-medium mb-3">Find a car. Contact the dealer. Done.</p>
              <p className="text-[#6E6E73] text-sm leading-relaxed">
                Search by make, model, body type. Find a car you like. Contact the dealer directly — by email or phone. Kerb makes the introduction and gets out of the way. Free for buyers, always.
              </p>
            </div>
          </div>

          <div className="bg-[#F8F8FA] border border-[#E5E5E7] rounded-md p-6">
            <p className="text-[#0A0A0F] font-medium mb-2">No featured listings. No paid prominence.</p>
            <p className="text-[#6E6E73] text-sm leading-relaxed">
              Kerb does not sell placement. Every listing is shown on equal terms. What you see is based on the car — not on how much a dealer has spent with the platform.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E7] mb-14" />

        {/* Verified dealers */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-[#0A0A0F] mb-4">Verified dealers</h2>
          <p className="text-[#6E6E73] leading-relaxed mb-4">
            Every dealer on Kerb is verified before their first listing goes live. Verification works in two stages:
          </p>
          <ol className="space-y-3 list-none">
            <li className="flex gap-4">
              <span className="text-[#A0714A] font-semibold text-sm pt-0.5">01</span>
              <div>
                <p className="text-[#0A0A0F] font-medium text-sm">Companies House check</p>
                <p className="text-[#6E6E73] text-sm">Our integration with Companies House confirms that the dealer is a registered, active business in the UK.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-[#A0714A] font-semibold text-sm pt-0.5">02</span>
              <div>
                <p className="text-[#0A0A0F] font-medium text-sm">Identity verification</p>
                <p className="text-[#6E6E73] text-sm">Dealers go through an identity verification process via Stripe before their account is approved.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E7] mb-14" />

        {/* Vision */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-[#0A0A0F] mb-4">Where we're going</h2>
          <div className="space-y-4 text-[#6E6E73] leading-relaxed">
            <p>
              Real Kerb Appeal isn't about paid rankings or platform games. It's what happens when the right buyer finds the right car, from a dealer they can trust — with nothing in the middle extracting value from both sides.
            </p>
            <p>
              That's the marketplace we're building. Not the biggest — the most trusted. A place dealers choose because it doesn't squeeze them, and buyers return to because what they see is real.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E7] mb-14" />

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-[#0A0A0F] mb-8">Common questions</h2>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <div key={item.question} className="border-b border-[#E5E5E7] pb-6 last:border-0">
                <h3 className="font-semibold text-[#0A0A0F] mb-2 text-sm">{item.question}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0A0A0F] rounded-md p-8 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#A0714A] mb-3">Real Kerb Appeal.</p>
          <p className="text-white text-xl font-light mb-6">List your cars. Search the inventory.</p>
          <div className="flex gap-3 justify-center flex-wrap items-start">
            <div className="flex flex-col items-center gap-1.5">
              <Link
                href="/dealers/join"
                className="bg-[#A0714A] hover:bg-[#8A6040] text-white px-6 py-2.5 rounded text-sm font-medium transition-colors no-underline"
              >
                List your cars
              </Link>
              <p className="text-white/40 text-xs">Dealers only</p>
            </div>
            <Link
              href="/search"
              className="border border-white/20 hover:border-white/40 text-white px-6 py-2.5 rounded text-sm font-medium transition-colors no-underline"
            >
              Search cars
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
