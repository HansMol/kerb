import { createServerClient } from '@/lib/supabase/server'
import { AdvertiserCard } from './advertiser-card'

export async function AdvertiserStrip() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('advertisers')
    .select('*')
    .eq('active', true)
    .eq('show_on_homepage', true)
    .order('display_order', { ascending: true })

  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map(advertiser => (
        <AdvertiserCard key={advertiser.id} advertiser={advertiser} />
      ))}
    </div>
  )
}
