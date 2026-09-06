#!/usr/bin/env python3
"""Render every fragment the H2 paginator emits in isolation (same CSS, fonts
and 666px measure as measure.html) and compare the real height with the
height the paginator budgeted (Splitter.frag_h). Also re-measures the whole
blocks as a control. Exit 1 if any fragment is taller than budgeted by more
than TOL px."""
import json, os, subprocess, sys
sys.argv = sys.argv[:1]
import builder as B

R = B.R
TOL = 1.5
measures = json.load(open(os.path.join(R, 'measures.json')))
blocks = B.h2_blocks()
pages, sp = B.paginate_v2('h2', blocks, measures, 3)
out = [B.head('frags', B.H2_CSS), '<div style="width:666px; margin:0 auto; background:#fff;">']
expect = {}
for page in pages:
    for it in page:
        if it['a'] is None:
            continue
        b = blocks[int(it['bid'].split('-')[-1])]
        fid = f"{it['bid']}#{it['a']}:{it['e']}"
        out.append(f'<div class="mb" id="{fid}">{B.frag_html(b, sp[it["bid"]], it["a"], it["e"])}</div>')
        expect[fid] = sp[it['bid']].frag_h(it['a'], it['e'])
out.append('</div></body></html>')
open(os.path.join(R, 'frags.html'), 'w').write('\n'.join(out))
subprocess.run(['node', os.path.join(R, 'measure2.cjs'), 'frags.html', 'frags-measures.json', 'frags-parts.json'], check=True, cwd=R)
real = json.load(open(os.path.join(R, 'frags-measures.json')))
worst = 0.0
bad = []
for fid, exp in expect.items():
    d = real[fid] - exp
    worst = max(worst, d)
    flag = ' <-- TALLER THAN BUDGET' if d > TOL else ''
    print(f'{fid:16s} budget {exp:7.1f}  real {real[fid]:5d}  diff {d:+6.1f}{flag}')
    if d > TOL:
        bad.append(fid)
print(f'\n{len(expect)} fragments; worst over-budget {worst:+.1f}px; {len(bad)} over tolerance')
sys.exit(1 if bad else 0)
