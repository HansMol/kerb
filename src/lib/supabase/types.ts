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
  subscription_status: 'not_activated' | 'awaiting_payment_method' | 'active' | 'past_due'
  billing_activated_at: string | null
  leads_invoiced_through: string | null
  created_at: string
}

type DealerInsert =
  Omit<DealerRow, 'id' | 'created_at' | 'slug' | 'subscription_status' | 'billing_activated_at' | 'leads_invoiced_through'>
  & Partial<Pick<DealerRow, 'slug' | 'subscription_status' | 'billing_activated_at' | 'leads_invoiced_through'>>
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

// Read-only view — `listings` filtered to status='live', has photos, and the
// dealer isn't paused for non-payment (see supabase/migrations/20260710_billing_pause.sql).
// Every public-facing listing query should read from this, not `listings` directly.
type PublicListingRow = ListingRow

type AdvertiserCategory = 'detailing_protection' | 'storage' | 'mechanic_mot' | 'transport' | 'photography_valuation'

type AdvertiserRow = {
  id: string
  name: string
  tagline: string
  logo_url: string | null
  cta_text: string
  cta_url: string
  category: AdvertiserCategory
  show_on_homepage: boolean
  active: boolean
  display_order: number
  created_at: string
}

type AdvertiserClickRow = {
  id: string
  advertiser_id: string
  clicked_at: string
}

type EnquiryRow = {
  id: string
  dealer_id: string
  listing_id: string | null
  name: string
  email: string
  phone: string | null
  message: string
  source_ip: string | null
  created_at: string
}

type EnquiryInsert = Omit<EnquiryRow, 'id' | 'created_at'>

type AdvertiserApplicationRow = {
  id: string
  business_name: string
  website: string
  contact_name: string
  email: string
  phone: string | null
  category: AdvertiserCategory | null
  what_they_offer: string
  why_relevant: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type WaitlistEntryRow = {
  id: string
  email: string
  make: string | null
  model: string | null
  max_price: number | null
  area: string | null
  created_at: string
}

type WaitlistEntryInsert = Omit<WaitlistEntryRow, 'id' | 'created_at'>

type PhoneRevealEventRow = {
  id: string
  dealer_id: string
  listing_id: string | null
  source_ip: string | null
  created_at: string
}

type PhoneRevealEventInsert = Omit<PhoneRevealEventRow, 'id' | 'created_at'>

export type { DealerRow, DealerInsert, DealerUpdate, ListingRow, ListingInsert, ListingUpdate, PublicListingRow, EnquiryRow, EnquiryInsert, AdvertiserCategory, AdvertiserRow, AdvertiserClickRow, AdvertiserApplicationRow, WaitlistEntryRow, WaitlistEntryInsert, PhoneRevealEventRow, PhoneRevealEventInsert }

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
      enquiries: {
        Row: EnquiryRow
        Insert: EnquiryInsert
        Update: never
        Relationships: [
          {
            foreignKeyName: 'enquiries_dealer_id_fkey'
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
      waitlist_entries: {
        Row: WaitlistEntryRow
        Insert: WaitlistEntryInsert
        Update: never
        Relationships: []
      }
      phone_reveal_events: {
        Row: PhoneRevealEventRow
        Insert: PhoneRevealEventInsert
        Update: never
        Relationships: [
          {
            foreignKeyName: 'phone_reveal_events_dealer_id_fkey'
            columns: ['dealer_id']
            isOneToOne: false
            referencedRelation: 'dealers'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      public_listings: {
        Row: PublicListingRow
        Relationships: []
      }
    }
    Functions: {
      search_listings_relevance: {
        Args: { search_term: string }
        Returns: { id: string; rank: number }[]
      }
    }
    Enums: Record<string, never>
  }
}
