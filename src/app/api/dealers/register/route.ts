import Stripe from 'stripe'
import { Resend } from 'resend'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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

  // Dealer-facing copy promises "a real person will call you within one
  // working day" — nothing else in this route surfaces a new registration,
  // so without this email that promise depends entirely on someone
  // remembering to check the dashboard.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    try {
      await resend.emails.send({
        from: 'Kerb <hello@kerb.autos>',
        to: 'hans@kerb.autos',
        replyTo: body.email,
        subject: `New dealer registration — ${esc(body.businessName)}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
            <p style="font-size:18px;font-weight:600;margin-bottom:4px">New dealer registration</p>
            <p style="color:#6E6E73;margin-top:0">via kerb.autos/dealers/register</p>

            <table style="width:100%;border-collapse:collapse;margin:24px 0">
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73;width:140px">Business</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;font-weight:500">${esc(body.businessName)}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Contact</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${esc(body.firstName)} ${esc(body.lastName)}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Email</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="mailto:${esc(body.email)}" style="color:#0A0A0F">${esc(body.email)}</a></td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Phone</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="tel:${esc(body.phone)}" style="color:#0A0A0F">${esc(body.phone)}</a></td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Plan</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${esc((body.plan ?? 'solo') as string)}</td></tr>
              <tr><td style="padding:8px 0;color:#6E6E73">Verification</td><td style="padding:8px 0">${esc(verifiedVia)} — status: ${dealerStatus}</td></tr>
            </table>

            <p style="margin-top:32px;font-size:13px;color:#A8AAB0">We tell dealers a real person calls within one working day — reply directly to this email or call ${esc(body.phone)} to follow up.</p>
          </div>
        `,
      })
    } catch (err) {
      console.error('[DealerRegister] Failed to send notification email:', err)
      // Non-fatal — registration already succeeded, don't fail the request over a notification
    }
  }

  return NextResponse.json({ dealerId: data.id }, { status: 201 })
}
