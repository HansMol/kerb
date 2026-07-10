import Stripe from 'stripe'

export const ACTIVATION_THRESHOLD = 3

// A dealer who crosses ACTIVATION_THRESHOLD leads but never adds a payment
// method keeps listings live and free for this many days — after that,
// public_listings (see supabase/migrations) excludes their listings until
// they add a card. Confirmed by Hans 10 Jul 2026.
export const PAUSE_AFTER_DAYS = 14

// If still awaiting a payment method this many days after crossing the
// threshold, flag the dealer for Hans to manually review — not an
// automated removal, see /api/cron/billing.
export const REVIEW_FLAG_AFTER_DAYS = 90

export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

const PLAN_AMOUNTS: Record<'solo' | 'pro', { amount: number; name: string }> = {
  solo: { amount: 5500,  name: 'Kerb Solo' },
  pro:  { amount: 13200, name: 'Kerb Pro'  },
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Invoices a dealer for a batch of leads. Callers are responsible for only
// invoking this once per lead — pass the exact date range being billed so
// the description is accurate, and advance the caller's own cursor after.
export async function chargeForLeads(
  stripe: Stripe,
  dealer: { plan: 'solo' | 'pro' | null; stripe_customer_id: string | null },
  leadCount: number,
  periodFrom: Date | null,
  periodTo: Date,
): Promise<void> {
  if (!dealer.stripe_customer_id || leadCount < 1) return

  const plan = dealer.plan ?? 'solo'
  const cfg = PLAN_AMOUNTS[plan]
  const perLead = (cfg.amount / 100 / leadCount).toFixed(2)
  const range = periodFrom
    ? `${formatDate(periodFrom)} – ${formatDate(periodTo)}`
    : `up to ${formatDate(periodTo)}`

  await stripe.invoiceItems.create({
    customer: dealer.stripe_customer_id,
    amount: cfg.amount,
    currency: 'gbp',
    description: `${cfg.name} — ${leadCount} buyer ${leadCount === 1 ? 'enquiry' : 'enquiries'} (${range}) · £${perLead}/enquiry`,
  })

  const invoice = await stripe.invoices.create({
    customer: dealer.stripe_customer_id,
    collection_method: 'charge_automatically',
    auto_advance: true,
    pending_invoice_items_behavior: 'include',
  })

  if (invoice.id) {
    await stripe.invoices.finalizeInvoice(invoice.id)
    // finalizeInvoice does not itself attempt collection — without this,
    // Stripe schedules the first charge attempt asynchronously (can be
    // over an hour later). We want the dealer charged immediately.
    await stripe.invoices.pay(invoice.id)
  }
}
