import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import Button from '../components/Button'
import { usePageTitle } from '../lib/usePageTitle'
import { CONTACT_MAILTO } from '../lib/contact'
import { NEXT_EVENT_UNTIL, isUpcoming } from '../lib/nextEvent'

// Events render as compact cards in a grid so several fit side by side.
// The visual is the organiser's logo on white (team feedback), not a photo.
// Team decision 25 Jul: events stay off the page until they are 100% confirmed
// (the J.P. Morgan card was removed under that rule; restore it from git
// history once the event is locked in).
// 12 Nov 2026: the Trading & Derivatives department supplied its first event with
// its own infographic (`poster`: shown whole, never cropped, a click opens the full
// file). Names stay out of the title and text at the department's request; the
// infographic carries them. Members only, so no Contact button (`contact: false`).
// `until`: the card leaves the page from that moment on.
type NewsEvent = {
  title: string
  logo?: string
  poster?: string
  posterAlt?: string
  date: { month: string; day: string }
  details: [string, string][]
  until?: string
  contact?: boolean
}

const EVENTS: NewsEvent[] = [
  {
    title: 'Next Initiative Event',
    poster: 'nextevent.jpg',
    posterAlt: 'Infographic for the next Trading & Derivatives event on 26 November 2026',
    date: { month: 'Nov', day: '26' },
    details: [
      ['Host', 'Trading & Derivatives department'],
      ['Where', 'Frankfurt School'],
      ['Access', 'Exclusive to FS Student Hedge Fund members'],
      ['Speaker', 'A Vice President of Equity Sales'],
      ['Programme', 'An introduction to the bank and to what the role on its equity sales desk really looks like, followed by an open Q&A session'],
      ['Why attend', 'A chance to learn directly from someone working at the heart of the markets and to get your questions answered'],
    ],
    until: NEXT_EVENT_UNTIL,
    contact: false,
  },
]

export default function Newsroom() {
  usePageTitle('Newsroom')
  const events = EVENTS.filter((e) => isUpcoming(e.until))
  return (
    <>
      {/* Hero */}
      <section className="container-page pt-12 pb-14 md:pt-16 md:pb-20">
        <h1 className="font-display text-display font-bold text-navy">Newsroom</h1>
        <p className="mt-6 max-w-2xl text-lead text-navy/80">
          Talks, firm visits, and everything else happening this semester at FS Student Hedge Fund.
        </p>
      </section>

      {/* Events grid */}
      <section className="bg-mist py-16 md:py-24">
        <Container>
          <h2 className="font-display text-h1 font-bold text-navy">This Semester</h2>
          <div className="mt-5 h-px w-full bg-navy/15" />

          {events.length === 0 && (
            <div className="mt-10 max-w-2xl">
              <p className="text-lead text-navy/80">
                The events for the coming semester are being finalized and will be announced here. In the meantime,
                our latest published work is on the Research page.
              </p>
              <div className="mt-8">
                <Button to="/research" className="w-full sm:w-auto">
                  Read our research
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((e) => (
              <article key={e.title} className="flex flex-col overflow-hidden border border-navy/10 bg-white">
                {e.poster ? (
                  <a
                    href={A(e.poster)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${e.posterAlt ?? e.title}, full size in a new tab`}
                    className="block"
                  >
                    <img
                      src={A(e.poster)}
                      alt={e.posterAlt ?? e.title}
                      width={1414}
                      height={2000}
                      className="h-auto w-full"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ) : e.logo ? (
                  <img
                    src={A(e.logo)}
                    alt={`${e.title} logo`}
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="flex flex-1 flex-col bg-navy p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 text-center leading-none">
                      <div className="bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white">{e.date.month}</div>
                      <div className="bg-white px-3 py-1.5 font-display text-xl font-bold text-navy">{e.date.day}</div>
                    </div>
                    <h3 className="font-display text-h3 font-bold">{e.title}</h3>
                  </div>

                  <dl className="mt-5 flex-1 space-y-3">
                    {e.details.map(([label, value]) => (
                      <div key={label} className="border-t border-white/15 pt-2.5">
                        <dt className="text-xs font-extrabold text-white/60">{label}</dt>
                        <dd className="mt-0.5 text-sm text-white/90">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {e.contact !== false && (
                    <div className="mt-6">
                      <Button href={CONTACT_MAILTO} variant="light" className="w-full sm:w-auto">
                        Contact
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
