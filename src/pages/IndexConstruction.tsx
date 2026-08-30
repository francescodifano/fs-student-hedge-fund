import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import StatBlock from '../components/StatBlock'
import { usePageTitle } from '../lib/usePageTitle'
import { MissionBand, DeptLeads, OtherDepartments, JoinCta } from '../components/DeptSections'

// "Our Process" — the Figma design's two-row box system: three navy boxes for
// the internal stages, two light boxes for the partner stages, plus a legend.
// Copy is the Figma's own.
const INTERNAL = [
  { n: '01', title: 'Research', desc: 'Systematic top-down screening across global sectors to identify investable themes and structural opportunities.' },
  { n: '02', title: 'Asset Selection', desc: 'Pod-based bottom-up analysis of individual securities, scored and ranked against a defined set of criteria.' },
  { n: '03', title: 'Structuring', desc: 'Formal index construction covering weighting methodology, rebalancing rules, and a full performance backtest.' },
]
const PARTNERS = [
  { tag: 'Calculation', name: 'Partner 1', desc: 'Independent index calculation and administration, ensuring full methodology transparency and regulatory compliance.' },
  { tag: 'Issuance', name: 'Partner 2', desc: 'Structured product issuance, bringing the index to market as a publicly tradable financial product.' },
]

const INDEX_SPECS: [string, string][] = [
  ['Topic', 'Global Energy Value Chain'],
  ['Geography', 'Global'],
  ['Weighting', 'Market Cap'],
  ['Benchmark', 'MSCI World'],
  ['Asset Selection', 'FSHF Internal'],
  ['Calculation', 'Partner 1'],
  ['Issuance', 'Partner 2'],
]

// Index Construction — the richest department page: hero, intro, stats,
// process, index banner, then the shared department sections.
export default function IndexConstruction() {
  usePageTitle('Index Construction')

  return (
    <article>
      <section className="relative">
        <img
          src={A('indexconstruction-1.jpg')}
          alt=""
          className="h-[48vw] max-h-[520px] min-h-[240px] w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy/10" />
        {/* Name band: left-aligned with the content grid, straddling the image's
            bottom edge (half over the photo, half over the white area) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="container-page">
            <h1 className="inline-block bg-navy px-8 py-5 font-display text-h1 font-bold text-white sm:px-12 sm:py-6">Index Construction</h1>
          </div>
        </div>
      </section>

      <section className="container-page pt-28 pb-16 md:pt-36 md:pb-24">
        <h2 className="font-display text-h1 font-bold text-navy">About</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <div className="mt-8 space-y-6 text-lead text-navy/85">
          <p>
            The Index Construction Department designs and launches publicly tradable financial indices, taking ideas
            from raw sector research all the way through to a live investable product. Our process follows a rigorous
            top-down methodology, systematic market screening, pod-based sector research, disciplined asset
            selection, and formal index construction by our structuring desk. Every index comes with a defined
            methodology, transparent selection criteria, and a full performance backtest.
          </p>
          <p className="font-display text-h3 font-bold text-navy">
            In partnership with leading industry players, we build real financial products, not simulations.
          </p>
        </div>
      </section>

      {/* Real numbers from the Solactive pitch deck */}
      <section className="container-page pb-16 md:pb-20">
        <div className="grid grid-cols-2 gap-6 border-y border-navy/10 py-10 sm:grid-cols-4 sm:gap-10">
          <StatBlock value="30" label="Members" />
          <StatBlock value="1" label="Demo Index" />
          <StatBlock value="30+" label="Companies Analysed" />
          <StatBlock value="5" label="Sectors Covered" />
        </div>
      </section>

      {/* From Research to Products — the Figma box system with flow arrows:
          navy boxes = FSHF internal stages, light boxes = partner stages */}
      <section className="container-page py-16 md:py-24">
        <h2 className="font-display text-h1 font-bold text-navy">From Research to Products</h2>

        <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-stretch md:gap-4">
          {INTERNAL.map((s, i) => (
            <div key={s.n} className="contents">
              {i > 0 && (
                <div aria-hidden className="flex items-center justify-center text-3xl font-bold text-navy/50">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:block">→</span>
                </div>
              )}
              <div className="flex-1 bg-navy p-7 text-white md:p-8">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-3xl font-bold">{s.n}</span>
                  <h3 className="font-sans text-2xl font-extrabold">{s.title}</h3>
                </div>
                <p className="mt-4 text-white/85">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div aria-hidden className="my-6 flex justify-center text-3xl font-bold text-navy/50 md:my-8">↓</div>

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-4">
          {PARTNERS.map((p, i) => (
            <div key={p.name} className="contents">
              {i > 0 && (
                <div aria-hidden className="flex items-center justify-center text-3xl font-bold text-navy/50">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:block">→</span>
                </div>
              )}
              <div className="flex-1 bg-mist p-7 text-navy md:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-sans text-2xl font-extrabold">{p.name}</h3>
                  <span className="font-display text-lg text-navy/70">{p.tag}</span>
                </div>
                <p className="mt-4 text-navy/80">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-navy">
          <span className="flex items-center gap-2.5">
            <span aria-hidden className="inline-block h-4 w-4 bg-navy" />
            FSHF Internal
          </span>
          <span className="flex items-center gap-2.5">
            <span aria-hidden className="inline-block h-4 w-4 border border-navy/20 bg-mist" />
            Partners
          </span>
        </div>
      </section>

      {/* Index banner: FSHF Energy Value Chain + performance chart */}
      <section className="bg-mist py-16 md:py-24">
        <Container>
          <p className="font-sans text-sm font-bold tracking-wide text-navy/60">Past Indices</p>
          <h2 className="mt-3 font-display text-h1 font-bold text-balance text-navy">FSHF Energy Value Chain</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <figure>
              <img
                src={A('ic-performance.jpg')}
                alt="Performance of the FSHF Energy Value Chain index against its benchmark"
                className="w-full"
                loading="lazy"
              />
              <figcaption className="mt-3 text-sm font-semibold text-navy/70">Performance</figcaption>
            </figure>
            <dl className="divide-y divide-navy/10 border-y border-navy/10">
              {INDEX_SPECS.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="font-sans font-extrabold text-navy">{k}</dt>
                  <dd className="text-right text-navy/75">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <MissionBand>Construction of data-driven indices, from market screening to a tradable product.</MissionBand>
      <DeptLeads names={['Vincent Ogrodowczyk', 'David Wunderlich']} />
      <OtherDepartments current="/index-construction" />
      <JoinCta dept="Index Construction" />
    </article>
  )
}
