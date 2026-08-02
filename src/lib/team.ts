// Leadership team — real members from the live FS Student Hedge Fund site.
// Single source of truth: the About grid and each department's "Leads" section
// both render from here.
export type Member = { name: string; role: string; bg: string; img: string; pos?: string }

export const TEAM: Member[] = [
  { name: 'Tarik Asaad', role: 'President & Founding Member', bg: 'BSc Computational Business Analytics, BSc Mathematics', img: 'team-tarik.jpg' },
  { name: 'Berke Çiçek', role: 'Co-President & Founding Member', bg: 'BSc Management, Philosophy, Economics', img: 'team-berke.jpg' },
  { name: 'Vincent Ogrodowczyk', role: 'Head of Index Construction & Founding Member', bg: 'BSc Business Administration', img: 'team-vincent.jpg' },
  { name: 'David Wunderlich', role: 'Head of Index Construction & Founding Member', bg: 'BSc Business Administration', img: 'team-david.jpg' },
  { name: 'Beliz Hyuseinova', role: 'Head of Trading and Derivatives & Founding Member', bg: 'BSc Computational Business Analytics', img: 'team-beliz.jpg' },
  { name: 'Francesco di Fano', role: 'Head of Hedge Fund Department & Founding Member', bg: 'MSc Finance', img: 'team-francesco.jpg' },
  { name: 'Julius Jagland', role: 'Head of Hedge Fund Department & Founding Member', bg: 'BSc Business Administration', img: 'team-julius.jpg' },
  { name: 'Tonio Hasler', role: 'Head of Quantitative Team & Founding Member', bg: 'BSc Computational Business Analytics, BSc Physics', img: 'team-tonio.jpg' },
  { name: 'Helena Morris', role: 'Head of External Relations and Marketing & Founding Member', bg: 'BSc Management, Philosophy, Economics', img: 'team-helena.jpg', pos: '50% 100%' },
  { name: 'Linh Pham', role: 'Head of External Relations and Marketing & Founding Member', bg: 'BSc Business Administration', img: 'team-linh.jpg' },
  { name: 'Conrad Chen', role: 'Advisor & Founding Member', bg: 'BSc Business Administration', img: 'team-conrad.jpg' },
]

export const byName = (...names: string[]): Member[] =>
  names.map((n) => TEAM.find((m) => m.name === n)).filter((m): m is Member => Boolean(m))
