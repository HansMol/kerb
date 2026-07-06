'use client'

import { useState, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { SearchFilters } from './search-filters'

interface Props {
  makes: string[]
}

export function MobileFilterDrawer({ makes }: Props) {
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams()

  // Count active filters (exclude sort param)
  const activeCount = [...searchParams.entries()].filter(([k]) => k !== 'sort').length

  // Close on route change (filter applied)
  useEffect(() => {
    setOpen(false)
  }, [searchParams])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Trigger button — mobile/tablet only */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-md border border-[#E5E5E7] bg-white text-sm font-medium text-[#0A0A0F] hover:border-[#C4C6CC] transition-colors"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#A0714A] text-white text-[11px] font-semibold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E7] sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-[#0A0A0F]">Filters &amp; Sort</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F8F8FA] hover:bg-[#E5E5E7] flex items-center justify-center transition-colors"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <SearchFilters makes={makes} />
        </div>

        <div className="px-5 pb-8 pt-2 sticky bottom-0 bg-white border-t border-[#E5E5E7]">
          <button
            onClick={() => setOpen(false)}
            className="w-full bg-[#0A0A0F] hover:bg-[#1C1C1E] text-white font-semibold py-3 rounded-md transition-colors text-sm"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  )
}
