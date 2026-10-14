import { DealerWizard } from './wizard'
import { createServerClient } from '@/lib/supabase/server'
import { findUnusedInvite } from '@/lib/founding'

export const metadata = {
  title: 'Register Your Dealership — Kerb',
  description: 'List your inventory on Kerb. Free to list, direct enquiries, no platform intermediation.',
}

export default async function DealerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; invite?: string }>
}) {
  const { plan, invite: inviteCode } = await searchParams
  const initialPlan = plan === 'solo' || plan === 'pro' ? plan : undefined

  // Founding dealer invite (Hans, 14 Oct 2026): no plan or pricing step.
  // A used or unknown code never falls back to the priced form.
  const invite = inviteCode ? await findUnusedInvite(createServerClient(), inviteCode) : null

  if (inviteCode && !invite) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] pt-12 pb-20">
        <div className="max-w-lg mx-auto px-4">
          <h1 className="text-[28px] font-light text-white tracking-tight mb-3">This invite link has already been used.</h1>
          <p className="text-[16px] text-[#6E6E73] leading-relaxed">
            If that wasn&apos;t you, or you need a new link, call Hans on{' '}
            <a href="tel:07503576689" className="text-white">07503 576689</a> or email{' '}
            <a href="mailto:hans@kerb.autos" className="text-white">hans@kerb.autos</a>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-12 pb-20">
      <DealerWizard initialPlan={initialPlan} inviteCode={invite?.code} />
    </div>
  )
}
