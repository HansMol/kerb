import Stripe from 'stripe'
import { Resend } from 'resend'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { findUnusedInvite, type FoundingInvite } from '@/lib/founding'

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

  // Founding dealer invite: claim the code before anything else, so a used
  // link cannot register a second free dealer. Released again if the insert fails.
  let invite: FoundingInvite | null = null
  if (body.inviteCode) {
    invite = await findUnusedInvite(supabase, body.inviteCode)
    const { data: claimed } = invite
      ? await supabase
          .from('dealer_invites')
          .update({ used_at: new Date().toISOString() })
          .eq('code', invite.code)
          .is('used_at', null)
          .select('code')
      : { data: null }
    if (!invite || !claimed?.length) {
      return NextResponse.json(
        { error: 'This invite link has already been used or is not valid. Please contact Hans on 07503 576689.' },
        { status: 400 },
      )
    }
  }

  // Create Stripe customer (no payment method — billing triggered on first enquiry).
  // Founding dealers are never set up in Stripe.
  let stripeCustomerId: string | null = null
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!invite && stripeKey && stripeKey !== 'sk_test_REPLACE_ME') {
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
      founding_dealer:  !!invite,
      free_until:       invite?.free_until ?? null,
      invite_code:      invite?.code ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Dealer registration error:', error)
    if (invite) {
      await supabase.from('dealer_invites').update({ used_at: null }).eq('code', invite.code)
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }

  if (invite) {
    await supabase.from('dealer_invites').update({ used_by_dealer_id: data.id }).eq('code', invite.code)
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
              <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Plan</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${invite ? `Founding dealer, free (invite: ${esc(invite.label)})` : esc((body.plan ?? 'solo') as string)}</td></tr>
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

    // Welcome email to a dealer who joined through an invite. Wording approved
    // by Hans, 14 Oct 2026: gratitude, what to expect, no "founding dealer".
    if (invite) {
      try {
        await resend.emails.send({
          from: 'Kerb <hello@kerb.autos>',
          to: body.email,
          replyTo: 'hans@kerb.autos',
          subject: `Welcome to Kerb, ${body.firstName}`,
          text: welcomeText(body.firstName, body.businessName),
          html: welcomeHtml(body.firstName, body.businessName),
        })
      } catch (err) {
        console.error('[DealerRegister] Failed to send welcome email:', err)
      }
    }
  }

  return NextResponse.json({ dealerId: data.id }, { status: 201 })
}

function welcomeText(firstName: string, business: string): string {
  return [
    `Hi ${firstName},`,
    '',
    `Thank you for joining Kerb. Having ${business} with us this early means a lot, and I'm grateful for your trust.`,
    '',
    "Your dealership is now set up. Here's what to expect:",
    '',
    '1. Add your cars with the photos you already have: https://kerb.autos/dashboard/listings/new. Each car appears on kerb.autos for buyers as soon as you publish it.',
    '2. Buyers\' enquiries come straight to you. We never sit in the middle.',
    `3. We'll feature the best of your cars on Instagram at @realkerbappeal, credited to ${business} with a link back to you.`,
    '',
    "Lots of cars? Send me your stock list in any format, or a link to it, and we'll load them for you.",
    '',
    'Questions? Reply to this email or call me on 07503 576689.',
    '',
    'Kind regards',
    '',
    'Hans Mol',
    'Founder, Kerb',
  ].join('\n')
}

function welcomeHtml(firstName: string, business: string): string {
  const f = esc(firstName)
  const b = esc(business)
  const p = 'margin:0 0 16px;line-height:1.6'
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F;font-size:15px">
      <p style="${p}">Hi ${f},</p>
      <p style="${p}">Thank you for joining Kerb. Having ${b} with us this early means a lot, and I'm grateful for your trust.</p>
      <p style="${p}">Your dealership is now set up. Here's what to expect:</p>
      <ol style="margin:0 0 16px;padding-left:20px;line-height:1.6">
        <li style="margin-bottom:8px">Add your cars with the photos you already have: <a href="https://kerb.autos/dashboard/listings/new" style="color:#0A0A0F">kerb.autos/dashboard/listings/new</a>. Each car appears on kerb.autos for buyers as soon as you publish it.</li>
        <li style="margin-bottom:8px">Buyers' enquiries come straight to you. We never sit in the middle.</li>
        <li>We'll feature the best of your cars on Instagram at @realkerbappeal, credited to ${b} with a link back to you.</li>
      </ol>
      <p style="${p}">Lots of cars? Send me your stock list in any format, or a link to it, and we'll load them for you.</p>
      <p style="${p}">Questions? Reply to this email or call me on 07503 576689.</p>
      <p style="${p}">Kind regards</p>
      <p style="margin:0;line-height:1.6">Hans Mol<br>Founder, Kerb</p>
    </div>
  `
}
