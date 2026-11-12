// Read-only release verification. Run SITE_SPLIT_GATE=A before touching the existing site.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const gate = process.env.SITE_SPLIT_GATE || 'A';
assert.ok(['A', 'B'].includes(gate));
const middle = 'https://math-standard-landing-page.vercel.app/';
const elementary = JSON.parse(fs.readFileSync(path.join(root, 'elementary-site/seo-config.json'))).productionOrigin + '/';
const output = path.join(root, '.seo/reports', `site-split-phase2-gate-${gate.toLowerCase()}`);
fs.mkdirSync(output, { recursive: true });
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
const read = file => fs.readFileSync(path.join(root, file));
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])['@graph']);

(async () => {
  const httpResults = [];
  async function get(url, status = 200, file) {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const body = Buffer.from(await response.arrayBuffer());
    assert.equal(response.status, status, url);
    if (status === 200) {
      assert.doesNotMatch(response.headers.get('x-robots-tag') || '', /noindex/i, url);
      if (file) assert.equal(hash(body), hash(read(file)), `${url}: deployed content differs from ${file}`);
    }
    httpResults.push({ url, status: response.status, contentType: response.headers.get('content-type'), sha256: hash(body), fileMatched: file || null });
    return { response, text: body.toString('utf8'), hash: hash(body) };
  }
  for (const [base, folder] of [[elementary, 'elementary-site/'], ...(gate === 'B' ? [[middle, '']] : [])]) {
    const home = await get(base, 200, folder + 'index.html');
    assert.match(home.response.headers.get('content-type'), /text\/html/);
    assert.ok(home.text.includes(`<link rel="canonical" href="${base}"`));
    assert.ok(home.text.includes(`<meta property="og:url" content="${base}"`));
    assert.match(home.text, /<title>[^<]+<\/title>/);
    assert.match(home.text, /name="description"\s+content="[^"]+"/);
    assert.match(home.text, /name="twitter:card" content="summary"/);
    assert.equal((home.text.match(/<h1\b/g) || []).length, 1);
    assert.doesNotMatch(home.text, /noindex|PENDING PRODUCTION URL|\{\{ELEMENTARY_ORIGIN\}\}/);
    const graph = jsonLd(home.text);
    assert.equal(graph.find(x => x['@id'] === base + '#academy').url, base);
    if (folder) {
      assert.doesNotMatch(JSON.stringify(graph), /math-standard-landing-page/);
      assert.doesNotMatch(home.text, /site-verification/);
    } else {
      assert.match(home.text, /4zFCuW52coMGJ_e8J7AZI-Wz93dqFQlZFPkAnNHbB5Q/);
      assert.match(home.text, /171a5a6dcfe42518d66f36ee407638acb8c02e42/);
    }
    const robots = await get(base + 'robots.txt', 200, folder + 'robots.txt');
    assert.match(robots.text, /^Allow: \/\r?$/m);
    assert.doesNotMatch(robots.text, /^Disallow:\s*\/\s*$/m);
    assert.ok(robots.text.includes(`Sitemap: ${base}sitemap.xml`));
    const sitemap = await get(base + 'sitemap.xml', 200, folder + 'sitemap.xml');
    assert.match(sitemap.response.headers.get('content-type'), /xml/);
    assert.ok(sitemap.text.includes(`<loc>${base}</loc>`));
    const llms = await get(base + 'llms.txt', 200, folder + 'llms.txt');
    assert.match(llms.response.headers.get('content-type'), /text\/plain/);
    assert.doesNotMatch(llms.text, /PENDING PRODUCTION URL/);
    await get(base + '__seo-not-found-test', 404);
    for (const asset of ['site.css', 'site.js', 'exit-offer.js', folder ? 'elementary.css' : 'secondary.css', folder ? 'ddak-logo-name.png' : 'math-standard-name.jpg']) {
      await get(base + 'assets/' + asset, 200, folder + 'assets/' + asset);
    }
  }
  if (gate === 'A') {
    const before = JSON.parse(read('.seo/reports/site-split-phase2-before.json'));
    for (const expected of before) {
      const actual = await get(middle + expected.path);
      assert.equal(actual.hash, expected.sha256, `GATE A changed existing Production: ${expected.path}`);
    }
  } else {
    for (const file of ['schools/pungyang-middle/index.html', 'exams/pungyang-middle/2026-g3-s1-final/index.html', 'data/exams/pungyang-middle/2026-g3-s1-final.json', 'elementary.html', 'secondary.html']) {
      const response = await get(middle + file.replace(/index\.html$/, ''), 200, file);
      if (file.endsWith('.html')) { jsonLd(response.text); assert.doesNotMatch(response.text, /noindex/i); }
    }
    await get(middle + 'elementary-site/', 404);
    await get(middle + 'elementary-site/index.html', 404);
    await get(middle + 'elementary-site/assets/site.js', 404);
  }
  for (const privateFile of ['seo-config.json', 'sitemap.xml.template', '.vercel/project.json']) await get(elementary + privateFile, 404);
  fs.writeFileSync(path.join(output, 'http.json'), JSON.stringify(httpResults, null, 2) + '\n');
  console.log(`PASS GATE ${gate}: production HTTP, exact source bytes, metadata, discovery files and true 404s`);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [], consoleErrors = [], failedResources = [], interactions = [];
  try {
    for (const [name, base, brand] of [['elementary', elementary, '딱풀리는수학 진접점'], ...(gate === 'B' ? [['middle-high', middle, '수학의 기준 진접본원']] : [])]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, isMobile: width === 390, hasTouch: width === 390 });
        // Intercept all programmatic consultation windows; no real message is submitted.
        await context.addInitScript(() => {
          window.testOpened = [];
          window.open = (...args) => { window.testOpened.push(args); return null; };
        });
        await context.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
        const page = await context.newPage();
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        page.on('response', r => { if (r.status() >= 400) failedResources.push(`${r.status()} ${r.url()}`); });
        await page.clock.install();
        await page.goto(base);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.naturalWidth > 0)));
        await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
        // Deterministic clock, and wait for the actual browser scroll events.
        const historyLength = await page.evaluate(() => history.length);
        await page.clock.fastForward(9000);
        if (width === 390) {
          await page.evaluate(() => { window.qaScrolls = []; addEventListener('scroll', () => window.qaScrolls.push(scrollY)); scrollTo({ top: 1200, behavior: 'instant' }); });
          await page.clock.runFor(100);
          await page.waitForFunction(() => window.qaScrolls.includes(1200));
          await page.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }));
          await page.clock.runFor(100);
          await page.waitForFunction(() => window.qaScrolls.includes(700));
        } else {
          await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0, relatedTarget: null })));
        }
        assert.ok(await page.locator('#exitOfferDialog').evaluate(el => el.open), `${name}/${width}: exit offer`);
        assert.equal(await page.evaluate(() => history.length), historyLength);
        await page.locator('[data-exit-close]').first().click();
        await page.clock.resume();
        await page.locator('#faqChatbotToggle').click();
        const question = page.locator('#faqChatbotPanel a').first();
        const target = await question.getAttribute('href');
        await question.click();
        assert.ok(await page.locator(target).evaluate(el => el.open));
        assert.ok(!(await page.locator('#faqChatbotPanel').isVisible()));
        assert.equal(await page.locator('.contact-links a[href^="tel:"]').getAttribute('href'), 'tel:031-522-5431');
        if (width === 1440) {
          await page.locator('.contact-links a[href^="tel:"]').click();
          assert.ok(await page.locator('#phoneDialog').evaluate(el => el.open));
          await page.keyboard.press('Escape');
        }
        assert.ok(await page.locator('a[href="https://naver.me/Gn0DQWNs"]').count());
        const blog = name === 'elementary' ? 'perfect-math1' : 'standrad-of-math';
        assert.ok(await page.locator(`a[href="https://blog.naver.com/${blog}"]`).count());
        for (const success of [true, false]) {
          await page.evaluate(works => {
            window.testCopied = null;
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: text => {
              if (!works) return Promise.reject(new Error('denied'));
              window.testCopied = text; return Promise.resolve();
            } } });
            document.execCommand = () => false;
          }, success);
          await page.locator('[name="student"]').fill('검수용 테스트');
          await page.locator('[name="grade"]').fill(name === 'elementary' ? '초4' : '중2');
          await page.locator('[name="phone"]').fill('010-0000-0000');
          await page.locator('#consultForm button[type="submit"]').click();
          const text = await page.locator('#consultMessage').inputValue();
          assert.ok(text.includes(brand));
          if (success) assert.equal(await page.evaluate(() => window.testCopied), text);
          else assert.match(await page.locator('#consultFormNote').textContent(), /직접/);
        }
        assert.equal((await page.evaluate(() => window.testOpened)).length, 2);
        assert.equal(await page.evaluate(() => localStorage.length), 0);
        const destination = name === 'elementary' ? middle : elementary;
        assert.equal(await page.locator('[data-brand-switch]').getAttribute('href'), destination);
        await page.locator('[data-brand-switch]').click();
        await page.waitForURL(destination);
        assert.equal(page.url(), destination);
        await page.goBack();
        assert.ok(page.url().startsWith(base));
        interactions.push({ name, width, destination, status: 'PASS' });
        await context.close();
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedResources, []);
    fs.writeFileSync(path.join(output, 'browser.json'), JSON.stringify({ status: 'PASS', interactions, pageErrors: errors, consoleErrors, failedResources, consultationSent: false }, null, 2) + '\n');
    console.log(`PASS GATE ${gate}: live desktop/mobile, images, FAQ, phone, consultation, exit offer, brand-link clicks and native back; zero errors`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
