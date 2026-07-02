import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ListingUpdate } from '@/lib/supabase/types'

async function getDealerForUser(userId: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('dealers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()
  return data
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const dealer = await getDealerForUser(userId)
  if (!dealer) return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })

  const { id } = await params
  const body = await request.json()
  const supabase = createServerClient()

  const updateData: ListingUpdate = {}
  if ('make' in body)         updateData.make = body.make
  if ('model' in body)        updateData.model = body.model
  if ('year' in body)         updateData.year = body.year
  if ('mileage' in body)      updateData.mileage = body.mileage
  if ('colour' in body)       updateData.colour = body.colour
  if ('body_type' in body)    updateData.body_type = body.body_type
  if ('doors' in body)        updateData.doors = body.doors
  if ('fuel_type' in body)    updateData.fuel_type = body.fuel_type
  if ('transmission' in body) updateData.transmission = body.transmission
  if ('engine_size' in body)  updateData.engine_size = body.engine_size
  if ('variant' in body)      updateData.variant = body.variant
  if ('price' in body)        updateData.price = body.price
  if ('status' in body)       updateData.status = body.status
  if ('description' in body)  updateData.description = body.description
  if ('photos' in body)       updateData.photos = body.photos

  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .eq('dealer_id', dealer.id)
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }

  return NextResponse.json({ listingId: data.id })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const dealer = await getDealerForUser(userId)
  if (!dealer) return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })

  const { id } = await params
  const supabase = createServerClient()

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('dealer_id', dealer.id)

  if (error) return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })

  return NextResponse.json({ success: true })
}
