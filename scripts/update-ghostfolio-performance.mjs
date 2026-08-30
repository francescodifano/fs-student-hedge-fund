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
      if (typeof p?.['1d']?.relativeChange !== 'number' || typeof p?.max?.relativeChange !== 'number') {
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

const performance = await fetchPerformance()
const today = new Date().toISOString().slice(0, 10)
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const sinceInception = round2(performance.max.relativeChange * 100)

// Idempotent: a re-run on the same day replaces that day rather than duplicating it.
data.series = [
  ...data.series.filter((p) => p.date !== today),
  { date: today, since_inception_pct: sinceInception },
].sort((a, b) => a.date.localeCompare(b.date))

data.headline = {
  day_pct: round2(performance['1d'].relativeChange * 100),
  week_pct: windowPct(data.series, WEEK_DAYS),
  month_pct: windowPct(data.series, MONTH_DAYS),
  since_inception_pct: sinceInception,
}
data.updated_at = new Date().toISOString()

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log(`Recorded ${today}: ${JSON.stringify(data.headline)}`)
