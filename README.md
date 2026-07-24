# FSHF LaTeX Package — README

Publication-ready LaTeX for the three FS Student Hedge Fund research papers, sharing one house style. Content is the Phase-1 revised text (Francesco's comments implemented); layout is uniform across all three.

## Contents

| File | What it is |
|---|---|
| `fshf-style.sty` | The shared house style. All layout lives here. |
| `fshf-commodities.tex` | Commodities Research Paper (32 pp compiled) |
| `fshf-equity.tex` | Equities Portfolio Research (18 pp compiled) |
| `fshf-fixed-income.tex` | Fixed Income Portfolio (17 pp compiled) |
| `FIGURES-MANIFEST.md` | Exact filenames for the chart exports (Equity 10, Fixed Income 5, Commodities none) |
| `fshf-*.pdf` | Preview PDFs compiled without figures/logo — placeholders show where images will land |

## How to compile

Engine: **pdfLaTeX**, run **twice** (second pass resolves the table of contents and cross-references):

```
pdflatex fshf-commodities.tex
pdflatex fshf-commodities.tex
```

Same for the other two. On Overleaf: upload the `.sty`, the three `.tex`, and a `figures/` folder, set the compiler to pdfLaTeX, and compile — no other configuration. All packages used are standard TeX Live (booktabs, longtable, tabularx, titlesec, fancyhdr, caption, enumitem, xcolor, hyperref, geometry, graphicx).

## The Times New Roman decision

The papers are set in Times. Under pdfLaTeX this is provided by **newtx** (the current, complete Times implementation shipped with full TeX Live / Overleaf). The style file falls back automatically to **mathptmx** (the classic Times package, available on even minimal installations) so the documents compile everywhere. The literal Times New Roman `.ttf` from Windows is only loadable under XeLaTeX/LuaLaTeX; the brief specifies pdfLaTeX, so the newtx route is the correct, visually equivalent implementation — this is the one deliberate interpretation of the font requirement, documented here as required.

## Figures

Every figure slot is a guarded `\fshffig{...}` call: if `figures/<name>.png` exists it is embedded at uniform width; if not, the document still compiles and prints a labelled placeholder box. Export the charts from the source documents unchanged, name them per `FIGURES-MANIFEST.md`, drop them into `figures/`, recompile — done. One exception flagged in the manifest: **Fixed Income Figure 2 must be re-exported/relabelled as core-PCE y/y** to match the corrected prose (review comment, flag 2). Optionally add `figures/fshf-logo.png` for the title pages (also guarded).

## Typesetting a fourth paper in the house style

```latex
\documentclass[11pt,a4paper]{article}
\usepackage{fshf-style}
\SetFshfShortTitle{Short Title for the Running Header}

\begin{document}
\makefshftitle{Full Paper Title}%
{Asset class / subtitle line}%
{Author One, Author Two \& Author Three}%
{1 January 2027}%
{Optional small note line, or \relax for none}

\setcounter{tocdepth}{2}
\tableofcontents
\clearpage

\section{First Section}
Body text...
\end{document}
```

House patterns to reuse:

- **Tables** — booktabs only (`\toprule`/`\midrule`/`\bottomrule`, no vertical rules), caption **above** via `\caption{...}` as the first thing in the `table` environment (renders as "Table N: ..."), headers wrapped in `\tabh{...}`, column types `P{width}` (left, wrapped), `Q{width}` (right), `L`/`R` (auto-width via `tabularx`). Source line after the table body: `\fshfsource{Sources: ...}`.
- **Page-spanning tables** — use `longtable` with the same rules (see the allocation table in `fshf-commodities.tex` for the pattern, including repeated headers via `\endhead`).
- **Figures** — `\fshffig{filename.png}{Caption}{Source line or \relax}`.
- **Reference lists** — `\begin{fshfreferences} \item ... \end{fshfreferences}` (hanging indent, titled "References"), or `\begin{fshfreferences*}{Custom Title} ... \end{fshfreferences*}`. No biblatex.
- **Headings** — `\section`/`\subsection`/`\subsubsection`; a fourth level (`\paragraph`) is styled as a numbered display heading for x.y.z.w structures.
- **Special characters** — escape `% & $ # _` in body text; use `\(\sim\)` for ~, `$\times$`, `$\rightarrow$`, `\checkmark`.

The accent color is `fshfaccent` (deep navy) — used for section titles, the header rule, links, and title-page rules. Change it once in the `.sty` to restyle everything.
