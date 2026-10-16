import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'

// Background check on founding dealers (Hans, 16 Oct 2026): invited dealers
// are approved the moment they sign up, so onboarding has no friction. This
// runs daily afterwards and compares what each new founding dealer entered
// with the Companies House company their invite was made for: still active,
// the same company number, a name that matches, a postcode in the same area.
// It never changes a dealer's status or listings; it records the result and
// emails Hans only when something needs a look.

const norm = (s: string | null | undefined) =>
  (s ?? '').toUpperCase().replace(/&/g, ' AND ').replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\b(LIMITED|LTD|PLC|LLP|THE|CO|COMPANY|UK)\b/g, ' ').replace(/\s+/g, ' ').trim()
const area = (pc: string | null | undefined) => (pc ?? '').toUpperCase().replace(/\s+/g, '').replace(/\d[A-Z]{2}$/, '')

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY
  const supabase = createServerClient()

  const { data: dealers, error } = await supabase
    .from('dealers')
    .select('id, business_name, company_number, postcode, invite_code, founding_check_at')
    .eq('founding_dealer', true)
    .is('founding_check_at', null)
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 })
  }

  const results: { id: string; business_name: string; check: string; issues: string[] }[] = []
  for (const d of dealers ?? []) {
    const issues: string[] = []
    const { data: inv } = d.invite_code
      ? await supabase.from('dealer_invites').select('company_number, company_name, postcode, source').eq('code', d.invite_code).maybeSingle()
      : { data: null }
    const number = inv?.company_number || d.company_number
    if (!number) {
      issues.push('no company number on the invite or the sign-up')
    } else {
      if (inv?.company_number && d.company_number && d.company_number.replace(/\s/g, '').toUpperCase() !== inv.company_number.toUpperCase()) {
        issues.push(`signed up with company ${d.company_number}, invite was for ${inv.company_number}`)
      }
      let chName = inv?.company_name ?? null
      let chPostcode = inv?.postcode ?? null
      if (apiKey) {
        try {
          const res = await fetch(`https://api.company-information.service.gov.uk/company/${number}`,
            { headers: { Authorization: `Basic ${btoa(`${apiKey}:`)}` } })
          if (res.ok) {
            const c = await res.json()
            if (c.company_status && c.company_status !== 'active') issues.push(`company is ${c.company_status} at Companies House`)
            chName = c.company_name ?? chName
            chPostcode = c.registered_office_address?.postal_code ?? chPostcode
          } else if (res.status === 404) {
            issues.push(`company ${number} not found at Companies House`)
          }
        } catch {
          // network error: the name and postcode checks below still run on the invite's details
        }
      }
      const a = norm(d.business_name), b = norm(chName)
      if (b && a && !a.includes(b) && !b.includes(a)) issues.push(`name entered "${d.business_name}", company is "${chName}"`)
      const pa = area(d.postcode), pb = area(inv?.postcode), pc = area(chPostcode)
      if (pa && (pb || pc) && pa !== pb && pa !== pc) issues.push(`postcode ${d.postcode} is not near ${inv?.postcode ?? chPostcode}`)
    }
    const check = issues.length ? issues.join('; ') : 'ok'
    await supabase.from('dealers').update({ founding_check: check, founding_check_at: new Date().toISOString() }).eq('id', d.id)
    results.push({ id: d.id, business_name: d.business_name, check, issues })
  }

  const flagged = results.filter(r => r.issues.length)
  const resendKey = process.env.RESEND_API_KEY
  if (flagged.length && resendKey) {
    const rows = flagged.map(r =>
      `<tr><td style="padding:8px 10px;border-bottom:1px solid #E5E5E7;font-weight:500">${r.business_name}</td>` +
      `<td style="padding:8px 10px;border-bottom:1px solid #E5E5E7;color:#3A3A3E">${r.issues.join('<br>')}</td></tr>`).join('')
    await new Resend(resendKey).emails.send({
      from: 'Kerb <notifications@kerb.autos>',
      to: 'hans@kerb.autos',
      subject: `Founding dealer check: ${flagged.length} to look at`,
      html: `<div style="font-family:sans-serif;max-width:620px;color:#1C1C1E">
        <p style="font-size:17px;font-weight:600">Founding dealer check</p>
        <p style="color:#6E6E73">${results.length} new founding dealers checked against Companies House; ${flagged.length} need a look. Nothing has been changed: they stay approved until you decide.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table></div>`,
    })
  }
  return NextResponse.json({ checked: results.length, flagged: flagged.length, results, timestamp: new Date().toISOString() })
}
