// Leadership team — real members from the live FS Student Hedge Fund site.
// Single source of truth: the About grid and each department's "Leads" section
// both render from here.
// `face` is the centre of the face in the photo, as fractions of its width and
// height; the organisation chart uses it to cut a round portrait.
export type Member = { name: string; role: string; bg: string; img: string; pos?: string; face?: [number, number] }

export const TEAM: Member[] = [
  { name: 'Tarik Asaad', role: 'President & Founding Member', bg: 'BSc Computational Business Analytics, BSc Mathematics', img: 'team-tarik.jpg' },
  { name: 'Berke Çiçek', role: 'Co-President & Founding Member', bg: 'BSc Management, Philosophy, Economics', img: 'team-berke.jpg' },
  { name: 'Vincent Ogrodowczyk', role: 'Head of Index Construction & Founding Member', bg: 'BSc Business Administration', img: 'team-vincent.jpg' },
  { name: 'David Wunderlich', role: 'Head of Index Construction & Founding Member', bg: 'BSc Business Administration', img: 'team-david.jpg' },
  { name: 'Beliz Hyuseinova', role: 'Head of Trading and Derivatives & Founding Member', bg: 'BSc Computational Business Analytics', img: 'team-beliz.jpg' },
  { name: 'Francesco di Fano', role: 'Head of Hedge Fund Department & Founding Member', bg: 'MSc Finance', img: 'team-francesco.jpg', face: [0.47, 0.5] },
  { name: 'Julius Jagland', role: 'Head of Hedge Fund Department & Founding Member', bg: 'BSc Business Administration', img: 'team-julius.jpg', face: [0.55, 0.49] },
  { name: 'Tonio Hasler', role: 'Head of Quantitative Team & Founding Member', bg: 'BSc Computational Business Analytics, BSc Physics', img: 'team-tonio.jpg' },
  { name: 'Helena Morris', role: 'Head of External Relations and Marketing & Founding Member', bg: 'BSc Management, Philosophy, Economics', img: 'team-helena.jpg', pos: '50% 100%' },
  { name: 'Linh Pham', role: 'Head of External Relations and Marketing & Founding Member', bg: 'BSc Business Administration', img: 'team-linh.jpg' },
  { name: 'Conrad Chen', role: 'Advisor & Founding Member', bg: 'BSc Business Administration', img: 'team-conrad.jpg' },
]

// Department roles outside the board. They appear in their department's
// "Leads" section but not in the About grid, which lists board members only.
export const STAFF: Member[] = [
  { name: 'Jakob Hautkappe', role: 'Portfolio Manager, Hedge Fund Department', bg: 'BSc Business Administration', img: 'team-jakob.jpg', pos: '50% 30%', face: [0.495, 0.465] },
]

export const byName = (...names: string[]): Member[] =>
  names.map((n) => [...TEAM, ...STAFF].find((m) => m.name === n)).filter((m): m is Member => Boolean(m))
