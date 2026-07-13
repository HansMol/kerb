import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  LayoutGrid,
  Plus,
  Car,
  ChevronRight,
  Clock,
  TrendingUp,
  MoreHorizontal,
  PoundSterling,
  MessageSquare,
  Upload,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { BillingActivationBanner } from './billing-activation-banner'
import { ACTIVATION_THRESHOLD, PAUSE_AFTER_DAYS, daysSince } from '@/lib/billing'

type DealerRow  = Database['public']['Tables']['dealers']['Row']
type ListingRow = Database['public']['Tables']['listings']['Row']

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return '£' + n.toLocaleString('en-GB')
}

function formatMileage(n: number) {
  return n.toLocaleString('en-GB') + ' mi'
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Verification badge ───────────────────────────────────────────────────────
function VerificationBadge({ dealer }: { dealer: DealerRow }) {
  const verified = dealer.status === 'approved'
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#F8F8FA] text-[#0A0A0F] border border-[#C4C6CC] rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
        <CheckCircle2 size={11} className="text-[#C4C6CC] flex-shrink-0" />
        Verified · {dealer.verified_via}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#F8F8FA] text-[#6E6E73] border border-[#E5E5E7] rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
      <Clock size={11} className="flex-shrink-0" />
      Verification pending
    </span>
  )
}

// ── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ListingRow['status'] }) {
  const styles = {
    live:     'bg-green-50 text-green-700 border-green-200',
    draft:    'bg-[#F8F8FA] text-[#6E6E73] border-[#E5E5E7]',
    sold:     'bg-blue-50 text-blue-700 border-blue-200',
    archived: 'bg-[#F8F8FA] text-[#6E6E73] border-[#E5E5E7]',
  }
  const labels = { live: 'Live', draft: 'Draft', sold: 'Sold', archived: 'Archived' }
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />}
      {labels[status]}
    </span>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="bg-white border border-[#E5E5E7] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6E6E73]">{label}</span>
        <Icon size={16} className="text-[#C4C6CC]" />
      </div>
      <p className="text-[28px] font-light text-[#0A0A0F] leading-none">{value}</p>
      {sub && <p className="text-[12px] text-[#6E6E73] mt-1.5">{sub}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (!dealer) redirect('/dealers/register')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  const { count: totalEnquiries } = await supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('dealer_id', dealer.id)

  let enquiriesThisPeriod = totalEnquiries ?? 0
  if (dealer.leads_invoiced_through) {
    const { count } = await supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
      .gt('created_at', dealer.leads_invoiced_through)
    enquiriesThisPeriod = count ?? 0
  }

  const rows = listings ?? []
  const liveCount    = rows.filter(l => l.status === 'live').length
  const draftCount   = rows.filter(l => l.status === 'draft').length
  const liveListings = rows.filter(l => l.status === 'live')
  const totalValue   = liveListings.reduce((s, l) => s + l.price, 0)
  const avgPrice     = liveListings.length ? Math.round(totalValue / liveListings.length) : 0
  const topListing   = [...liveListings].sort((a, b) => b.price - a.price)[0]

  const isPaused = dealer.subscription_status === 'awaiting_payment_method' && dealer.billing_activated_at
    ? daysSince(dealer.billing_activated_at, new Date()) >= PAUSE_AFTER_DAYS
    : false

  return (
    <div className="bg-[#F8F8FA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {dealer.subscription_status === 'awaiting_payment_method' && (
          <BillingActivationBanner
            dealerId={dealer.id}
            enquiryCount={totalEnquiries ?? 0}
            isPaused={isPaused}
          />
        )}

        {/* ── Dealer header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-semibold text-[#0A0A0F]">{dealer.business_name}</h1>
              <VerificationBadge dealer={dealer} />
            </div>
            <p className="text-[14px] text-[#6E6E73]">
              {dealer.first_name} {dealer.last_name} · {dealer.city}, {dealer.postcode} · Member since {formatMonth(dealer.created_at)}
            </p>
          </div>
          <div className="flex gap-2 self-start">
            <Link
              href="/dashboard/listings/bulk-upload"
              className="inline-flex items-center gap-2 bg-white border border-[#E5E5E7] hover:border-[#C4C6CC] text-[#0A0A0F] text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload size={15} />
              Bulk upload
            </Link>
            <Link
              href="/dashboard/listings/new"
              className="inline-flex items-center gap-2 bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={15} />
              Add listing
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={LayoutGrid}
            label="Total listings"
            value={rows.length}
            sub={`${liveCount} live · ${draftCount} draft`}
          />
          <StatCard
            icon={Car}
            label="Live now"
            value={liveCount}
            sub={liveCount === 1 ? '1 vehicle on sale' : `${liveCount} vehicles on sale`}
          />
          <StatCard
            icon={PoundSterling}
            label="Avg list price"
            value={avgPrice ? formatPrice(avgPrice) : '—'}
            sub={liveCount ? `across ${liveCount} live listing${liveCount !== 1 ? 's' : ''}` : 'no live listings yet'}
          />
          <StatCard
            icon={TrendingUp}
            label="Top listing"
            value={topListing ? `${topListing.make} ${topListing.model}` : '—'}
            sub={topListing ? formatPrice(topListing.price) : 'add a live listing to see this'}
          />
          <StatCard
            icon={MessageSquare}
            label="Enquiries"
            value={
              dealer.subscription_status === 'not_activated'
                ? `${totalEnquiries ?? 0}/${ACTIVATION_THRESHOLD}`
                : dealer.subscription_status === 'awaiting_payment_method'
                ? totalEnquiries ?? 0
                : enquiriesThisPeriod
            }
            sub={
              dealer.subscription_status === 'not_activated'
                ? `${Math.max(0, ACTIVATION_THRESHOLD - (totalEnquiries ?? 0))} more until billing starts`
                : dealer.subscription_status === 'awaiting_payment_method'
                ? (isPaused ? 'listings paused — add a payment method' : 'add a payment method to keep them coming')
                : enquiriesThisPeriod === 0
                ? 'no charge yet this period'
                : 'will be on your next invoice'
            }
          />
        </div>

        {/* ── Listings table ────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E5E5E7] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E7]">
            <h2 className="text-[15px] font-semibold text-[#0A0A0F]">My listings</h2>
            <span className="text-[13px] text-[#6E6E73]">{rows.length} vehicle{rows.length !== 1 ? 's' : ''}</span>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-[#F8F8FA] border border-[#E5E5E7] flex items-center justify-center mb-4">
                <Car size={22} className="text-[#C4C6CC]" />
              </div>
              <p className="text-[15px] font-medium text-[#0A0A0F] mb-1">No listings yet</p>
              <p className="text-[13px] text-[#6E6E73] mb-6 max-w-xs">
                Add your first vehicle to start reaching buyers on Kerb.
              </p>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center gap-2 bg-[#0A0A0F] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors hover:bg-[#1C1C1E]"
              >
                <Plus size={15} />
                Add your first listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E5E7]">
                    {['Vehicle', 'Price', 'Mileage', 'Status', 'Added', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((listing, i) => (
                    <tr
                      key={listing.id}
                      className={`hover:bg-[#F8F8FA] transition-colors ${i < rows.length - 1 ? 'border-b border-[#E5E5E7]' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-semibold text-[#0A0A0F]">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <p className="text-[12px] text-[#6E6E73] mt-0.5">
                          {listing.colour} · {listing.fuel_type} · {listing.transmission}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-semibold text-[#0A0A0F]">{formatPrice(listing.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] text-[#6E6E73]">{formatMileage(listing.mileage)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={listing.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] text-[#6E6E73]">{formatDate(listing.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/dashboard/listings/${listing.id}/edit`}
                            className="text-[12px] font-medium text-[#6E6E73] hover:text-[#0A0A0F] transition-colors px-2.5 py-1 rounded-md border border-transparent hover:border-[#E5E5E7]"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="p-1.5 text-[#6E6E73] hover:text-[#0A0A0F] rounded-md hover:bg-[#F8F8FA] transition-colors"
                            aria-label="More options"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Verification detail ────────────────────────────────────────── */}
        {dealer.status === 'approved' && dealer.company_number && (
          <div className="mt-6 flex items-center gap-3 bg-white border border-[#E5E5E7] rounded-xl px-5 py-4">
            <CheckCircle2 size={18} className="text-[#C4C6CC] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#0A0A0F]">
                {dealer.business_name} is verified via {dealer.verified_via}
              </p>
              <p className="text-[12px] text-[#6E6E73] mt-0.5">
                Company number {dealer.company_number} · Active status confirmed
              </p>
            </div>
            <ChevronRight size={16} className="text-[#C4C6CC] flex-shrink-0" />
          </div>
        )}

      </div>
    </div>
  )
}
