import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function generateSlug(
  supabase: ReturnType<typeof createServerClient>,
  businessName: string
): Promise<string> {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data } = await supabase.from('dealers').select('slug').eq('slug', base).maybeSingle()
  if (!data) return base

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`
    const { data: d } = await supabase.from('dealers').select('slug').eq('slug', candidate).maybeSingle()
    if (!d) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createServerClient()

  // Prevent duplicate registrations
  const { data: existing } = await supabase
    .from('dealers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already registered' }, { status: 409 })
  }

  // Create Stripe customer (no payment method — billing triggered on first enquiry)
  let stripeCustomerId: string | null = null
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey && stripeKey !== 'sk_test_REPLACE_ME') {
    try {
      const stripe   = new Stripe(stripeKey)
      const customer = await stripe.customers.create({
        email: body.email,
        name:  `${body.firstName} ${body.lastName}`,
        metadata: {
          business_name: body.businessName,
          plan:          body.plan ?? 'solo',
        },
      })
      stripeCustomerId = customer.id
    } catch (err) {
      console.error('Stripe customer creation failed:', err)
      // Non-fatal — proceed with registration, backfill customer ID later
    }
  }

  // Re-verify company status server-side — never trust the client's claim
  let verifiedCompanyStatus: string | null = null
  let verifiedVia = 'Manual review required'
  let dealerStatus: 'pending' | 'approved' = 'pending'

  if (body.isSoleTrader) {
    verifiedVia = 'Stripe Identity (pending)'
  } else if (body.companyNumber) {
    const chKey = process.env.COMPANIES_HOUSE_API_KEY
    if (chKey) {
      try {
        const chRes = await fetch(
          `https://api.company-information.service.gov.uk/company/${encodeURIComponent(body.companyNumber)}`,
          { headers: { Authorization: `Basic ${btoa(`${chKey}:`)}` } }
        )
        if (chRes.ok) {
          const chData = await chRes.json()
          verifiedCompanyStatus = chData.company_status ?? null
          if (verifiedCompanyStatus === 'active') {
            verifiedVia = 'Companies House (auto)'
            dealerStatus = 'approved'
          }
        }
      } catch {
        // Non-fatal — registration proceeds as pending, reviewed manually
      }
    }
  }

  const slug = await generateSlug(supabase, body.businessName)

  const { data, error } = await supabase
    .from('dealers')
    .insert({
      clerk_user_id:    userId,
      first_name:       body.firstName,
      last_name:        body.lastName,
      email:            body.email,
      phone:            body.phone,
      business_name:    body.businessName,
      company_number:   body.companyNumber || null,
      company_status:   body.isSoleTrader ? 'sole-trader' : (verifiedCompanyStatus || null),
      city:             body.city,
      postcode:         body.postcode,
      website:          body.website || null,
      makes:            body.makes,
      inventory_size:   body.inventorySize,
      price_range:      body.priceRange,
      verified_via:     verifiedVia,
      status:           dealerStatus,
      plan:             body.plan ?? 'solo',
      slug,
      stripe_customer_id: stripeCustomerId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Dealer registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }

  return NextResponse.json({ dealerId: data.id }, { status: 201 })
}
