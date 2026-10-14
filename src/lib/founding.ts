import { createServerClient } from '@/lib/supabase/server'

// Founding dealers join through a private invite link (Hans, 14 Oct 2026):
// no plan or pricing step, no Stripe customer, and billing never starts while
// free_until is null (no end date) or still in the future.
export function isFoundingFree(
  dealer: { founding_dealer?: boolean | null; free_until?: string | null },
  now: Date,
): boolean {
  if (!dealer.founding_dealer) return false
  return !dealer.free_until || new Date(dealer.free_until) > now
}

export type FoundingInvite = { code: string; label: string; free_until: string | null }

// An invite is usable once. Returns null for an unknown or already-used code.
export async function findUnusedInvite(
  supabase: ReturnType<typeof createServerClient>,
  code: string | undefined | null,
): Promise<FoundingInvite | null> {
  if (!code || !/^[A-Za-z0-9-]{6,64}$/.test(code)) return null
  const { data } = await supabase
    .from('dealer_invites')
    .select('code, label, free_until, used_at')
    .eq('code', code)
    .maybeSingle()
  if (!data || data.used_at) return null
  return { code: data.code, label: data.label, free_until: data.free_until }
}
