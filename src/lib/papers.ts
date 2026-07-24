// Published research papers, served from public/papers on this site itself.
// Covers live in public/assets as research-*-cover.jpg (page one of each PDF).
export type Paper = {
  title: string
  tag: string
  authors: string
  date: string
  blurb: string
  pdf: string
  cover: string
  coverAlt: string
}

export const PAPERS: Paper[] = [
  {
    title: 'Commodities Research Paper',
    tag: 'Commodities · 2026',
    authors: 'Jakob Hautkappe and Jonathan Nadar',
    date: '25 June 2026',
    blurb:
      'A core satellite commodities sleeve of 50% gold, 30% copper and 20% passive agriculture, built on three distinct drivers, each tested against twenty years of data and carrying a written falsification rule.',
    pdf: 'commodities-research-2026.pdf',
    cover: 'research-commodities-cover.jpg',
    coverAlt: 'Title page of the Commodities Research Paper',
  },
  {
    title: 'Equities Portfolio Research',
    tag: 'Equities · 2026',
    authors: 'Timur, Anton and Sandro',
    date: '24 June 2026',
    blurb:
      'A late cycle reflation playbook for a US and European equity sleeve: a 60% passive core with 40% thematic satellites, built on Fed and ECB divergence, the oil shock and the European valuation discount.',
    pdf: 'equities-portfolio-research-2026.pdf',
    cover: 'research-equities-cover.jpg',
    coverAlt: 'Title page of the Equities Portfolio Research paper',
  },
  {
    title: 'Fixed Income Portfolio',
    tag: 'Fixed Income · 2026',
    authors: 'Anastasia Shevchuk, Johannes Volkemer and Raphael Banner',
    date: '2 July 2026',
    blurb:
      'A defensive 70/30 EUR and USD fixed income portfolio across 20 UCITS ETFs, built on ECB and Fed policy divergence and prioritising capital preservation with a blended duration near 4.3 years.',
    pdf: 'fixed-income-portfolio-2026.pdf',
    cover: 'research-fixed-income-cover.jpg',
    coverAlt: 'Title page of the Fixed Income Portfolio paper',
  },
  {
    title: 'The Volatility Risk Premium',
    tag: 'Literature Review · 2026',
    authors: 'Leon Hendrischk, Friedrich Morris and Linda Zillmer',
    date: 'June 2026',
    blurb:
      'Why option implied volatility exceeds realized volatility: the insurance premium at the heart of option markets, how it is measured, how practitioners harvest it, and whether it has declined since 2010.',
    pdf: 'volatility-risk-premium-review-2026.pdf',
    cover: 'research-vrp-cover.jpg',
    coverAlt: 'Title page of The Volatility Risk Premium literature review',
  },
  {
    title: 'Efficient Market Hypothesis',
    tag: 'Literature Review · 2026',
    authors: 'Takudzwa Mutetwa, Sebastian Maurer and Sean Pascal',
    date: 'July 2026',
    blurb:
      'From the classical forms of market efficiency to behavioural anomalies, limits to arbitrage and adaptive markets: where prices are efficient enough that active management struggles to add value.',
    pdf: 'efficient-market-hypothesis-review-2026.pdf',
    cover: 'research-emh-cover.jpg',
    coverAlt: 'Title page of the Efficient Market Hypothesis literature review',
  },
]
