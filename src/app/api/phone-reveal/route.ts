import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Same throttle shape as /api/enquiries — generous enough for a real buyer
// checking a couple of listings, tight enough to stop a script farming
// reveals (each one is a logged, potentially billable event).
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MINUTES = 10

function getClientIp(req: NextRequest): string {
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { dealer_id: string; listing_id?: string }
  const { dealer_id, listing_id } = body

  if (!dealer_id || !UUID_RE.test(dealer_id)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (listing_id && !UUID_RE.test(listing_id)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createServerClient()

  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('phone_reveal_events')
    .select('id', { count: 'exact', head: true })
    .eq('source_ip', ip)
    .gte('created_at', windowStart)

  if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
    return Response.json({ error: 'Too many requests — please try again shortly' }, { status: 429 })
  }

  // Number is only ever looked up here, server-side, on a tracked request —
  // never present in the page's server-rendered HTML.
  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('phone')
    .eq('id', dealer_id)
    .eq('status', 'approved')
    .single()

  if (error || !dealer) {
    return Response.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const { error: insertError } = await supabase.from('phone_reveal_events').insert({
    dealer_id,
    listing_id: listing_id ?? null,
    source_ip: ip,
  })

  if (insertError) {
    console.error('[PhoneReveal] Failed to log reveal event:', insertError)
  }

  return Response.json({ phone: dealer.phone })
}
