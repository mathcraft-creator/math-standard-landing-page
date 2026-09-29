// Optional browser QA. No real consultation message or external navigation is sent.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.QA_OUTPUT_DIR || '.seo/reports/site-split-browser');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml' };
fs.mkdirSync(output, { recursive: true });

function makeServer(documentRoot) {
  return http.createServer((req, res) => {
    let name;
    try { name = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\//, '').replace(/^landing\//, ''); }
    catch { res.writeHead(400).end(); return; }
    let target = path.resolve(documentRoot, name);
    if (target !== documentRoot && !target.startsWith(documentRoot + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    fs.createReadStream(target).pipe(res);
  });
}

(async () => {
  const servers = [makeServer(root), makeServer(path.join(root, 'elementary-site'))];
  let browser;
  const errors = [], consoleErrors = [], failures = [], checks = [];
  try {
    await Promise.all(servers.map(server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve))));
    const [main, elementary] = servers.map(server => `http://127.0.0.1:${server.address().port}/`);
    browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
    const context = await browser.newContext();
    await context.addInitScript(() => {
      window.testOpened = [];
      window.open = (...args) => { window.testOpened.push(args); return null; };
    });
    // Even a mistaken click cannot send data to an external service.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['127.0.0.1', ''].includes(url.hostname) ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    const pages = [
      ['middle-high', main, '수학의 기준 진접본원'],
      ['elementary', elementary, '딱풀리는수학 진접점'],
      ['legacy-secondary', main + 'secondary.html', '수학의 기준 진접본원'],
      ['legacy-elementary', main + 'elementary.html', '딱풀리는수학 진접점'],
      ['school', main + 'schools/pungyang-middle/'],
      ['exam', main + 'exams/pungyang-middle/2026-g3-s1-final/'],
    ];
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      for (const [name, url] of pages) {
        assert.equal((await page.goto(url)).status(), 200);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
        assert.equal(await page.locator('h1').count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}/${width}: overflow`);
        assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)));
        if (['middle-high', 'elementary'].includes(name) && [390, 1440].includes(width)) {
          await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
          await page.locator('.page-hero').screenshot({ path: path.join(output, `${name}-hero-${width}.png`) });
          await page.locator('.cross-link').scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(output, `${name}-switch-${width}.png`) });
          const link = page.locator('[data-brand-switch]');
          const box = await link.boundingBox();
          assert.ok(box.width > 0 && box.x >= 0 && box.x + box.width <= width, 'switch is usable');
        }
        checks.push(`${name} ${width}: HTTP 200, one H1, assets loaded, no overflow`);
      }
    }
    console.log('PASS: 6 routes × 4 widths; elementary is served from an independent document root');

    // All local links/anchors, including the Pilot link graph, must resolve.
    for (const [, url] of pages) {
      await page.goto(url);
      const links = await page.locator('a[href]').evaluateAll(elements => elements.map(el => el.href));
      for (const href of new Set(links)) {
        if (!href.startsWith(main) && !href.startsWith(elementary)) continue;
        const response = await context.request.get(href);
        assert.equal(response.status(), 200, href);
        const hash = new URL(href).hash;
        if (hash) assert.ok((await response.text()).includes(`id="${hash.slice(1)}"`), href);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(main);
    assert.equal(await page.locator('[data-brand-switch="elementary"]').getAttribute('href'), 'https://ddaksoojj.vercel.app/');
    // Cross-origin clicks are exercised by production-site-split-check.cjs; legacy remains directly accessible.
    await page.goto(main + 'elementary.html');
    assert.equal(page.url(), main + 'elementary.html');
    await page.goBack();
    assert.equal(page.url(), main);
    await page.locator('a[href="./schools/pungyang-middle/"]').click();
    assert.equal(page.url(), main + 'schools/pungyang-middle/');
    await page.reload();
    await page.goBack();
    assert.equal(page.url(), main);
    for (const hash of ['ddak-elementary', 'math-standard-secondary', 'fliplearning', 'process']) {
      await page.goto(main + '#' + hash);
      assert.equal(page.url(), main + '#' + hash);
      assert.equal(await page.locator('#' + hash).count(), 1);
    }
    await page.goto(elementary + 'index.html');
    await page.reload();
    await page.locator('.brand').click();
    assert.equal(page.url(), elementary);
    assert.equal(await page.locator('[data-brand-switch="secondary"]').getAttribute('href'), 'https://math-standard-landing-page.vercel.app/');
    console.log('PASS: local links, direct visits, refresh, native back, root aliases and independent home navigation');

    for (const [name, url, brand] of pages.filter(p => p[2])) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(url);
      const phone = page.locator('.contact-links a[href^="tel:"]');
      await phone.click();
      assert.ok(await page.locator('#phoneDialog').evaluate(el => el.open));
      await page.keyboard.press('Escape');
      assert.ok(await phone.evaluate(el => el === document.activeElement));
      await phone.click();
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
      await page.locator('#phoneCopyButton').click();
      assert.equal(await page.evaluate(() => getSelection().toString()), '031-522-5431');
      await page.keyboard.press('Escape');
      await page.locator('#faqChatbotToggle').click();
      const faq = page.locator('#faqChatbotPanel a').first();
      const target = await faq.getAttribute('href');
      await faq.click();
      assert.ok(await page.locator(target).evaluate(el => el.open));
      assert.ok(await page.locator(`${target} summary`).evaluate(el => el === document.activeElement));
      assert.ok(!(await page.locator('#faqChatbotPanel').isVisible()));
      await page.locator('#faqChatbotToggle').click();
      await page.keyboard.press('Escape');
      assert.ok(!(await page.locator('#faqChatbotPanel').isVisible()));
      for (const copyWorks of [true, false]) {
        await page.goto(url);
        await page.evaluate(works => {
          window.testCopied = null;
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: text => {
            if (!works) return Promise.reject(new Error('denied'));
            window.testCopied = text;
            return Promise.resolve();
          } } });
          document.execCommand = () => false;
        }, copyWorks);
        assert.equal(await page.locator('[name="program"]').inputValue(), brand);
        await page.locator('[name="student"]').fill(' 테스트학생 ');
        await page.locator('[name="grade"]').fill(name.includes('elementary') ? '초4' : '중2');
        await page.locator('[name="phone"]').fill('010-0000-0000');
        await page.locator('[name="message"]').fill('<script>테스트 문구</script>');
        await page.locator('#consultForm button[type="submit"]').click();
        await page.waitForFunction(() => !document.getElementById('consultResult').hidden);
        const message = await page.locator('#consultMessage').inputValue();
        assert.ok(message.includes(brand));
        assert.ok(message.includes('학생 이름: 테스트학생'));
        assert.ok(message.includes('<script>테스트 문구</script>'));
        if (copyWorks) assert.equal(await page.evaluate(() => window.testCopied), message);
        else assert.match(await page.locator('#consultFormNote').textContent(), /직접/);
        assert.deepEqual(await page.evaluate(() => window.testOpened), [['http://pf.kakao.com/_yWFTn/chat', '_blank', 'noopener,noreferrer']]);
        assert.equal(await page.evaluate(() => localStorage.length), 0);
      }
    }
    console.log('PASS: all four consultation forms, copy success/failure, safe literal text, phone focus and FAQ; all sends intercepted');

    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJS.newPage();
    for (const [, url, brand] of pages.filter(p => p[2])) {
      await plain.goto(url);
      assert.ok(await plain.locator('button[type="submit"]').isDisabled());
      await plain.locator('[name="student"]').fill('test');
      await plain.locator('[name="grade"]').fill('test');
      await plain.locator('[name="phone"]').fill('010-0000-0000');
      await plain.locator('[name="phone"]').press('Enter');
      assert.equal(plain.url(), url, brand);
    }
    await noJS.close();
    for (const [name, url] of [['middle-high', main], ['elementary', elementary]]) {
      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await mobile.clock.install();
      await mobile.goto(url);
      const historyLength = await mobile.evaluate(() => history.length);
      await mobile.clock.fastForward(9000);
      // Flush real scroll events before advancing the mocked clock again.
      await mobile.evaluate(() => {
        window.qaScrolls = [];
        addEventListener('scroll', () => window.qaScrolls.push(scrollY));
        scrollTo({ top: 1200, behavior: 'instant' });
      });
      await mobile.clock.runFor(100);
      await mobile.waitForFunction(() => window.qaScrolls.includes(1200));
      await mobile.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }));
      await mobile.clock.runFor(100);
      await mobile.waitForFunction(() => window.qaScrolls.includes(700));
      assert.ok(await mobile.locator('#exitOfferDialog').evaluate(el => el.open), JSON.stringify(await mobile.evaluate(() => ({
        scroll: scrollY, touch: matchMedia('(hover: none), (pointer: coarse)').matches,
        visibility: document.visibilityState, active: document.activeElement.tagName,
        dialog: !!document.querySelector('dialog[open]'), time: Date.now()
      }))));
      assert.equal(await mobile.evaluate(() => history.length), historyLength);
      await mobile.locator('[data-exit-close]').first().click();
      assert.ok(!(await mobile.locator('#exitOfferDialog').evaluate(el => el.open)));
      await mobile.close();
      const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await desktop.clock.install();
      await desktop.goto(url);
      const exit = () => desktop.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0, relatedTarget: null })));
      await exit();
      assert.ok(!(await desktop.locator('#exitOfferDialog').evaluate(el => el.open)));
      await desktop.clock.fastForward(9000);
      await exit();
      assert.ok(await desktop.locator('#exitOfferDialog').evaluate(el => el.open));
      await desktop.locator('[data-exit-consult]').click();
      assert.ok(desktop.url().endsWith('#apply'));
      assert.ok(await desktop.locator('[name="student"]').evaluate(el => el === document.activeElement));
      await exit();
      assert.ok(!(await desktop.locator('#exitOfferDialog').evaluate(el => el.open)));
      await desktop.close();
    }
    console.log('PASS: no-JS prevents form URL leakage; desktop/mobile exit dialogs preserve history');
    // Check project subpaths and direct file asset loading without a parent HTTP root.
    for (const url of [main + 'landing/index.html', elementary + 'landing/index.html']) {
      await page.goto(url);
      await page.locator('.brand').click();
      assert.ok(page.url().endsWith('/landing/'));
      assert.ok(await page.locator('.page-logo img').evaluate(el => el.naturalWidth > 0));
    }
    for (const file of ['index.html', 'elementary-site/index.html']) {
      await page.goto(pathToFileURL(path.join(root, file)).href);
      await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      assert.ok(await page.locator('button[type="submit"]').isEnabled());
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failures, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ status: 'PASS', checks, testedRoutes: pages.map(([name]) => name), widths: [360, 390, 768, 1440], independentDocumentRoots: true, consultationTransmitted: false, pageErrors: errors, consoleErrors, failedResponses: failures }, null, 2) + '\n');
    console.log('PASS: relative subpaths, direct file assets, zero page/console errors and zero failed responses');
  } finally {
    if (browser) await browser.close();
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
