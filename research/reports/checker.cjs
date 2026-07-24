const puppeteer = require('/home/francesco_di_fano/wwjs/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const out = {};
  for (const [doc, file] of [['h2','fshf-h2-2026-report.html'],['sg','fshf-seagate-report.html']]) {
    const p = await b.newPage();
    await p.goto(`file:///home/francesco_di_fano/fs-student-hedge-fund/research/reports/${file}`, {waitUntil: 'networkidle0', timeout: 90000});
    await p.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 800));
    out[doc] = await p.evaluate(() => Array.from(document.querySelectorAll('.page')).map(pg => {
      const c = pg.querySelector('.content');
      return c ? Math.max(0, c.scrollHeight - c.clientHeight) : 0;
    }));
    await p.close();
  }
  require('fs').writeFileSync('/home/francesco_di_fano/fs-student-hedge-fund/research/reports/overflow.json', JSON.stringify(out));
  console.log(JSON.stringify(out));
  await b.close();
})();
