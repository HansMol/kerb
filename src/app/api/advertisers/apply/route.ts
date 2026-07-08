import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import type { AdvertiserCategory } from '@/lib/supabase/types'

const VALID_CATEGORIES: AdvertiserCategory[] = [
  'detailing_protection', 'storage', 'mechanic_mot', 'transport', 'photography_valuation',
]

const CATEGORY_LABELS: Record<AdvertiserCategory, string> = {
  detailing_protection: 'Detailing & Protection',
  storage: 'Storage',
  mechanic_mot: 'Mechanics & MOT',
  transport: 'Transport & Logistics',
  photography_valuation: 'Photography & Valuation',
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
    businessName: string
    website: string
    contactName: string
    email: string
    phone?: string
    category: string
    whatTheyOffer: string
    whyRelevant?: string
  }

  const { businessName, website, contactName, email, phone, category, whatTheyOffer, whyRelevant } = body

  if (!businessName?.trim() || !website?.trim() || !contactName?.trim() || !email?.trim() || !whatTheyOffer?.trim()) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!VALID_CATEGORIES.includes(category as AdvertiserCategory)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 })
  }

  if (
    businessName.length > 200 || website.length > 500 ||
    contactName.length > 200 || email.length > 320 ||
    whatTheyOffer.length > 2000
  ) {
    return Response.json({ error: 'Field too long' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error: dbError } = await supabase
    .from('advertiser_applications')
    .insert({
      business_name: businessName.trim(),
      website: website.trim(),
      contact_name: contactName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      category: category as AdvertiserCategory,
      what_they_offer: whatTheyOffer.trim(),
      why_relevant: whyRelevant?.trim() || null,
    })

  if (dbError) {
    console.error('advertiser_applications insert error:', dbError)
    return Response.json({ error: 'Failed to save application' }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)

    await resend.emails.send({
      from: 'Kerb <hello@kerb.autos>',
      to: 'hans@kerb.autos',
      replyTo: email,
      subject: `New advertiser application — ${esc(businessName)}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0A0A0F">
          <p style="font-size:18px;font-weight:600;margin-bottom:4px">New advertiser application</p>
          <p style="color:#6E6E73;margin-top:0">via kerb.autos/advertise/apply</p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73;width:140px">Business</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;font-weight:500">${esc(businessName)}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Website</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="${esc(website)}" style="color:#0A0A0F">${esc(website)}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Contact</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${esc(contactName)}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Email</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7"><a href="mailto:${esc(email)}" style="color:#0A0A0F">${esc(email)}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #E5E5E7;color:#6E6E73">Phone</td><td style="padding:8px 0;border-bottom:1px solid #E5E5E7">${esc(phone ?? 'Not provided')}</td></tr>
            <tr><td style="padding:8px 0;color:#6E6E73">Category</td><td style="padding:8px 0">${esc(CATEGORY_LABELS[category as AdvertiserCategory])}</td></tr>
          </table>

          <p style="color:#6E6E73;font-size:13px;margin-bottom:4px">What they offer</p>
          <p style="white-space:pre-wrap;background:#F8F8FA;border:1px solid #E5E5E7;border-radius:6px;padding:16px;margin:0 0 16px">${esc(whatTheyOffer)}</p>

          ${whyRelevant ? `
          <p style="color:#6E6E73;font-size:13px;margin-bottom:4px">Why relevant to Kerb buyers</p>
          <p style="white-space:pre-wrap;background:#F8F8FA;border:1px solid #E5E5E7;border-radius:6px;padding:16px;margin:0 0 16px">${esc(whyRelevant)}</p>
          ` : ''}

          <p style="margin-top:32px;font-size:13px;color:#A8AAB0">Reply directly to this email to respond to ${esc(contactName)}.<br>Kerb — Real Kerb Appeal.</p>
        </div>
      `,
    })
  }

  return Response.json({ success: true })
}
