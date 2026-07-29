#!/usr/bin/env python3
"""Transform Jakob's H2-2026-Report-publish.md into the builder input h2-final.md.

- Drops the title block and the context-only "How to read this report" section
  (per Jakob's email: first section is context, not for publication).
- Inserts [CHART: ...] markers for the five house figures.
- Adds the marker-convention note to Appendix C (preserves the essential
  reader-facing conventions from the dropped section).
- Leaves Section 3.1 weights and the Disclaimer for later targeted edits.
"""
import re, os

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'H2-2026-Report-publish.md')
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reports', 'h2-final.md')

md = open(SRC).read()

# 1. start at the Foreword (drops title block + "How to read this report")
md = md[md.index('## Foreword'):]

# 2. chart markers, anchored on unique lines
inserts = [
    # after the 2.1 Brent price-path table's last row
    ('| 22 to 23 June | approximately $77 to $78 | Lowest in about three months |',
     '\n[CHART: equity-fig1-brent-2026.png]'),
    # end of the 2.2 US paragraph
    ('bottomed near 2.6% in early 2025, and has risen since.',
     '\n\n[CHART: fi-fig2-core-inflationary-data.png]'),
    # after the 2.3 central-bank bullets (BoE/BoJ line is last)
    ('its highest policy rate since 1995.',
     '\n\n[CHART: equity-fig3-policy-rates.png]'),
    # after the 2.4 yields paragraph mentioning the ECB AAA 10y figure
    ('well below crisis levels.',
     '\n\n[CHART: fi-fig5-aaa-10y-yield.png]'),
    # end of 4.2 satellites narrative
    ('The team flags the mismatch rather than ignoring it.',
     '\n\n[CHART: equity-fig8-combined-portfolio.png]'),
]
for anchor, marker in inserts:
    assert md.count(anchor) == 1, f'anchor not unique: {anchor[:50]}'
    md = md.replace(anchor, anchor + marker)

# 3. preserve the essential conventions from the dropped section in Appendix C
conv = (
    '- **Marker convention:** unmarked text is drawn from one of the fund\'s five '
    'research papers and can be traced back to them. Passages marked *Fund view* are '
    'consolidations or judgements of the Hedge Fund Department rather than statements '
    'taken one to one from a paper.\n'
    '- **Naming convention:** the report is named for the period it positions for. '
    'The next edition, positioning for January to June 2027, will be the H1 2027 Report, '
    'with a reporting date of 31 December 2026.\n'
)
anchor = '- **Fixed income:** product durations are stated as approximations in the source tables and the sleeve figures are derived from them.'
assert md.count(anchor) == 1
md = md.replace(anchor, anchor + '\n' + conv.rstrip())

open(DST, 'w').write(md)
print(f'wrote {DST}: {len(md.splitlines())} lines, {len(md.split())} words')
