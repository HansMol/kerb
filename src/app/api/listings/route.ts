import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!dealer) {
    return NextResponse.json({ listings: [] })
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  return NextResponse.json({ listings })
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createServerClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      dealer_id: dealer.id,
      make: body.make,
      model: body.model,
      year: body.year,
      mileage: body.mileage,
      colour: body.colour,
      body_type: body.bodyType,
      doors: body.doors,
      fuel_type: body.fuelType,
      transmission: body.transmission,
      engine_size: body.engineSize || null,
      variant: body.variant || null,
      price: body.price,
      status: body.status,
      description: body.description,
      photos: body.photos ?? [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('Listing creation error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }

  return NextResponse.json({ listingId: data.id }, { status: 201 })
}
