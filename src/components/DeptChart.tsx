import { asset as A } from '../lib/asset'
import { byName } from '../lib/team'
import { CHART_AS_OF, CHART_LEADS, CHART_TEAMS, type ChartPerson, type ChartTeam } from '../lib/hedgeFundTeam'

// Organisation chart of the Hedge Fund Department: the two heads, the
// portfolio manager, then one card per research team. Data lives in
// lib/hedgeFundTeam.ts; the lead photos come from the shared team list.

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`inline-block h-3.5 w-3.5 shrink-0 fill-current ${className}`} role="img" aria-label="On a semester abroad">
      <path d="M10 1.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L10 15l-5.4 2.9 1.1-6.1L1.2 7.6l6.1-.8z" />
    </svg>
  )
}

// Round portrait cut from the 3:4 team photo, zoomed on the face.
const ZOOM = 2.7
function Portrait({ img, face = [0.5, 0.45] }: { img: string; face?: [number, number] }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
      <img
        src={A(img)}
        alt=""
        className="absolute max-w-none"
        style={{ width: `${ZOOM * 100}%`, left: `${50 - face[0] * ZOOM * 100}%`, top: `${50 - face[1] * ZOOM * (400 / 3)}%` }}
        loading="lazy"
      />
    </div>
  )
}

function LeadCard({ name, role, abroad, light = false }: { name: string; role: string; abroad?: boolean; light?: boolean }) {
  const m = byName(name)[0]
  return (
    <div className={`flex items-center gap-4 px-4 py-3 ${light ? 'bg-white text-navy' : 'border border-white/35 bg-white/10 text-white'}`}>
      {m && <Portrait img={m.img} face={m.face} />}
      <div className="min-w-0">
        <div className={`font-sans text-xs font-extrabold ${light ? 'text-navy/70' : 'text-white/75'}`}>{role}</div>
        <div className="font-sans text-lg font-bold leading-tight">
          {name}
          {abroad && <Star className="ml-1.5 align-[-1px]" />}
        </div>
      </div>
    </div>
  )
}

function Person({ p }: { p: ChartPerson }) {
  return (
    <li className={`flex items-center gap-2 border-b border-navy/10 py-2 font-sans ${p.former ? 'text-navy/35' : 'text-navy'}`}>
      <span className="font-semibold">{p.name}</span>
      {p.abroad && <Star />}
    </li>
  )
}

function TeamCard({ team }: { team: ChartTeam }) {
  const count = team.groups.reduce((n, g) => n + g.people.filter((p) => !p.former).length, 0)
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-baseline justify-between gap-3 bg-navy px-4 py-3 text-white">
        <h3 className="font-display text-xl font-bold">{team.name}</h3>
        <span className="shrink-0 font-sans text-xs font-bold text-white/70">
          {count} {count === 1 ? 'member' : 'members'}
        </span>
      </div>
      <div className={`flex-1 px-4 pb-4 pt-2 ${team.groups.length > 1 ? 'grid gap-x-6 sm:grid-cols-2' : ''}`}>
        {team.groups.map((g, i) => (
          <div key={g.label ?? i}>
            {g.label && <div className="border-b-2 border-navy/25 pb-1 pt-2 font-sans text-xs font-extrabold text-navy/60">{g.label}</div>}
            <ul>
              {g.people.map((p) => (
                <Person key={p.name} p={p} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DeptChart() {
  const abroad = new Set(CHART_LEADS.headsAbroad)
  return (
    <section id="organisation" className="container-page pt-16 md:pt-24">
      <h2 className="font-display text-h1 font-bold text-navy">How we are organised</h2>
      <div className="mt-5 h-px w-full bg-navy/15" />

      <div className="mt-10 bg-mist/60">
        {/* Leadership band */}
        <div className="bg-navy px-5 py-8 sm:px-8 md:py-10">
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {CHART_LEADS.heads.map((n) => (
              <LeadCard key={n} name={n} role="Head of Department" abroad={abroad.has(n)} />
            ))}
          </div>
          {/* Bracket from the two heads down to the portfolio manager */}
          <div aria-hidden className="mx-auto hidden h-6 max-w-3xl sm:block">
            <div className="mx-auto h-3 w-1/2 border-x-2 border-b-2 border-white/50" />
            <div className="mx-auto h-3 w-0.5 bg-white/50" />
          </div>
          <div className="mx-auto mt-3 max-w-sm sm:mt-0">
            <LeadCard name={CHART_LEADS.portfolioManager} role="Portfolio Manager" light />
          </div>
        </div>
        {/* Stem from the portfolio manager into the teams */}
        <div aria-hidden className="mx-auto hidden h-8 w-0.5 bg-navy/40 lg:block" />

        {/* Teams */}
        <div className="grid gap-4 p-4 pt-6 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_1fr_1.7fr] lg:pt-0">
          {CHART_TEAMS.map((t) => (
            <TeamCard key={t.name} team={t} />
          ))}
        </div>
        <div className="flex flex-col gap-1 px-4 pb-5 font-sans text-sm text-navy/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="inline-flex items-center gap-2">
            <Star /> On a semester abroad
          </span>
          <span>As of {CHART_AS_OF}</span>
        </div>
      </div>
    </section>
  )
}
