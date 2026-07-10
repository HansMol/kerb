'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle } from 'lucide-react'

export function BillingActivationBanner({
  dealerId,
  enquiryCount,
  isPaused,
}: {
  dealerId: string
  enquiryCount: number
  isPaused: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong — try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong — try again.')
      setLoading(false)
    }
  }

  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl px-6 py-5 ${isPaused ? 'bg-[#3A1414] border border-red-900/40' : 'bg-[#0A0A0F]'}`}>
      <div className="flex items-start gap-3">
        {isPaused
          ? <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          : <CreditCard size={18} className="text-[#C4C6CC] flex-shrink-0 mt-0.5" />
        }
        <div>
          {isPaused ? (
            <>
              <p className="text-[14px] font-semibold text-white">Your listings are paused</p>
              <p className="text-[13px] text-[#D9A8A8] mt-0.5">
                No payment method has been added, so buyers can&apos;t find your listings right now. Add a card and you&apos;re back live immediately.
              </p>
            </>
          ) : (
            <>
              <p className="text-[14px] font-semibold text-white">You&apos;ve had {enquiryCount} real buyer {enquiryCount === 1 ? 'enquiry' : 'enquiries'}</p>
              <p className="text-[13px] text-[#A8AAB0] mt-0.5">
                Add a payment method within 14 days to keep your listings live. You&apos;re only ever charged in a month we send you an enquiry.
              </p>
            </>
          )}
          {error && <p className="text-[12px] text-red-400 mt-1.5">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-[#C4C6CC] hover:bg-[#A8AAB0] disabled:opacity-60 text-[#0A0A0F] text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
      >
        {loading ? 'Loading…' : isPaused ? 'Reactivate my listings' : 'Add payment method'}
      </button>
    </div>
  )
}
