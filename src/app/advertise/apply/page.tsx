'use client'

import { useState } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function AdvertiseApplyPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    const form = e.currentTarget
    const data = {
      businessName:   (form.elements.namedItem('businessName')   as HTMLInputElement).value,
      website:        (form.elements.namedItem('website')         as HTMLInputElement).value,
      contactName:    (form.elements.namedItem('contactName')     as HTMLInputElement).value,
      email:          (form.elements.namedItem('email')           as HTMLInputElement).value,
      phone:          (form.elements.namedItem('phone')           as HTMLInputElement).value,
      whatTheyOffer:  (form.elements.namedItem('whatTheyOffer')   as HTMLTextAreaElement).value,
      whyRelevant:    (form.elements.namedItem('whyRelevant')     as HTMLTextAreaElement).value,
    }

    const res = await fetch('/api/advertisers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      const body = await res.json().catch(() => ({}))
      setError((body as { error?: string }).error ?? 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center px-6">
        <div className="max-w-[480px] text-center">
          <div className="w-12 h-12 rounded-full bg-[#0A0A0F] flex items-center justify-center mx-auto mb-6">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M1.5 8l6 6L18.5 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold text-[#0A0A0F] mb-3">Application received.</h1>
          <p className="text-[16px] text-[#6E6E73] leading-[1.75] mb-8">
            We review every application personally and will come back to you within one working day.
          </p>
          <Link href="/" className="text-[14px] font-semibold text-[#A0714A] hover:text-[#8A6040] transition-colors">
            Back to Kerb →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <div className="max-w-[640px] mx-auto px-6 py-20">

        <Link href="/advertise" className="text-[13px] text-[#6E6E73] hover:text-[#0A0A0F] transition-colors flex items-center gap-1.5 mb-10">
          ← Advertising on Kerb
        </Link>

        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#A0714A] mb-3">Apply to advertise</p>
        <h1 className="text-[clamp(28px,3vw,40px)] font-light text-[#0A0A0F] leading-[1.15] tracking-[-0.01em] mb-3">
          Tell us about your business.
        </h1>
        <p className="text-[15px] text-[#6E6E73] leading-[1.75] mb-10">
          We review every application. If it is a good fit for Kerb buyers, we will be in touch within one working day to discuss placement and get you live.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="businessName" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">Business name</label>
              <input
                id="businessName" name="businessName" type="text" required maxLength={200}
                className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors"
                placeholder="Acme Car Care Ltd"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">Website</label>
              <input
                id="website" name="website" type="url" required maxLength={500}
                className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors"
                placeholder="https://acmecarcare.co.uk"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contactName" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">Your name</label>
              <input
                id="contactName" name="contactName" type="text" required maxLength={200}
                className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">Email</label>
              <input
                id="email" name="email" type="email" required maxLength={320}
                className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors"
                placeholder="jane@acmecarcare.co.uk"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">
              Phone <span className="text-[#A8AAB0] font-normal">(optional)</span>
            </label>
            <input
              id="phone" name="phone" type="tel" maxLength={30}
              className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors"
              placeholder="+44 7700 000000"
            />
          </div>

          <div>
            <label htmlFor="whatTheyOffer" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">What does your business offer?</label>
            <textarea
              id="whatTheyOffer" name="whatTheyOffer" required maxLength={2000} rows={4}
              className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors resize-none"
              placeholder="We provide dry ice cleaning and graphene anti-corrosion coating for classic and prestige vehicles…"
            />
          </div>

          <div>
            <label htmlFor="whyRelevant" className="block text-[13px] font-semibold text-[#0A0A0F] mb-1.5">
              Why is this relevant to Kerb buyers? <span className="text-[#A8AAB0] font-normal">(optional)</span>
            </label>
            <textarea
              id="whyRelevant" name="whyRelevant" maxLength={2000} rows={3}
              className="w-full border border-[#D1D1D6] rounded-md px-4 py-3 text-[15px] text-[#0A0A0F] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:border-[#0A0A0F] transition-colors resize-none"
              placeholder="Classic car buyers often want to protect their purchase before they even drive it home…"
            />
          </div>

          {status === 'error' && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-[#0A0A0F] hover:bg-[#1C1C1E] disabled:opacity-50 text-white text-[14px] font-semibold tracking-[0.04em] py-4 rounded-md transition-colors"
          >
            {status === 'submitting' ? 'Sending…' : 'Submit application →'}
          </button>

          <p className="text-[12px] text-[#A8AAB0] text-center leading-[1.6]">
            No commitment. We will review your application and come back to you directly.
          </p>

        </form>
      </div>
    </div>
  )
}
