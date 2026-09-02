import { Fragment, useLayoutEffect, useRef, useState, type UIEvent } from 'react'
import { Link } from 'react-router-dom'
import { asset as A } from '../lib/asset'
import { usePageTitle } from '../lib/usePageTitle'
import { MissionBand, DeptLeads, OtherDepartments, JoinCta } from '../components/DeptSections'
import portfolio from '../data/hedge-fund-portfolio.json'
import performance from '../data/hedge-fund-performance.json'

// The Hedge Fund department page, per the department's August and September
// 2026 specs: hero → What we do → mission → Performance (headline figures +
// since-inception chart) → Positioning (four donut charts) → Portfolio
// holdings (full table) → the shared department sections. Charts and table
// render from src/data/hedge-fund-portfolio.json, the Performance section
// from src/data/hedge-fund-performance.json, which only the scheduled
// update-performance workflow writes. The page is fully static: no
// market-data source is contacted at build or run time.

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
  // Rendered as a full-width sub-header band immediately before this row,
  // announcing a later entry date inside the sleeve's group.
  subheader?: string
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
type PerfPoint = { date: string; since_inception_pct: number }
type Performance = {
  updated_at: string | null
  inception_date: string
  base_currency: string
  headline: {
    day_pct: number | null
    week_pct: number | null
    month_pct: number | null
    since_inception_pct: number | null
  }
  series: PerfPoint[]
}

const DATA: Portfolio = portfolio
const PERF: Performance = performance

// A missing or empty field renders as an em dash — never a substituted value.
const EM_DASH = '—'
const textOrDash = (s: string) => (s ? s : EM_DASH)
const priceOrDash = (v: number | null | undefined) => (v == null ? EM_DASH : v.toFixed(2))

// Legend percentages carry one decimal everywhere so the four donuts read as
// one set. Values print exactly as supplied, never re-rounded.
const LEGEND_DP = 1
const pct = (v: number, dp: number) => `${v.toFixed(dp)}%`

// One date format for the whole page: D MMM YYYY, no leading zero.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

// Performance figures print with an explicit sign and two decimals. A null
// renders as an em dash, never as a zero, and an exact zero is neither a
// gain nor a loss, so it carries no sign and stays in the muted grey.
const signedPct = (v: number | null) => {
  if (v == null) return EM_DASH
  if (v === 0) return '0.00%'
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}%`
}
// Gain/loss colouring is the page's one deliberate exception to the
// navy-only chrome rule: scoped to the four performance figures per
// the token comment in index.css.
const signedColor = (v: number | null) => (v == null || v === 0 ? 'text-navy/60' : v > 0 ? 'text-gain' : 'text-loss')

// "1 Sep 2026, 22:57 UTC" — longDate's form with the time appended.
const updatedAtLabel = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  return `${date}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`
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

// Each donut announces what it shows: its name plus every slice and weight.
const donutTitle = (name: string, slices: Slice[]) =>
  `${name}: ${slices.map((s) => `${s.label} ${pct(s.weight, LEGEND_DP)}`).join(', ')}`

function Donut({ slices, colors, className, title }: { slices: Slice[]; colors: string[]; className?: string; title: string }) {
  const total = slices.reduce((sum, s) => sum + s.weight, 0)
  if (total <= 0) return null
  let a = -Math.PI / 2
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <title>{title}</title>
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

function Legend({ slices, colors }: { slices: Slice[]; colors: string[] }) {
  return (
    <ul className="w-full space-y-2.5">
      {slices.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3 text-sm">
          <span aria-hidden className="h-3.5 w-3.5 shrink-0 border border-navy/20" style={{ backgroundColor: colors[i] }} />
          <span className="text-navy/85">{s.label}</span>
          <span className="ml-auto font-extrabold text-navy tabular-nums">{pct(s.weight, LEGEND_DP)}</span>
        </li>
      ))}
    </ul>
  )
}

// Each sleeve figure is centred within its grid column, so the three read as
// symmetric about the page centre. The legend is centred as a block while its
// rows keep their label-left, percentage-right alignment.
function SleeveChart({ sleeve }: { sleeve: Sleeve }) {
  const colors = sliceColors(sleeve.chart)
  const name = `${sleeve.name} sleeve`
  return (
    <figure className="flex flex-col items-center text-center">
      <figcaption className="font-sans text-h3 font-extrabold text-navy">{name}</figcaption>
      <Donut slices={sleeve.chart} colors={colors} className="mt-5 w-full max-w-[220px]" title={donutTitle(name, sleeve.chart)} />
      <div className="mt-5 w-full max-w-[300px] text-left">
        <Legend slices={sleeve.chart} colors={colors} />
      </div>
      <p className="mt-4 text-sm text-navy/60">{sleeve.caption}</p>
      {sleeve.paper_url && (
        <a
          href={import.meta.env.BASE_URL + sleeve.paper_url}
          target="_blank"
          rel="noopener"
          aria-label={`Read the paper on the ${sleeve.name.toLowerCase()} sleeve`}
          className="mt-3 inline-block font-sans text-sm font-extrabold text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:decoration-navy"
        >
          Read the paper
        </a>
      )}
    </figure>
  )
}

// Measures an element's width, before first paint and on every resize, so an
// SVG can be drawn at one-to-one pixels instead of being scaled.
function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(Math.round(el.getBoundingClientRect().width))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

// The since-inception line chart: hand-written inline SVG in the same manner
// as the donuts, navy line, muted zero baseline, sparse axes. Month labels
// rather than exact dates, a handful of round percentage ticks, and no
// interactivity. It is drawn at the measured width of its container, never
// scaled, so text and stroke keep their pixel size at every viewport, with a
// shorter chart and fewer labels on a phone.
function PerformanceChart({ series }: { series: PerfPoint[] }) {
  const [ref, W] = useMeasuredWidth<HTMLDivElement>()
  if (series.length < 2) return null

  const narrow = W > 0 && W < 640
  const H = narrow ? 220 : 300
  if (W === 0) return <div ref={ref} className="mt-10 w-full" style={{ height: H }} aria-hidden="true" />

  const PAD = { top: 14, right: 14, bottom: 30, left: narrow ? 40 : 46 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const values = series.map((p) => p.since_inception_pct)
  const lo = Math.min(0, ...values)
  const hi = Math.max(0, ...values)
  // Round tick step: the smallest of 0.5 / 1 / 2 / 5 / 10 that keeps the
  // axis to at most seven intervals, so the range fits the data closely.
  const step = [0.5, 1, 2, 5, 10].find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 7) ?? 10
  const yMin = Math.floor(lo / step) * step
  const yMax = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let v = yMin; v <= yMax + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)

  const x = (i: number) => PAD.left + (i / (series.length - 1)) * innerW
  const y = (v: number) => PAD.top + ((yMax - v) / (yMax - yMin)) * innerH
  const path = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(p.since_inception_pct).toFixed(2)}`).join(' ')

  // A label at each month change. The series start itself is unlabelled, so
  // the 25 June baseline point draws no attention to itself. Narrow charts
  // thin the labels out so they never crowd.
  const allMonthLabels = series
    .map((p, i) => ({ i, month: Number(p.date.slice(5, 7)) }))
    .filter((m, idx, arr) => idx > 0 && m.month !== arr[idx - 1].month)
    .map((m) => ({ x: x(m.i), key: series[m.i].date, label: MONTHS[m.month - 1] }))
  const every = Math.max(1, Math.ceil(allMonthLabels.length / Math.max(2, Math.floor(innerW / 90))))
  const monthLabels = allMonthLabels.filter((_, idx) => idx % every === 0)

  const first = series[0]
  const last = series[series.length - 1]
  const title = 'Portfolio performance since inception'
  const desc = `Cumulative return of the simulated portfolio since inception, from its ${longDate(first.date)} baseline to ${longDate(last.date)}, ranging between ${signedPct(Math.min(...values))} and ${signedPct(Math.max(...values))}, latest ${signedPct(last.since_inception_pct)}.`

  return (
    <div ref={ref} className="mt-10 w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-labelledby="perf-chart-title" aria-describedby="perf-chart-desc">
        <title id="perf-chart-title">{title}</title>
        <desc id="perf-chart-desc">{desc}</desc>
        {ticks.map((v) => (
          <text key={v} x={PAD.left - 8} y={y(v) + 3.5} textAnchor="end" fontSize="11" fill="#060033" opacity="0.55">
            {`${v}%`}
          </text>
        ))}
        {monthLabels.map((m) => (
          <text key={m.key} x={m.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#060033" opacity="0.55">
            {m.label}
          </text>
        ))}
        {/* Zero baseline in the neutral grey, since the series crosses zero */}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke="#999999" strokeWidth="1" />
        <path d={path} fill="none" stroke="#060033" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function HoldingsTable({ data }: { data: Portfolio }) {
  // Entry dates are announced by the group header (the sleeve's opening date,
  // taken from its first position) and by sub-header bands for later staged
  // adds — there is deliberately no per-row Entry date column, which would
  // sit empty for most sleeves and duplicate what the sub-headers say.
  // A Price column exists if and only if the data file carries prices_as_of.
  const showPriceColumn = Boolean(data.prices_as_of)
  const columns = 9 + (showPriceColumn ? 1 : 0)

  const headCell = 'py-3 pr-4 font-sans text-sm font-extrabold text-navy'
  const cell = 'py-3 pr-4 align-top text-sm'
  const num = `${cell} text-right tabular-nums`
  // The portfolio weight is the column a reader scans, so it is one step
  // larger and in full-strength navy while the other figures stay muted.
  const numStrong = 'py-3 pr-4 align-top text-right text-base font-semibold text-navy tabular-nums'

  // The right-edge fade (narrow viewports) hides once the table is scrolled
  // fully right, so it never veils the % of portfolio column being read.
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setScrolledToEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  return (
    <div className="relative">
      <div className="holdings-scroll overflow-x-auto" onScroll={onScroll}>
        <table className="holdings-table w-full min-w-[960px] border-collapse text-left">
          <caption className="sr-only">Portfolio holdings, {data.label}</caption>
          <thead>
            <tr className="border-b-2 border-navy/20">
              <th scope="col" className={`${headCell} sticky left-0 z-10 bg-white`}>Position</th>
              <th scope="col" className={headCell}>Ticker</th>
              <th scope="col" className={headCell}>ISIN</th>
              <th scope="col" className={headCell}>Listing</th>
              <th scope="col" className={headCell}>Ccy</th>
              <th scope="col" className={headCell}>Role</th>
              <th scope="col" className={`${headCell} text-right`}>Entry price</th>
              {showPriceColumn && <th scope="col" className={`${headCell} text-right`}>Price</th>}
              <th scope="col" className={`${headCell} text-right`}>% of sleeve</th>
              <th scope="col" className={`${headCell} text-right`}>% of portfolio</th>
            </tr>
          </thead>
          {data.sleeves.map((sleeve) => {
            // The group header announces the sleeve's opening date, taken from
            // its first position. Later dates inside the group are announced by
            // that row's sub-header band.
            const groupDate = sleeve.positions[0]?.entry_date ?? ''
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
                  <td colSpan={columns - (groupDate ? 4 : 1)} />
                  {groupDate && (
                    <td colSpan={3} className="whitespace-nowrap py-3 pr-4 text-right text-sm text-white/85">
                      Entry date {longDate(groupDate)}
                    </td>
                  )}
                </tr>
                {rows.map((p, idx) => (
                  <Fragment key={`${p.name}-${p.entry_date}-${idx}`}>
                    {/* A sub-header band mirrors the group header's structure:
                        a sticky first cell (empty, on the mist background, so
                        the sticky column never paints white over the band
                        during horizontal scroll), a spacer, then the label
                        right-aligned under the group header's date so every
                        date in the table sits on one vertical line. */}
                    {p.subheader && (
                      <tr className="bg-mist">
                        <td className="sticky left-0 z-10 bg-mist py-3" />
                        <td colSpan={columns - 4} />
                        <td colSpan={3} className="whitespace-nowrap py-3 pr-4 text-right font-sans text-sm font-semibold text-navy">
                          {p.subheader}
                        </td>
                      </tr>
                    )}
                    {/* The hairline sits only BETWEEN data rows: a border on the
                        first row, or on a row directly under a group or
                        sub-header band, would paint a 1px seam under the band
                        (sticky-cell/border-collapse background quirk in Chromium) */}
                    <tr className={`${idx > 0 && !p.subheader ? 'border-t border-navy/10' : ''} ${p.is_cash ? 'italic text-navy/50' : 'text-navy/85'}`}>
                      <th scope="row" className={`${cell} sticky left-0 z-10 min-w-[10rem] max-w-[10rem] bg-white text-left font-semibold max-md:border-r max-md:border-navy/10 md:min-w-[15rem] md:max-w-[22rem] ${p.is_cash ? 'text-navy/50' : 'text-navy'}`}>
                        {p.name}
                      </th>
                      <td className={`${cell} whitespace-nowrap tabular-nums`}>{p.is_cash ? EM_DASH : textOrDash(p.ticker)}</td>
                      <td className={`${cell} whitespace-nowrap tabular-nums`}>{p.is_cash ? EM_DASH : textOrDash(p.isin)}</td>
                      <td className={`${cell} whitespace-nowrap`}>{p.is_cash ? EM_DASH : textOrDash(p.listing)}</td>
                      <td className={cell}>{textOrDash(p.currency)}</td>
                      <td className={`${cell} min-w-[11rem]`}>{textOrDash(p.role)}</td>
                      <td className={num}>{p.is_cash ? EM_DASH : priceOrDash(p.entry_price)}</td>
                      {showPriceColumn && <td className={num}>{priceOrDash(p.current_price)}</td>}
                      <td className={num}>{p.weight_sleeve.toFixed(1)}</td>
                      <td className={p.is_cash ? num : numStrong}>{p.weight_portfolio.toFixed(2)}</td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            )
          })}
        </table>
      </div>
      {/* A fade at the right edge on narrow viewports signals that the table
          scrolls sideways. Hidden from md up and in print. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 md:hidden print:hidden ${scrolledToEnd ? 'hidden' : ''}`}
        style={{ background: 'linear-gradient(to left, #fff, rgba(255, 255, 255, 0))' }}
      />
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

      <section id="what-we-do" className="container-page pt-28 pb-16 md:pt-36 md:pb-24">
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

      <MissionBand support="We are students and we manage no client money, but we hold our work to the standard we would need to meet if we did. Every view starts from primary sources, is written down before it is acted on, and names the conditions that would prove it wrong. The portfolio is where that research becomes a decision, and the papers set out the reasoning in full.">
        We research financial markets and put what we learn into practice.
      </MissionBand>

      <section id="performance" className="container-page pt-16 md:pt-24">
        <h2 className="font-display text-h1 font-bold text-navy">Performance</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <p className="mt-8 text-lead text-navy/85">
          Read from the department's portfolio record after each trading day's close and published here automatically, measured since the
          portfolio was established on 26 June 2026. Figures are in USD and include the effect of currency movements on positions held in other
          currencies.
        </p>

        <div className="mt-10 flex flex-wrap gap-x-14 gap-y-8">
          {(
            [
              ['1D', PERF.headline.day_pct],
              ['1W', PERF.headline.week_pct],
              ['1M', PERF.headline.month_pct],
              ['Since inception', PERF.headline.since_inception_pct],
            ] as [string, number | null][]
          ).map(([label, v]) => (
            <div key={label}>
              <div className="font-sans text-sm font-bold text-navy/60">{label}</div>
              <div className={`mt-1 font-sans text-3xl font-extrabold tabular-nums ${signedColor(v)}`}>{signedPct(v)}</div>
            </div>
          ))}
        </div>
        {PERF.updated_at && updatedAtLabel(PERF.updated_at) && (
          <p className="mt-5 text-sm text-navy/60">Last updated {updatedAtLabel(PERF.updated_at)}.</p>
        )}

        <PerformanceChart series={PERF.series} />

        <p className="mt-8 max-w-4xl text-sm text-navy/60">
          These figures describe a simulated portfolio. No client capital is managed and no order is placed in the market. Returns are measured
          from recorded entry prices with no transaction costs, spreads, taxes or fees applied, they cover a period of a few months, and they are
          not audited. Past performance is not indicative of future results.
        </p>
      </section>

      <section id="positioning" className="container-page pt-16 md:pt-24">
        <h2 className="font-display text-h1 font-bold text-navy">Positioning for {DATA.half_year}</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <div className="mt-8 space-y-5 text-lead text-navy/85">
          <p>
            The allocation below is the department's positioning for the second half of 2026, established at entry on 26 June 2026. The split
            across the three sleeves is a strategic decision taken at department level. The composition within each sleeve is the output of that
            sleeve's own research paper.
          </p>
          <p>
            The equities and fixed income teams each deployed their sleeve in full on day one. The commodities team deployed 70% at entry and
            staged the remainder, following the plan its paper derives from a Monte Carlo study of the deployment decision. The passive layer and
            the gold physical core went in immediately, because no entry signal argued for waiting on them. The two legs that did carry a signal
            were staged against those signals rather than bought at a single print, under a hard backstop of six to eight weeks so that staging
            could not turn into indefinite deferral. Mechanical calendar averaging was tested and rejected: over a six month horizon it gives up
            measurable expected return to buy a small, signal free tail cushion, at several times the trade count. Copper was completed on 22 July
            and gold on 29 July.
          </p>
          <p>All figures are percentage weights of a simulated portfolio. No client capital is managed and no absolute amounts are disclosed.</p>
        </div>

        {/* The portfolio donut is the parent figure: centred with its legend
            as a pair in a constrained container, set apart from the three
            sleeve charts, whose slices are shares of their own sleeve and
            not comparable with it. */}
        <figure className="mx-auto mt-12 max-w-2xl">
          <figcaption className="text-center font-sans text-h3 font-extrabold text-navy">Portfolio allocation</figcaption>
          <div className="mt-5 flex flex-col items-center justify-center gap-8 sm:flex-row">
            <Donut slices={portfolioSlices} colors={portfolioColors} className="w-full max-w-[260px]" title={donutTitle('Portfolio allocation', portfolioSlices)} />
            <div className="w-full max-w-[300px]">
              <Legend slices={portfolioSlices} colors={portfolioColors} />
            </div>
          </div>
        </figure>

        <div className="mt-14 h-px w-full bg-navy/15" />
        <p className="mt-10 text-center font-sans text-h2 font-extrabold text-navy">Composition within each sleeve</p>

        {/* The three sleeve charts sit side by side on desktop and stack
            below 768px */}
        <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          {DATA.sleeves.map((s) => (
            <SleeveChart key={s.id} sleeve={s} />
          ))}
        </div>

        <p className="mt-10 text-sm text-navy/60">
          Weights as at entry. Fixed income is split 70% EUR and 30% USD. The commodities sleeve reached these target weights on 29 July 2026, on
          completion of the staged entry described above.
        </p>
      </section>

      <section id="holdings" className="container-page py-16 md:py-24">
        <h2 className="font-display text-h1 font-bold text-navy">Portfolio holdings</h2>
        <div className="mt-5 h-px w-full bg-navy/15" />
        <p className="mt-8 text-lead text-navy/85">
          Every position held by the department, grouped by sleeve and ordered by weight. Entry prices are the prices paid at execution, stated
          in the trading currency of the listing used. The staged commodities tranches are listed as separate entries at the price paid on the
          day rather than blended into an average. The reasoning behind each sleeve is set out in full in the corresponding research paper.
        </p>

        <div className="mt-10">
          <HoldingsTable data={DATA} />
        </div>

        <div className="mt-8 space-y-3 text-sm text-navy/60">
          <p>
            Positions were entered on 26 June 2026, with the staged commodities tranches added on 22 and 29 July 2026, and are held against the
            year end evaluation. Entry prices are not marked to market on this page.
          </p>
          <p>
            Weights are shown both as a share of the position's own sleeve and as a share of the total portfolio. Sleeve weights sum to 100%.
            Portfolio weights sum to 100% across all three sleeves.
            {DATA.prices_as_of ? ` Current prices are as at ${longDate(DATA.prices_as_of)}.` : ''}
          </p>
          <p>
            Where a position was executed on a different listing of the same fund from the one named in the corresponding research paper, this
            table shows the listing actually used. The ISIN identifies the fund and is unchanged in every case.
          </p>
          <p>Performance at the position level is not shown here. Portfolio level performance, updated after each trading day, is shown above under Performance.</p>
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
