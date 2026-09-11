const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const pageUrl = file => process.env.EXIT_TEST_ORIGIN
  ? new URL(file, process.env.EXIT_TEST_ORIGIN + '/').href
  : 'file:///' + path.join(root, file).replaceAll('\\', '/');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const file of ['index.html', 'elementary.html', 'secondary.html']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.clock.install();
      await page.goto(pageUrl(file));
      const exit = () => page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', {clientY: 0, relatedTarget: null})));
      await exit();
      assert.equal(await page.locator('#exitOfferDialog').evaluate(el => el.open), false, 'no immediate popup');
      await page.clock.fastForward(9000);
      await page.locator('.menu a').first().focus();
      await exit();
      assert.ok(await page.locator('#exitOfferDialog').evaluate(el => el.open));
      assert.ok((await page.locator('#exitOfferTitle').textContent()).length > 5);
      if (file === 'index.html') await page.screenshot({ path: path.join(root, 'docs/previews/exit-offer-desktop.png') });
      await page.locator('[data-exit-consult]').click();
      await page.clock.runFor(100);
      assert.ok(page.url().endsWith('#apply'));
      assert.ok(await page.locator('[name="student"]').evaluate(el => el === document.activeElement), 'consultation keeps focus');
      assert.equal(await page.locator('#exitOfferDialog').evaluate(el => el.open), false);
      await exit();
      assert.equal(await page.locator('#exitOfferDialog').evaluate(el => el.open), false, 'once per page visit');
      await page.close();
    }
    console.log('PASS: all three pages, dwell guard, consultation navigation, once-only offer');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.clock.install();
    await page.goto(pageUrl('index.html'));
    const historyLength = await page.evaluate(() => history.length);
    await page.clock.fastForward(9000);
    await page.evaluate(() => { window.scrollTo({ top: 1200, behavior: 'instant' }); });
    await page.clock.runFor(100);
    await page.evaluate(() => { window.scrollTo({ top: 700, behavior: 'instant' }); });
    await page.clock.runFor(100);
    assert.ok(await page.locator('#exitOfferDialog').evaluate(el => el.open));
    assert.equal(await page.evaluate(() => history.length), historyLength);
    await page.screenshot({ path: path.join(root, 'docs/previews/exit-offer-mobile.png') });
    await page.locator('[data-exit-close]').first().click();
    assert.equal(await page.locator('#exitOfferDialog').evaluate(el => el.open), false);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log('PASS: mobile return-scroll offer, dismiss, no history guard, no overflow');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
