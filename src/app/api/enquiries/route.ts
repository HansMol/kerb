import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Enquiries now trigger the "no leads, no pay" billing engine, so an
// unthrottled bot here can falsely activate a dealer's billing — not just
// spam their inbox. Keep this generous enough for a real buyer messaging
// a few dealers, tight enough to stop a script.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MINUTES = 10

function getClientIp(req: NextRequest): string {
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    dealer_id: string
    listing_id: string
    listing_title: string
    name: string
    email: string
    phone?: string
    message: string
  }

  const { dealer_id, listing_id, listing_title, name, email, phone, message } = body

  if (!dealer_id || !listing_id || !listing_title || !name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!UUID_RE.test(dealer_id) || !UUID_RE.test(listing_id)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Invalid fields' }, { status: 400 })
  }

  if (name.length > 200 || email.length > 320 || message.length > 5000 || (phone && phone.length > 30)) {
    return Response.json({ error: 'Field too long' }, { status: 400 })
  }

  const supabase = createServerClient()

  // ── Rate limit: block bursts from the same source before they reach billing ──

  const ip = getClientIp(req)
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('source_ip', ip)
    .gte('created_at', windowStart)

  if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
    return Response.json({ error: 'Too many enquiries — please try again shortly' }, { status: 429 })
  }

  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('email, first_name, last_name')
    .eq('id', dealer_id)
    .single()

  if (error || !dealer) {
    return Response.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('[Enquiry] RESEND_API_KEY not set')
    return Response.json({ error: 'Email service not configured' }, { status: 503 })
  }

  const resend = new Resend(resendKey)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://kerb.autos'
  const listingUrl = `${baseUrl}/cars/${listing_id}`
  const from = 'Kerb <enquiries@kerb.autos>'

  const safeName    = esc(name)
  const safeEmail   = esc(email)
  const safePhone   = phone ? esc(phone) : null
  const safeMessage = esc(message)
  const safeTitle   = esc(String(listing_title))

  // ── Persist the enquiry — the monthly billing job counts against this ──────

  const { error: insertError } = await supabase.from('enquiries').insert({
    dealer_id,
    listing_id,
    name,
    email,
    phone: phone ?? null,
    message,
    source_ip: ip,
  })

  if (insertError) {
    console.error('[Enquiry] Failed to store enquiry:', insertError)
    return Response.json({ error: 'Failed to record enquiry' }, { status: 500 })
  }

  // ── Send enquiry email to dealer ──────────────────────────────────────────

  await resend.emails.send({
    from,
    to: dealer.email,
    replyTo: email,
    subject: `New enquiry — ${listing_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
        <p style="font-size:18px;font-weight:600;margin-bottom:4px">New buyer enquiry</p>
        <p style="color:#6E6E73;margin-top:0">via Kerb</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73;width:120px">Vehicle</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;font-weight:500"><a href="${listingUrl}" style="color:#0A0A0F">${safeTitle}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">From</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;font-weight:500">${safeName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Email</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="mailto:${safeEmail}" style="color:#0A0A0F">${safeEmail}</a></td></tr>
          ${safePhone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Phone</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="tel:${safePhone}" style="color:#0A0A0F">${safePhone}</a></td></tr>` : ''}
        </table>

        <p style="color:#6E6E73;font-size:13px;margin-bottom:4px">Message</p>
        <p style="white-space:pre-wrap;background:#F8F8FA;border:1px solid #E5E5E7;border-radius:6px;padding:16px;margin:0">${safeMessage}</p>

        <p style="margin-top:32px;font-size:13px;color:#A8AAB0">Reply directly to this email to respond to ${safeName}.<br>Kerb — Real Kerb Appeal. <a href="${baseUrl}" style="color:#A8AAB0">${baseUrl.replace('https://', '')}</a></p>
      </div>
    `,
  })

  return Response.json({ success: true })
}
