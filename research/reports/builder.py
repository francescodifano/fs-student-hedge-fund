#!/usr/bin/env python3
"""FSHF report builder: md -> blocks -> measured pagination -> branded A4 HTML.

Usage:
  builder.py emit-measure   # writes measure.html with all blocks of both docs
  builder.py assemble       # reads measures.json, writes the two final HTML docs
"""
import json, re, sys, html, os

R = os.path.dirname(os.path.abspath(__file__))
ACRONYMS = {'ROIC','AI','HAMR','HDD','HDDS','SSD','SSDS','WDC','DCF','OECD','STX','PMR','EPMR','MAMR',
            'BOM','CSP','CSPS','OEM','OEMS','HPC','TB','GAAP','P&L','ULTRASMR','NAND','EB','CAGR','FCF',
            'WACC','EV','EBITDA','US','USD','EUR','ECB','FED','FOMC','ETF','ETFS','UCITS','VRP','EMH',
            'PCE','CPI','II','NATO','FX','LME','GDP','FY2026'}
SMALL = {'a','an','and','as','at','but','by','for','in','of','on','or','the','to','vs','with','from'}

def smart_title(s):
    words = s.split(' ')
    out = []
    for i, w in enumerate(words):
        core = re.sub(r'[^A-Za-z0-9&+]', '', w)
        if core.upper() in ACRONYMS and len(core) > 1:
            out.append(w.upper() if w.isupper() or w.islower() else w)
            continue
        lw = w.lower()
        if 0 < i < len(words) - 1 and lw.strip('():,') in SMALL:
            out.append(lw)
        else:
            out.append(lw[:1].upper() + lw[1:] if lw else w)
    return ' '.join(out)

SUPMAP = str.maketrans('\u00b9\u00b2\u00b3\u2070\u2074\u2075\u2076\u2077\u2078\u2079', '1230456789')

def inline(t):
    t = re.sub(r'\s*<sup>(\d+)</sup>', r'@@SUP\1@@', t)
    t = re.sub(r'\s*([\u00b9\u00b2\u00b3\u2070\u2074-\u2079]+)', lambda m: '@@SUP' + m.group(1).translate(SUPMAP) + '@@', t)
    t = html.escape(t, quote=False)
    t = re.sub(r'"([^"\n]+)"', '“\\1”', t)
    t = re.sub(r"(\w)'(\w)", '\\1’\\2', t)
    t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)', r'<em>\1</em>', t)
    t = t.replace('@@BR@@', '<br/>')
    t = re.sub(r'@@SUP(\d+)@@', r'<sup>\1</sup>', t)
    return t

def dedash(t):
    # display copy rule: em dashes -> middot separators (verbatim quotes keep theirs)
    return t.replace(' — ', ' · ')

def md_table(lines):
    rows = [[c.strip() for c in ln.strip().strip('|').split('|')] for ln in lines]
    rows = [r for r in rows if not all(re.fullmatch(r':?-{2,}:?', c or '---') for c in r)]
    if not rows: return ''
    # header = first row if a separator existed in raw lines
    had_sep = any(re.match(r'^\s*\|[\s:|-]+\|\s*$', ln) for ln in lines)
    h = ''
    body = rows
    if had_sep and len(rows) > 1 and any(c for c in rows[0]):
        h = '<tr>' + ''.join(f'<th>{inline(c)}</th>' for c in rows[0]) + '</tr>'
        body = rows[1:]
    b = ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body)
    return f'<table>{h}{b}</table>'

FIGMETA = {
 'equity-fig1-brent-2026.png': ('Brent crude during the Middle East conflict (2026)', 'Sources: EIA/FRED (spot); ICE/Investing.com (front-month futures). From the Equities Portfolio Research paper.'),
 'equity-fig3-policy-rates.png': ('Major central bank policy rates (as of 20 June 2026)', 'Source: central bank communications. From the Equities Portfolio Research paper.'),
 'equity-fig8-combined-portfolio.png': ('Recommended combined portfolio: 60% core / 40% satellites', 'From the Equities Portfolio Research paper.'),
 'fi-fig2-core-inflationary-data.png': ('Core PCE inflation, percent change from year ago', 'Source: FRED, series PCEPILFE. From the Fixed Income Portfolio paper.'),
 'fi-fig5-aaa-10y-yield.png': ('Euro area AAA rated 10 year government bond yield', 'Source: ECB Data Portal, AAA yield curve 10 year spot rate, daily data through the reporting date of 30 June 2026. Redrawn by the fund.'),
}

def b64(name, sub='figb64'):
    p = os.path.join(R, sub, name + '.b64') if sub == 'figb64' else os.path.join(R, sub, name)
    return open(p).read()

B64MAP = {'fi-fig5-aaa-10y-yield.png': 'fi-fig5-aaa-10y-30jun.png'}

def fig_block(fname):
    cap, src = FIGMETA[fname]
    uri = b64(B64MAP.get(fname, fname))
    return f'<div class="figure"><div class="frame"><img src="{uri}" /></div><div class="cap">{cap}</div><div class="src">{src}</div></div>'

def group_composites(blocks):
    out, i = [], 0
    while i < len(blocks):
        b = blocks[i]
        if b['t'] == 'tcap' and i + 1 < len(blocks) and blocks[i+1]['t'] == 'table':
            parts = [b['html'], blocks[i+1]['html']]
            j = i + 2
            if j < len(blocks) and blocks[j]['t'] == 'tnote':
                parts.append(blocks[j]['html']); j += 1
            out.append({'t': 'tablegroup', 'html': ''.join(parts)})
            i = j; continue
        if b['t'] == 'table' and i + 1 < len(blocks) and blocks[i+1]['t'] == 'tnote':
            out.append({'t': 'tablegroup', 'html': b['html'] + blocks[i+1]['html']})
            i += 2; continue
        out.append(b); i += 1
    return out

def parse_flow(md, doc):
    """Generic md -> block list. Returns list of {t, html, meta}."""
    blocks = []
    lines = md.split('\n')
    i = 0
    para, ul, tbl = [], [], []
    secnum = [0]
    def flush():
        nonlocal para, ul, tbl
        if para:
            txt = ' '.join(para).strip()
            if txt:
                ptype = 'p'
                cls = 'body'
                if re.match(r'^(\*\*)?Table \d', txt): ptype = 'tcap'
                elif re.match(r'^(\*\*)?Analysis:', txt): ptype = 'tnote'
                elif re.fullmatch(r'\*\*[^*]{3,64}\*\*', txt): ptype = 'h4label'
                elif txt.startswith('***'): ptype, cls = 'callout', 'body callout'
                blocks.append({'t': ptype, 'html': f'<p class="{cls}">{inline(dedash(txt) if doc=="h2" else txt)}</p>'})
            para = []
        if ul:
            items = ''.join(f'<li>{inline(dedash(x) if doc=="h2" else x)}</li>' for x in ul)
            blocks.append({'t': 'ul', 'html': f'<ul class="list">{items}</ul>'})
            ul = []
        if tbl:
            blocks.append({'t': 'table', 'html': md_table(tbl)})
            tbl = []
    while i < len(lines):
        ln = lines[i]
        s = ln.strip()
        if s.startswith('<!--') or s == '---' or s == '':
            if s == '' and (para or ul or tbl):
                flush()
            i += 1; continue
        m = re.match(r'^## (.+)$', s)
        if m:
            flush()
            raw = re.sub(r'\*', '', m.group(1)).strip()
            special = None
            if doc == 'h2':
                lowraw = raw.lower()
                msec = re.match(r'^Section (\d+):\s*(.+)$', raw)
                mapp = re.match(r'^Appendix ([A-Z]):\s*(.+)$', raw)
                if msec:
                    raw = f'{msec.group(1)}. {msec.group(2)}'
                elif mapp:
                    special = f'Appendix {mapp.group(1)}'
                    raw = mapp.group(2)
                elif lowraw.startswith('foreword') or 'letter' in lowraw:
                    special = 'Foreword'
                    raw = re.sub(r'^Foreword:\s*', '', raw)
                elif 'published research' in lowraw: special = 'Appendix'
                elif 'disclaimer' in lowraw: special = 'Notice'
            nm = re.match(r'^(\d+)\.\s*(.+)$', raw)
            if nm:
                num, title = nm.group(1), nm.group(2)
            elif special:
                num, title = None, raw
            else:
                secnum[0] += 1; num, title = str(secnum[0]), raw
            title = re.sub(r':\s*$', '', title)
            def deshout(s):
                letters = [c for c in s if c.isalpha()]
                if letters and sum(1 for c in letters if c.isupper()) > len(letters) * 0.6:
                    return smart_title(s)
                return s
            if ':' in title and doc == 'seagate':
                a, b_ = title.split(':', 1)
                b_ = re.sub(r'^\((.*?)\)\s*', r'\1 ', b_.strip()).strip()
                title = f'{deshout(a.strip())}<span class="bandsub">{deshout(b_)}</span>'
            else:
                title = deshout(title)
            toc_t = re.sub(r'<span class="bandsub">', ': ', title)
            toc_t = re.sub(r'<[^>]+>', '', toc_t).strip()
            eyebrow = special
            blocks.append({'t': 'band', 'num': num, 'title': title, 'toc': toc_t, 'eyebrow': eyebrow, 'html': ''})
            i += 1; continue
        m = re.match(r'^### (.+)$', s)
        if m:
            flush()
            blocks.append({'t': 'h3', 'html': f'<h3>{inline(m.group(1).replace("*", ""))}</h3>'})
            i += 1; continue
        m = re.match(r'^#### (.+)$', s)
        if m:
            flush()
            blocks.append({'t': 'h4', 'html': f'<h4>{inline(m.group(1))}</h4>'})
            i += 1; continue
        m = re.match(r'^\[CHART:\s*([^\]]+)\]$', s)
        if m:
            flush()
            name = m.group(1).strip()
            if doc == 'h2' and name in FIGMETA:
                blocks.append({'t': 'figure', 'html': fig_block(name)})
            i += 1; continue
        if s.startswith('# '):
            i += 1; continue
        if s.startswith('|'):
            if para or ul: flush()
            tbl.append(s); i += 1; continue
        if s.startswith('- '):
            if para or tbl: flush()
            ul.append(s[2:]); i += 1; continue
        mo = re.match(r'^(\d+)\.\s+(\S.*)$', s)
        if mo and doc == 'h2':
            flush()
            blocks.append({'t': 'oli', 'html': f'<div class="oli"><span class="on">{mo.group(1)}</span><div class="ot">{inline(dedash(mo.group(2)))}</div></div>'})
            i += 1; continue
        if tbl: flush()
        para.append(s); i += 1
    flush()
    return group_composites(blocks)

# ---------------- Seagate specific ----------------
def seagate_blocks():
    order = ['seagate-p1-3.md','seagate-p4-6.md','seagate-p7-9.md','seagate-p10-12.md','seagate-p13-15.md']
    full = '\n'.join(open(os.path.join(R, f)).read() for f in order)
    # stitch sentences broken across chunk/page boundaries: a line ending without
    # terminal punctuation, followed by blank line(s) (and optional comments),
    # resuming with a lowercase word or ellipsis
    full = re.sub(r'([a-z0-9,;%$]) *(?:\n+(?:<!--[^\n]*-->[ \n]*)*)+(?:\.\.\.|\u2026)? *(?=[a-z])', r'\1 ', full)
    # editorial fixes (verified against source images)
    full = full.replace('***DRIVERS OF THE 40% MARGIN:***', '**Drivers of the 40% margin:**')
    full = full.replace('value of the HAMR transition\n', 'value of the HAMR transition.\n')
    full = full.replace('**Mitigation:** Seagate has diversified assembly\n', '**Mitigation:** Seagate has diversified assembly.\n')
    # cut cover segment: content before '## 1. INVESTMENT'
    full = full[full.index('## 1. INVESTMENT'):]
    # remove TOC page: between 'PAGE 2' marker and 'PAGE 3' marker
    full = re.sub(r'<!-- =* PAGE 2.*?(?=<!-- =* PAGE 3)', '', full, flags=re.S)
    # split off AUTHORS section (rebuilt) and references tail
    authors_at = full.index('## AUTHORS')
    body_md = full[:authors_at]
    tail = full[authors_at:]
    refs_at = tail.index('## KEY DATA SOURCES')
    authors_md = tail[:refs_at]
    refs_md = tail[refs_at:]
    blocks = parse_flow(body_md, 'seagate')
    # analysts certification text from authors_md
    cert = re.search(r'Certification:\*\s*\n\n(.+?)\n\n', authors_md, re.S)
    cert_txt = cert.group(1).strip() if cert else ''
    # references: band + ref items
    rblocks = [{'t': 'band', 'num': None, 'title': 'Key Data Sources and References', 'html': ''}]
    src_summary = []
    for m in re.finditer(r'\*\*([^*]+):\*\*\s*([¹²³⁴⁵⁶⁷⁸⁹⁰\d\s]+)', refs_md[:refs_md.index('## REFERENCES')]):
        SUPMAP = str.maketrans('\u00b9\u00b2\u00b3\u2070\u2074\u2075\u2076\u2077\u2078\u2079', '1230456789')
        refno = m.group(2).strip().translate(SUPMAP).replace(' ', '')
        src_summary.append(f'<span class="srcpair"><strong>{m.group(1).strip()}</strong> (ref {refno})</span>')
    if src_summary:
        rblocks.append({'t': 'p', 'html': '<p class="body srcline">Primary reference by area: ' + ' &nbsp;·&nbsp; '.join(src_summary) + '</p>'})
    ref_items = re.findall(r'\*\*(\d+\)[^*]+?)\*\*\s*\n(https?://\S+)', refs_md)
    for title, url in ref_items:
        t = html.escape(title.strip().rstrip(','), quote=False)
        rblocks.append({'t': 'ref', 'html': f'<div class="ref"><div class="rt">{t}</div><div class="ru">{html.escape(url)}</div></div>'})
    return blocks, rblocks, cert_txt

AUTHORS = [
 ('p12-headshot-edor-shehu.png', 'Edor Shehu', 'Head of Research'),
 ('p12-headshot-conrad-chen.png', 'Conrad Chen', 'Initiative Head'),
 ('p12-headshot-tarik-asaad.png', 'Tarik Asaad', 'Initiative Co-Head'),
 ('p12-headshot-francesco-di-fano.png', 'Francesco di Fano', 'Analyst'),
 ('p12-headshot-timur-khairullin.png', 'Timur Khairullin', 'Analyst'),
]

def authors_page_html(pgno, cert_txt):
    import base64
    cells = []
    for img, nm, role in AUTHORS:
        raw = base64.b64encode(open(os.path.join(R, 'sgcharts', img), 'rb').read()).decode()
        cells.append(f'<div class="author"><img src="data:image/png;base64,{raw}" /><div class="an">{nm}</div><div class="ar">{role}</div></div>')
    grid = ''.join(cells)
    return f'''<div class="page" data-canvas-width="794" data-canvas-height="1123">
  {chrome_header('seagate')}
  <div class="content">
    <div class="band"><div class="eyebrow">The team</div><h2>Authors</h2></div>
    <div class="authors">{grid}</div>
    <h3 style="margin-top:34px">Analysts certification</h3>
    <p class="body">{inline(cert_txt)}</p>
  </div>
  {chrome_footer('Seagate Technology Holdings PLC', pgno)}
</div>'''

# ---------------- shared chrome ----------------
def chrome_header(doc):
    logon = open(os.path.join(R, 'logo-nav.png.b64')).read()
    label = 'H2 2026 Report' if doc == 'h2' else 'Equity Research · Seagate Technology'
    return f'<div class="hdr"><img src="{logon}" /><div class="doc">{label}</div></div><div class="hdr-rule"></div>'

def chrome_footer(label, pgno):
    return f'<div class="ftr-rule"></div><div class="ftr"><div>{label}</div><div>{pgno}</div></div>'

CSS = open(os.path.join(R, 'design.css')).read() if os.path.exists(os.path.join(R, 'design.css')) else ''

def head(title):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>{title}</title>
<meta name="hz:slide-selector" content=".page" />
<meta name="hz:canvas-width" content="794" />
<meta name="hz:canvas-height" content="1123" />
<link rel="stylesheet" href="https://use.typekit.net/cmo4ffz.css">
<style>
{CSS}
</style>
</head>
<body>
'''

def band_html(b):
    eyebrow = b.get('eyebrow') or (f'Section {b["num"]}' if b.get('num') else 'Appendix')
    return f'<div class="band"><div class="eyebrow">{eyebrow}</div><h2>{b["title"]}</h2></div>'

def h2_blocks():
    h2md = open(os.path.join(R, 'h2-final.md')).read()
    h2md = h2md.replace('**Francesco di Fano and Julius Jagland**\nHeads of FS Student Hedge Fund Department', '**Francesco di Fano and Julius Jagland**@@BR@@Heads of FS Student Hedge Fund Department')
    h2md = h2md.replace('**Jakob Hautkappe**\nSenior Associate', '**Jakob Hautkappe**@@BR@@Senior Associate')
    return parse_flow(h2md, 'h2')

# ---------------- measurement emit ----------------
def emit_measure():
    sgb, sgr, _cert = seagate_blocks()
    h2b = h2_blocks()
    out = [head('measure')]
    out.append('<div style="width:666px; margin:0 auto; background:#fff;">')
    store = {}
    for prefix, blks in (('sg', sgb + sgr), ('h2', h2b)):
        for j, b in enumerate(blks):
            bid = f'{prefix}-{j}'
            inner = band_html(b) if b['t'] == 'band' else b['html']
            out.append(f'<div class="mb" id="{bid}">{inner}</div>')
            store[bid] = b
    out.append('</div></body></html>')
    open(os.path.join(R, 'measure.html'), 'w').write('\n'.join(out))
    json.dump({k: {kk: vv for kk, vv in v.items()} for k, v in store.items()},
              open(os.path.join(R, 'blocks.json'), 'w'))
    print(f'measure.html written: {len(store)} blocks')

# ---------------- pagination ----------------
CONTENT_H = 890
HARD_H = 927

def rebalance(pages, blocks, measures, prefix):
    def bof(bid):
        return blocks[int(bid.split('-')[-1])]
    for k in range(1, len(pages)):
        page = pages[k]
        if not page or bof(page[0])['t'] == 'band':
            continue
        total = sum(measures[b] for b in page)
        prev = pages[k - 1]
        if total < 420 and len(prev) > 1 and bof(prev[-1])['t'] in ('tablegroup', 'table', 'figure'):
            moved = prev.pop()
            if measures[moved] + total <= HARD_H:
                page.insert(0, moved)
            else:
                prev.append(moved)

FORCED = set()
if os.path.exists(os.path.join(R, 'breaks.json')):
    FORCED = set(json.load(open(os.path.join(R, 'breaks.json'))))

def paginate(prefix, blocks, measures, start_page):
    pages, cur, used = [], [], 0
    pgno = start_page
    sec_pages = {}
    def close():
        nonlocal cur, used, pgno
        if cur:
            pages.append(cur); cur = []; used = 0; pgno += 1
    idx = [k for k in blocks]
    for j, b in enumerate(blocks):
        bid = f'{prefix}-{j}'
        h = measures[bid]
        if b['t'] == 'band':
            ey = b.get('eyebrow') or ''
            flow = ey.startswith('Appendix') or ey == 'Notice'
            if flow and cur and used + h + 300 <= CONTENT_H:
                # back-matter bands may share a page with the previous appendix
                sec_pages[(b.get('num'), b.get('toc') or re.sub(r'<[^>]+>', ' ', b['title']).strip())] = start_page + len(pages)
                cur.append(bid); used += h + 30
                continue
            close()
            sec_pages[(b.get('num'), b.get('toc') or re.sub(r'<[^>]+>', ' ', b['title']).strip())] = start_page + len(pages)
            cur.append(bid); used = h
            continue
        if bid in FORCED and cur:
            close()
        # keep-with-next for headings; a bold label keeps its full follower,
        # and a heading followed by an indivisible visual block (table or
        # figure) moves with it rather than sitting orphaned at a page foot
        if b['t'] in ('h3', 'h4', 'h4label'):
            nj = blocks[j + 1] if j + 1 < len(blocks) else None
            nxt = measures.get(f'{prefix}-{j+1}', 0)
            if b['t'] == 'h4label' or (nj and nj['t'] in ('table', 'tablegroup', 'figure')):
                reserve = nxt
            else:
                reserve = min(nxt, 120)
            if used + h + reserve > CONTENT_H:
                close(); cur.append(bid); used = h
                continue
        if used + h > CONTENT_H and cur:
            nxt = blocks[j+1] if j + 1 < len(blocks) else None
            tail = nxt is None or nxt['t'] == 'band'
            if not (tail and used + h <= HARD_H):
                close()
        cur.append(bid); used += h
    close()
    rebalance(pages, blocks, measures, prefix)
    fill_pages(pages, blocks, measures)
    return pages, sec_pages

def fill_pages(pages, blocks, measures):
    """Pull leading blocks of the next page up while they genuinely fit,
    so pages do not end in large whitespace. Bands never move (sections
    keep starting their own page), forced breaks are respected, and a
    heading only moves if its follower fits with it."""
    def bof(bid):
        return blocks[int(bid.split('-')[-1])]
    def pageh(page):
        h = sum(measures[b] for b in page)
        h += 30 * sum(1 for i, b in enumerate(page) if i > 0 and bof(b)['t'] == 'band')
        return h
    moved = True
    while moved:
        moved = False
        for k in range(len(pages) - 1):
            while pages[k + 1]:
                bid = pages[k + 1][0]
                b = bof(bid)
                if b['t'] == 'band' or bid in FORCED:
                    break
                # absorbing the whole next page, or a self-contained visual
                # block (table/figure), may use the hard allowance, mirroring
                # the tail rule: a small overrun beats a large gap
                hard_ok = len(pages[k + 1]) == 1 or b['t'] in ('table', 'tablegroup', 'figure')
                limit = HARD_H if hard_ok else CONTENT_H
                free = limit - pageh(pages[k])
                if measures[bid] > free:
                    break
                if b['t'] in ('h3', 'h4', 'h4label') and len(pages[k + 1]) > 1:
                    nxt = measures[pages[k + 1][1]]
                    reserve = nxt if b['t'] == 'h4label' else min(nxt, 120)
                    if measures[bid] + reserve > free:
                        break
                pages[k].append(pages[k + 1].pop(0))
                moved = True
        pages[:] = [p for p in pages if p]

# ---------------- pagination v2 (fragment-aware; used for the H2 report) ----------------
# Blocks that are internally divisible (tables by row, lists by item, body
# paragraphs by line) may be split across a page boundary so that pages fill
# to the bottom instead of ending early. Headings always keep their follower
# (or its first fragment) on the same page. Sections still start their own
# page, forced breaks are respected, and the Seagate document keeps the
# legacy paginator so its published layout is untouched.
PARTS = json.load(open(os.path.join(R, 'parts.json'))) if os.path.exists(os.path.join(R, 'parts.json')) else {}
MEASURES_ALL = json.load(open(os.path.join(R, 'measures.json'))) if os.path.exists(os.path.join(R, 'measures.json')) else {}
SPLIT_PARAS = os.environ.get('SPLIT_PARAS', '1') == '1'
MIN_LINES, MIN_ROWS, MIN_ITEMS = 2, 2, 2   # smallest fragment on either side of a break
HEAD_LINES = 3                             # a heading keeps at least this many lines of a following paragraph
# bottom margins (design.css) that need no room when the block ends a page
TRAIL = {'p': 12, 'callout': 12, 'h4label': 12, 'table': 14, 'tablegroup': 12, 'ul': 14, 'figure': 16, 'h3': 10, 'h4': 8, 'oli': 0, 'band': 0}
TALL_UNIT = 70                             # a single list item or table row at least this tall (about three lines) may stand alone as a fragment

class Splitter:
    def __init__(self, bid, b, parts):
        self.kind = None
        info = parts.get(bid)
        if not info:
            return
        t = b['t']
        if t in ('table', 'tablegroup') and 'table' in info:
            rows = info['table']['rows']
            self.hdr_h = sum(r['h'] for r in rows if r['hdr'])
            self.units = [r['h'] for r in rows if not r['hdr']]
            self.mt, self.mb = info['table']['mt'], info['table']['mb']
            self.cols = info['table'].get('cols', [])
            ch = info.get('children', [])
            ti = next(i for i, c in enumerate(ch) if c['tag'] == 'table')
            self.note_h = sum(c['h'] + c['mt'] + c['mb'] for c in ch[ti + 1:])
            core = self.mt + self.hdr_h + sum(self.units) + self.mb
            self.cap_h = max(0.0, MEASURES_ALL.get(bid, core + self.note_h) - core - self.note_h)
            self.kind, self.min = 'table', MIN_ROWS
        elif t == 'ul' and 'ul' in info:
            items = info['ul']['items']
            self.units = [it['h'] for it in items]
            self.gap = items[0]['mb'] if items else 0
            self.mt, self.mb = info['ul']['mt'], info['ul']['mb']
            self.kind, self.min = 'ul', MIN_ITEMS
        elif t == 'p' and SPLIT_PARAS and 'p' in info and '&nbsp;' not in b['html'] and '<br' not in b['html']:
            p = info['p']
            wl = p['wordLines']
            n = max(p['nlines'], int(round(p['h'] / p['lh']))) if p['lh'] else 0
            if n >= 2 * MIN_LINES and wl and wl[-1] + 1 == n and tok_words(b['html']) == len(wl):
                self.lh, self.mb = p['lh'], p['mb']
                self.units = [self.lh] * n
                self.starts = [i for i, l in enumerate(wl) if i == 0 or wl[i - 1] != l]
                # a word that wraps mid-word (hyphen break) is never a safe cut point
                self.nocut = {li for li, w in enumerate(self.starts) if w in set(p.get('broken', []))}
                self.kind, self.min = 'p', MIN_LINES
        if self.kind and not self.cuts(0):
            self.kind = None

    @property
    def n(self):
        return len(self.units)

    def ok(self, a, e):
        """A fragment [a, e) is acceptable when it holds at least `min` units,
        or a single list item tall enough to read as a paragraph of its own."""
        if e - a >= self.min:
            return True
        return self.kind in ('ul', 'table') and e - a == 1 and self.units[a] >= TALL_UNIT

    def cuts(self, a):
        """Candidate end indices for a fragment starting at a, largest first."""
        nocut = getattr(self, 'nocut', ())
        return [c for c in range(self.n - 1, a, -1) if c not in nocut and self.ok(a, c) and self.ok(c, self.n)]

    def frag_h(self, a, e):
        s = sum(self.units[a:e])
        if self.kind == 'table':
            return self.mt + self.hdr_h + s + self.mb + (self.cap_h if a == 0 else 0) + (self.note_h if e == self.n else 0)
        if self.kind == 'ul':
            return self.mt + s + self.gap * (e - a - 1) + self.mb
        return s + self.mb

TOK = re.compile(r'(<[^>]+>)|([^\s<]+)|(\s+)')

def tok_words(ph):
    """Word count of a paragraph's inner HTML under TOK; must equal the
    browser's count (measure2.cjs: /\\S+/ per text node) for a split to be safe."""
    m = re.match(r'^(<p[^>]*>)(.*)(</p>)$', ph, re.S)
    return sum(1 for t in TOK.finditer(m.group(2)) if t.group(2)) if m else -1

def slice_p_html(ph, w0, w1):
    """Return the paragraph restricted to words [w0, w1), re-closing and
    re-opening any inline tags that straddle the cut."""
    m = re.match(r'^(<p[^>]*>)(.*)(</p>)$', ph, re.S)
    op, inner, cl = m.groups()
    out, stack, w, inside = [], [], 0, False
    for tm in TOK.finditer(inner):
        tag, word, ws = tm.groups()
        if tag:
            name = re.match(r'</?\s*(\w+)', tag).group(1)
            if tag.startswith('</'):
                if stack and stack[-1][0] == name:
                    stack.pop()
                if inside:
                    out.append(tag)
            elif tag.endswith('/>'):
                if inside:
                    out.append(tag)
            else:
                stack.append((name, tag))
                if inside:
                    out.append(tag)
        elif word:
            if w == w0:
                inside = True
                out.extend(t for _, t in stack)
            if w1 is not None and w == w1:
                inside = False
                out.extend(f'</{name}>' for name, _ in reversed(stack))
                break
            if inside:
                out.append(word)
            w += 1
        else:
            if inside:
                out.append(ws)
    if inside:
        out.extend(f'</{name}>' for name, _ in reversed(stack))
    s = ''.join(out).strip()
    while True:
        s2 = re.sub(r'<(\w+)>\s*</\1>', '', s)
        if s2 == s:
            break
        s = s2
    return op + s + cl

def frag_html(b, s, a, e):
    if a is None:
        return b['html']
    if s.kind == 'table':
        m = re.match(r'^(.*?)(<table[^>]*>)(.*)(</table>)(.*)$', b['html'], re.S)
        pre, topen, inner, tclose, post = m.groups()
        rows = re.findall(r'<tr>.*?</tr>', inner, re.S)
        hdr = [r for r in rows if '<th' in r]
        body = [r for r in rows if '<th' not in r]
        # fragments are separate tables: pin the column widths measured on the
        # whole table so rows wrap exactly as measured and both parts line up
        colgroup = '<colgroup>' + ''.join(f'<col style="width:{w:.1f}px">' for w in s.cols) + '</colgroup>' if s.cols else ''
        topen = f'<table class="split{"" if a == 0 else " cont"}" style="table-layout:fixed">{colgroup}'
        return (pre if a == 0 else '') + topen + ''.join(hdr) + ''.join(body[a:e]) + tclose + (post if e == s.n else '')
    if s.kind == 'ul':
        m = re.match(r'^(<ul[^>]*>)(.*)(</ul>)$', b['html'], re.S)
        items = re.findall(r'<li>.*?</li>', m.group(2), re.S)
        return m.group(1) + ''.join(items[a:e]) + m.group(3)
    w0 = s.starts[a]
    w1 = s.starts[e] if e < s.n else None
    return slice_p_html(b['html'], w0, w1)

def paginate_v2(prefix, blocks, measures, start_page):
    sp = {f'{prefix}-{j}': Splitter(f'{prefix}-{j}', b, PARTS) for j, b in enumerate(blocks)}
    pages, cur, used = [], [], 0
    def close():
        nonlocal cur, used
        if cur:
            pages.append(cur); cur = []; used = 0
    def reserve_after(j):
        if j + 1 >= len(blocks):
            return 0
        nb = f'{prefix}-{j+1}'
        s = sp[nb]
        if blocks[j + 1]['t'] in ('h3', 'h4', 'h4label'):
            return measures[nb] + reserve_after(j + 1)
        if s.kind == 'p':
            return s.frag_h(0, HEAD_LINES) - TRAIL['p'] if HEAD_LINES in s.cuts(0) else measures[nb] - TRAIL['p']
        if s.kind:
            return s.frag_h(0, min(s.cuts(0))) - TRAIL[blocks[j + 1]['t']]
        return measures[nb] - TRAIL.get(blocks[j + 1]['t'], 0)
    for j, b in enumerate(blocks):
        bid = f'{prefix}-{j}'
        h = measures[bid]
        if b['t'] == 'band':
            ey = b.get('eyebrow') or ''
            flow = ey.startswith('Appendix') or ey == 'Notice'
            if flow and cur and used + h + 300 <= CONTENT_H:
                cur.append({'bid': bid, 'a': None, 'e': None}); used += h + 30
                continue
            close()
            cur.append({'bid': bid, 'a': None, 'e': None}); used = h
            continue
        heading = ('h3', 'h4', 'h4label')
        if bid in FORCED and cur and not all(blocks[int(it['bid'].split('-')[-1])]['t'] in heading for it in cur):
            close()
        if b['t'] in heading:
            nb = f'{prefix}-{j+1}'
            if cur and (nb in FORCED or used + h + reserve_after(j) > CONTENT_H):
                close()   # the heading would be stranded: start the page with it
            cur.append({'bid': bid, 'a': None, 'e': None}); used += h
            continue
        s = sp[bid]
        nxt = blocks[j + 1] if j + 1 < len(blocks) else None
        tail = nxt is None or nxt['t'] == 'band'
        visual = b['t'] in ('table', 'tablegroup', 'figure')
        a = 0
        def place(a_, e_, hh):
            nonlocal used
            whole = not s.kind or (a_ == 0 and e_ == s.n)
            cur.append({'bid': bid, 'a': None if whole else a_, 'e': None if whole else e_})
            used += hh
        tr = TRAIL.get(b['t'], 0)
        while True:
            rem = s.frag_h(a, s.n) if s.kind else h
            free = CONTENT_H - used
            if rem - tr <= free:
                place(a, s.n if s.kind else None, rem); break
            # a small overrun beats a large gap: a self-contained visual block, or
            # the last block before a section break, may use the hard allowance
            if cur and (tail or visual) and used + rem - tr <= HARD_H:
                place(a, s.n if s.kind else None, rem); break
            if s.kind:
                cuts = s.cuts(a)
                e = next((c for c in cuts if s.frag_h(a, c) - tr <= free), None)
                if e is not None and s.kind in ('table', 'ul') and free - (s.frag_h(a, e) - tr) > 100:
                    # a table or list cut that would still leave a large gap may
                    # take one more unit under the hard allowance, like a whole
                    # visual block: a small overrun beats a large gap
                    e2 = next((c for c in cuts if c > e and used + s.frag_h(a, c) - tr <= HARD_H), None)
                    if e2 is not None:
                        e = e2
                if e is not None:
                    place(a, e, s.frag_h(a, e)); close(); a = e
                    continue
            if cur:
                close(); continue
            place(a, s.n if s.kind else None, rem); break   # taller than a page on its own
    close()
    return pages, sp

def render_pages(pages, blocks_by_id, doc, footer_label, start_page, splitters=None):
    out = []
    for k, page in enumerate(pages):
        pgno = start_page + k
        inner = []
        for pos, it in enumerate(page):
            bid = it if isinstance(it, str) else it['bid']
            b = blocks_by_id[bid]
            if b['t'] == 'band':
                gap = '<div style="height:30px"></div>' if pos > 0 else ''
                inner.append(gap + band_html(b))
            elif isinstance(it, str) or it['a'] is None:
                inner.append(b['html'])
            else:
                inner.append(frag_html(b, splitters[bid], it['a'], it['e']))
        out.append(f'''<div class="page" data-canvas-width="794" data-canvas-height="1123">
  {chrome_header(doc)}
  <div class="content">
{''.join(inner)}
  </div>
  {chrome_footer(footer_label, pgno)}
</div>''')
    return out

def assemble():
    measures = json.load(open(os.path.join(R, 'measures.json')))
    logow = open(os.path.join(R, 'logo-white.png.b64')).read()

    # ---------- H2 2026 report ----------
    h2b = h2_blocks()
    h2ids = {f'h2-{j}': b for j, b in enumerate(h2b)}
    pages, h2sp = paginate_v2('h2', h2b, measures, 3)
    cover = f'''<div class="page cover" data-canvas-width="794" data-canvas-height="1123">
  <img class="logo" src="{logow}" />
  <div class="rule-top"></div>
  <div class="eyebrow">FS Student Hedge Fund · Research</div>
  <h1>H2 2026 Report</h1>
  <div class="subtitle">Positioning for a late cycle reflation: equities, fixed income and commodities into December 2026, built from the published research of the fund's investment teams.</div>
  <div class="rule-bottom"></div>
  <div class="meta"><strong>Hedge Fund Department</strong><br/>Frankfurt School of Finance and Management<br/>Reporting date: 30 June 2026 · Published: July 2026</div>
</div>'''
    toc_items = []
    for k, page in enumerate(pages):
        for it in page:
            bid = it['bid']
            b = h2ids[bid]
            if b['t'] != 'band':
                continue
            eyebrow = b.get('eyebrow') or ''
            label = b.get('toc') or ''
            num = b.get('num') or ''
            if eyebrow.startswith('Appendix ') :
                label = f'{eyebrow}: {label}'
            toc_items.append(f'<div class="ti"><span class="tn">{num}</span><span class="tt">{label}</span><span class="tp">{3 + k}</span></div>')
    h2toc = f'''<div class="page" data-canvas-width="794" data-canvas-height="1123">
  {chrome_header('h2')}
  <div class="content">
    <div class="band"><div class="eyebrow">Overview</div><h2>Contents</h2></div>
    <div class="toc">{''.join(toc_items)}</div>
  </div>
  {chrome_footer('FS Student Hedge Fund · H2 2026 Report', 2)}
</div>'''
    doc = head('FS Student Hedge Fund · H2 2026 Report') + cover + h2toc + '\n'.join(
        render_pages(pages, h2ids, 'h2', 'FS Student Hedge Fund · H2 2026 Report', 3, h2sp)) + '\n</body></html>'
    open(os.path.join(R, 'fshf-h2-2026-report.html'), 'w').write(doc)
    print(f'H2 report: {2 + len(pages)} pages')
    pagemap = {'h2': [None, None] + [[it['bid'] + ('' if it['a'] is None else f"#{it['a']}:{it['e']}") for it in p] for p in pages]}

    # ---------- Seagate ----------
    sgb, sgr, cert = seagate_blocks()
    body_ids = {f'sg-{j}': b for j, b in enumerate(sgb + sgr)}
    # body pages start at 3 (cover=1, toc=2)
    bpages, sec_pages = paginate('sg', sgb, measures, 3)
    authors_pg = 3 + len(bpages)
    # refs blocks come after authors page
    roffset = len(sgb)
    rblocks = sgr
    rpages, rsec = paginate2_offset('sg', rblocks, roffset, measures, authors_pg + 1)
    cover = f'''<div class="page cover" data-canvas-width="794" data-canvas-height="1123">
  <img class="logo" src="{logow}" />
  <div class="rule-top" style="top:300px"></div>
  <div class="eyebrow" style="top:336px">Equity Research · Technology Hardware, Storage and Peripherals</div>
  <h1 style="top:372px; font-size:44px;">Seagate Technology Holdings PLC</h1>
  <div class="subtitle" style="top:510px">The architecture of areal density and the structural margin reset. Initiating coverage with a twelve month view on the mass capacity storage cycle.</div>
  <div class="rule-bottom" style="top:610px"></div>
  <div class="coverstats">
    <div class="cs"><div class="csl">Recommendation</div><div class="csn">BUY</div></div>
    <div class="cs"><div class="csl">Price target</div><div class="csn">$350.00</div></div>
    <div class="cs"><div class="csl">Current price</div><div class="csn">$278.00</div></div>
    <div class="cs"><div class="csl">Implied upside</div><div class="csn">+25.9%</div></div>
  </div>
  <div class="meta"><strong>Equity Research Team</strong><br/>FS Student Hedge Fund · Frankfurt School of Finance and Management<br/>December 23, 2025 · NASDAQ: STX</div>
</div>'''
    toc_items = []
    for (num, title), pg in sec_pages.items():
        t = re.sub(r'\s+', ' ', title)
        toc_items.append(f'<div class="ti"><span class="tn">{num or ""}</span><span class="tt">{t}</span><span class="tp">{pg}</span></div>')
    toc_items.append(f'<div class="ti"><span class="tn"></span><span class="tt">Authors</span><span class="tp">{authors_pg}</span></div>')
    for (num, title), pg in rsec.items():
        toc_items.append(f'<div class="ti"><span class="tn"></span><span class="tt">{re.sub(chr(60)+".*?"+chr(62), " ", title).strip()}</span><span class="tp">{pg}</span></div>')
    toc = f'''<div class="page" data-canvas-width="794" data-canvas-height="1123">
  {chrome_header('seagate')}
  <div class="content">
    <div class="band"><div class="eyebrow">Overview</div><h2>Contents</h2></div>
    <div class="toc">{''.join(toc_items)}</div>
  </div>
  {chrome_footer('Seagate Technology Holdings PLC', 2)}
</div>'''
    parts = [head('FS Student Hedge Fund · Seagate Technology Holdings PLC'), cover, toc]
    parts += render_pages(bpages, body_ids, 'seagate', 'Seagate Technology Holdings PLC', 3)
    parts.append(authors_page_html(authors_pg, cert))
    parts += render_pages(rpages, {f'sg-{roffset + j}': b for j, b in enumerate(rblocks)}, 'seagate', 'Seagate Technology Holdings PLC', authors_pg + 1)
    doc = '\n'.join(parts) + '\n</body></html>'
    open(os.path.join(R, 'fshf-seagate-report.html'), 'w').write(doc)
    print(f'Seagate: {2 + len(bpages) + 1 + len(rpages)} pages (body {len(bpages)}, refs {len(rpages)})')
    pagemap['sg'] = [None, None] + [list(p) for p in bpages] + [None] + [list(p) for p in rpages]
    json.dump(pagemap, open(os.path.join(R, 'pagemap.json'), 'w'))

def paginate2_offset(prefix, blocks, offset, measures, start_page):
    pages, cur, used = [], [], 0
    sec_pages = {}
    def close():
        nonlocal cur, used
        if cur: pages.append(cur); cur = []; used = 0
    for j, b in enumerate(blocks):
        bid = f'{prefix}-{offset + j}'
        h = measures[bid]
        if bid in FORCED and cur:
            close()
        if b['t'] == 'band':
            close()
            sec_pages[(b.get('num'), b.get('toc') or re.sub(r'<[^>]+>', ' ', b['title']).strip())] = start_page + len(pages)
            cur.append(bid); used = h; continue
        if used + h > CONTENT_H and cur:
            nxt = blocks[j+1] if j + 1 < len(blocks) else None
            tail = nxt is None or nxt['t'] == 'band'
            if not (tail and used + h <= HARD_H):
                close()
        cur.append(bid); used += h
    close()
    return pages, sec_pages

if __name__ == '__main__':
    if sys.argv[1] == 'emit-measure':
        emit_measure()
    else:
        assemble()
