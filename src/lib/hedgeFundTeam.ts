// Who is where in the Hedge Fund Department. Rendered by DeptChart on the
// Hedge Fund page. Names as the members use them; `abroad` marks a semester
// abroad, `former` a past team member who now holds a department role.
export type ChartPerson = { name: string; abroad?: boolean; former?: boolean }
export type ChartGroup = { label?: string; people: ChartPerson[] }
export type ChartTeam = { name: string; groups: ChartGroup[] }

export const CHART_AS_OF = 'October 2026'

export const CHART_LEADS = {
  heads: ['Francesco di Fano', 'Julius Jagland'],
  headsAbroad: ['Julius Jagland'],
  portfolioManager: 'Jakob Hautkappe',
}

export const CHART_TEAMS: ChartTeam[] = [
  {
    name: 'Fixed income',
    groups: [
      {
        people: [
          { name: 'Johannes Volkemer' },
          { name: 'Raphael Banner' },
          { name: 'Jasper Claßen' },
          { name: 'Tristan Lützenkirchen' },
          { name: 'Atharva Johri' },
          { name: 'Leonard Heß' },
          { name: 'Anastasia Shevchuk', abroad: true },
        ],
      },
    ],
  },
  {
    name: 'Equities',
    groups: [
      {
        people: [
          { name: 'Sandro Janashvili' },
          { name: 'Anton Hilger' },
          { name: 'Pedro Cunha' },
          { name: 'Leon Veauthier' },
          { name: 'Timon Wismer' },
          { name: 'Timur Khairullin', abroad: true },
        ],
      },
    ],
  },
  {
    name: 'Commodities',
    groups: [
      {
        people: [
          { name: 'Jonathan Nadar' },
          { name: 'Balint Mihalik' },
          { name: 'Niklas Colonius' },
          { name: 'Jakob Hautkappe', former: true },
        ],
      },
    ],
  },
  {
    name: 'Independent research',
    groups: [
      {
        label: 'Volatility Risk Premium',
        people: [
          { name: 'Leon Hendrischk', abroad: true },
          { name: 'Friedrich Morris', abroad: true },
          { name: 'Linda Zillmer', abroad: true },
        ],
      },
      {
        label: 'Efficient Market Hypothesis',
        people: [
          { name: 'Takudzwa Mutetwa', abroad: true },
          { name: 'Sebastian Maurer', abroad: true },
          { name: 'Sean Pascal', abroad: true },
        ],
      },
    ],
  },
]
