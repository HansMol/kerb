import allPreviews from '@/data/dealer-previews.json'

export type Slide = {
  photo: string
  kind: 'cover' | 'spec' | 'text' | 'breathing' | 'verdict'
  kicker: string
  headline: string
  body?: string
  specs?: { v: string; k: string }[]
}

export type PreviewCar = {
  year: string
  make: string
  model: string
  trim: string
  mileage: string
  price: string
  photo_url: string
  hook: string
  dealer_website: string
  dealer_email?: string
  dealer_phone?: string
  slides?: Slide[]
  // Added 18 Aug 2026: the real editorial content (spec facts, why-this-one,
  // verdict) moved off the image overlays and into the post caption — Hans's
  // call after reviewing the text-heavy version, so slides now carry only a
  // cover kicker and a closing "link in description" note.
  caption?: string
}

export type DealerPreview = {
  dealer_name: string
  cars: PreviewCar[]
}

// Bundled at build time via static import — Cloudflare Workers has no
// filesystem at runtime, so fs.readFileSync per-request doesn't work there
// (confirmed 12 Aug 2026: every preview page 404'd after deploy despite
// building fine locally). A static import gets inlined into the JS bundle
// by webpack, which works the same in Workers as anywhere else.
const previews = allPreviews as Record<string, DealerPreview>

export function getDealerPreview(slug: string): DealerPreview | null {
  return previews[slug] ?? null
}

export function getAllDealerPreviewSlugs(): string[] {
  return Object.keys(previews)
}
