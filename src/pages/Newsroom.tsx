import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import Button from '../components/Button'
import { usePageTitle } from '../lib/usePageTitle'

// Events render as compact cards in a grid so several fit side by side.
// The visual is the organiser's logo on white (team feedback), not a photo.
// Team decision 25 Jul: events stay off the page until they are 100% confirmed
// (the J.P. Morgan card was removed under that rule; restore it from git
// history once the event is locked in).
const EVENTS: {
  title: string
  logo: string
  date: { month: string; day: string }
  details: [string, string][]
}[] = []

export default function Newsroom() {
  usePageTitle('Newsroom')
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

          {EVENTS.length === 0 && (
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
            {EVENTS.map((e) => (
              <article key={e.title} className="flex flex-col overflow-hidden border border-navy/10 bg-white">
                <img
                  src={A(e.logo)}
                  alt={`${e.title} logo`}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
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

                  <div className="mt-6">
                    <Button to="/contact" variant="light" className="w-full sm:w-auto">
                      Apply
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
