// Edge check for 학원 소식, 블로그 and the main-page event strip.
//   PLAYWRIGHT_MODULE=<path> node tests/browser-news-check.cjs [baseUrl]
// Without a baseUrl it serves the working folder on a random port (no /api/blog locally,
// so the blog page shows the built list).
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('./curriculum-server.cjs');
const out = path.resolve(__dirname, '..', 'output', 'playwright', 'news');
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
      await page.clock.setFixedTime(new Date('2026-11-26T12:00:00+09:00'));

      await page.goto(base + '/');
      const strip = page.locator('[data-news-strip] .news-item');
      check(`${label} main strip shows the briefing`, await strip.count() === 1 && await strip.isVisible());
      check(`${label} main strip D-day`, (await strip.locator('[data-dday]').textContent()) === 'D-20');
      check(`${label} main no overflow`, await overflow(page) <= 0);
      await page.screenshot({ path: path.join(out, `main-${label}.png`) });
      await strip.click();
      await page.waitForURL(/\/news\/2026-12-16-pre-middle1-briefing\/$/);
      const poster = await page.locator('img.poster').evaluate(i => i.complete && i.naturalWidth);
      check(`${label} detail opens from strip, poster loads`, poster === 800);
      check(`${label} detail booking link`, await page.locator('[data-apply] a.primary').getAttribute('href') === 'https://booking.kakao.com/short/PQCG-dZ-e-');
      check(`${label} detail no overflow`, await overflow(page) <= 0);
      await page.screenshot({ path: path.join(out, `detail-${label}.png`), fullPage: true });

      await page.goto(base + '/news/');
      check(`${label} news list upcoming card`, await page.locator('[data-upcoming] .ncard').count() === 1 && await page.locator('[data-past-wrap]').isHidden());
      check(`${label} news no overflow`, await overflow(page) <= 0);
      await page.screenshot({ path: path.join(out, `news-${label}.png`), fullPage: true });

      await page.goto(base + '/blog/');
      const all = await page.locator('.pcard:visible').count();
      await page.getByRole('button', { name: '농어촌 전형' }).click();
      const rural = await page.locator('.pcard:visible').count();
      const ruralOnly = await page.locator('.pcard:visible').evaluateAll(els => els.every(e => e.dataset.cat === '농어촌 전형'));
      check(`${label} blog filter`, all >= 10 && rural > 0 && rural < all && ruralOnly, `${all} → ${rural}, only=${ruralOnly}`);
      await page.getByRole('button', { name: '전체' }).click();
      check(`${label} blog filter reset`, await page.locator('.pcard:visible').count() === all);
      await page.waitForTimeout(800);
      const thumbs = await page.locator('.pcard img').evaluateAll(imgs => imgs.slice(0, 3).map(i => i.complete && i.naturalWidth > 0));
      check(`${label} blog thumbnails load`, thumbs.every(Boolean), JSON.stringify(thumbs));
      check(`${label} blog no overflow`, await overflow(page) <= 0);
      await page.screenshot({ path: path.join(out, `blog-${label}.png`) });

      await page.goto(base + '/middle/');
      check(`${label} middle news list`, await page.locator('#news .posts li').count() === 3);
      await page.locator('#news').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.locator('#news').screenshot({ path: path.join(out, `middle-news-${label}.png`) });

      // After the event ends the listings change without a rebuild.
      await page.clock.setFixedTime(new Date('2026-12-16T12:00:00+09:00'));
      await page.goto(base + '/');
      check(`${label} ended: main strip removed`, await page.locator('[data-news-strip]').count() === 0);
      await page.goto(base + '/news/');
      check(`${label} ended: moved to 지난 소식`, await page.locator('[data-past] .ncard').count() === 1 && await page.locator('[data-empty]').isVisible());
      await page.goto(base + '/news/2026-12-16-pre-middle1-briefing/');
      check(`${label} ended: detail hides booking`, await page.locator('[data-ended]').isVisible() && await page.locator('[data-apply]').isHidden());
      await page.goto(base + '/middle/');
      check(`${label} ended: middle drops event`, await page.locator('#news .posts li').count() === 2);
      check(`${label} no script errors`, errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
  } finally {
    await browser.close();
    if (server) server.close();
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
  }
  const failed = results.filter(r => !r.ok).length;
  console.log(`${results.length - failed}/${results.length} PASS`);
  process.exit(failed ? 1 : 0);
})();
