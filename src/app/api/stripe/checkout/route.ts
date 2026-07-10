import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Collects a payment method for a dealer who has crossed the 3-lead
// activation threshold. No line items — the monthly billing cron invoices
// against this saved card, it is never charged directly from this session.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key === 'sk_test_REPLACE_ME') {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const { dealerId } = await req.json() as { dealerId: string }

  const supabase = createServerClient()
  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('stripe_customer_id, email')
    .eq('id', dealerId)
    .eq('clerk_user_id', userId)
    .single()

  if (error || !dealer) {
    return Response.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const stripe = new Stripe(key)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'

  const session = await stripe.checkout.sessions.create({
    mode: 'setup',
    customer: dealer.stripe_customer_id ?? undefined,
    customer_email: dealer.stripe_customer_id ? undefined : dealer.email,
    metadata: { dealer_id: dealerId },
    setup_intent_data: { metadata: { dealer_id: dealerId } },
    success_url: `${baseUrl}/dashboard?billing=success`,
    cancel_url:  `${baseUrl}/dashboard?billing=cancelled`,
  })

  return Response.json({ url: session.url })
}
