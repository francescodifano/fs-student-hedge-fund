#!/usr/bin/env python3
"""Pagination audit for the H2 report: per-page fill, orphaned headings,
mid-section gaps, fragment placements, and text integrity against a reference
HTML. Usage: verify.py [pagemap.json] [reference.html]"""
import json, re, sys, os, difflib
sys.argv, argv = sys.argv[:1], sys.argv[1:]
import builder as B

R = os.path.dirname(os.path.abspath(__file__))
pm_path = argv[0] if argv else os.path.join(R, 'pagemap.json')
ref_html = argv[1] if len(argv) > 1 else None
pm = json.load(open(pm_path))['h2']
ms = json.load(open(os.path.join(R, 'measures.json')))
bl = json.load(open(os.path.join(R, 'blocks.json')))
sp = {k: B.Splitter(k, b, B.PARTS) for k, b in bl.items() if k.startswith('h2-')}

def parse(it):
    m = re.match(r'^(h2-\d+)(?:#(\d+):(\d+))?$', it)
    return m.group(1), (int(m.group(2)) if m.group(2) else None), (int(m.group(3)) if m.group(3) else None)

def item_h(it):
    bid, a, e = parse(it)
    return ms[bid] if a is None else sp[bid].frag_h(a, e)

def snip(b):
    t = re.sub(r'<[^>]+>', ' ', b.get('html') or b.get('title', ''))
    return re.sub(r'\s+', ' ', t).strip()[:60]

issues = []
print(f'{"pg":>3} {"used":>5} {"free":>5}  n  last        next        flags')
for i, page in enumerate(pm):
    if not page:
        continue
    pg = i + 1
    ids = [parse(it) for it in page]
    tot = sum(item_h(it) for it in page) + 30 * sum(1 for k, (bid, _, _) in enumerate(ids) if k > 0 and bl[bid]['t'] == 'band')
    tot -= B.TRAIL.get(bl[ids[-1][0]]['t'], 0)   # the last block's bottom margin needs no room
    free = B.CONTENT_H - tot
    lb, la, le = ids[-1]
    last = bl[lb]
    nxt_page = pm[i + 1] if i + 1 < len(pm) else None
    nb = parse(nxt_page[0])[0] if nxt_page else None
    nxt = bl[nb] if nb else None
    flags = []
    if last['t'] in ('h3', 'h4', 'h4label'):
        flags.append('ORPHAN-HEADING')
    if len(ids) >= 2 and bl[ids[-2][0]]['t'] in ('h3', 'h4', 'h4label') and last['t'] == 'p' and item_h(page[-1]) <= 60 and nxt and nxt['t'] != 'band':
        flags.append('HEADING+1P-AT-FOOT')
    if free > 150 and nxt and nxt['t'] != 'band' and nb not in B.FORCED:
        flags.append(f'GAP{int(free)}')
    if free < 0:
        flags.append(f'OVER{int(-free)}')
    frags = [it for it in page if '#' in it]
    if frags:
        flags.append('frag:' + ','.join(f'{it}/{sp[parse(it)[0]].n}' for it in frags))
    mark = ' '.join(flags)
    print(f'p{pg:2d} {int(tot):5d} {int(free):5d} {len(page):2d}  {last["t"]:10s}  {(nxt["t"] if nxt else "-"):10s}  {mark}')
    if any(f.startswith(('ORPHAN', 'HEADING', 'GAP', 'OVER')) for f in flags):
        issues.append((pg, mark))
        for it in page[-3:]:
            bid = parse(it)[0]
            print(f'        {it:12s} {bl[bid]["t"]:10s} {int(item_h(it)):4d}  {snip(bl[bid])}')
        if nxt:
            print(f'     -> {nxt_page[0]:12s} {nxt["t"]:10s} {int(item_h(nxt_page[0])):4d}  {snip(nxt)}')
pages = sum(1 for p in pm if p) + 2
print(f'\n{pages} pages total; {len(issues)} flagged pages: {issues}')

if ref_html:
    from html.parser import HTMLParser
    INLINE = ('strong', 'em', 'sup', 'b', 'i')
    class Styled(HTMLParser):
        """Emit every word tagged with the inline formatting it sits in, so a
        split that loses or leaks <strong>/<em> across a page break shows up."""
        def __init__(self):
            super().__init__(); self.stack = []; self.out = []
        def handle_starttag(self, tag, attrs):
            if tag in INLINE: self.stack.append(tag)
        def handle_endtag(self, tag):
            if tag in INLINE and tag in self.stack:
                del self.stack[len(self.stack) - 1 - self.stack[::-1].index(tag)]
        def handle_data(self, data):
            fmt = '+'.join(sorted(set(self.stack)))
            self.out.extend(f'{w}|{fmt}' if fmt else w for w in data.split())
    def words(path):
        h = open(path).read()
        h = h[h.index('<body>'):]
        # keep only content areas of body pages; drop repeated headers of continued tables
        h = re.sub(r'<table class="split cont"[^>]*>(<colgroup>.*?</colgroup>)?<tr><th.*?</tr>', '<table>', h, flags=re.S)
        h = re.sub(r'<colgroup>.*?</colgroup>', '', h, flags=re.S)
        conts = re.findall(r'<div class="content">(.*?)</div>\s*<div class="ftr-rule">', h, re.S)
        p = Styled(); p.feed(' '.join(conts)); return p.out
    a, b = words(ref_html), words(os.path.join(R, 'fshf-h2-2026-report.html'))
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    diffs = [op for op in sm.get_opcodes() if op[0] != 'equal']
    print(f'text integrity vs {os.path.basename(ref_html)}: {len(a)} vs {len(b)} words, {len(diffs)} differing spans')
    for tag, i1, i2, j1, j2 in diffs[:10]:
        print('  ', tag, ' '.join(a[i1:i2])[:100], '|', ' '.join(b[j1:j2])[:100])
