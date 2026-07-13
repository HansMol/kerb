import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createServerClient } from '@/lib/supabase/server'
import { listingSchema } from '@/lib/listing-schema'
import type { ListingInsert } from '@/lib/supabase/types'

const MAX_ROWS = 200

// CSV headers are snake_case (matches the downloadable template + DB column
// names, since a dealer opens this in Excel/Sheets) — mapped to the camelCase
// shape listingSchema expects, which is shared with the single-listing form.
function mapRow(row: Record<string, string>) {
  return {
    make:         row.make?.trim(),
    model:        row.model?.trim(),
    year:         row.year ? Number(row.year) : undefined,
    mileage:      row.mileage ? Number(row.mileage) : undefined,
    colour:       row.colour?.trim(),
    bodyType:     row.body_type?.trim(),
    doors:        row.doors?.trim(),
    fuelType:     row.fuel_type?.trim(),
    transmission: row.transmission?.trim(),
    engineSize:   row.engine_size?.trim() || undefined,
    variant:      row.variant?.trim() || undefined,
    price:        row.price ? Number(row.price) : undefined,
    description:  row.description?.trim(),
    status:       'draft' as const,
  }
}

function firstIssueMessage(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0]
  return `${issue.path.join('.')}: ${issue.message}`
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const csvText = await request.text()
  if (!csvText.trim()) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 })
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.data.length === 0) {
    return NextResponse.json({ error: 'No rows found in file' }, { status: 400 })
  }

  if (parsed.data.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows — maximum ${MAX_ROWS} per upload (found ${parsed.data.length})` },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!dealer) {
    return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
  }

  const errors: { row: number; message: string }[] = []
  const toInsert: ListingInsert[] = []
  const rowMeta: { make: string; model: string }[] = []

  parsed.data.forEach((raw, i) => {
    const spreadsheetRow = i + 2 // +1 for 0-index, +1 for the header row
    const mapped = mapRow(raw)
    const result = listingSchema.safeParse(mapped)

    if (!result.success) {
      errors.push({ row: spreadsheetRow, message: firstIssueMessage(result.error) })
      return
    }

    toInsert.push({
      dealer_id:    dealer.id,
      make:         result.data.make,
      model:        result.data.model,
      year:         result.data.year,
      mileage:      result.data.mileage,
      colour:       result.data.colour,
      body_type:    result.data.bodyType,
      doors:        result.data.doors,
      fuel_type:    result.data.fuelType,
      transmission: result.data.transmission,
      engine_size:  result.data.engineSize || null,
      variant:      result.data.variant || null,
      price:        result.data.price,
      status:       'draft',
      description:  result.data.description,
      photos:       [],
    })
    rowMeta.push({ make: result.data.make, model: result.data.model })
  })

  if (toInsert.length === 0) {
    return NextResponse.json({ created: [], errors }, { status: 200 })
  }

  // Relies on Postgres preserving VALUES-list order on a single
  // INSERT ... RETURNING statement to zip `inserted` back up with `rowMeta`.
  const { data: inserted, error: insertError } = await supabase
    .from('listings')
    .insert(toInsert)
    .select('id')

  if (insertError) {
    console.error('Bulk listing insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save listings — please try again' }, { status: 500 })
  }

  const created = inserted.map((row, i) => ({
    id:    row.id,
    make:  rowMeta[i].make,
    model: rowMeta[i].model,
  }))

  return NextResponse.json({ created, errors }, { status: 201 })
}
