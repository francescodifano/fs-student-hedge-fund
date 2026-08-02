import { Link } from 'react-router-dom'
import { asset as A } from '../lib/asset'
import Button from '../components/Button'
import { usePageTitle } from '../lib/usePageTitle'
import { ADDITIONAL, FEATURED, PAPERS, type Paper } from '../lib/papers'

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <a
      href={`${import.meta.env.BASE_URL}papers/${paper.pdf}`}
      target="_blank"
      rel="noopener"
      className="group flex flex-col border border-navy/15 bg-white transition-colors hover:border-navy/40"
    >
      <div className="overflow-hidden border-b border-navy/10 bg-mist">
        <img
          src={A(paper.cover)}
          alt={paper.coverAlt}
          className="aspect-[4/3] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="font-sans text-sm font-bold tracking-wide text-navy/55">{paper.tag}</p>
        <h3 className="mt-3 font-display text-h3 font-bold text-navy">{paper.title}</h3>
        <p className="mt-1.5 text-sm text-navy/60">
          {paper.authors} · {paper.date}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-navy/75">{paper.blurb}</p>
        <p className="mt-auto pt-6 text-sm font-bold text-navy">
          Read the paper
          <span aria-hidden className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
        </p>
      </div>
    </a>
  )
}

// All report PDFs are hosted on this site itself (public/papers) — no external redirects.
const FEATURED_URL = `${import.meta.env.BASE_URL}papers/${FEATURED.pdf}`

export default function Research() {
  usePageTitle('Research')
  return (
    <>
      {/* Hero, mirroring the homepage: serif heading left, solid-navy lead right */}
      <section className="container-page pt-12 md:pt-16">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end">
          <h1 className="font-display text-display text-navy">Research</h1>
          <p className="text-lead text-navy">
            Working as one, our members combine rigorous analysis with disciplined execution.
          </p>
        </div>
      </section>

      {/* Full-width image with the navy band bleeding in from the viewport's left
          edge, straddling the image bottom (same treatment as the homepage hero) */}
      <div className="relative z-10 mt-12 md:mt-20">
        {/* image layered above the band (band peeks out left and below, unchanged position) */}
        <div className="container-wide relative z-10">
          <img
            src={A('research-hero.jpg')}
            alt="Pages from the fund's published research reports"
            className="h-[44vw] max-h-[640px] min-h-[220px] w-full object-cover"
            fetchPriority="high"
          />
        </div>
        <div aria-hidden className="absolute -bottom-6 left-0 z-0 h-16 w-[78vw] bg-navy md:-bottom-10 md:h-28 md:w-[70vw] md:max-w-[1054px]" />
      </div>

      {/* Latest research: the flagship report (extra top padding clears the band overhang) */}
      <section className="container-page pt-24 pb-16 md:pt-32 md:pb-24">
        <h2 className="font-display text-h1 font-bold text-navy">Latest Research</h2>
        <p className="mt-6 max-w-3xl text-lead text-navy/80">
          The fund publishes a flagship report each half year, synthesizing the work of every investment team into one
          view of how we are positioned.
        </p>

        <article className="mt-10 grid overflow-hidden bg-navy text-white lg:grid-cols-2">
          <img
            src={A(FEATURED.cover)}
            alt={FEATURED.coverAlt}
            className="aspect-square w-full object-cover object-top sm:aspect-[4/3] lg:aspect-auto lg:h-full"
            loading="lazy"
          />
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="font-sans text-sm font-bold tracking-wide text-white/60">{FEATURED.tag}</p>
            <h3 className="mt-4 font-display text-h2 font-bold">{FEATURED.title}</h3>
            <p className="mt-4 text-white/75">{FEATURED.blurb}</p>
            <div className="mt-8">
              <Button href={FEATURED_URL} variant="light">
                Read the report
              </Button>
            </div>
          </div>
        </article>
      </section>

      {/* Research papers: the portfolio research behind the current positioning.
          Cards link straight to the PDFs hosted on this site (public/papers). */}
      <section className="container-page pb-16 md:pb-20">
        <h2 className="font-display text-h1 font-bold text-navy">Research Papers</h2>
        <p className="mt-6 max-w-3xl text-lead text-navy/80">
          The portfolio research behind the fund's current positioning, reviewed by the department heads and
          typeset in the house style of the fund.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {PAPERS.map((paper) => (
            <PaperCard key={paper.pdf} paper={paper} />
          ))}
        </div>
      </section>

      {/* Additional research: literature reviews and prior-cycle work. */}
      <section className="container-page pb-20 md:pb-28">
        <h2 className="font-display text-h1 font-bold text-navy">Additional Research</h2>
        <p className="mt-6 max-w-3xl text-lead text-navy/80">
          Literature reviews that set the standard the portfolio work is held to, and research from earlier
          cycles of the fund.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {ADDITIONAL.map((paper) => (
            <PaperCard key={paper.pdf} paper={paper} />
          ))}
        </div>
        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-navy/60">
          Our research is prepared by students for educational purposes and does not constitute investment
          advice or a recommendation to buy or sell any financial instrument. Each paper carries a legal notice
          with the disclosures required under Art. 20 of the EU Market Abuse Regulation and Delegated Regulation
          (EU) 2016/958. The initiative manages no client assets and operates a simulated paper portfolio only.
          See the full disclaimer in the{' '}
          <Link to="/imprint" className="font-bold text-navy underline-offset-2 hover:underline">
            imprint
          </Link>
          .
        </p>
      </section>
    </>
  )
}
