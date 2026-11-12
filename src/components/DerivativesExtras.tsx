import { useCallback, useEffect, useRef, useState } from 'react'
import { asset as A } from '../lib/asset'
import Button from './Button'
import { DERIV_GROUPS, type DerivCard } from '../lib/derivativesCards'
import { WORKSHOP_PHOTOS } from '../lib/workshops'
import { NEXT_EVENT_DATE, NEXT_EVENT_UNTIL, isUpcoming } from '../lib/nextEvent'

// Extra sections on the Trading & Derivatives page only, below its About text (department brief,
// 12 Nov 2026): flip cards on the instruments, a pointer to the next event in the Newsroom, and the
// workshop photo gallery. Content lives in lib/derivativesCards.ts and lib/workshops.ts.
export default function DerivativesExtras() {
  return (
    <>
      <InstrumentCards />
      <NextEventLink />
      <WorkshopGallery />
    </>
  )
}

// Filter buttons (the brief's optional item 2.2, added on the site owner's choice of 12 Nov 2026): the
// section opens on the first group, the options strategies the department trades, so a visitor
// meets 10 cards instead of 29; the other groups and All are one click away.
const FILTERS = ['All', ...DERIV_GROUPS.map((g) => g.filter)]

function InstrumentCards() {
  const [filter, setFilter] = useState(DERIV_GROUPS[0]?.filter ?? 'All')
  const groups = filter === 'All' ? DERIV_GROUPS : DERIV_GROUPS.filter((g) => g.filter === filter)
  return (
    <section className="container-page pb-16 md:pb-24">
      <h2 className="font-display text-h1 font-bold text-navy">Derivative Instruments</h2>
      <div className="mt-5 h-px w-full bg-navy/15" />
      <div role="group" aria-label="Show instruments by group" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`border px-4 py-2.5 font-sans text-[0.95rem] font-extrabold transition-colors ${
              filter === f ? 'border-navy bg-navy text-white' : 'border-navy/20 bg-white text-navy hover:bg-mist'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {/* Tells screen-reader users that the list below changed */}
      <p className="sr-only" aria-live="polite">
        Showing {groups.reduce((n, g) => n + g.cards.length, 0)} cards: {filter}
      </p>
      <p className="mt-6 text-lead text-navy/85">Click a card to flip it.</p>
      {groups.map((g) => (
        <div key={g.title} className="mt-12">
          <h3 className="font-display text-h3 font-bold text-navy">{g.title}</h3>
          {g.note && <p className="mt-2 text-navy/75">{g.note}</p>}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {g.cards.map((c) => (
              <FlipCard key={c.front} card={c} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

// A real button, so Enter and Space flip it too; aria-pressed tells assistive technology which side
// is up, and both sides stay in the accessible text. Reduced motion swaps the 3D turn for a fade.
// Each face centres its text with my-auto and scrolls if enlarged system text ever outgrows it, so
// nothing is cut off (brief 2.2); hover matches the site's other bordered cards.
function FlipCard({ card }: { card: DerivCard }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      className="group block h-56 w-full cursor-pointer text-left [perspective:1200px]"
    >
      <span
        className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none motion-reduce:[transform:none] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <span
          className={`absolute inset-0 flex justify-center overflow-y-auto border border-navy/10 bg-white p-6 text-center transition-colors group-hover:border-navy/30 [-webkit-backface-visibility:hidden] [backface-visibility:hidden] motion-reduce:transition-opacity motion-reduce:duration-300 ${
            flipped ? 'motion-reduce:opacity-0' : ''
          }`}
        >
          <span className="my-auto font-display text-h3 font-bold text-navy">{card.front}</span>
        </span>
        <span
          className={`absolute inset-0 flex overflow-y-auto bg-navy p-6 text-white [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)] motion-reduce:[transform:none] motion-reduce:transition-opacity motion-reduce:duration-300 ${
            flipped ? '' : 'motion-reduce:opacity-0'
          }`}
        >
          <span className="my-auto text-[0.95rem] leading-relaxed text-white/95">{card.back}</span>
        </span>
      </span>
    </button>
  )
}

// The event itself lives in the Newsroom (site owner's decision, 12 Nov 2026); this band only points there.
// After the event date it switches to the brief's fallback line on its own (lib/nextEvent.ts).
function NextEventLink() {
  const upcoming = isUpcoming(NEXT_EVENT_UNTIL)
  return (
    <section className="bg-mist py-14 md:py-20">
      <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-h2 font-bold text-navy">Next Initiative Event</h2>
          <p className="mt-3 max-w-2xl text-lead text-navy/85">
            {upcoming
              ? `${NEXT_EVENT_DATE} at Frankfurt School, exclusive to FS Student Hedge Fund members. The details are in the Newsroom.`
              : 'Our next event will be announced soon.'}
          </p>
        </div>
        <Button to="/newsroom" className="w-full md:w-auto">
          Go to the Newsroom
        </Button>
      </div>
    </section>
  )
}

function WorkshopGallery() {
  const [open, setOpen] = useState<number | null>(null)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  // The thumbnail that opened the lightbox gets the focus back when it closes (brief 4.2).
  const openedFrom = useRef(0)
  if (WORKSHOP_PHOTOS.length === 0) return null
  return (
    <section className="container-page py-16 md:py-24">
      <h2 className="font-display text-h1 font-bold text-navy">Our Workshops</h2>
      <div className="mt-5 h-px w-full bg-navy/15" />
      <p className="mt-8 max-w-3xl text-lead text-navy/85">
        Highlights from our workshops on portfolio management and derivative instruments, and preparation for trading interviews.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {WORKSHOP_PHOTOS.map((src, i) => (
          <button
            key={src}
            type="button"
            ref={(el) => {
              thumbs.current[i] = el
            }}
            onClick={() => {
              openedFrom.current = i
              setOpen(i)
            }}
            className="group block overflow-hidden border border-navy/10 bg-mist"
            aria-label={`Open photo ${i + 1} of ${WORKSHOP_PHOTOS.length}`}
          >
            <img
              src={A(src)}
              alt="Participants at a Trading & Derivatives workshop"
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          index={open}
          onIndex={setOpen}
          onClose={() => {
            setOpen(null)
            requestAnimationFrame(() => thumbs.current[openedFrom.current]?.focus())
          }}
        />
      )}
    </section>
  )
}

// Width of this device's classic scrollbar, measured on a hidden probe (0 where scrollbars overlay
// the content). Measured this way, a page that is too wide does not count as a scrollbar.
function scrollbarWidth() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll'
  document.body.appendChild(probe)
  const w = probe.offsetWidth - probe.clientWidth
  probe.remove()
  return w
}

function Lightbox({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const n = WORKSHOP_PHOTOS.length
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const prev = useCallback(() => onIndex((index - 1 + n) % n), [index, n, onIndex])
  const next = useCallback(() => onIndex((index + 1) % n), [index, n, onIndex])

  // On open: focus the close button and stop the page behind from scrolling. Where the page has a
  // classic scrollbar that takes up space, the body is padded by its width so nothing jumps sideways;
  // overlay scrollbars (phones, most Macs) measure 0 and get no padding.
  useEffect(() => {
    closeRef.current?.focus()
    const { overflow, paddingRight } = document.body.style
    const de = document.documentElement
    const gap = de.scrollHeight > de.clientHeight ? scrollbarWidth() : 0
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [])

  // Keys: Esc closes, arrows change photo, and Tab cycles through the dialog's own buttons only,
  // so keyboard focus never moves to the page hidden behind it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Tab') {
        const items = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        if (items.length === 0) return
        e.preventDefault()
        const at = items.indexOf(document.activeElement as HTMLButtonElement)
        const to = e.shiftKey ? (at <= 0 ? items.length - 1 : at - 1) : at === -1 || at === items.length - 1 ? 0 : at + 1
        items[to].focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Workshop photo ${index + 1} of ${n}`}
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-navy/95 p-4 [touch-action:pinch-zoom]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      // Swipe: one finger, mostly sideways, at least 50 px; anything else (scrolls, pinches) is ignored.
      onTouchStart={(e) => {
        touch.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
      }}
      onTouchEnd={(e) => {
        const t = touch.current
        touch.current = null
        if (!t || e.touches.length > 0) return
        const dx = e.changedTouches[0].clientX - t.x
        const dy = e.changedTouches[0].clientY - t.y
        if (Math.abs(dx) < 50 || Math.abs(dx) < 1.5 * Math.abs(dy)) return
        if (dx > 0) prev()
        else next()
      }}
    >
      <img
        src={A(WORKSHOP_PHOTOS[index])}
        alt="Participants at a Trading & Derivatives workshop"
        className="max-h-[88vh] max-w-full object-contain"
      />
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 bg-white px-4 py-2 font-sans font-extrabold text-navy hover:bg-mist"
      >
        Close
      </button>
      {n > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-4 py-3 font-sans text-xl font-extrabold text-navy hover:bg-mist"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-4 py-3 font-sans text-xl font-extrabold text-navy hover:bg-mist"
          >
            <span aria-hidden>→</span>
          </button>
        </>
      )}
      {/* Announced to screen readers when the photo changes */}
      <p aria-live="polite" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-white/80">
        <span aria-hidden="true" data-counter>
          {index + 1} / {n}
        </span>
        <span className="sr-only">
          Photo {index + 1} of {n}
        </span>
      </p>
    </div>
  )
}
