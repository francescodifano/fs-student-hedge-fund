// Export a built report HTML to PDF, one A4 page per .page div (794x1123 px).
// Usage: node export-pdf.cjs fshf-h2-2026-report.html [out.pdf]
const path = require('path');
const puppeteer = require('/home/francesco_di_fano/wwjs/node_modules/puppeteer');
const R = '/home/francesco_di_fano/fs-student-hedge-fund/research/reports';
const src = process.argv[2] || 'fshf-h2-2026-report.html';
const dst = process.argv[3] || src.replace(/\.html$/, '.pdf');
(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.goto(`file://${path.join(R, src)}`, {waitUntil: 'networkidle0', timeout: 120000});
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));
  const pages = await p.evaluate(() => document.querySelectorAll('.page').length);
  await p.pdf({path: path.join(R, dst), width: '794px', height: '1123px', printBackground: true,
               margin: {top: 0, bottom: 0, left: 0, right: 0}});
  console.log(`exported ${dst}: ${pages} .page divs`);
  await b.close();
})();
