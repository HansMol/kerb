import Stripe from 'stripe'

export const ACTIVATION_THRESHOLD = 3

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
  })

  if (invoice.id) {
    await stripe.invoices.finalizeInvoice(invoice.id)
  }
}
