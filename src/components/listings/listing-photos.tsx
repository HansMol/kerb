'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Car } from 'lucide-react'

interface Props {
  photos: string[]
  title: string
}

export function ListingPhotos({ photos, title }: Props) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[4/3] bg-[#F8F8FA] flex items-center justify-center">
        <Car size={40} className="text-[#E5E5E7]" />
      </div>
    )
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex(i => (i - 1 + photos.length) % photos.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex(i => (i + 1) % photos.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -40) setIndex(i => (i + 1) % photos.length)
    if (delta > 40) setIndex(i => (i - 1 + photos.length) % photos.length)
    touchStartX.current = null
  }

  return (
    <div
      className="relative aspect-[4/3] bg-[#F8F8FA] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index]}
        alt={`${title} — photo ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight size={14} />
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setIndex(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
