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

// The featured flagship report shown in the Latest Research block.
export const FEATURED: Paper = {
  title: 'H2 2026 Report',
  tag: 'Flagship Report · 2026',
  authors: 'Hedge Fund Department',
  date: 'July 2026',
  blurb:
    'The fund’s positioning for the second half of 2026, built from the published research of the commodities, equities and fixed income teams: a late cycle reflation regime, expressed through three sleeves with written triggers on every position.',
  pdf: 'h2-2026-report.pdf',
  // Inner chart pages, not the navy title page: the featured box is itself
  // navy, so the cover render used to blend in and read as "no picture".
  cover: 'research-h2-2026-pages.jpg',
  coverAlt: 'Chart pages from the FS Student Hedge Fund H2 2026 Report',
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
  {
    title: 'Seagate Technology Holdings PLC',
    tag: 'Equity Research · 2025',
    authors: 'Equity Research Team',
    date: '23 December 2025',
    blurb:
      'Initiating coverage with a BUY rating and a $350 price target: the architecture of areal density, the HAMR margin reset, and a twelve month view on the mass capacity storage cycle.',
    pdf: 'seagate-technology-equity-research-2025.pdf',
    cover: 'research-seagate-cover.jpg',
    coverAlt: 'Cover of the Seagate Technology equity research report',
  },
]
