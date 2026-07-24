# Figure Manifest

The `.tex` files reference figures by these exact filenames. Export each chart from the source documents (unchanged, per the brief — graphs stay as they are) and drop it into a `figures/` folder next to the `.tex` files. Until an image is present, the document compiles anyway and shows a labelled placeholder box in its spot. PNG shown below; PDF/JPG also work if you keep the basename and adjust the extension in the `.tex`.

Also optional: `figures/fshf-logo.png` — the fund logo for the title page of every paper (guarded; absent = blank space).

## Commodities paper (fshf-commodities.tex)
No figures. The paper is text and tables only; nothing to export.

## Fixed Income paper (fshf-fixed-income.tex) — 5 figures
| Filename | Caption in paper | Original location |
|---|---|---|
| fi-fig1-annual-inflation-rates.png | Annual inflation rates | p. 5, Figure 1 (ECB Data Portal) |
| fi-fig2-core-inflationary-data.png | Core inflationary data | p. 6, Figure 2 (FRED g=1WWjC) — **must be re-exported/relabelled as core-PCE y/y to match the corrected prose (comment flag 2)** |
| fi-fig3-core-labor-market-data.png | Core labor market data | p. 6, Figure 3 (FRED g=1WWDy) |
| fi-fig4-fomc-dot-plot.png | "Dot Plot" of FOMC members — SEP, June 17, 2026 | p. 7, Figure 4 |
| fi-fig5-aaa-10y-yield.png | Euro area AAA-rated 10-year government bond yield | p. 8, Figure 5 (ECB Data Portal) |

## Equity paper (fshf-equity.tex) — 10 figures
| Filename | Caption in paper | Original location |
|---|---|---|
| equity-fig1-brent-2026.png | Brent crude during the Middle East conflict (2026) | p. 4, Figure 1 |
| equity-fig2-inflation-above-target.png | Inflation above target across major economies (2026) | p. 4, Figure 2 |
| equity-fig3-policy-rates.png | Major central bank policy rates (as of 20 June 2026) | p. 5, Figure 3 |
| equity-fig4-fed-funds-upper.png | US federal funds target, upper bound (2024–2026) | p. 5, Figure 4 |
| equity-fig5-treasury-curve.png | US Treasury yield curve (mid-June 2026) | p. 6, Figure 5 |
| equity-fig6-european-fund-flows.png | European fund flows: rotation into passive equity (2026) | p. 10, Figure 6 |
| equity-fig7-source-european-sleeve.png | Source European sleeve allocation (regional note) | p. 11, Figure 7 |
| equity-fig8-combined-portfolio.png | Recommended combined portfolio — 60% core / 40% satellites | p. 14, Figure 8 |
| equity-figA-us-forward-pe.png | US sector forward P/E vs the market multiple | p. 8, Figure A |
| equity-figB-us-active-tilts.png | US sector active tilts — overweights vs underweights | p. 9, Figure B |

Note on numbering: in the typeset versions, figures are numbered sequentially by LaTeX (the original "Figure A"/"Figure B" become part of the single sequence). The captions preserve the original titles, so cross-referencing against the source documents stays easy.
