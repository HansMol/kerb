import Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { chargeForLeads } from '@/lib/billing'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const key    = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const payload = await req.text()
  const sig     = req.headers.get('stripe-signature') ?? ''

  if (!key || key === 'sk_test_REPLACE_ME') {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(key)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret ?? '')
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  // ── Stripe Identity ────────────────────────────────────────────────────────

  if (event.type === 'identity.verification_session.verified') {
    const session       = event.data.object as Stripe.Identity.VerificationSession
    const email         = session.metadata?.email ?? 'unknown'
    const name          = session.metadata?.name  ?? 'unknown'
    const clerkUserId   = session.metadata?.clerk_user_id
    console.log(`[Identity] VERIFIED — ${name} <${email}> · ${session.id}`)

    if (clerkUserId) {
      await supabase
        .from('dealers')
        .update({ verified_via: 'Stripe Identity (verified)', status: 'approved' })
        .eq('clerk_user_id', clerkUserId)
    } else {
      // Fallback for sessions created before the clerk_user_id metadata was added
      await supabase
        .from('dealers')
        .update({ verified_via: 'Stripe Identity (verified)', status: 'approved' })
        .eq('email', email)
    }
  }

  if (event.type === 'identity.verification_session.requires_input') {
    const session = event.data.object as Stripe.Identity.VerificationSession
    console.log(`[Identity] REQUIRES INPUT — ${session.metadata?.email} · ${session.id}`)
  }

  // ── Billing activation — payment method setup ───────────────────────────────
  // Fires when a dealer completes the "add payment method" Checkout session
  // sent once they cross the 3-lead activation threshold (see /api/cron/billing).
  // Saves the card as the customer's default, then immediately invoices for
  // every lead received up to now — there is no prior cursor at this point,
  // so this always covers the dealer's whole pre-activation lead history.

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const dealerId = session.metadata?.dealer_id
    if (!dealerId || session.mode !== 'setup') return Response.json({ received: true })

    const setupIntentId = typeof session.setup_intent === 'string' ? session.setup_intent : session.setup_intent?.id
    const customerId     = typeof session.customer === 'string' ? session.customer : session.customer?.id

    if (!setupIntentId || !customerId) return Response.json({ received: true })

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
    const paymentMethodId = typeof setupIntent.payment_method === 'string'
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id

    if (!paymentMethodId) return Response.json({ received: true })

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    const { data: dealer } = await supabase
      .from('dealers')
      .select('plan')
      .eq('id', dealerId)
      .single()

    const { count } = await supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)

    const now = new Date()

    await chargeForLeads(stripe, { plan: dealer?.plan ?? 'solo', stripe_customer_id: customerId }, count ?? 0, null, now)

    await supabase
      .from('dealers')
      .update({
        stripe_customer_id:     customerId,
        subscription_status:    'active',
        leads_invoiced_through: now.toISOString(),
      })
      .eq('id', dealerId)

    console.log(`[Billing] Activated and invoiced ${count ?? 0} leads — dealer ${dealerId}`)
  }

  if (event.type === 'invoice.paid') {
    const invoice  = event.data.object as Stripe.Invoice
    const customer = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    if (!customer) return Response.json({ received: true })

    await supabase
      .from('dealers')
      .update({ subscription_status: 'active' })
      .eq('stripe_customer_id', customer)
    console.log(`[Invoice] Paid — customer ${customer}`)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice  = event.data.object as Stripe.Invoice
    const customer = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    if (!customer) return Response.json({ received: true })

    await supabase
      .from('dealers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_customer_id', customer)
    console.log(`[Invoice] Payment failed — customer ${customer}`)
  }

  return Response.json({ received: true })
}
