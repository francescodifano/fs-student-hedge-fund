import { asset as A } from '../lib/asset'
import Container from '../components/Container'
import Button from '../components/Button'
import TeamCard from '../components/TeamCard'
import { TEAM } from '../lib/team'
import { usePageTitle } from '../lib/usePageTitle'

export default function About() {
  usePageTitle('About')
  return (
    <>
      {/* Hero, mirroring the homepage: serif heading left, solid-navy lead + Apply right */}
      <section className="container-page pt-12 md:pt-16">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end">
          <h1 className="font-display text-display text-navy">
            Serious About Finance?
            <br />
            So Are We.
          </h1>
          <div>
            <p className="text-lead text-navy">
              Frankfurt School's student-run finance initiative, where academic rigor meets real markets.
            </p>
            <div className="mt-8">
              <Button to="/applications" className="w-full sm:w-auto">Apply</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team photo with the navy band bleeding in from the viewport's left edge,
          straddling the image bottom (same treatment as the homepage hero) */}
      <div className="relative z-10 mt-12 md:mt-20">
        {/* image layered above the band (band peeks out left and below, unchanged position) */}
        <div className="container-page relative z-10">
          <img
            src={A('team-hero.jpg')}
            alt="The FS Student Hedge Fund team"
            className="h-[42vw] max-h-[600px] min-h-[220px] w-full object-cover object-[50%_68%]"
            fetchPriority="high"
          />
        </div>
        <div aria-hidden className="absolute -bottom-6 left-0 z-0 h-16 w-[78vw] bg-navy md:-bottom-10 md:h-28 md:w-[70vw] md:max-w-[1054px]" />
      </div>

      {/* Mission (extra top padding clears the band overhang) */}
      <section className="bg-mist pt-24 pb-16 md:pt-32 md:pb-24">
        <Container>
          <h2 className="font-display text-h1 font-bold text-navy">Developing Capital Markets Expertise</h2>
          <div className="mt-8 max-w-4xl space-y-5 text-lead text-navy/85">
            <p>
              FS Student Hedge Fund is Frankfurt School's student-managed investment initiative; a selective team
              operating across three departments: Hedge Fund, Trading &amp; Derivatives, and Index Construction.
              Together, we apply institutional-grade strategies to real markets, from developing macro theses and
              managing derivative portfolios to constructing structured indices in collaboration with industry
              partners.
            </p>
            <p>
              Our members don't just study markets, they research them, model them, and take positions in them. We
              exist to bridge the gap between academic rigor and real-world capital markets practice, developing the
              next generation of investment talent from the ground up.
            </p>
          </div>
        </Container>
      </section>

      {/* Meet the team */}
      <section className="container-page py-16 md:py-24">
        <h2 className="font-display text-h1 font-bold text-navy">Meet the Board</h2>
        <p className="mt-4 max-w-2xl text-lead text-navy/70">
          The board members leading our departments, building real financial products together with the whole team.
        </p>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {TEAM.map((m) => (
            <li key={m.name}>
              <TeamCard m={m} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
