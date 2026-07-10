import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const [{ data: listings }, { data: dealers }] = await Promise.all([
    supabase
      .from('public_listings')
      .select('id, updated_at'),
    supabase
      .from('dealers')
      .select('slug, created_at')
      .eq('status', 'approved')
      .not('slug', 'is', null),
  ])

  const listingUrls: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `https://kerb.autos/cars/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const dealerUrls: MetadataRoute.Sitemap = (dealers ?? [])
    .filter(d => d.slug)
    .map(d => ({
      url: `https://kerb.autos/dealers/${d.slug}`,
      lastModified: new Date(d.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [
    { url: 'https://kerb.autos', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://kerb.autos/search', lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
    { url: 'https://kerb.autos/dealers', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://kerb.autos/dealers/join', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kerb.autos/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kerb.autos/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://kerb.autos/advice', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://kerb.autos/advice/how-to-buy-a-used-car-uk', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kerb.autos/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://kerb.autos/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...listingUrls,
    ...dealerUrls,
  ]
}
