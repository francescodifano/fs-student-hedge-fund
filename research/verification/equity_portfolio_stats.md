# Equity paper — flag 7 verification: blended dividend yield and portfolio beta

Run of `equity_portfolio_stats.py` (yfinance 1.2.0, live Yahoo Finance data), as-of **24 July 2026** (last close in the data). Portfolio = the "Recommended combined portfolio — 60% core / 40% satellites" table in `fshf-equity.tex`, mapped to the Section 7 UCITS instrument list.

## Ticker mapping (paper instrument → Yahoo listing)

| Sleeve | Weight | Paper ticker / ISIN | EUR return listing | Yield source |
|---|---|---|---|---|
| US core | 34% | CSPX / IE00B5BMR087 | SXR8.DE (same fund, Xetra EUR line) | proxy SPY (Acc class pays nothing) |
| Europe core | 26% | EXSA / DE0002635307 | EXSA.DE | own listing (Dist) |
| EU banks | 8% | EXV1 / DE000A0F5UJ7 | EXV1.DE | own listing (Dist) |
| Defense | 8% | NATO / IE000OJ5TQP4 | ASWC.DE (same fund, Xetra EUR line) | **unavailable** — Acc only, no distributing twin |
| Health care | 6% | EXV4 (confirm) | EXV4.DE | own listing (Dist) |
| Staples/food | 6% | (confirm) | EXH3.DE (iShares STOXX Eur 600 Food & Bev DE) | own listing (Dist) |
| Energy | 5% | EXH1 (confirm) | EXH1.DE | own listing (Dist) |
| US financials | 4% | (confirm; fund = iShares S&P 500 Financials, IUFS) | QDVH.DE (same fund, Xetra EUR line) | proxy XLF |
| Rare earths | 3% | VVMX / IE0002PG6CA6 | VVMX.DE | proxy REMX (US-listed VanEck, same strategy) |

All nine holdings resolved to EUR listings for the return series (100% weight coverage). Rejected candidates: SEKN.DE and IUFS.AS do not exist on Yahoo; CSPX.L, NATO.L, REMX.L, IUFS.L exist but trade in USD, so the Xetra EUR lines were preferred.

## 1. Blended trailing-12M dividend yield

Method: weight × per-ETF trailing yield, where trailing yield = sum of cash dividends over the last 365 days (`Ticker.dividends`) / last close, same listing, same currency. Accumulating share classes use a distributing tracker of the same or near-identical index as proxy (SPY for S&P 500; XLF for S&P 500 financials; REMX for MVIS rare earths). The defense sleeve (8%) has no distributing twin anywhere, so it is excluded and the blend is renormalized over the remaining 92% of weight.

| Holding | Weight | Trailing-12M yield | Detail (divs / close, as of 2026-07-24) |
|---|---|---|---|
| CSPX (via SPY) | 34% | 1.018% | 4 divs, 7.5250 / 738.93 |
| EXSA.DE | 26% | 2.461% | 4 divs, 1.5809 / 64.23 |
| EXV1.DE | 8% | 3.504% | 4 divs, 1.4419 / 41.15 |
| NATO | 8% | n/a | excluded |
| EXV4.DE | 6% | 1.619% | 4 divs, 1.8570 / 114.68 |
| EXH3.DE | 6% | 2.325% | 4 divs, 1.5137 / 65.09 |
| EXH1.DE | 5% | 2.778% | 4 divs, 1.4956 / 53.84 |
| IUFS (via XLF) | 4% | 1.433% | 4 divs, 0.8070 / 56.31 |
| VVMX (via REMX) | 3% | 1.927% | 1 div, 1.3010 / 67.51 |

- **Blended portfolio yield: 1.91%** (coverage 92% of weight, renormalized)
- **Pure-US comparator: SPY 1.02%** (cross-check VOO: 1.08%)

The paper's claim holds: the blend is roughly double the S&P 500 trailing yield.

## 2. Portfolio beta (weekly EUR returns)

Method: Friday-sampled weekly simple returns from auto-adjusted daily closes of the nine EUR listings, weighted at the table weights (weights sum to 100%; series renormalized over aligned weeks); 104 weeks, 2024-08-02 to 2026-07-24; OLS.

| Benchmark | Beta | Alpha (ann.) | R² | n |
|---|---|---|---|---|
| MSCI World in EUR (EUNL.DE) | **0.861** | +4.99% | 0.851 | 104 |
| S&P 500 in EUR (SXR8.DE, EUR-listed tracker) | **0.734** | +7.04% | 0.720 | 104 |
| S&P 500 in EUR (^GSPC / EURUSD=X) | 0.623 | +9.45% | 0.602 | 104 |

The SXR8.DE regression is the cleaner S&P 500-in-EUR estimate: it uses Xetra closes synchronous with the portfolio legs. The ^GSPC/EURUSD variant is biased down by asynchronous closing times (Xetra 17:30 CET vs NYSE 22:00 CET) and is reported for transparency.

## What went into the paper

Sentence in Section 6 (Portfolio Construction), replacing the unquantified assertion, with a method footnote: blended trailing dividend yield **1.9%** vs **1.0%** for the S&P 500; beta **0.86** vs MSCI World in EUR and **0.73** vs the S&P 500 in EUR (0.62 on the FX-converted index, noted in the footnote).

Caveats: yields for CSPX/IUFS/VVMX come from same-index distributing proxies, not the UCITS share classes themselves; the defense sleeve is unpriced for yield (coverage 92%); "confirm"-status rows were mapped to the named funds' German listings, which is the natural reading but should be re-checked against the final ISINs approved in IBKR on deployment day.

Reproduce: `~/wrds_project/venv/bin/python3 equity_portfolio_stats.py`
