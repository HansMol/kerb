import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { getDealerPreview } from '@/lib/dealer-previews'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MINUTES = 10

// Every dealer acknowledgement copies Hans, so he has a real thread with the
// dealer rather than only a notification to himself (his call, 22 Sep 2026).
const HANS = 'hans@kerb.autos'

// Autotrader writes the literal string "private" into the email field where a
// dealer publishes no address, and 68 of round 2's 474 dealers carry it. It
// reads like a value and is not one, so the shape is tested rather than
// emptiness — the same trap that once overstated the contactable list.
function isRealEmail(value: string | undefined): value is string {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

function dealerEmailFor(slug: string, carSummary: string): string | null {
  const preview = getDealerPreview(slug)
  if (!preview) return null
  const match = preview.cars.find((c) =>
    carSummary.toLowerCase().includes(`${c.make} ${c.model}`.toLowerCase()),
  )
  const email = (match ?? preview.cars[0])?.dealer_email
  return isRealEmail(email) ? email.trim() : null
}

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

  // ── Has this dealer already said yes to this car? ──
  // A double-tap on the button, or a second visit to the page, must not put a
  // second "thanks for your yes" in the dealer's inbox. The row is still
  // written either way; only the acknowledgement is suppressed.
  const { count: priorYes } = await supabase
    .from('dealer_content_permissions')
    .select('id', { count: 'exact', head: true })
    .eq('dealer_slug', dealer_slug)
    .eq('car_summary', car_summary)
    .eq('decision', 'yes')

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

    // ── The dealer's own acknowledgement ──
    // Until 22 Sep 2026 the dealer received nothing at all: the page said
    // "we'll let you know once we've posted your content" and the only mail
    // went to Hans. That line is a promise, so this closes the first half of
    // it while they are still on the page.
    //
    // Sent on a yes only. A dealer who declines has finished the conversation
    // and another email is not an acknowledgement, it is a follow-up.
    const dealerEmail = decision === 'yes' ? dealerEmailFor(dealer_slug, car_summary) : null

    if (dealerEmail && !(priorYes ?? 0)) {
      await resend.emails.send({
        from: 'Kerb <enquiries@kerb.autos>',
        to: dealerEmail,
        cc: HANS,
        // enquiries@ is a sending address; without this a dealer's reply goes
        // nowhere anybody reads.
        replyTo: HANS,
        subject: `Thanks — we've got your yes`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F;line-height:1.55">
          <p>Hi ${safeDealer} team,</p>
          <p>Thanks for the go-ahead on your ${safeCar}. That is all we needed.</p>
          <p>We will build the post from the photos already on your listing, so there
          is nothing further for you to do and no cost. When it goes up I will email
          you the link — it will credit ${safeDealer} by name, tag your profile and
          link back to your site.</p>
          <p>If you would rather we featured a different car, or you change your mind
          at any point, just reply to this and we will pull it.</p>
          <p style="margin-bottom:4px">Hans</p>
          <p style="margin:0;color:#6E6E73">Kerb — kerb.autos<br>07503 576689</p>
        </div>
      `,
      }).catch((err) => console.error('[ContentPermission] Failed to acknowledge dealer:', err))
    } else if (decision === 'yes' && !dealerEmail) {
      // Not an error: some dealers genuinely publish no address. Logged so the
      // silence is visible rather than assumed.
      console.warn(`[ContentPermission] No usable email for ${dealer_slug} — no acknowledgement sent`)
    }
  }

  return Response.json({ success: true })
}
