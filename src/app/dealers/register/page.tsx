import { DealerWizard } from './wizard'

export const metadata = {
  title: 'Register Your Dealership — Kerb',
  description: 'List your inventory on Kerb. Free to list, direct enquiries, no platform intermediation.',
}

export default async function DealerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const initialPlan = plan === 'solo' || plan === 'pro' ? plan : undefined

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-12 pb-20">
      <DealerWizard initialPlan={initialPlan} />
    </div>
  )
}
