import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { chargeForLeads, ACTIVATION_THRESHOLD } from '@/lib/billing'

export const dynamic = 'force-dynamic'

type Dealer = {
  id: string
  first_name: string
  email: string
  plan: 'solo' | 'pro' | null
  stripe_customer_id: string | null
  subscription_status: 'not_activated' | 'awaiting_payment_method' | 'active' | 'past_due'
  leads_invoiced_through: string | null
}

async function countEnquiries(
  supabase: ReturnType<typeof createServerClient>,
  dealerId: string,
  since: string | null,
): Promise<number> {
  let query = supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('dealer_id', dealerId)

  if (since) query = query.gt('created_at', since)

  const { count } = await query
  return count ?? 0
}

async function sendActivationEmail(resend: Resend, dealer: Dealer, baseUrl: string) {
  await resend.emails.send({
    from: 'Kerb <billing@kerb.autos>',
    to: dealer.email,
    subject: "You've had 3 real buyer enquiries — add a payment method to keep them coming",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
        <p style="font-size:18px;font-weight:600;margin-bottom:4px">Nice work, ${dealer.first_name}</p>
        <p style="color:#6E6E73;margin-top:0">You've had ${ACTIVATION_THRESHOLD} real buyer enquiries through Kerb — enough to prove it's not a fluke.</p>

        <p>Add a payment method to activate billing. From here, you're only ever charged in a month we actually send you an enquiry — nothing in a month we don't.</p>

        <a href="${baseUrl}/dashboard" style="display:inline-block;background:#0A0A0F;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;margin:16px 0">Go to my dashboard →</a>

        <p style="margin-top:32px;font-size:13px;color:#A8AAB0">Questions? Reply to this email.<br>Kerb — Real Kerb Appeal. <a href="${baseUrl}" style="color:#A8AAB0">${baseUrl.replace('https://', '')}</a></p>
      </div>
    `,
  })
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === 'sk_test_REPLACE_ME') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const resendKey = process.env.RESEND_API_KEY
  const stripe    = new Stripe(stripeKey)
  const resend    = resendKey ? new Resend(resendKey) : null
  const supabase  = createServerClient()
  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://kerb.autos'
  const now       = new Date()

  const { data: dealers, error } = await supabase
    .from('dealers')
    .select('id, first_name, email, plan, stripe_customer_id, subscription_status, leads_invoiced_through')
    .eq('status', 'approved')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 })
  }

  const results: { dealer_id: string; action: string }[] = []

  for (const dealer of (dealers ?? []) as Dealer[]) {
    try {
      if (dealer.subscription_status === 'not_activated') {
        const total = await countEnquiries(supabase, dealer.id, null)
        if (total >= ACTIVATION_THRESHOLD) {
          await supabase
            .from('dealers')
            .update({ subscription_status: 'awaiting_payment_method', billing_activated_at: now.toISOString() })
            .eq('id', dealer.id)
          if (resend) await sendActivationEmail(resend, dealer, baseUrl)
          results.push({ dealer_id: dealer.id, action: `activated_at_${total}_leads` })
        } else {
          results.push({ dealer_id: dealer.id, action: 'below_threshold' })
        }
        continue
      }

      if (dealer.subscription_status === 'awaiting_payment_method') {
        // Crossed the threshold but no card on file yet — resend the reminder,
        // nothing to invoice until they complete setup (see Stripe webhook).
        if (resend) await sendActivationEmail(resend, dealer, baseUrl)
        results.push({ dealer_id: dealer.id, action: 'reminder_sent' })
        continue
      }

      // active or past_due — bill for everything since the last invoice
      const leadCount = await countEnquiries(supabase, dealer.id, dealer.leads_invoiced_through)

      if (leadCount < 1) {
        results.push({ dealer_id: dealer.id, action: 'no_leads_no_charge' })
        continue
      }

      await chargeForLeads(
        stripe,
        dealer,
        leadCount,
        dealer.leads_invoiced_through ? new Date(dealer.leads_invoiced_through) : null,
        now,
      )

      await supabase
        .from('dealers')
        .update({ leads_invoiced_through: now.toISOString() })
        .eq('id', dealer.id)

      results.push({ dealer_id: dealer.id, action: `invoiced_${leadCount}_leads` })
    } catch (err) {
      console.error(`[Billing cron] Failed for dealer ${dealer.id}:`, err)
      results.push({ dealer_id: dealer.id, action: 'error' })
    }
  }

  return NextResponse.json({ processed: results.length, results, timestamp: now.toISOString() })
}
