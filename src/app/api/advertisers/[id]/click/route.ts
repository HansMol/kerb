import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: advertiser } = await supabase
    .from('advertisers')
    .select('cta_url')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!advertiser) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Log click — fire and forget, don't block the redirect
  supabase.from('advertiser_clicks').insert({ advertiser_id: id }).then(() => {})

  return NextResponse.redirect(advertiser.cta_url, { status: 302 })
}
