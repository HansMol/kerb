type DealerRow = {
  id: string
  clerk_user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  business_name: string
  company_number: string | null
  company_status: string | null
  city: string
  postcode: string
  website: string | null
  makes: string[]
  inventory_size: string
  price_range: string
  verified_via: string
  status: 'pending' | 'approved' | 'rejected'
  plan: 'solo' | 'pro' | null
  slug: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'free' | 'active' | 'cancelled' | 'past_due'
  billing_starts_at: string | null
  first_lead_received_at: string | null
  created_at: string
}

type DealerInsert =
  Omit<DealerRow, 'id' | 'created_at' | 'slug' | 'stripe_subscription_id' | 'subscription_status' | 'billing_starts_at' | 'first_lead_received_at'>
  & Partial<Pick<DealerRow, 'slug' | 'stripe_subscription_id' | 'subscription_status' | 'billing_starts_at' | 'first_lead_received_at'>>
type DealerUpdate = Partial<Omit<DealerRow, 'id' | 'created_at'>>

type ListingRow = {
  id: string
  dealer_id: string
  make: string
  model: string
  year: number
  mileage: number
  colour: string
  body_type: string
  doors: string
  fuel_type: string
  transmission: string
  engine_size: string | null
  variant: string | null
  price: number
  status: 'draft' | 'live' | 'sold' | 'archived'
  description: string
  photos: string[]
  created_at: string
  updated_at: string
}

type ListingInsert = Omit<ListingRow, 'id' | 'created_at' | 'updated_at'>
type ListingUpdate = Partial<ListingInsert>

type AdvertiserRow = {
  id: string
  name: string
  tagline: string
  logo_url: string | null
  cta_text: string
  cta_url: string
  show_on_homepage: boolean
  show_on_detail: boolean
  active: boolean
  display_order: number
  created_at: string
}

type AdvertiserClickRow = {
  id: string
  advertiser_id: string
  clicked_at: string
}

type AdvertiserApplicationRow = {
  id: string
  business_name: string
  website: string
  contact_name: string
  email: string
  phone: string | null
  what_they_offer: string
  why_relevant: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type { DealerRow, DealerInsert, DealerUpdate, ListingRow, ListingInsert, ListingUpdate, AdvertiserRow, AdvertiserClickRow, AdvertiserApplicationRow }

export type Database = {
  public: {
    Tables: {
      dealers: {
        Row: DealerRow
        Insert: DealerInsert
        Update: DealerUpdate
        Relationships: []
      }
      listings: {
        Row: ListingRow
        Insert: ListingInsert
        Update: ListingUpdate
        Relationships: [
          {
            foreignKeyName: 'listings_dealer_id_fkey'
            columns: ['dealer_id']
            isOneToOne: false
            referencedRelation: 'dealers'
            referencedColumns: ['id']
          }
        ]
      }
      advertisers: {
        Row: AdvertiserRow
        Insert: Omit<AdvertiserRow, 'id' | 'created_at'>
        Update: Partial<Omit<AdvertiserRow, 'id' | 'created_at'>>
        Relationships: []
      }
      advertiser_applications: {
        Row: AdvertiserApplicationRow
        Insert: Omit<AdvertiserApplicationRow, 'id' | 'created_at' | 'status'> & Partial<Pick<AdvertiserApplicationRow, 'status'>>
        Update: Partial<Pick<AdvertiserApplicationRow, 'status'>>
        Relationships: []
      }
      advertiser_clicks: {
        Row: AdvertiserClickRow
        Insert: Omit<AdvertiserClickRow, 'id' | 'clicked_at'>
        Update: never
        Relationships: [
          {
            foreignKeyName: 'advertiser_clicks_advertiser_id_fkey'
            columns: ['advertiser_id']
            isOneToOne: false
            referencedRelation: 'advertisers'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
