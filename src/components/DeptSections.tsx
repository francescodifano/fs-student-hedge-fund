import { Link } from 'react-router-dom'
import Container from './Container'
import TeamCard from './TeamCard'
import { byName } from '../lib/team'
import { DEPARTMENTS } from '../lib/nav'

// Shared sections for every department page: mission band, department leads,
// cross-navigation to the other departments, and a join CTA.

export function MissionBand({ children, support }: { children: string; support?: string }) {
  return (
    <section className="border-b border-white/10 bg-navy text-white">
      <Container className="py-14 md:py-20">
        <p className="font-sans text-sm font-bold tracking-wide text-white/60">Our mission</p>
        <p className="mt-4 max-w-4xl font-display text-h2 font-bold">{children}</p>
        {support && <p className="mt-6 max-w-4xl text-lead text-white/85">{support}</p>}
      </Container>
    </section>
  )
}

export function DeptLeads({ names }: { names: string[] }) {
  const leads = byName(...names)
  if (!leads.length) return null
  return (
    <section className="container-page py-16 md:py-24">
      <h2 className="font-display text-h1 font-bold text-navy">Department Leads</h2>
      {/* A lone lead gets a single, wider column on mobile instead of half the
          viewport next to an empty cell */}
      <div className={`mt-10 grid gap-4 sm:gap-6 lg:grid-cols-4 ${leads.length === 1 ? 'max-w-[280px] grid-cols-1 sm:max-w-none sm:grid-cols-2' : 'grid-cols-2'}`}>
        {leads.map((m) => (
          <TeamCard key={m.name} m={m} />
        ))}
      </div>
      <Link to="/about" className="mt-8 inline-flex items-center gap-2 font-sans font-extrabold text-navy transition-transform hover:translate-x-1">
        Meet the whole board <span aria-hidden>→</span>
      </Link>
    </section>
  )
}

export function OtherDepartments({ current }: { current: string }) {
  const others = DEPARTMENTS.filter((d) => d.to !== current)
  return (
    <section className="bg-mist py-16 md:py-24">
      <Container>
        <h2 className="font-display text-h1 font-bold text-navy">Explore the other departments</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {others.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="group flex items-center justify-between border border-navy/10 bg-white p-6 transition-colors hover:border-navy/30"
            >
              <span className="font-display text-h3 font-bold text-navy">{d.label}</span>
              <span aria-hidden className="font-sans font-extrabold text-navy transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

// Same design as the homepage's closing CTA (white, serif navy heading, navy
// box button) — only the wording differs per department.
export function JoinCta({ dept }: { dept: string }) {
  return (
    <section className="container-page py-16 md:py-24 print:hidden">
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-h1 font-bold text-navy">
          Interested in <span className="whitespace-nowrap">{dept}?</span>
        </h2>
        <Link
          to="/applications"
          className="block w-full bg-navy px-10 py-5 text-center font-sans text-xl font-extrabold text-white transition-opacity hover:opacity-90 md:w-auto md:px-16 md:py-6 md:text-2xl"
        >
          Apply
        </Link>
      </div>
    </section>
  )
}
