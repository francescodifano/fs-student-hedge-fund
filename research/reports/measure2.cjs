// Measurement pass v2: block heights (measures.json, same format as before) plus
// the internal structure the paginator needs to split blocks across pages
// (parts.json): table rows, list items and paragraph line starts.
const fs = require('fs');
const puppeteer = require('/home/francesco_di_fano/wwjs/node_modules/puppeteer');
const R = '/home/francesco_di_fano/fs-student-hedge-fund/research/reports';
// optional: node measure2.cjs <input.html> <measures.json> <parts.json> (paths relative to R)
const IN = process.argv[2] || 'measure.html', OUT_M = process.argv[3] || 'measures.json', OUT_P = process.argv[4] || 'parts.json';
(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width: 900, height: 1200});
  await p.goto(`file://${R}/${IN}`, {waitUntil: 'networkidle0', timeout: 60000});
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));
  const out = await p.evaluate(() => {
    const measures = {}, parts = {};
    const px = v => parseFloat(v) || 0;
    // line index of every whitespace-separated word, in DOM order, via Range rects
    function wordLines(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const tops = [], broken = [];
      let node;
      while ((node = walker.nextNode())) {
        const txt = node.nodeValue;
        const re = /\S+/g;
        let m;
        while ((m = re.exec(txt))) {
          const r = document.createRange();
          r.setStart(node, m.index);
          r.setEnd(node, m.index + m[0].length);
          // a word that wraps mid-word spans two lines: credit it to the LAST
          // line, so a cut before it moves the whole word down (safe direction)
          const rects = r.getClientRects();
          const rect = rects.length ? rects[rects.length - 1] : r.getBoundingClientRect();
          if (rects.length > 1 && rects[rects.length - 1].top > rects[0].top + 3) broken.push(tops.length);
          tops.push(rect.top);
        }
      }
      const lines = [];
      let li = -1, cur = -1e9;
      for (const t of tops) {
        if (t > cur + 3) { li++; cur = t; }
        lines.push(li);
      }
      return {lines, broken};
    }
    for (const el of document.querySelectorAll('.mb')) {
      measures[el.id] = el.offsetHeight;
      const child = el.firstElementChild;
      if (!child) continue;
      const info = {};
      const table = el.querySelector('table');
      if (table) {
        const cs = getComputedStyle(table);
        info.table = {
          h: table.offsetHeight, mt: px(cs.marginTop), mb: px(cs.marginBottom),
          rows: Array.from(table.querySelectorAll('tr')).map(tr => ({hdr: !!tr.querySelector('th'), h: tr.getBoundingClientRect().height})),
          cols: table.rows.length ? Array.from(table.rows[0].cells).map(c => c.getBoundingClientRect().width) : [],
        };
        info.children = Array.from(el.children).map(c => ({
          tag: c.tagName.toLowerCase(), cls: c.className, h: c.offsetHeight,
          mt: px(getComputedStyle(c).marginTop), mb: px(getComputedStyle(c).marginBottom),
        }));
      }
      const ul = el.querySelector('ul.list');
      if (ul) {
        const cs = getComputedStyle(ul);
        info.ul = {
          h: ul.offsetHeight, mt: px(cs.marginTop), mb: px(cs.marginBottom),
          items: Array.from(ul.children).map(li => ({h: li.getBoundingClientRect().height, mb: px(getComputedStyle(li).marginBottom)})),
        };
      }
      if (child.tagName === 'P' && child.classList.contains('body') && !child.classList.contains('callout') && el.children.length === 1) {
        const cs = getComputedStyle(child);
        const {lines, broken} = wordLines(child);
        info.p = {
          h: child.offsetHeight, mb: px(cs.marginBottom), lh: px(cs.lineHeight),
          nlines: lines.length ? lines[lines.length - 1] + 1 : 0, wordLines: lines, broken,
        };
      }
      if (Object.keys(info).length) parts[el.id] = info;
    }
    return {measures, parts};
  });
  fs.writeFileSync(`${R}/${OUT_M}`, JSON.stringify(out.measures));
  fs.writeFileSync(`${R}/${OUT_P}`, JSON.stringify(out.parts));
  console.log('measured', Object.keys(out.measures).length, 'blocks;', Object.keys(out.parts).length, 'with parts');
  await b.close();
})();
