import { Link } from 'react-router-dom'
import { asset as A } from '../lib/asset'
import { usePageTitle } from '../lib/usePageTitle'
import { MissionBand, DeptLeads, OtherDepartments, JoinCta } from '../components/DeptSections'
import portfolio from '../data/hedge-fund-portfolio.json'

// The Hedge Fund department page, per the department's August 2026 spec:
// hero → What we do → mission → Positioning (four donut charts) → Portfolio
// holdings (full table) → the shared department sections. Charts and table
// both render from src/data/hedge-fund-portfolio.json — a portfolio update
// means replacing that one file, nothing else. The page is fully static:
// no market-data source is contacted at build or run time, and no
// performance figures or absolute amounts are ever derived from the data.

type Position = {
  name: string
  ticker: string
  isin: string
  listing: string
  currency: string
  role: string
  entry_date: string
  entry_price: number | null
  weight_sleeve: number
  weight_portfolio: number
  is_cash: boolean
  current_price?: number | null
}
type Slice = { label: string; weight: number }
type Sleeve = {
  id: string
  name: string
  portfolio_weight: number
  caption: string
  paper_url: string
  chart: Slice[]
  positions: Position[]
}
type Portfolio = {
  as_of_date: string
  label: string
  half_year: string
  prices_as_of?: string
  sleeves: Sleeve[]
}

const DATA: Portfolio = portfolio

// A missing or empty field renders as an em dash — never a substituted value.
const EM_DASH = '—'
const textOrDash = (s: string) => (s ? s : EM_DASH)
const priceOrDash = (v: number | null | undefined) => (v == null ? EM_DASH : v.toFixed(2))

// Percentages print exactly as supplied: one decimal where the chart's data
// carries decimals, whole numbers where it does not. No re-rounding.
const chartDecimals = (slices: Slice[]) => (slices.some((s) => !Number.isInteger(s.weight)) ? 1 : 0)
const pct = (v: number, dp: number) => `${v.toFixed(dp)}%`

// DD MMM YYYY per the spec's update contract (day zero-padded)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}

// Slice colours are the site navy varied in lightness only (mixed toward
// white), with the existing mist grey reserved for the cash slice. No new
// hues are introduced.
const NAVY_RGB = [6, 0, 51]
const CASH_NEUTRAL = '#e5e5e5'
const isCashSlice = (label: string) => /cash/i.test(label)
const navyTint = (t: number) => `rgb(${NAVY_RGB.map((c) => Math.round(c + (255 - c) * t)).join(', ')})`
function sliceColors(slices: Slice[]): string[] {
  const invested = slices.filter((s) => !isCashSlice(s.label)).length
  let i = 0
  return slices.map((s) => (isCashSlice(s.label) ? CASH_NEUTRAL : navyTint(invested < 2 ? 0 : (0.72 * i++) / (invested - 1))))
}

function arcPath(cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number) {
  const pt = (a: number, r: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${pt(a0, rOut)} A ${rOut} ${rOut} 0 ${large} 1 ${pt(a1, rOut)} L ${pt(a1, rIn)} A ${rIn} ${rIn} 0 ${large} 0 ${pt(a0, rIn)} Z`
}

// The visible legend carries every label and percentage, so the drawing
// itself is decorative for assistive technology.
function Donut({ slices, colors, className }: { slices: Slice[]; colors: string[]; className?: string }) {
  const total = slices.reduce((sum, s) => sum + s.weight, 0)
  if (total <= 0) return null
  let a = -Math.PI / 2
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {slices.map((s, i) => {
        const frac = s.weight / total
        // A full-circle arc has coincident endpoints and would not draw at
        // all, so a single 100% slice renders as a plain ring instead.
        if (frac > 0.9999) {
          return <circle key={s.label} cx="100" cy="100" r="77" fill="none" stroke={colors[i]} strokeWidth="38" />
        }
        const a1 = a + frac * 2 * Math.PI
        const d = arcPath(100, 100, 96, 58, a, a1)
        a = a1
        return <path key={s.label} d={d} fill={colors[i]} stroke="#fff" strokeWidth="1.5" />
      })}
    </svg>
  )
}

function Legend({ slices, colors, dp }: { slices: Slice[]; colors: string[]; dp: number }) {
  return (
    <ul className="w-full space-y-2.5">
      {slices.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3 text-sm">
          <span aria-hidden className="h-3.5 w-3.5 shrink-0 border border-navy/20" style={{ backgroundColor: colors[i] }} />
          <span className="text-navy/85">{s.label}</span>
          <span className="ml-auto font-extrabold text-navy tabular-nums">{pct(s.weight, dp)}</span>
        </li>
      ))}
    </ul>
  )
}

function SleeveChart({ sleeve }: { sleeve: Sleeve }) {
  const colors = sliceColors(sleeve.chart)
  const dp = chartDecimals(sleeve.chart)
  return (
    <figure>
      <figcaption className="font-sans text-lg font-extrabold text-navy">{sleeve.name} sleeve</figcaption>
      <Donut slices={sleeve.chart} colors={colors} className="mt-5 w-full max-w-[220px]" />
      <div className="mt-5 max-w-[300px]">
        <Legend slices={sleeve.chart} colors={colors} dp={dp} />
      </div>
      <p className="mt-4 text-sm text-navy/60">{sleeve.caption}</p>
      {sleeve.paper_url && (
        <a
          href={import.meta.env.BASE_URL + sleeve.paper_url}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-block font-sans text-sm font-extrabold text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:decoration-navy"
        >
          Read the paper
        </a>
      )}
    </figure>
  )
}

function HoldingsTable({ data }: { data: Portfolio }) {
  // Entry dates: identical within a sleeve → shown once in the group header
  // and the column omitted. If any sleeve's dates differ, the column appears.
  const showDateColumn = data.sleeves.some((s) => new Set(s.positions.map((p) => p.entry_date)).size > 1)
  // A Price column exists if and only if the data file carries prices_as_of.
  const showPriceColumn = Boolean(data.prices_as_of)
  const columns = 9 + (showDateColumn ? 1 : 0) + (showPriceColumn ? 1 : 0)

  const headCell = 'py-3 pr-4 font-sans text-sm font-extrabold text-navy'
  const cell = 'py-3 pr-4 align-top text-sm'
  const num = `${cell} text-right tabular-nums`

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-left">
        <caption className="sr-only">Portfolio holdings, {data.label}</caption>
        <thead>
          <tr className="border-b-2 border-navy/20">
            <th scope="col" className={`${headCell} sticky left-0 z-10 bg-white`}>Position</th>
            <th scope="col" className={headCell}>Ticker</th>
            <th scope="col" className={headCell}>ISIN</th>
            <th scope="col" className={headCell}>Listing</th>
            <th scope="col" className={headCell}>Ccy</th>
            <th scope="col" className={headCell}>Role</th>
            {showDateColumn && <th scope="col" className={headCell}>Entry date</th>}
            <th scope="col" className={`${headCell} text-right`}>Entry price</th>
            {showPriceColumn && <th scope="col" className={`${headCell} text-right`}>Price</th>}
            <th scope="col" className={`${headCell} text-right`}>% of sleeve</th>
            <th scope="col" className={`${headCell} text-right`}>% of portfolio</th>
          </tr>
        </thead>
        {data.sleeves.map((sleeve) => {
          const dates = new Set(sleeve.positions.map((p) => p.entry_date))
          const uniformDate = dates.size === 1 ? [...dates][0] : ''
          // Cash rows render last within their sleeve, whatever their weight.
          const rows = [...sleeve.positions.filter((p) => !p.is_cash), ...sleeve.positions.filter((p) => p.is_cash)]
          return (
            <tbody key={sleeve.id}>
              <tr className="bg-navy text-white">
                {/* nowrap only from md up: on mobile it would force the
                    sticky column wider than the data cells' 10rem cap */}
                <th scope="row" className="sticky left-0 z-10 bg-navy py-3 pr-4 text-left font-sans text-sm font-extrabold md:whitespace-nowrap">
                  {sleeve.name} ({sleeve.portfolio_weight.toFixed(1)}% of portfolio)
                </th>
                <td colSpan={columns - (uniformDate ? 4 : 1)} />
                {uniformDate && (
                  <td colSpan={3} className="whitespace-nowrap py-3 pr-4 text-right text-sm text-white/85">
                    Entry date {longDate(uniformDate)}
                  </td>
                )}
              </tr>
              {rows.map((p, idx) => (
                // The hairline sits only BETWEEN data rows: a border on the
                // first row would paint a 1px seam under the navy group band
                // (sticky-cell/border-collapse background quirk in Chromium)
                <tr key={p.name} className={`${idx > 0 ? 'border-t border-navy/10' : ''} ${p.is_cash ? 'italic text-navy/50' : 'text-navy/85'}`}>
                  <th scope="row" className={`${cell} sticky left-0 z-10 min-w-[10rem] max-w-[10rem] bg-white text-left font-semibold max-md:border-r max-md:border-navy/10 md:min-w-[15rem] md:max-w-[22rem] ${p.is_cash ? 'text-navy/50' : 'text-navy'}`}>
                    {p.name}
                  </th>
                  <td className={`${cell} whitespace-nowrap tabular-nums`}>{p.is_cash ? EM_DASH : textOrDash(p.ticker)}</td>
                  <td className={`${cell} whitespace-nowrap tabular-nums`}>{p.is_cash ? EM_DASH : textOrDash(p.isin)}</td>
                  <td className={`${cell} whitespace-nowrap`}>{p.is_cash ? EM_DASH : textOrDash(p.listing)}</td>
                  <td className={cell}>{textOrDash(p.currency)}</td>
                  <td className={`${cell} min-w-[11rem]`}>{textOrDash(p.role)}</td>
                  {showDateColumn && <td className={`${cell} whitespace-nowrap`}>{p.entry_date ? longDate(p.entry_date) : EM_DASH}</td>}
                  <td className={num}>{p.is_cash ? EM_DASH : priceOrDash(p.entry_price)}</td>
                  {showPriceColumn && <td className={num}>{priceOrDash(p.current_price)}</td>}
                  <td className={num}>{p.weight_sleeve.toFixed(1)}</td>
                  <td className={num}>{p.weight_portfolio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}

export default function HedgeFund() {
  usePageTitle('Hedge Fund')

  // The portfolio-level chart: sleeves by portfolio weight, largest first.
  const portfolioSlices: Slice[] = [...DATA.sleeves]
    .sort((a, b) => b.portfolio_weight - a.portfolio_weight)
    .map((s) => ({ label: s.name, weight: s.portfolio_weight }))
  const portfolioColors = sliceColors(portfolioSlices)
  const portfolioDp = chartDecimals(portfolioSlices)

  return (
    <article>
      <section className="relative">
        <img
          src={A('hedgefund-1.jpg')}
          alt=""
          className="h-[48vw] max-h-[520px] min-h-[240px] w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy/10" />
        {/* Name band: left-aligned with the content grid, straddling the image's
            bottom edge (half over the photo, half over the white area) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="container-page">
            <h1 className="inline-block bg-navy px-8 py-5 font-display text-h1 font-bold text-white sm:px-12 sm:py-6">Hedge Fund</h1>
          </div>
        </div>
      </section>

      <section className="container-page pt-28 pb-16 md:pt-36 md:pb-24">
        <h2 className="font-display text-h1 font-bold text-navy">What we do</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <div className="mt-8 space-y-5 text-lead text-navy/85">
          <p>The Hedge Fund department builds and maintains its own portfolio, and it publishes the written research behind every position it holds.</p>
          <p>
            The portfolio is organised into three sleeves for commodities, equities and fixed income. Each sleeve is owned by its own investment
            team of two to three students. A team receives a mandate and an investment horizon from the two department heads and is then
            responsible for everything that follows, meaning the macro view, the security selection, the position sizing, and the paper that has to
            justify all three.
          </p>
          <p>
            The three teams work independently of one another. No team is given the other teams' theses, positioning or drafts while it is
            working, and no house view is handed down from above. Each sleeve therefore has to stand on its own analytical merit rather than on a
            shared assumption that nobody has tested. The sleeves are brought together only at the end of the half year, when the department
            combines them into a single portfolio level view in the half year report. The correlation and balance of the combined book are
            therefore something we observe and then have to explain, not something we assumed at the start.
          </p>
          <p>
            The standard is the same in every team. No position enters the portfolio without a written thesis behind it. A thesis has to name the
            driver it is betting on, the horizon over which it should play out, and the conditions under which we would accept that we were wrong.
            Positions are implemented through UCITS ETFs and ETCs, selected on cost, liquidity and replicability, so that any reader can verify
            exactly what we hold.
          </p>
        </div>

        <h3 className="mt-14 font-display text-h3 font-bold text-navy">How a position gets on the book</h3>
        <ol className="mt-6 list-decimal space-y-4 pl-6 text-lead text-navy/85">
          <li>
            <strong className="font-extrabold text-navy">Mandate.</strong> The two department heads assign the sleeve, the investment horizon and
            the evaluation date. There is no minimum or maximum number of positions. The portfolio is as broad or as concentrated as the research
            justifies.
          </li>
          <li>
            <strong className="font-extrabold text-navy">Research.</strong> The team works from primary sources rather than from secondary
            commentary, meaning central bank and statistical releases, industry body data, company reporting and the Bloomberg terminals on
            campus.
          </li>
          <li>
            <strong className="font-extrabold text-navy">Thesis.</strong> The view is written down before it is acted on. It states the dominant
            driver, the supply and demand or valuation evidence, the catalysts, a bull, base and bear case, and explicit falsification conditions.
          </li>
          <li>
            <strong className="font-extrabold text-navy">Review.</strong> The two department heads review the paper. Approval of the thesis, not
            the finished formatting, is what triggers execution.
          </li>
          <li>
            <strong className="font-extrabold text-navy">Monitoring.</strong> Positions run to the year end evaluation, with internal adjustments
            if a monitoring trigger is hit. The full reassessment and rebalancing follows the December exam period.
          </li>
        </ol>

        <p className="mt-10 text-lead text-navy/85">
          The department publishes three portfolio papers each semester, one per sleeve, alongside literature reviews on the foundations that the
          strategies rest on. It also publishes one half year report that ties the three sleeves into a single statement of how the portfolio is
          positioned. All of it is on{' '}
          <Link to="/research" className="font-extrabold text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:decoration-navy">
            the Research page
          </Link>
          .
        </p>
      </section>

      <MissionBand support="We are students and we manage no client money. What we hold ourselves to is the standard. Every view is researched from primary sources, written down before it is acted on, and stated so that it can be proven wrong. The portfolio is what makes that real. It turns an interest in financial markets into a habit of thinking, and it leaves every member with work they can defend line by line.">
        We learn the craft by practising it to a professional standard.
      </MissionBand>

      <section className="container-page pt-16 md:pt-24">
        <h2 className="font-display text-h1 font-bold text-navy">Positioning for {DATA.half_year}</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <p className="mt-8 text-lead text-navy/85">
          The allocation below is the department's positioning for the second half of 2026, as established at entry on 26 June 2026. The split
          across the three sleeves is a strategic decision taken at department level. The composition within each sleeve is the output of that
          sleeve's own research paper. All figures are percentage weights of a simulated portfolio. No client capital is managed and no absolute
          amounts are disclosed.
        </p>

        <figure className="mt-12">
          <figcaption className="font-sans text-lg font-extrabold text-navy">Portfolio allocation</figcaption>
          <div className="mt-5 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <Donut slices={portfolioSlices} colors={portfolioColors} className="w-full max-w-[260px]" />
            <div className="w-full max-w-[300px]">
              <Legend slices={portfolioSlices} colors={portfolioColors} dp={portfolioDp} />
            </div>
          </div>
        </figure>

        {/* The three sleeve charts sit side by side on desktop and stack
            below 768px */}
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {DATA.sleeves.map((s) => (
            <SleeveChart key={s.id} sleeve={s} />
          ))}
        </div>

        <p className="mt-10 text-sm text-navy/60">
          Weights as at entry, 26 June 2026. Fixed income is split 70% EUR and 30% USD. The commodities sleeve is being entered in tranches. Gold
          is 70% deployed against its 50% target weight and copper is 50% deployed against its 30% target, while the passive agriculture layer was
          entered in full. The remaining 30% of the sleeve is held in cash pending the second and third tranches.
        </p>
      </section>

      <section className="container-page py-16 md:py-24">
        <h2 className="font-display text-h1 font-bold text-navy">Portfolio holdings</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <p className="mt-8 text-lead text-navy/85">
          Every position held by the department, grouped by sleeve and ordered by weight. Entry prices are the prices paid at execution on 26 June
          2026, stated in the trading currency of the listing used. The reasoning behind each sleeve is set out in full in the corresponding
          research paper.
        </p>

        <div className="mt-10">
          <HoldingsTable data={DATA} />
        </div>

        <div className="mt-8 space-y-3 text-sm text-navy/60">
          <p>All positions were entered on 26 June 2026 and are held against the year end evaluation. Entry prices are not marked to market on this page.</p>
          <p>
            Weights are shown both as a share of the position's own sleeve and as a share of the total portfolio. Sleeve weights sum to 100%.
            Portfolio weights sum to 100% across all three sleeves.
            {DATA.prices_as_of ? ` Current prices are as at ${longDate(DATA.prices_as_of)}.` : ''}
          </p>
          <p>Performance is deliberately not shown. The positions were entered on 26 June 2026 and will first be assessed at the year end evaluation.</p>
          <p>
            Our research is prepared by students for educational purposes and does not constitute investment advice or a recommendation to buy or
            sell any financial instrument. The department manages no client assets and operates a simulated paper portfolio only.
          </p>
        </div>
      </section>

      <DeptLeads names={['Francesco di Fano', 'Julius Jagland']} />
      <OtherDepartments current="/hedge-fund" />
      <JoinCta dept="Hedge Fund" />
    </article>
  )
}
