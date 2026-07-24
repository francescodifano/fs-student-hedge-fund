#!/usr/bin/env python3
"""
Equity paper, review flag 7 verification.

Computes, from live Yahoo Finance data (yfinance):
  (1) the blended trailing-12M dividend yield of the recommended combined
      portfolio (Table: "Recommended combined portfolio - 60% core / 40%
      satellites" in fshf-equity.tex), weight x per-ETF trailing yield,
      versus a pure-US comparator (S&P 500 trailing yield via SPY, with
      VOO as cross-check);
  (2) portfolio beta: weighted weekly EUR total-return series over the
      last ~2 years regressed against (a) iShares Core MSCI World UCITS
      ETF in EUR (EUNL.DE) and (b) the S&P 500 index expressed in EUR
      (^GSPC converted at EURUSD=X; SXR8.DE as sanity check).

Run:  ~/wrds_project/venv/bin/python3 equity_portfolio_stats.py

Ticker mapping (paper instrument -> Yahoo listing used for EUR returns):
  CSPX  IE00B5BMR087 -> SXR8.DE  (same fund, Xetra EUR line; CSPX.L is USD)
  EXSA  DE0002635307 -> EXSA.DE
  EXV1  DE000A0F5UJ7 -> EXV1.DE
  NATO  IE000OJ5TQP4 -> ASWC.DE  (same fund, Xetra EUR line; NATO.L is USD)
  VVMX  IE0002PG6CA6 -> VVMX.DE  (Xetra EUR line; REMX.L is the USD LSE line)
  EXV4  (confirm)    -> EXV4.DE  (iShares STOXX Europe 600 Health Care DE)
  EXH1  (confirm)    -> EXH1.DE  (iShares STOXX Europe 600 Oil & Gas DE)
  Food & Beverage    -> EXH3.DE  (iShares STOXX Europe 600 Food & Beverage DE)
  IUFS / S&P 500 Financials -> QDVH.DE (same fund, Xetra EUR line; IUFS.L is USD)

Dividend-yield source per holding:
  Distributing German listings (EXSA.DE, EXV1.DE, EXV4.DE, EXH1.DE,
  EXH3.DE): trailing yield = sum of cash dividends over the last 365 days
  (yfinance Ticker.dividends, EUR) / last close (EUR), same listing.
  Accumulating share classes pay no dividends, so a distributing tracker
  of the same or near-identical index is used as yield proxy:
    SXR8.DE (S&P 500, Acc)            -> SPY  (S&P 500, Dist)
    QDVH.DE (S&P 500 Financials, Acc) -> XLF  (Financial Select Sector, Dist)
    VVMX.DE (MVIS Rare Earth, Acc)    -> REMX (US VanEck, same strategy, Dist)
    ASWC.DE (Future of Defence, Acc)  -> NO distributing twin exists;
      excluded from the yield blend, weights renormalized, coverage reported.
"""

import sys
import numpy as np
import pandas as pd
import yfinance as yf

YIELD_LOOKBACK_DAYS = 365
BETA_WEEKS = 104  # ~2 years of weekly returns

# sleeve, fund (short), paper ticker, ISIN, weight, EUR return listing, yield source
HOLDINGS = [
    ("US core",       "iShares Core S&P 500 UCITS (Acc)",        "CSPX", "IE00B5BMR087", 0.34, "SXR8.DE", ("proxy", "SPY")),
    ("Europe core",   "iShares STOXX Europe 600 (DE)",           "EXSA", "DE0002635307", 0.26, "EXSA.DE", ("self", "EXSA.DE")),
    ("EU banks",      "iShares STOXX Europe 600 Banks (DE)",     "EXV1", "DE000A0F5UJ7", 0.08, "EXV1.DE", ("self", "EXV1.DE")),
    ("Defense",       "HANetf Future of Defence (Acc)",          "NATO", "IE000OJ5TQP4", 0.08, "ASWC.DE", ("missing", None)),
    ("Health care",   "iShares STOXX Europe 600 Health Care",    "EXV4", "confirm",      0.06, "EXV4.DE", ("self", "EXV4.DE")),
    ("Staples/food",  "iShares STOXX Europe 600 Food & Bev",     "EXH3", "confirm",      0.06, "EXH3.DE", ("self", "EXH3.DE")),
    ("Energy",        "iShares STOXX Europe 600 Oil & Gas",      "EXH1", "confirm",      0.05, "EXH1.DE", ("self", "EXH1.DE")),
    ("US financials", "iShares S&P 500 Financials Sector (Acc)", "IUFS", "confirm",      0.04, "QDVH.DE", ("proxy", "XLF")),
    ("Rare earths",   "VanEck Rare Earth & Strat Metals (Acc)",  "VVMX", "IE0002PG6CA6", 0.03, "VVMX.DE", ("proxy", "REMX")),
]

US_COMPARATORS = ["SPY", "VOO"]
BENCH_WORLD_EUR = "EUNL.DE"     # iShares Core MSCI World UCITS ETF, Xetra, EUR
BENCH_SPX = "^GSPC"             # S&P 500 index, USD -> converted to EUR
BENCH_SPX_EUR_ETF = "SXR8.DE"   # sanity check: S&P 500 UCITS traded in EUR
FX = "EURUSD=X"                 # USD per EUR


def trailing_yield(ticker: str):
    """Trailing-12M cash dividends / last close, same listing. Returns
    (yield_pct, n_divs, div_sum, last_close, asof) or None if no dividends."""
    t = yf.Ticker(ticker)
    hist = t.history(period="1y")
    if hist.empty:
        return None
    last = float(hist["Close"].iloc[-1])
    asof = hist.index[-1].date()
    divs = t.dividends
    if divs is None or len(divs) == 0:
        return None
    divs = divs.copy()
    divs.index = divs.index.tz_localize(None)
    cut = pd.Timestamp(asof) - pd.Timedelta(days=YIELD_LOOKBACK_DAYS)
    t12 = divs[divs.index > cut]
    if len(t12) == 0:
        return None
    return 100.0 * float(t12.sum()) / last, len(t12), float(t12.sum()), last, asof


def weekly_returns(close: pd.Series) -> pd.Series:
    """Friday-sampled weekly simple returns from a daily close series."""
    s = close.dropna()
    s.index = pd.DatetimeIndex(s.index).tz_localize(None)
    w = s.resample("W-FRI").last().dropna()
    return w.pct_change().dropna()


def ols_beta(y: pd.Series, x: pd.Series):
    """OLS of y on x. Returns beta, alpha (per period), R2, n."""
    df = pd.concat([y, x], axis=1, join="inner").dropna()
    df.columns = ["y", "x"]
    n = len(df)
    beta = df["y"].cov(df["x"]) / df["x"].var()
    alpha = df["y"].mean() - beta * df["x"].mean()
    r2 = df["y"].corr(df["x"]) ** 2
    return beta, alpha, r2, n


def main():
    print("=" * 78)
    print("PART 1 - Blended trailing-12M dividend yield")
    print("=" * 78)
    rows, missing_wt = [], 0.0
    for sleeve, fund, ptick, isin, w, eur_listing, (mode, ysrc) in HOLDINGS:
        if mode == "missing":
            missing_wt += w
            rows.append((sleeve, ptick, w, None, "unavailable (Acc, no distributing twin)"))
            continue
        res = trailing_yield(ysrc)
        if res is None:
            missing_wt += w
            rows.append((sleeve, ptick, w, None, f"{ysrc}: no dividend data"))
            continue
        ypct, ndiv, dsum, last, asof = res
        tag = "own listing" if mode == "self" else f"proxy {ysrc}"
        rows.append((sleeve, ptick, w, ypct, f"{tag}: {ndiv} divs, sum {dsum:.4f} / close {last:.2f}, as of {asof}"))

    covered = [(w, y) for _, _, w, y, _ in rows if y is not None]
    cov_wt = sum(w for w, _ in covered)
    blended = sum(w * y for w, y in covered) / cov_wt
    for sleeve, ptick, w, y, note in rows:
        ystr = f"{y:6.3f}%" if y is not None else "   n/a "
        print(f"  {sleeve:14s} {ptick:5s} w={w:5.0%}  ttm_yield={ystr}  [{note}]")
    print(f"\n  Coverage: {cov_wt:.0%} of portfolio weight ({missing_wt:.0%} unresolved)")
    print(f"  Blended trailing-12M dividend yield (renormalized over coverage): {blended:.2f}%")

    for c in US_COMPARATORS:
        res = trailing_yield(c)
        if res:
            ypct, ndiv, dsum, last, asof = res
            print(f"  US comparator {c}: trailing-12M yield {ypct:.2f}% "
                  f"({ndiv} divs, sum {dsum:.4f} / close {last:.2f}, as of {asof})")

    print()
    print("=" * 78)
    print(f"PART 2 - Portfolio beta (weekly EUR returns, last {BETA_WEEKS} weeks)")
    print("=" * 78)
    tickers = [h[5] for h in HOLDINGS] + [BENCH_WORLD_EUR, BENCH_SPX, BENCH_SPX_EUR_ETF, FX]
    px = yf.download(tickers, period="3y", interval="1d", auto_adjust=True,
                     progress=False)["Close"]

    wk = {c: weekly_returns(px[c]) for c in px.columns}
    port_rets, total_w = [], 0.0
    for h in HOLDINGS:
        r = wk[h[5]]
        if len(r) < BETA_WEEKS // 2:
            print(f"  WARNING: {h[5]} has only {len(r)} weekly returns - excluded")
            continue
        port_rets.append(h[4] * r)
        total_w += h[4]
    port = pd.concat(port_rets, axis=1).dropna().sum(axis=1) / total_w
    port = port.iloc[-BETA_WEEKS:]
    print(f"  Return-series coverage: {total_w:.0%} of portfolio weight, "
          f"{len(port)} weeks, {port.index[0].date()} to {port.index[-1].date()}")

    # S&P 500 in EUR: USD index level / (USD per EUR)
    fx_w = px[FX].dropna()
    fx_w.index = pd.DatetimeIndex(fx_w.index).tz_localize(None)
    spx = px[BENCH_SPX].dropna()
    spx.index = pd.DatetimeIndex(spx.index).tz_localize(None)
    spx_eur = (spx / fx_w).dropna()
    spx_eur_w = spx_eur.resample("W-FRI").last().dropna().pct_change().dropna()

    benches = [
        ("MSCI World EUR (EUNL.DE)", wk[BENCH_WORLD_EUR]),
        ("S&P 500 in EUR (^GSPC / EURUSD)", spx_eur_w),
        ("S&P 500 EUR sanity (SXR8.DE)", wk[BENCH_SPX_EUR_ETF]),
    ]
    for name, b in benches:
        beta, alpha, r2, n = ols_beta(port, b.iloc[-BETA_WEEKS:])
        print(f"  vs {name:34s} beta={beta:.3f}  alpha={alpha*52*100:+.2f}%/yr  "
              f"R2={r2:.3f}  n={n}")

    print("\nDone. As-of date =", port.index[-1].date())


if __name__ == "__main__":
    sys.exit(main())
