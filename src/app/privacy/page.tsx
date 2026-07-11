import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Kerb collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[740px] mx-auto px-6 sm:px-10 py-24 sm:py-32">

        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#A8AAB0] mb-4">Legal</p>
        <h1 className="text-[clamp(32px,4vw,48px)] font-light leading-[1.15] text-[#0A0A0F] tracking-[-0.01em] mb-3">Privacy Policy</h1>
        <p className="text-sm text-[#6E6E73] mb-14 pb-10 border-b border-[#E5E5E7]">
          Kerb is operated by Ice Clean Works Ltd &nbsp;·&nbsp; Last updated: 11 July 2026 &nbsp;·&nbsp; Version 1.1
        </p>

        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          This policy explains how Ice Clean Works Ltd (company number 17027354), operating the Kerb platform (&quot;Kerb&quot;, &quot;we&quot;, &quot;us&quot;), collects, uses, and protects personal data when you use kerb.autos. We are the data controller for personal data processed under this policy.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">1. What data we collect</h2>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">Buyers</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Buyers can browse all listings and contact dealers without creating an account. When you submit an enquiry, we collect the name, email address, and phone number you provide. This information is forwarded directly to the relevant dealer and is not retained by Kerb beyond standard server logging (30 days).
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">Dealers</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          When you register as a dealer we collect your name, business name, Companies House registration number, email address, phone number, and billing details (processed by Stripe — we do not store card numbers). We also collect information about your listings and account activity.
        </p>

        <h3 className="text-base font-semibold text-[#0A0A0F] mt-7 mb-2.5">Usage data</h3>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We collect standard server logs (IP address, browser type, pages visited, timestamps) and use Google Analytics 4 and Microsoft Clarity to understand how people use the platform. This data is aggregated and used only to improve the service.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">2. How we use your data</h2>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To operate the platform and provide the services described in our <Link href="/terms" className="text-[#0A0A0F] underline underline-offset-2">Terms of Service</Link></li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To verify dealer registrations via Companies House</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To process subscription payments via Stripe</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To send transactional emails (enquiry notifications, billing receipts, platform updates)</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To detect and prevent fraud or misuse of the platform</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">To improve the platform through anonymised usage analytics</li>
        </ul>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We do not sell your personal data. We do not use your data for advertising profiling. We do not share your data with third parties except as described in section 3.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">3. Third-party processors</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We use the following third-party services to operate the platform. Each is bound by a data processing agreement:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Supabase</strong> — database hosting (EU region)</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Clerk</strong> — dealer authentication</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Stripe</strong> — payment processing</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Resend</strong> — transactional email delivery</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Cloudflare</strong> — hosting and traffic routing</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Google Analytics 4</strong> — anonymised usage analytics</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Microsoft Clarity</strong> — anonymised heatmap and session analytics</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Companies House Public Data API</strong> — business verification</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">4. Legal basis for processing</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We process personal data on the following legal bases under UK GDPR:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Contract</strong> — to provide the services you have signed up for as a dealer</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Legitimate interests</strong> — fraud prevention, platform security, usage analytics</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]"><strong>Consent</strong> — where you have opted in to marketing communications (you may withdraw at any time)</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">5. Data retention</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          Dealer account data is retained for the duration of your account and for 6 years after closure (to comply with UK tax and legal requirements). Buyer enquiry data passed to dealers is not retained by Kerb beyond 30 days in server logs. You may request deletion at any time — see section 6.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">6. Your rights</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">Under UK GDPR you have the right to:</p>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Access the personal data we hold about you</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Correct inaccurate data</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Request deletion of your data (subject to legal retention requirements)</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Request a portable export of your data</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Object to processing based on legitimate interests</li>
          <li className="text-base leading-[1.8] text-[#3A3A3E]">Withdraw consent where processing is based on consent</li>
        </ul>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          To exercise any of these rights, email <a href="mailto:hello@kerb.autos" className="text-[#0A0A0F] underline underline-offset-2">hello@kerb.autos</a>. We will respond within 30 days. If you are unsatisfied with our response you have the right to complain to the Information Commissioner&apos;s Office (ico.org.uk).
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">7. Cookies</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We use strictly necessary cookies to operate the platform (session management, authentication). We also use analytics cookies (Google Analytics, Microsoft Clarity) to understand usage. Analytics cookies are non-essential — you may decline them via your browser settings.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">8. Changes to this policy</h2>
        <p className="text-base leading-[1.8] text-[#3A3A3E] mb-4">
          We may update this policy from time to time. Where changes are material we will notify dealers by email. The current version is always available at{' '}
          <Link href="/privacy" className="text-[#0A0A0F] underline underline-offset-2">kerb.autos/privacy</Link>.
        </p>

        <h2 className="text-xl font-semibold text-[#0A0A0F] mt-12 mb-4 leading-snug">9. Contact</h2>
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
