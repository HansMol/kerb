'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const sortOptions = [
  { value: 'newest',      label: 'Most recent' },
  { value: 'price_asc',   label: 'Price: low to high' },
  { value: 'price_desc',  label: 'Price: high to low' },
  { value: 'mileage_asc', label: 'Lowest mileage' },
  { value: 'year_desc',   label: 'Age: newest first' },
  { value: 'year_asc',    label: 'Age: oldest first' },
]

const bodyTypes = [
  { value: 'hatchback',   label: 'Hatchback' },
  { value: 'saloon',      label: 'Saloon' },
  { value: 'estate',      label: 'Estate' },
  { value: 'suv',         label: 'SUV / 4x4' },
  { value: 'coupe',       label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'mpv',         label: 'MPV' },
]

const fuelTypes = [
  { value: 'petrol',         label: 'Petrol' },
  { value: 'diesel',         label: 'Diesel' },
  { value: 'hybrid',         label: 'Hybrid' },
  { value: 'plug_in_hybrid', label: 'Plug-in Hybrid' },
  { value: 'electric',       label: 'Electric' },
]

const transmissions = [
  { value: 'manual',    label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
]

export function SearchFilters({ makes }: { makes: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'any' && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/search?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => router.push('/search')

  const hasFilters = searchParams.toString().length > 0

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#0A0A0F]">Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-[#6E6E73] hover:text-[#0A0A0F] underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">

        {/* Sort */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Sort by</Label>
          <Select
            value={searchParams.get('sort') ?? 'newest'}
            onValueChange={v => updateFilter('sort', v === 'newest' ? null : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Most recent" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Make */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Make</Label>
          <Select
            value={searchParams.get('make') ?? 'any'}
            onValueChange={v => updateFilter('make', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any make</SelectItem>
              {makes.map(m => <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Price</Label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Min"
              type="number"
              defaultValue={searchParams.get('minPrice') ?? ''}
              onBlur={e => updateFilter('minPrice', e.target.value)}
              className="text-sm"
            />
            <span className="text-[#A8AAB0] text-sm shrink-0">to</span>
            <Input
              placeholder="Max"
              type="number"
              defaultValue={searchParams.get('maxPrice') ?? ''}
              onBlur={e => updateFilter('maxPrice', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Year */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Year</Label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="From"
              type="number"
              defaultValue={searchParams.get('yearMin') ?? ''}
              onBlur={e => updateFilter('yearMin', e.target.value)}
              className="text-sm"
            />
            <span className="text-[#A8AAB0] text-sm shrink-0">to</span>
            <Input
              placeholder="To"
              type="number"
              defaultValue={searchParams.get('yearMax') ?? ''}
              onBlur={e => updateFilter('yearMax', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Body type */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Body type</Label>
          <Select
            value={searchParams.get('bodyType') ?? 'any'}
            onValueChange={v => updateFilter('bodyType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any body type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any body type</SelectItem>
              {bodyTypes.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Fuel type */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Fuel type</Label>
          <Select
            value={searchParams.get('fuelType') ?? 'any'}
            onValueChange={v => updateFilter('fuelType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any fuel type</SelectItem>
              {fuelTypes.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Transmission */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Transmission</Label>
          <Select
            value={searchParams.get('transmission') ?? 'any'}
            onValueChange={v => updateFilter('transmission', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any transmission</SelectItem>
              {transmissions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Seller type */}
        <div>
          <Label className="text-xs font-semibold text-[#A8AAB0] uppercase tracking-wider mb-2 block">Seller</Label>
          <Select
            value={searchParams.get('sellerType') ?? 'any'}
            onValueChange={v => updateFilter('sellerType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any seller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Private &amp; Dealer</SelectItem>
              <SelectItem value="private">Private only</SelectItem>
              <SelectItem value="dealer">Dealer only</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </aside>
  )
}
