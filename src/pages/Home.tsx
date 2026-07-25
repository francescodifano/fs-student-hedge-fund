import { Link } from 'react-router-dom'
import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import StatBlock from '../components/StatBlock'
import { usePageTitle } from '../lib/usePageTitle'

// Order and naming follow the live site (Departments 01-04) + Media & Community.
const DEPT_CARDS = [
  {
    name: 'Index Construction',
    to: '/index-construction',
    desc: 'Designing and maintaining custom indices through rigorous methodology, transparent selection criteria, and systematic rebalancing.',
  },
  {
    name: 'Trading & Derivatives',
    to: '/derivatives',
    desc: 'Active trading strategies and derivatives-based approaches with a focus on risk management, execution, and market microstructure.',
  },
  {
    name: 'Hedge Fund',
    to: '/hedge-fund',
    desc: 'Multi-strategy fund combining discretionary and systematic approaches to generate risk-adjusted returns across market environments.',
  },
  {
    name: 'Quantitative Team',
    to: '/quant',
    desc: 'Systematic investment strategies built on rigorous research, quantitative modelling, and data-driven analysis across asset classes.',
  },
  {
    name: 'Media & Community',
    to: '/social',
    desc: 'Building the FSHF brand, growing our network, and connecting our work with partners, sponsors, and future members.',
  },
]

export default function Home() {
  usePageTitle()
  return (
    <>
      {/* Hero (a little more air below the header, per team feedback) */}
      <section className="container-page pt-14 md:pt-20">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end">
          <h1 className="font-display text-display text-navy">
            Discipline
            <br />
            <span className="font-normal">meets </span>
            <span className="font-bold">Ambition</span>
          </h1>
          <p className="text-lead text-navy">
            FS Student Hedge Fund is Frankfurt School's student-run finance initiative, spanning Hedge Fund,
            Trading &amp; Derivatives, and Index Construction teams pursuing diverse strategies across real markets.
          </p>
        </div>
      </section>
      {/* Hero image with the navy band bleeding in from the viewport's left edge,
          straddling the image's bottom (original design: 1054x135 box at left-0) */}
      <div className="relative z-10 mt-14 md:mt-24">
        {/* feature image on the shared rails; slightly less tall, more air above (team feedback) */}
        <div className="container-wide relative z-10">
          <img
            src={A('home-1.jpg')}
            alt=""
            className="h-[40vw] max-h-[560px] min-h-[220px] w-full object-cover"
            fetchPriority="high"
          />
        </div>
        <div aria-hidden className="absolute -bottom-6 left-0 z-0 h-16 w-[78vw] bg-navy md:-bottom-10 md:h-28 md:w-[70vw] md:max-w-[1054px]" />
      </div>

      {/* One team, one mission + stats + team photo.
          Wide grid: text hugs the left, the bigger photo sits right and
          stretches to the height of the whole text block (team feedback). */}
      <section className="container-wide pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-stretch lg:gap-16">
          <div className="max-w-xl">
            <h2 className="font-display text-h1 font-bold text-navy">
              One Team.
              <br />
              One Mission.
            </h2>
            <p className="mt-6 text-lead text-navy/80">
              FS Student Hedge Fund is Frankfurt School's student-managed investment initiative, a selective team
              operating across three departments, Hedge Fund, Trading &amp; Derivatives, and Index Construction.
              Together, we apply institutional-grade strategies to real markets, from developing macro theses and
              managing derivative portfolios to constructing structured indices in collaboration with our industry
              partners.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <StatBlock value="95+" label="Members" />
              <StatBlock value="10+" label="Nationalities" />
              <StatBlock value="5" label="Departments" />
              <StatBlock value="200+" label="Applications" />
            </div>
          </div>
          <img
            src={A('team-hero.jpg')}
            alt="The FS Student Hedge Fund team"
            className="aspect-[4/3] w-full object-cover object-[50%_20%] lg:aspect-auto lg:h-full"
            loading="lazy"
          />
        </div>
      </section>

      {/* Departments */}
      <section className="bg-mist py-16 md:py-24">
        <Container>
          <h2 className="font-display text-h1 font-bold text-navy">Our Departments</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEPT_CARDS.map((c, i) => (
              <Link
                key={c.to}
                to={c.to}
                className={`group flex flex-col justify-between border border-navy/10 bg-white p-7 transition-colors hover:border-navy/30 ${
                  i === DEPT_CARDS.length - 1 ? 'lg:col-span-2' : '' /* fills the 3-col grid's orphan cell */
                }`}
              >
                <div>
                  <h3 className="font-display text-h3 font-bold text-navy">{c.name}</h3>
                  <p className="mt-3 text-navy/70">{c.desc}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 font-sans font-extrabold text-navy transition-transform group-hover:translate-x-1">
                  Learn more <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA on white, with the navy "Contact us" box as its own element
          (original design: 443x91 navy box beside the serif heading) */}
      <section className="container-page py-16 md:py-24">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-h1 font-bold text-navy">Be Where Talent Starts.</h2>
          <Link
            to="/contact"
            className="block w-full bg-navy px-10 py-5 text-center font-sans text-xl font-extrabold text-white transition-opacity hover:opacity-90 md:w-auto md:px-16 md:py-6 md:text-2xl"
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  )
}
