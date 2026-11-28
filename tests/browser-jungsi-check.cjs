// Edge check for the 2027 정시 explorer at /jungsi/ and the links to it.
//   PLAYWRIGHT_MODULE=<path> node tests/browser-jungsi-check.cjs [baseUrl]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('./curriculum-server.cjs');
const out = path.resolve(__dirname, '..', 'output', 'playwright', 'jungsi');
fs.mkdirSync(out, { recursive: true });

(async () => {
  let server, base = process.argv[2];
  if (!base) { server = createServer().listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}`; }
  const browser = await chromium.launch({ channel: 'msedge' });
  const results = [];
  const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); };
  const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  try {
    for (const [label, viewport] of [['390', { width: 390, height: 844 }], ['1280', { width: 1280, height: 900 }]]) {
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/jungsi/');
      await page.waitForLoadState('networkidle');
      check(`${label} explorer renders`, (await page.locator('#main').innerText()).trim().length > 200);
      check(`${label} tabs built`, await page.locator('#tabs a').count() >= 3, `${await page.locator('#tabs a').count()} tabs`);
      check(`${label} source footer filled`, (await page.locator('#srcBand').innerText()).includes('한국대학교육협의회'));
      check(`${label} usage note visible`, await page.locator('.usage-note').isVisible());
      check(`${label} no horizontal overflow`, await overflow(page) <= 0, `${await overflow(page)}px`);
      await page.screenshot({ path: path.join(out, `jungsi-${label}.png`) });
      const before = await page.locator('#main').innerText();
      await page.locator('#tabs a').nth(1).click();
      await page.waitForTimeout(300);
      check(`${label} tab switch changes view`, (await page.locator('#main').innerText()) !== before, await page.evaluate(() => location.hash));
      check(`${label} overflow after tab switch`, await overflow(page) <= 0, `${await overflow(page)}px`);
      await page.locator('#fKw').fill('서울대');
      await page.waitForTimeout(400);
      check(`${label} search works`, (await page.locator('#main').innerText()).includes('서울대'));
      await page.screenshot({ path: path.join(out, `jungsi-${label}-search.png`), fullPage: false });
      const hash = await page.evaluate(() => location.hash);
      await page.keyboard.press('Tab');
      await page.locator('.skip-link').focus();
      await page.keyboard.press('Enter');
      check(`${label} skip link keeps route`, await page.evaluate(() => location.hash) === hash);
      await page.locator('.academy-links a', { hasText: '홈으로' }).click();
      await page.waitForLoadState();
      check(`${label} home link`, new URL(page.url()).pathname.replace(/index\.html$/, '') === '/');
      for (const [from, sel] of [['/', '.explorer-nav a[href="./jungsi/"]'], ['/middle/', 'a[href="../jungsi/"] >> visible=true']]) {
        await page.goto(base + from);
        const link = page.locator(sel).first();
        if (await link.isVisible()) { await link.click(); await page.waitForLoadState(); }
        else await page.goto(new URL(await link.getAttribute('href'), base + from).href);
        check(`${label} link from ${from}`, new URL(page.url()).pathname === '/jungsi/');
      }
      check(`${label} script errors`, errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
  const failed = results.filter(r => !r.ok).length;
  console.log(`${results.length - failed}/${results.length} PASS`);
  process.exit(failed ? 1 : 0);
})();
