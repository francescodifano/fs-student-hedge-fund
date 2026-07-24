const puppeteer = require('/home/francesco_di_fano/wwjs/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width: 1440, height: 900});
  await p.goto('http://127.0.0.1:8123/research', {waitUntil: 'networkidle0'});
  await p.evaluate(() => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); window.scrollTo(0, document.body.scrollHeight); });
  await new Promise(r => setTimeout(r, 2500));
  await p.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({path: '/tmp/claude-1001/-home-francesco-di-fano/aa67a4fc-7216-41ec-9b4d-31a8268d98a8/scratchpad/final-research.png', fullPage: true});
  console.log('shot');
  await b.close();
})();
