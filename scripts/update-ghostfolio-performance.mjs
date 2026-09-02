#!/usr/bin/env node
// Appends today's reading from the portfolio tracker's public, token-free
// endpoint to src/data/hedge-fund-performance.json and recomputes the
// headline figures. Run only by update-performance.yml.
//
// relativeChange arrives as a decimal fraction: 0.0123 means +1.23%.

import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../src/data/hedge-fund-performance.json', import.meta.url)
const ACCESS_ID = process.env.GHOSTFOLIO_ACCESS_ID
const MAX_ATTEMPTS = 3
const WEEK_DAYS = 5
const MONTH_DAYS = 21
const ATTRIBUTION_OFFSET_HOURS = 6

if (!ACCESS_ID) {
  console.error('GHOSTFOLIO_ACCESS_ID is not set.')
  process.exit(1)
}

const round2 = (n) => Math.round(n * 100) / 100

async function fetchPerformance() {
  const url = `https://ghostfol.io/api/v1/public/${ACCESS_ID}/portfolio`
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const body = await res.json()
      const p = body?.performance
      if (typeof p?.max?.relativeChange !== 'number') {
        throw new Error(`Unexpected response shape: ${JSON.stringify(body).slice(0, 400)}`)
      }
      return p
    } catch (err) {
      lastError = err
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`)
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 5000 * attempt))
    }
  }
  throw lastError
}

// Window return from the cumulative since-inception series. Returns null when
// there is not enough history, which the UI renders as an em dash.
function windowPct(series, daysBack) {
  if (series.length <= daysBack) return null
  const recent = 1 + series[series.length - 1].since_inception_pct / 100
  const past = 1 + series[series.length - 1 - daysBack].since_inception_pct / 100
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

const performance = await fetchPerformance()
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const sinceInception = round2(performance.max.relativeChange * 100)

// Idempotent: a re-run for the same market date replaces it rather than
// duplicating it.
data.series = [
  ...data.series.filter((p) => p.date !== marketDate),
  { date: marketDate, since_inception_pct: sinceInception },
].sort((a, b) => a.date.localeCompare(b.date))

// All four figures derive from the series, so they always agree with each
// other and with the chart. Taking the day figure from the endpoint instead
// is what produced the stuck 0.00%: a reading taken after midnight UTC sees a
// fresh calendar day with no market data behind it.
data.headline = {
  day_pct: windowPct(data.series, 1),
  week_pct: windowPct(data.series, WEEK_DAYS),
  month_pct: windowPct(data.series, MONTH_DAYS),
  since_inception_pct: sinceInception,
}
data.updated_at = new Date().toISOString()

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log(`Recorded ${marketDate}: ${JSON.stringify(data.headline)}`)
