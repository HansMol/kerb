'use client'

import { useState } from 'react'

export type Slide = {
  photo: string
  kind: 'cover' | 'spec' | 'text' | 'breathing' | 'verdict'
  kicker: string
  headline: string
  body?: string
  specs?: { v: string; k: string }[]
}

// Visual language matches the hand-built Vehicle Content/<car>/template-preview.html
// examples exactly (dark scrim, kicker, headline, spec-strip, verdict slide) — the
// same real format already approved and used for the Kerb - BMW 330i Mark Hopkins
// Canva carousel. Standardised to exactly 10 slides.
export function CarouselMockup({
  slides,
  dealerName,
  caption,
}: {
  slides: Slide[]
  dealerName: string
  caption?: string
}) {
  const [active, setActive] = useState(0)
  if (!slides.length) return null
  const slide = slides[active]

  return (
    <div className="mx-auto w-full max-w-[340px]">
      {/* Instagram phone-UI wrapper — matches Kerb - Social Amplification.html */}
      <div className="rounded-xl border border-charcoal bg-[#111116] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-charcoal px-3.5 py-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-charcoal to-[#2A2A2E] text-[10px] font-semibold text-platinum">
            K
          </div>
          <span className="text-xs font-semibold text-platinum">kerb.autos</span>
          <span className="ml-auto text-[11px] font-semibold text-[#4A8FE7]">Follow</span>
        </div>

        <div className="relative aspect-square w-full overflow-hidden bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.photo}
            alt={slide.headline || 'Kerb carousel slide'}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className={
              slide.kind === 'cover' || slide.kind === 'verdict'
                ? 'absolute inset-0'
                : 'absolute inset-x-0 bottom-0 h-[62%]'
            }
            style={{
              // Only darken the caption band — the car itself (the top ~55%
              // of the frame on cover/verdict slides) stays fully clear, not
              // washed out, so viewers see it in full rather than through a
              // tint (real feedback, 17 Aug 2026: the car needs to be seen
              // "in all its glory", not dampened for text contrast). A small
              // non-zero base darkening was added 18 Aug 2026 after real
              // feedback that white text over a light-coloured car was
              // unreadable on cover slides — the gradient alone isn't
              // enough for short kicker text that sits above the 45% mark;
              // combined with the text-shadow below, not a replacement.
              background:
                slide.kind === 'cover' || slide.kind === 'verdict'
                  ? 'linear-gradient(180deg, rgba(10,10,15,0.18) 0%, rgba(10,10,15,0.12) 45%, rgba(10,10,15,0.85) 100%)'
                  : 'linear-gradient(to top, rgba(10,10,15,0.96) 0%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0) 100%)',
            }}
          />

          {/* slide dots */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`block h-[4px] rounded-full transition-all ${
                  i === active ? 'w-3.5 bg-white' : 'w-[4px] bg-white/35'
                }`}
              />
            ))}
          </div>

          {(slide.kicker || slide.headline) && (
            <div className="absolute inset-x-0 bottom-0 p-4">
              {slide.kicker && (
                <div
                  className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-copper-light"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
                >
                  {slide.kicker}
                </div>
              )}
              {slide.headline && (
                <div
                  className="mb-2 text-[19px] font-extrabold uppercase leading-[1.1] tracking-[-0.01em] text-white"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                >
                  {slide.headline}
                </div>
              )}
              {slide.body && <p className="text-[12.5px] leading-[1.4] text-cloud">{slide.body}</p>}
              {slide.specs && (
                <div className="mt-2.5 flex gap-3 border-t border-white/20 pt-2.5">
                  {slide.specs.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[13px] font-extrabold text-white">{s.v}</span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-platinum-deep">
                        {s.k}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setActive((a) => Math.min(a + 1, slides.length - 1))}
            className="absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/15 text-sm text-white"
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-3.5 px-3.5 pt-2.5 pb-1 text-lg text-platinum">
          <span>♡</span>
          <span>💬</span>
          <span>↗</span>
          <span className="ml-auto">⋔</span>
        </div>
        <div className="px-3.5 pb-1 text-xs font-semibold text-platinum">Liked by real buyers</div>
        <div
          className="px-3.5 pb-3.5 text-xs leading-[1.5] text-platinum-deep"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          <span className="font-semibold text-platinum">kerb.autos</span>{' '}
          {caption || (
            <>
              {slides[0]?.headline} <span className="text-[#4A8FE7]">#RealKerbAppeal</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === active ? 'bg-copper' : 'bg-charcoal'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-platinum-deep">
        Slide {active + 1} of {slides.length} — mockup of the finished post, sourced from {dealerName}&apos;s real
        listing photos
      </p>
    </div>
  )
}
