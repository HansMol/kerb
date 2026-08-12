import fs from 'fs'
import path from 'path'

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
}

export type DealerPreview = {
  dealer_name: string
  cars: PreviewCar[]
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'dealer-previews')

export function getDealerPreview(slug: string): DealerPreview | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function getAllDealerPreviewSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return []
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}
