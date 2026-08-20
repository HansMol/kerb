import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
  const body = (await req.json()) as {
    dealer_slug: string
    dealer_name: string
    car_summary: string
    decision: 'yes' | 'no'
  }

  const { dealer_slug, dealer_name, car_summary, decision } = body

  if (!dealer_slug?.trim() || !dealer_name?.trim() || !car_summary?.trim()) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (decision !== 'yes' && decision !== 'no') {
    return Response.json({ error: 'Invalid decision' }, { status: 400 })
  }
  if (dealer_slug.length > 200 || dealer_name.length > 200 || car_summary.length > 300) {
    return Response.json({ error: 'Field too long' }, { status: 400 })
  }

  const supabase = createServerClient()
  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent') ?? null

  // ── Rate limit: same source can't spam responses ──
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('dealer_content_permissions')
    .select('id', { count: 'exact', head: true })
    .eq('source_ip', ip)
    .gte('created_at', windowStart)

  if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
    return Response.json({ error: 'Too many requests — please try again shortly' }, { status: 429 })
  }

  const { error: insertError } = await supabase.from('dealer_content_permissions').insert({
    dealer_slug,
    dealer_name,
    car_summary,
    decision,
    source_ip: ip,
    user_agent: userAgent,
  })

  if (insertError) {
    console.error('[ContentPermission] Failed to store response:', insertError)
    return Response.json({ error: 'Failed to record response' }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    const safeDealer = esc(dealer_name)
    const safeCar = esc(car_summary)
    await resend.emails.send({
      from: 'Kerb <enquiries@kerb.autos>',
      to: 'hans@kerb.autos',
      subject: `${decision === 'yes' ? '✅' : '❌'} ${dealer_name} — ${decision.toUpperCase()} on content permission`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
          <p style="font-size:18px;font-weight:600;margin-bottom:4px">${decision === 'yes' ? 'Dealer said YES' : 'Dealer said NO'}</p>
          <p style="color:#6E6E73;margin-top:0">via /preview/${esc(dealer_slug)}</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73;width:120px">Dealer</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;font-weight:500">${safeDealer}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Car</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${safeCar}</td></tr>
          </table>
        </div>
      `,
    }).catch((err) => console.error('[ContentPermission] Failed to notify:', err))
  }

  return Response.json({ success: true })
}
