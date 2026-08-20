'use client'

import { useState } from 'react'

export function PermissionButtons({
  dealerSlug,
  dealerName,
  carSummary,
}: {
  dealerSlug: string
  dealerName: string
  carSummary: string
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'yes' | 'no' | 'error'>('idle')

  async function respond(decision: 'yes' | 'no') {
    setStatus('sending')
    try {
      const res = await fetch('/api/content-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_slug: dealerSlug, dealer_name: dealerName, car_summary: carSummary, decision }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus(decision)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'yes') {
    return (
      <p className="text-[16px] font-medium text-ink">
        Thanks — we&rsquo;ve got your yes. We&rsquo;ll let you know once we&rsquo;ve posted your
        content.
      </p>
    )
  }
  if (status === 'no') {
    return (
      <p className="text-[16px] font-medium text-ink">
        No problem — we won&rsquo;t feature this car. Thanks for letting us know.
      </p>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => respond('yes')}
          disabled={status === 'sending'}
          className="rounded-md bg-[#0A0A0F] px-8 py-3.5 text-[14px] font-semibold tracking-[0.02em] text-white ring-2 ring-copper ring-offset-2 ring-offset-white transition-colors hover:bg-[#1C1C1E] disabled:opacity-50"
        >
          Yes, feature it
        </button>
        <button
          onClick={() => respond('no')}
          disabled={status === 'sending'}
          className="rounded-md border border-silver-line bg-white px-8 py-3.5 text-[14px] font-semibold tracking-[0.02em] text-stone transition-colors hover:border-[#C4C6CC] hover:text-ink disabled:opacity-50"
        >
          No thanks
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-3 text-[13px] text-stone">
          That didn&rsquo;t go through — please try again, or just reply to the email.
        </p>
      )}
    </div>
  )
}
