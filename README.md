# FS Student Hedge Fund — Website

Website for the **FS Student Hedge Fund**, a student initiative of Frankfurt School of Finance & Management.

- **Live site:** https://fs-student-hedgefund.com (canonical: `fsassociates.de`)
- **Current stack:** Lovable build — Vite + React + TypeScript + Tailwind + shadcn/ui
- **Status:** Redesign / improvement in progress

## Repo structure

| Path | Purpose |
|------|---------|
| `reference/` | Reference templates to draw from (drop files here). See `reference/README.md`. |
| `src/` | App source (to be added — current site or a rebuild). |

## Design tokens (current live site)

Pulled from the live CSS bundle, for continuity:

- Navy: `hsl(222 47% 11%)` · Navy-light: `hsl(222 30% 20%)`
- Accent (royal blue): `hsl(225 73% 57%)` — *candidate for desaturation*
- Background: white · Border: `hsl(220 13% 91%)` · Radius: `0.25rem`
- Breakpoint: `md = 768px` · Section rhythm: `py-24`

## Improvement checklist (from review, prioritized)

### P1 — Proportions & whitespace (biggest issue)
- [ ] Fix half-empty rows: hero headline, About, and Research leave ~40% of the row empty. Either fill the second column (stat block / chart / logo lockup / photo) or switch to a centered single column (`max-w ~720px`).
- [ ] Remove empty grid cells and tighten vertical rhythm to one scale (e.g. `py-20` desktop / `py-12` mobile). Target page height ~5,500px (currently 8,833px).
- [ ] Close the number↔title gap in the Investment Approach steps.

### P2 — Consistency
- [ ] Unify section alignment: every section left-aligned with a blue eyebrow label. (Research is currently center-aligned with no eyebrow — fix.)
- [ ] Normalize team headshots: one background, one crop ratio, one zoom. (Top row uses an FS-branded banner backdrop; others are plain studio — mismatched.)
- [ ] Resolve "three departments" copy vs four cards (Index Construction, Trading & Derivatives, Hedge Fund, Quantitative Team).

### P3 — Brand & type
- [ ] Desaturate/darken the royal-blue accent toward an institutional steel-blue.
- [ ] Replace the stock Tailwind type scale with a custom headline/body scale.

### P4 — Content & credibility
- [ ] Add a legal disclaimer to the footer (e.g. "Educational student initiative. Not investment advice; no solicitation or offer of securities.").
- [ ] Confirm Solactive and UniCredit have approved being named as partners.

### P5 — Mobile
- [ ] Reduce mobile page length (currently ~14,499px) once whitespace is fixed.
- [ ] Fix the minor hero/header overlap artifact at the top of the mobile view.

## Notes
Private repo. To make it public later: `gh repo edit francescodifano/fs-student-hedge-fund --visibility public --accept-visibility-change-consequences`
