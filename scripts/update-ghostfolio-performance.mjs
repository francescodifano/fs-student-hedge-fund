#!/usr/bin/env node
// Appends today's reading from the portfolio tracker's public, token-free
// endpoints to src/data/hedge-fund-performance.json and recomputes the
// headline figures. Run only by update-performance.yml.
//
// The department keeps two tracker accounts with identical activities that
// differ only in base currency, one in EUR and one in USD. Both are read in
// the same run, seconds apart, so the two series always share the same dates
// and the same moment of measurement. If either reading fails, nothing is
// written: the two lines on the page can never drift apart by a day.
//
// relativeChange arrives as a decimal fraction: 0.0123 means +1.23%.

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../src/data/hedge-fund-performance.json', import.meta.url)

// One read-only public Access ID per account. The USD account's variable keeps
// the name it has had since launch.
const ACCESS_IDS = {
  EUR: process.env.GHOSTFOLIO_ACCESS_ID_EUR,
  USD: process.env.GHOSTFOLIO_ACCESS_ID,
}
const CURRENCIES = Object.keys(ACCESS_IDS)

const MAX_ATTEMPTS = 3
const WEEK_DAYS = 5
const MONTH_DAYS = 21
const ATTRIBUTION_OFFSET_HOURS = 6

// Largest believable one-day change in the since-inception figure, in
// percentage points. The largest change recorded to date is about 1.1. A
// bigger jump points to a wrong Access ID or a bad reading, so the run stops
// instead of publishing it. A manual run with "force" ticked overrides the
// check for a genuine market move.
const MAX_DAILY_MOVE_PP = 3
const FORCE = process.env.FORCE === 'true'

const missing = CURRENCIES.filter((c) => !ACCESS_IDS[c])
if (missing.length) {
  console.error(
    `Access ID not set for: ${missing.join(', ')}. Expected repository variables GHOSTFOLIO_ACCESS_ID_EUR and GHOSTFOLIO_ACCESS_ID.`,
  )
  process.exit(1)
}
if (ACCESS_IDS.EUR === ACCESS_IDS.USD) {
  console.error('GHOSTFOLIO_ACCESS_ID_EUR and GHOSTFOLIO_ACCESS_ID hold the same value. Each must point to its own account.')
  process.exit(1)
}

const round2 = (n) => Math.round(n * 100) / 100

async function fetchPerformance(currency) {
  const url = `https://ghostfol.io/api/v1/public/${ACCESS_IDS[currency]}/portfolio`
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const body = await res.json()
      const p = body?.performance
      if (typeof p?.max?.relativeChange !== 'number' || !Number.isFinite(p.max.relativeChange)) {
        throw new Error(`Unexpected response shape: ${JSON.stringify(body).slice(0, 400)}`)
      }
      return p
    } catch (err) {
      lastError = err
      console.warn(`${currency}: attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`)
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 5000 * attempt))
    }
  }
  throw new Error(`${currency}: ${lastError.message}`)
}

// Window return for one currency from its cumulative since-inception series.
// Returns null when there is not enough history, which the UI renders as an
// em dash.
function windowPct(series, currency, daysBack) {
  if (series.length <= daysBack) return null
  const recent = 1 + series[series.length - 1][currency] / 100
  const past = 1 + series[series.length - 1 - daysBack][currency] / 100
  if (past === 0) return null
  return round2((recent / past - 1) * 100)
}

// The reading belongs to the trading day that produced it, not to the clock
// time the job happened to start. GitHub delays scheduled runs under load, and
// a delay past midnight UTC would otherwise file a closing value under the
// following date. Six hours of offset absorbs any realistic delay.
const marketDate = new Date(Date.now() - ATTRIBUTION_OFFSET_HOURS * 60 * 60 * 1000).toISOString().slice(0, 10)

// A weekend has no close. This also makes manual dispatches safe at any time.
const weekday = new Date(`${marketDate}T12:00:00Z`).getUTCDay()
if (weekday === 0 || weekday === 6) {
  console.log(`${marketDate} is a weekend, nothing to record.`)
  process.exit(0)
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const isTwoCurrency =
  Array.isArray(data.series) && data.series.length > 0 && data.series.every((p) => CURRENCIES.every((c) => typeof p[c] === 'number'))
if (!isTwoCurrency) {
  console.error('hedge-fund-performance.json is not in the two-currency format (every series point needs a number for EUR and USD). Nothing was written.')
  process.exit(1)
}

// Both readings or none.
const settled = await Promise.allSettled(CURRENCIES.map((c) => fetchPerformance(c)))
const failures = settled.filter((s) => s.status === 'rejected').map((s) => s.reason.message)
if (failures.length) {
  console.error(`Reading failed, nothing was written:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
const reading = Object.fromEntries(CURRENCIES.map((c, i) => [c, round2(settled[i].value.max.relativeChange * 100)]))

// Plausibility against the last recorded trading day before this one. A re-run
// for the same market date is compared with the day before, not with itself.
const previous = data.series.filter((p) => p.date < marketDate).at(-1)
if (previous) {
  const jumps = CURRENCIES.filter((c) => Math.abs(reading[c] - previous[c]) > MAX_DAILY_MOVE_PP).map(
    (c) => `${c} ${previous[c]}% on ${previous.date} to ${reading[c]}%`,
  )
  if (jumps.length && !FORCE) {
    console.error(
      `Since-inception figure moved more than ${MAX_DAILY_MOVE_PP} percentage points in one day: ${jumps.join('; ')}. ` +
        'Check that each Access ID points to the right account. If the move is real, run the workflow manually with "force" ticked. Nothing was written.',
    )
    process.exit(1)
  }
  if (jumps.length) console.warn(`Forced past the plausibility check: ${jumps.join('; ')}`)
}

// Idempotent: a re-run for the same market date replaces it rather than
// duplicating it.
data.series = [...data.series.filter((p) => p.date !== marketDate), { date: marketDate, ...reading }].sort((a, b) =>
  a.date.localeCompare(b.date),
)

// All figures derive from the series, so they always agree with each other
// and with the chart. Taking the day figure from the endpoint instead is what
// produced the stuck 0.00%: a reading taken after midnight UTC sees a fresh
// calendar day with no market data behind it.
data.headline = Object.fromEntries(
  CURRENCIES.map((c) => [
    c,
    {
      day_pct: windowPct(data.series, c, 1),
      week_pct: windowPct(data.series, c, WEEK_DAYS),
      month_pct: windowPct(data.series, c, MONTH_DAYS),
      since_inception_pct: reading[c],
    },
  ]),
)
data.updated_at = new Date().toISOString()

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')

// Hands the market date to the commit step, so the commit message names the
// trading day recorded rather than the clock date the job ran on.
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `market_date=${marketDate}\n`)

console.log(`Recorded ${marketDate}: ${JSON.stringify(data.headline)}`)
