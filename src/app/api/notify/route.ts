import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function readField(params: URLSearchParams | Record<string, unknown>, key: string): string | null {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''

  let fields: URLSearchParams | Record<string, unknown>

  if (contentType.includes('application/json')) {
    fields = await req.json()
  } else {
    const text = await req.text()
    fields = new URLSearchParams(text)
  }

  const email = readField(fields, 'email')
  const make = readField(fields, 'make')
  const model = readField(fields, 'model')
  const area = readField(fields, 'area')
  const maxPriceRaw = readField(fields, 'max_price')
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null

  if (!email || !email.includes('@')) {
    return NextResponse.redirect(new URL('/?notify=invalid', req.url))
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId || !process.env.RESEND_API_KEY) {
    return NextResponse.redirect(new URL('/?notify=error', req.url))
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId,
  })

  // ── Structured waitlist entry — what buyers are actually looking for ───────
  // Best-effort: a failure here shouldn't block the email signup above.
  const supabase = createServerClient()
  const { error: waitlistError } = await supabase.from('waitlist_entries').insert({
    email,
    make,
    model,
    max_price: maxPrice !== null && !Number.isNaN(maxPrice) ? maxPrice : null,
    area,
  })

  if (waitlistError) {
    console.error('[Notify] Failed to store waitlist entry:', waitlistError)
  }

  return NextResponse.redirect(new URL('/?notify=ok', req.url))
}
