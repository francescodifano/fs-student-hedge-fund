// Single source of truth for navigation — used by the header, mobile menu and footer.

export type NavItem = { label: string; to: string }

// Department names/order follow the live site: 01 Index Construction,
// 02 Trading & Derivatives, 03 Hedge Fund, 04 Quantitative Team.
export const DEPARTMENTS: NavItem[] = [
  { label: 'Index Construction', to: '/index-construction' },
  { label: 'Trading & Derivatives', to: '/derivatives' },
  { label: 'Hedge Fund', to: '/hedge-fund' },
  { label: 'Quantitative Team', to: '/quant' },
  { label: 'Media & Community', to: '/social' },
]

export const FOOTER_PAGES: NavItem[] = [
  { label: 'Homepage', to: '/' },
  { label: 'Newsroom', to: '/newsroom' },
  { label: 'Research', to: '/research' },
  { label: 'Index Construction', to: '/index-construction' },
  { label: 'Trading & Derivatives', to: '/derivatives' },
  { label: 'Hedge Fund', to: '/hedge-fund' },
  { label: 'Quantitative Team', to: '/quant' },
  { label: 'Media & Community', to: '/social' },
  { label: 'Applications', to: '/applications' },
  { label: 'About', to: '/about' },
]
