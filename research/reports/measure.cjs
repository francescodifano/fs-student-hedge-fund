const puppeteer = require('/home/francesco_di_fano/wwjs/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width: 900, height: 1200});
  await p.goto('file:///home/francesco_di_fano/fs-student-hedge-fund/research/reports/measure.html', {waitUntil: 'networkidle0', timeout: 60000});
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));
  const out = await p.evaluate(() => {
    const res = {};
    for (const el of document.querySelectorAll('.mb')) {
      const child = el.firstElementChild;
      if (!child) { res[el.id] = 0; continue; }
      const cs = getComputedStyle(child);
      res[el.id] = el.offsetHeight;
    }
    return res;
  });
  require('fs').writeFileSync('/home/francesco_di_fano/fs-student-hedge-fund/research/reports/measures.json', JSON.stringify(out));
  console.log('measured', Object.keys(out).length, 'blocks');
  await b.close();
})();
