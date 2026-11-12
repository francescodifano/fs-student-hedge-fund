// Flip cards on the Trading & Derivatives page (/derivatives). One entry per card: add, edit or
// remove a card here and the page follows. Content from the department's brief (Beliz Hyuseinova,
// 12 Nov 2026), published as written; a separate fact-check of the wording followed.
export type DerivCard = { front: string; back: string }
// `filter`: the label of the group's filter button above the cards (brief 2.2).
export type DerivGroup = { title: string; filter: string; note?: string; cards: DerivCard[] }

export const DERIV_GROUPS: DerivGroup[] = [
  {
    title: 'Options strategies',
    filter: 'Options',
    note: 'We trade these in paper accounts, and only covered positions, never uncovered (naked) ones.',
    cards: [
      { front: 'Long Call', back: 'The right to buy an asset at a set strike price before expiry. Profits if the price rises above the strike plus the premium paid; the most you can lose is the premium.' },
      { front: 'Long Put', back: 'The right to sell an asset at a set strike price before expiry. Profits if the price falls below the strike minus the premium; the most you can lose is the premium. Used to speculate or to protect a holding.' },
      { front: 'Covered Call', back: 'Hold the underlying and sell a call against it. The premium is extra income, but gains above the strike are given up, and the holding still falls in value if the price drops.' },
      { front: 'Covered Put', back: 'A short position in the underlying combined with a sold put. The premium is extra income and the short is covered, but profit on the short is capped at the strike and the risk is a rising price.' },
      { front: 'Long Call Spread', back: 'Buy a lower-strike call and sell a higher-strike call with the same expiry. A cheaper bullish bet than a single call, with both profit and loss capped.' },
      { front: 'Long Put Spread', back: 'Buy a higher-strike put and sell a lower-strike put with the same expiry. A cheaper bearish bet than a single put, with both profit and loss capped.' },
      { front: 'Collar', back: 'Hold the underlying, buy a protective put and sell a call. The call premium pays for the put. Losses are floored and gains are capped.' },
      { front: 'Short Collar', back: 'The mirror image of a collar for a short position: short the underlying, buy a call to cap losses if the price rises, and sell a put to pay for it. Caps both risk and reward.' },
      { front: 'Long Straddle', back: 'Buy a call and a put with the same strike and expiry. Profits from a large move in either direction; loses if the price stays near the strike. Maximum loss is the total premium.' },
      { front: 'Long Strangle', back: 'Buy an out-of-the-money call and an out-of-the-money put with the same expiry. Cheaper than a straddle, but needs a bigger move to profit.' },
    ],
  },
  {
    title: 'Futures',
    filter: 'Futures',
    cards: [
      { front: 'Futures Contract', back: 'A standardised, exchange-traded agreement to buy or sell an asset at a set price on a future date. Marked to market daily and traded on margin, so gains and losses are leveraged.' },
      { front: 'Treasury Futures', back: 'Futures on US Treasury notes and bonds (2Y, 5Y, 10Y, Ultra, 30Y), physically deliverable via the cheapest-to-deliver bond. Used to take views on rates, manage duration and trade the yield curve.' },
      { front: 'Treasury Yield Futures', back: 'Smaller, cash-settled futures quoted in yield rather than price, tracking on-the-run Treasuries. A precise, low-cost way to trade yield levels and curve spreads.' },
      { front: 'SOFR Futures', back: 'Cash-settled futures on the Secured Overnight Financing Rate (3-month and 1-month contracts). Priced at 100 minus the rate; used to trade or hedge expectations for short-term US rates.' },
      { front: 'Fed Funds Futures', back: 'Monthly cash-settled futures priced at 100 minus the average effective Fed Funds rate for the month. They show what the market expects the Fed to do at upcoming meetings.' },
      { front: 'Credit Index Futures', back: 'Futures tracking investment-grade or high-yield corporate bond indices, giving broad credit exposure in a single, liquid contract.' },
    ],
  },
  {
    title: 'Interest rate options and swaps (Fixed Income / FICC)',
    filter: 'Rates',
    cards: [
      { front: 'Options on Rate Futures', back: 'Options on Treasury or SOFR futures, including mid-curve options. Used to express rate views with defined risk, hedge, or build cap-like and floor-like payoffs.' },
      { front: 'Interest Rate Cap / Floor', back: 'A series of options that pays out when a floating rate rises above the cap strike or falls below the floor strike. Used to hedge floating-rate borrowing or lending.' },
      { front: 'Interest Rate Swap', back: 'An OTC agreement to exchange fixed-rate and floating-rate (e.g. SOFR) payments on an agreed notional. Used to hedge rate risk or trade views on rates and the curve.' },
      { front: 'Forward Rate Agreement', back: 'An OTC contract that locks in an interest rate for a future period. At the start of that period, the difference to the actual rate is settled in cash.' },
    ],
  },
  {
    title: 'Credit',
    filter: 'Credit',
    cards: [
      { front: 'Credit Default Swap', back: 'Works like insurance on a bond: the buyer pays a regular premium and the seller pays out if the reference borrower has a credit event, such as a default.' },
      { front: 'CDS Index', back: 'A standardised basket of credit default swaps (e.g. CDX, iTraxx) that gives broad investment-grade or high-yield credit exposure in one instrument.' },
      { front: 'Total Return Swap', back: 'One party pays the total return (income plus price change) of an asset such as a bond or index, and receives a floating rate in return. Gives synthetic exposure with little capital.' },
    ],
  },
  {
    title: 'FX and Commodities',
    filter: 'FX and Commodities',
    cards: [
      { front: 'FX Forward', back: 'An OTC agreement to exchange two currencies at a fixed rate on a future date. Used to lock in an exchange rate and hedge currency risk.' },
      { front: 'FX Swap', back: 'A spot currency trade paired with an opposite forward trade. Used for short-term funding and for rolling currency positions; the price reflects the interest rate gap between the two currencies.' },
      { front: 'Cross-Currency Basis Swap', back: "Exchange of interest payments, and usually principal, in two currencies. The quoted basis shows how much demand there is for one currency's funding." },
      { front: 'Currency Futures', back: 'Standardised, exchange-traded contracts on currency pairs such as EUR/USD. Used to hedge or speculate on exchange rates.' },
      { front: 'Commodity Futures', back: 'Standardised contracts on commodities such as oil, gas, metals and agriculture, settled physically or in cash. Used to hedge price risk or speculate.' },
      { front: 'Commodity Options', back: 'Options on commodities or commodity futures. Give the right, not the obligation, to buy or sell at a set price, with risk limited to the premium for buyers.' },
    ],
  },
]
