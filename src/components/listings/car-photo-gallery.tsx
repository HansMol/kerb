'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Car, ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'

interface Props {
  photos: string[]
  title: string
}

export function CarPhotoGallery({ photos, title }: Props) {
  const [mainIndex, setMainIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const lbPrev = useCallback(() =>
    setLightboxIndex(i => i === null ? null : (i - 1 + photos.length) % photos.length),
    [photos.length]
  )
  const lbNext = useCallback(() =>
    setLightboxIndex(i => i === null ? null : (i + 1) % photos.length),
    [photos.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lbPrev()
      if (e.key === 'ArrowRight') lbNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, lbPrev, lbNext, closeLightbox])

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  const handleMainTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleMainTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -40) setMainIndex(i => (i + 1) % photos.length)
    if (delta > 40) setMainIndex(i => (i - 1 + photos.length) % photos.length)
    touchStartX.current = null
  }

  const lbTouchStartX = useRef<number | null>(null)
  const handleLbTouchStart = (e: React.TouchEvent) => {
    lbTouchStartX.current = e.touches[0].clientX
  }
  const handleLbTouchEnd = (e: React.TouchEvent) => {
    if (lbTouchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - lbTouchStartX.current
    if (delta < -50) lbNext()
    if (delta > 50) lbPrev()
    lbTouchStartX.current = null
  }

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-[#F8F8FA] flex items-center justify-center">
        <Car size={64} className="text-[#E5E5E7]" />
      </div>
    )
  }

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[16/10] rounded-md overflow-hidden bg-[#F8F8FA] cursor-zoom-in"
        onTouchStart={handleMainTouchStart}
        onTouchEnd={handleMainTouchEnd}
        onClick={() => openLightbox(mainIndex)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[mainIndex]}
          alt={`${title} — photo ${mainIndex + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white">
          <Expand size={14} />
        </div>
        {photos.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setMainIndex(i => (i - 1 + photos.length) % photos.length) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setMainIndex(i => (i + 1) % photos.length) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {mainIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
          {photos.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`${title} photo ${i + 1}`}
              onClick={() => setMainIndex(i)}
              className={`h-20 w-28 object-cover rounded shrink-0 cursor-pointer transition-all ${
                i === mainIndex
                  ? 'border-2 border-[#A0714A] opacity-100'
                  : 'border border-[#E5E5E7] opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex flex-col"
          onTouchStart={handleLbTouchStart}
          onTouchEnd={handleLbTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <p className="text-white/50 text-sm">{lightboxIndex + 1} / {photos.length}</p>
            <button
              onClick={closeLightbox}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close gallery"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center relative px-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex]}
              alt={`${title} — photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={lbPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={lbNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 px-5 py-4 overflow-x-auto shrink-0 justify-center">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`shrink-0 w-16 h-11 rounded overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
