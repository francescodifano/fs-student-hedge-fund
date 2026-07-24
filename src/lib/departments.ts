// Content for the department pages — sourced verbatim from the live site
// (fs-student-hedgefund.com/departments/*), which numbers the departments and
// names them "Trading & Derivatives" / "Quantitative Team".
// Index Construction has its own richer page (IndexConstruction.tsx).
// `mission` lines are the per-department statements from the Solactive pitch
// deck's "Struktur" slide (translated); `leads` reference lib/team.ts by name.
export type Dept = { num: string; name: string; hero: string; body: string[]; mission: string; leads: string[] }

export const DEPARTMENTS_DATA: Record<string, Dept> = {
  'hedge-fund': {
    num: '03',
    name: 'Hedge Fund',
    hero: 'hedgefund-1.jpg',
    mission: 'Independent research and institutional-grade financial analysis.',
    leads: ['Francesco di Fano', 'Julius Jagland'],
    body: [
      'The Hedge Fund combines discretionary and systematic approaches across multiple strategies and asset classes. Members develop macro theses, construct diversified portfolios, and implement hedging strategies to generate risk-adjusted returns across varying market environments.',
      'The department also reviews and publishes the written research of the investment teams: portfolio papers for the commodities, equities and fixed income sleeves, together with literature reviews on the foundations of our strategies. All published papers are available on the Research page.',
    ],
  },
  derivatives: {
    num: '02',
    name: 'Trading & Derivatives',
    hero: 'derivatives-1.jpg',
    mission: 'Portfolio competitions with real options strategies, teams competing head-to-head.',
    leads: ['Beliz Hyuseinova'],
    body: [
      'The trading and derivative department brings together students from across disciplines, forming cross-functional teams that collaborate to navigate real-world financial markets. Each team manages a portfolio using a set of derivative instruments spanning multiple asset classes, developing and executing strategies in a structured, competitive environment.',
      'Teams are evaluated on a quarterly basis using performance metrics, with standings tracked and published throughout the year. Beyond the competition itself, members benefit from a rich learning environment, including workshops on financial theory and derivative strategies, as well as ongoing dialogue with experienced traders and academics who provide guidance, challenge ideas, and help teams refine their thinking. It is a department designed to sharpen analytical skills, foster cross-asset understanding, and cultivate the next generation of investment talent.',
    ],
  },
  quant: {
    num: '04',
    name: 'Quantitative Team',
    hero: 'quant-1.jpg',
    mission: 'Quantitative support for every department through models and data analysis.',
    leads: ['Tonio Hasler'],
    body: [
      'The Quantitative Research department brings together students with a passion for mathematics, data science, and financial markets, forming collaborative teams that develop and apply systematic investment strategies. Each team works to research, build, and refine quantitative models and analytical tools that support more informed investment decisions across asset classes.',
      'Teams present and evaluate their strategies on a regular basis, with a focus on sound methodology, and continuous iteration.',
      'Beyond project work, the department offers a hands-on introduction to the world of quantitative finance. Through workshops and practical sessions, members gain exposure to real-world methodologies used in the industry, while also building the technical and conceptual foundations required for careers in the field. The department aims to foster rigorous thinking, strengthen programming and modelling skills, and prepare students for interviews and roles in quantitative finance.',
    ],
  },
}
