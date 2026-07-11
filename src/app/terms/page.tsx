import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Dealer terms of service for Kerb — including the three founding commitments.',
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F8F8FA] border-l-[3px] border-[#0A0A0F] px-6 py-5 my-7 rounded-r-md">
      <p className="text-[#0A0A0F] font-medium leading-relaxed m-0">{children}</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[740px] mx-auto px-6 sm:px-10 py-24 sm:py-32">

        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#A8AAB0] mb-4">Legal</p>
        <h1 className="text-[clamp(32px,4vw,48px)] font-light leading-[1.15] text-[#0A0A0F] tracking-[-0.01em] mb-3">Terms of Service</h1>
        <p className="text-sm text-[#6E6E73] mb-14 pb-10 border-b border-[#E5E5E7]">
          Kerb is operated by Ice Clean Works Ltd &nbsp;·&nbsp; Last updated: 11 July 2026 &nbsp;·&nbsp; Version 1.3
        </p>

        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          These terms govern your use of the Kerb platform, whether as a buyer browsing and enquiring about vehicles, or as a dealer registering to list inventory. By using the platform you agree to these terms.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">The Three Founding Commitments</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Every dealer who registers with Kerb enters into an agreement that includes these three commitments. They are not marketing promises — they are binding contractual terms. They cannot be removed or watered down by a product update, a policy revision, or a change in commercial direction.
        </p>

        <Callout>Commitment 01 — Lead Ownership{'\n'}Every buyer enquiry is delivered directly to you. Kerb does not intercept, qualify, re-route, hold, or monetise your leads. Ever.</Callout>
        <Callout>Commitment 02 — Search Integrity{'\n'}Organic search results are ordered by relevance and recency only. No dealer can pay to rank above another. Spotlight — a dealer-curated showcase on a dealer&apos;s own profile page — is the only paid visibility feature and it never affects search position.</Callout>
        <Callout>Commitment 03 — Exit With Your Data{'\n'}Your listing history, enquiry records, and contact data belong to you. You may request a full export at any time. Leaving Kerb costs nothing and loses nothing.</Callout>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">1. About Kerb</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Kerb is a UK vehicle marketplace, currently operated as a service of Ice Clean Works Ltd (company number 17027354). We connect buyers directly with dealers. We do not buy, sell, value, or intermediate the sale of any vehicle. We are not a party to any transaction between a buyer and a dealer.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">2. Dealer terms</h2>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.1 Eligibility</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          To list vehicles you must be a UK-registered business. We verify registration via Companies House. You must provide accurate details at registration and keep them current. Sole traders and partnerships registered with HMRC are eligible on written application.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.2 Listing accuracy</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          You are responsible for ensuring every listing is accurate, current, and compliant with the Consumer Rights Act 2015, the Consumer Protection from Unfair Trading Regulations 2008, and all other applicable UK consumer law. Mileage, condition, service history, and MOT status must be truthful. Listings must be removed or updated promptly when a vehicle is sold or details change.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.3 Lead ownership</h3>
        <Callout>Every buyer enquiry is delivered directly to you. Kerb does not intercept, qualify, re-route, hold, or monetise your leads. This is a founding commitment and is not subject to change by product update or policy revision.</Callout>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.4 Search integrity</h3>
        <Callout>Organic search results on Kerb are ordered by relevance and recency only. No dealer can pay to rank above another dealer in search results. This rule applies permanently and without exception.</Callout>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We do not apply algorithmic badges, price scores, or performance labels to your listings. Your professional judgement on pricing is not publicly graded by the platform.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.5 Spotlight</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Dealers on a paid subscription may designate up to three live listings as &quot;Spotlight&quot; vehicles. Spotlighted vehicles are displayed prominently on the dealer&apos;s own profile page and may be featured in a dedicated Dealer Spotlight section on the Kerb homepage.
        </p>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Spotlight status has no effect whatsoever on a vehicle&apos;s position in any search result. It is a dealer-controlled showcase on the dealer&apos;s own profile only. Spotlight is not a paid search ranking, a placement fee, or an advertisement within the search index.
        </p>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Spotlight is automatically removed from any listing whose status changes to sold, archived, or draft. A dealer may remove Spotlight designation at any time.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.6 Subscription and billing</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Listing is free. No payment details are required at registration. You will not be invoiced in any calendar month unless you received at least one buyer enquiry through the platform during that month — this applies for as long as you use Kerb, not only during an initial period. Before your first invoice you will need at least three buyer enquiries in total; this one-off threshold does not apply again to any later invoice, which each require only one enquiry in the relevant month. Every invoice states the number of enquiries delivered in that period. No charge will ever be applied for a month in which no enquiry was delivered.
        </p>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Once you reach three buyer enquiries, you have 14 days to add a payment method before your listings are paused from buyer search — this is not a charge or a penalty, and nothing already delivered is clawed back. Adding a payment method at any point reactivates your listings immediately and automatically, with no review or delay.
        </p>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          A &quot;buyer enquiry&quot; is a message or phone-number reveal submitted through Kerb and delivered to your dealer account, protected by basic anti-spam and rate-limiting controls. Kerb does not assess, qualify, score, or otherwise vet the seriousness, intent, or genuineness of any individual enquiry beyond these controls, and does not guarantee that any enquiry will result in a viewing, a negotiation, or a sale. Responding to and converting enquiries is your responsibility. Fees are charged for the delivery of enquiries meeting this definition and are not refundable on the basis of an enquiry&apos;s quality, seriousness, or outcome.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.7 Your data</h3>
        <Callout>Your listing history, enquiry records, and contact data belong to you. You may request a full export at any time by emailing hello@kerb.autos. Leaving Kerb costs nothing and loses nothing — your data is returned to you in full.</Callout>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.8 Prohibited conduct</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">You must not:</p>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li className="text-base leading-[1.8] text-[#3A3A3E]">List vehicles you do not own or have authority to sell</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Publish misleading, false, or fraudulent listings</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Use the platform to collect buyer data for purposes other than responding to genuine enquiries about listed vehicles</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Attempt to circumvent the platform&apos;s verification or access controls</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">List vehicles that are subject to a finance agreement without disclosing that interest</li>
        </ul>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">2.9 Termination</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We may suspend or remove a dealer account where there is evidence of fraudulent, misleading, or harmful conduct, or persistent breach of these terms. We will give notice and an opportunity to respond except where immediate action is required to protect buyers or the platform.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">3. Buyer terms</h2>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">3.1 No account required</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Buyers do not need to create an account to search listings, view vehicle details, or contact a dealer. We do not gate access behind registration. Where a buyer chooses to submit an enquiry form, the information submitted is sent directly to the relevant dealer and is not retained by Kerb beyond standard server logging.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">3.2 Buyer responsibility</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Buyers are responsible for conducting their own due diligence before purchasing any vehicle, including but not limited to independent inspection, vehicle history checks, and finance checks. Kerb is not a party to any sale and makes no representation about the condition, history, title, or value of any listed vehicle.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">3.3 Disputes</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Any dispute arising from a vehicle purchase is between the buyer and the dealer. Kerb is not liable for the outcome of any transaction. Buyers retain all statutory rights under UK consumer law against the selling dealer.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">4. Intellectual property</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          The Kerb name, wordmark, and platform design are the property of Ice Clean Works Ltd. Dealers grant Kerb a non-exclusive licence to display listing content (text, photos, specifications) on the platform for the purpose of presenting the listing to buyers. This licence ends when the listing is removed or the dealer account is closed.
        </p>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Dealers also grant Kerb a non-exclusive licence to use listing content — including photos — in Kerb&apos;s own marketing, including social media, to promote the listing and the Kerb platform. No dealer is paid for this use, and no dealer is identified in the resulting post — a buyer only learns which dealer holds the car by clicking through to its listing on Kerb. This licence ends when the listing is removed or the dealer account is closed, except that marketing material already published before that point is not required to be taken down retrospectively.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">5. Limitation of liability</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Kerb provides the platform on an &quot;as is&quot; basis. We do not guarantee uninterrupted availability. To the maximum extent permitted by UK law, Ice Clean Works Ltd is not liable for any indirect, consequential, or incidental loss arising from use of the platform. Our total liability to any dealer in any 12-month period shall not exceed the subscription fees paid by that dealer in the same period.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">6. Changes to these terms</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We may update these terms from time to time. Where changes are material, we will give dealers not less than 30 days&apos; notice by email before the changes take effect. Continued use of the platform after the effective date constitutes acceptance. The current version of these terms is always available at{' '}
          <Link href="/terms" className="text-[#0A0A0F] underline underline-offset-2">kerb.autos/terms</Link>.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">7. Governing law</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          These terms are governed by the law of England and Wales. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">8. Contact</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Kerb is a service of Ice Clean Works Ltd<br />
          <a href="mailto:hello@kerb.autos" className="text-[#0A0A0F] underline underline-offset-2">hello@kerb.autos</a><br />
          Company number 17027354, registered in England and Wales<br />
          3rd Floor, 86-90 Paul Street, London, England, EC2A 4NE
        </p>

      </main>
    </div>
  )
}
