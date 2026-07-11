'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'

interface Props {
  dealer_id: string
  listing_id?: string
  className?: string
  iconClassName?: string
}

export function PhoneReveal({ dealer_id, listing_id, className, iconClassName }: Props) {
  const [phone, setPhone]   = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function reveal() {
    if (status === 'loading' || phone) return
    setStatus('loading')

    try {
      const res = await fetch('/api/phone-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_id, listing_id }),
      })

      if (res.ok) {
        const data = await res.json() as { phone: string }
        setPhone(data.phone)
        setStatus('idle')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (phone) {
    return (
      <a href={`tel:${phone}`} className={className}>
        <Phone size={14} className={iconClassName} />
        {phone}
      </a>
    )
  }

  return (
    <button type="button" onClick={reveal} disabled={status === 'loading'} className={className}>
      <Phone size={14} className={iconClassName} />
      {status === 'loading' ? 'Loading…' : status === 'error' ? 'Try again' : 'Show number'}
    </button>
  )
}
