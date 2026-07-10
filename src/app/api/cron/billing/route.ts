import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { chargeForLeads, ACTIVATION_THRESHOLD, PAUSE_AFTER_DAYS, REVIEW_FLAG_AFTER_DAYS, daysSince } from '@/lib/billing'

export const dynamic = 'force-dynamic'

type Dealer = {
  id: string
  first_name: string
  business_name: string
  email: string
  plan: 'solo' | 'pro' | null
  stripe_customer_id: string | null
  subscription_status: 'not_activated' | 'awaiting_payment_method' | 'active' | 'past_due'
  billing_activated_at: string | null
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

function emailFooter(baseUrl: string): string {
  return `<p style="margin-top:32px;font-size:13px;color:#A8AAB0">Questions? Reply to this email.<br>Kerb — Real Kerb Appeal. <a href="${baseUrl}" style="color:#A8AAB0">${baseUrl.replace('https://', '')}</a></p>`
}

function dashboardButton(baseUrl: string, label: string): string {
  return `<a href="${baseUrl}/dashboard" style="display:inline-block;background:#0A0A0F;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;margin:16px 0">${label}</a>`
}

// First time a dealer crosses ACTIVATION_THRESHOLD — still within the
// PAUSE_AFTER_DAYS grace window, listings unaffected.
async function sendActivationEmail(resend: Resend, dealer: Dealer, leadCount: number, baseUrl: string) {
  await resend.emails.send({
    from: 'Kerb <billing@kerb.autos>',
    to: dealer.email,
    subject: 'Real buyers want your cars — add a payment method to keep them coming',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
        <p style="font-size:18px;font-weight:600;margin-bottom:4px">Nice work, ${dealer.first_name}</p>
        <p style="color:#6E6E73;margin-top:0">You've had ${leadCount} real buyer ${leadCount === 1 ? 'enquiry' : 'enquiries'} through Kerb.</p>

        <p>You've proven your cars have Real Kerb Appeal — real buyers want your cars. Add a payment method within ${PAUSE_AFTER_DAYS} days to keep your listings live and the enquiries coming.</p>

        ${dashboardButton(baseUrl, 'Go to my dashboard →')}

        <p style="color:#6E6E73">Once you're set up, billing stays simple: you're only ever charged in a month we actually send you an enquiry — nothing in a month we don't.</p>

        <p style="color:#6E6E73">If we don't hear from you within ${PAUSE_AFTER_DAYS} days, we'll pause your listings until you do. Nothing's lost — add a card any time and you're back live immediately.</p>

        ${emailFooter(baseUrl)}
      </div>
    `,
  })
}

// Past PAUSE_AFTER_DAYS with no card — listings are actually hidden from
// buyers now (see public_listings view), tone shifts from pitch to notice.
async function sendPausedEmail(resend: Resend, dealer: Dealer, baseUrl: string) {
  await resend.emails.send({
    from: 'Kerb <billing@kerb.autos>',
    to: dealer.email,
    subject: 'Your listings are paused — add a payment method to go live again',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
        <p style="font-size:18px;font-weight:600;margin-bottom:4px">Hi ${dealer.first_name}</p>
        <p style="color:#6E6E73;margin-top:0">Your listings on Kerb are currently paused — no payment method has been added yet, so buyers can't find them right now.</p>

        <p>Add a card and you're back live immediately. No review, no delay.</p>

        ${dashboardButton(baseUrl, 'Reactivate my listings →')}

        <p style="color:#6E6E73">You're only ever charged in a month we actually send you an enquiry — nothing in a month we don't.</p>

        ${emailFooter(baseUrl)}
      </div>
    `,
  })
}

// Internal notice to Hans — not automated removal, just a prompt to decide.
async function sendReviewFlagEmail(resend: Resend, dealer: Dealer, days: number, baseUrl: string) {
  await resend.emails.send({
    from: 'Kerb <billing@kerb.autos>',
    to: 'hans@kerb.autos',
    subject: `Dealer paused ${days} days — ${dealer.business_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
        <p style="font-size:16px;font-weight:600">${dealer.business_name}</p>
        <p style="color:#6E6E73">Crossed ${ACTIVATION_THRESHOLD} leads and has been awaiting a payment method for ${days} days (past the ${REVIEW_FLAG_AFTER_DAYS}-day review mark). Listings have been paused from search since day ${PAUSE_AFTER_DAYS}. Not auto-removed — worth a manual look.</p>
        <p style="color:#6E6E73">Dealer email: ${dealer.email}</p>
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
    .select('id, first_name, business_name, email, plan, stripe_customer_id, subscription_status, billing_activated_at, leads_invoiced_through')
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
          if (resend) await sendActivationEmail(resend, dealer, total, baseUrl)
          results.push({ dealer_id: dealer.id, action: `activated_at_${total}_leads` })
        } else {
          results.push({ dealer_id: dealer.id, action: 'below_threshold' })
        }
        continue
      }

      if (dealer.subscription_status === 'awaiting_payment_method') {
        const days = dealer.billing_activated_at ? daysSince(dealer.billing_activated_at, now) : 0
        const paused = days >= PAUSE_AFTER_DAYS

        if (resend) {
          if (paused) {
            await sendPausedEmail(resend, dealer, baseUrl)
          } else {
            const total = await countEnquiries(supabase, dealer.id, null)
            await sendActivationEmail(resend, dealer, total, baseUrl)
          }
          if (days >= REVIEW_FLAG_AFTER_DAYS) {
            await sendReviewFlagEmail(resend, dealer, days, baseUrl)
          }
        }
        results.push({ dealer_id: dealer.id, action: paused ? 'paused_reminder_sent' : 'activation_reminder_sent' })
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
