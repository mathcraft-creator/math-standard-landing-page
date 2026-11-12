// Optional browser QA: npm install --prefix <temporary-tools-folder> playwright
// Set PLAYWRIGHT_MODULE to that folder's node_modules/playwright, then run this file.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs', 'previews');
fs.mkdirSync(output, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/landing\//, ''); } catch { res.writeHead(400).end(); return; }
  const target = path.resolve(root, name);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
  fs.createReadStream(target).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/landing/`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    window.testOpened = [];
    window.open = (...args) => { window.testOpened.push(args); return null; };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      for (const file of ['index.html', 'elementary.html', 'secondary.html']) {
        await page.goto(base + file);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
        assert.equal(await page.locator('h1').count(), 1);
        const overflow = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(overflow.doc <= overflow.viewport, `${file} at ${width}: overflow ${JSON.stringify(overflow)}`);
        const broken = await page.locator('img').evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
        assert.deepEqual(broken, []);
        if ([390,1440].includes(width)) await page.screenshot({ path: path.join(output, `${file.replace('.html','')}-${width}.png`), fullPage: true });
        if (width === 1440) {
          await page.locator(file === 'index.html' ? '.home-hero' : '.page-hero').screenshot({ path: path.join(output, `${file.replace('.html','')}-hero.png`) });
          if (file !== 'index.html') await page.locator('#stories').screenshot({ path: path.join(output, `${file.replace('.html','')}-stories.png`) });
        }
      }
    }
    console.log('PASS: three pages, four widths, all images and no horizontal overflow; six screenshots saved');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + 'index.html');
    await page.locator('.course-card.elementary').click();
    assert.ok(page.url().endsWith('/elementary.html'));
    await page.goBack();
    assert.ok(page.url().endsWith('/index.html'));
    await page.locator('.course-card.secondary').click();
    assert.ok(page.url().endsWith('/secondary.html'));
    await page.reload();
    assert.equal(await page.locator('body').getAttribute('data-page'), 'secondary');
    await page.locator('.brand').click();
    assert.ok(page.url().endsWith('/index.html'));
    for (const [hash, destination] of [['ddak-elementary','elementary.html'],['math-standard-secondary','secondary.html'],['fliplearning','secondary.html'],['process','secondary.html']]) {
      await page.goto(base + 'index.html#' + hash);
      await page.waitForURL(`**/${destination}#${hash}`);
    }
    console.log('PASS: mobile course navigation, normal back, reload, logo and legacy hashes');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + 'index.html');
    const phone = page.locator('.home-under a[href^="tel:"]');
    await phone.click();
    assert.ok(await page.locator('#phoneDialog').evaluate(el => el.open));
    await page.keyboard.press('Escape');
    assert.ok(!(await page.locator('#phoneDialog').evaluate(el => el.open)));
    assert.ok(await phone.evaluate(el => el === document.activeElement));
    console.log('PASS: native phone dialog Escape and focus return');
    await phone.click();
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable:true, value:{ writeText: () => Promise.reject(new Error('clipboard denied')) } });
    });
    await page.locator('#phoneCopyButton').click();
    assert.equal(await page.evaluate(() => window.getSelection().toString()), '031-522-5431');
    await page.keyboard.press('Escape');
    await page.locator('#faqChatbotToggle').click();
    await page.locator('#faqChatbotPanel a[href="#faq-course"]').click();
    assert.ok(await page.locator('#faq-course').evaluate(el => el.open));
    assert.ok(!(await page.locator('#faqChatbotPanel').isVisible()));
    assert.ok(await page.locator('#faq-course summary').evaluate(el => el === document.activeElement));
    console.log('PASS: phone fallback selects the actual number; FAQ widget reveals answer and closes');
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJS.newPage();
    for (const file of ['index.html','elementary.html','secondary.html']) {
      await plain.goto(base + file);
      assert.ok(await plain.locator('button[type="submit"]').isDisabled());
      await plain.locator('[name="student"]').fill('test');
      await plain.locator('[name="grade"]').fill('test');
      await plain.locator('[name="phone"]').fill('010-0000-0000');
      await plain.locator('[name="phone"]').press('Enter');
      assert.equal(plain.url(), base + file, 'no native GET submission');
    }
    await noJS.close();
    console.log('PASS: JavaScript-disabled submission cannot leak form data into URLs');
    for (const [file, expected] of [['index.html','상담 후 결정'],['elementary.html','딱풀리는수학 진접점'],['secondary.html','수학의 기준 진접본원']]) {
      await page.goto(base + file);
      assert.equal(await page.locator('[name="program"]').inputValue(), expected);
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', { configurable:true, value:{ writeText: () => Promise.reject(new Error('clipboard denied')) } });
        document.execCommand = () => false;
      });
      await page.locator('[name="student"]').fill(' 테스트학생 ');
      await page.locator('[name="grade"]').fill('초4');
      await page.locator('[name="phone"]').fill('010-0000-0000');
      await page.locator('[name="message"]').fill('<script>테스트 문구</script>');
      await page.locator('#consultForm button[type="submit"]').click();
      await page.waitForFunction(() => document.getElementById('consultFormNote').textContent.includes('직접'));
      assert.ok(await page.locator('#consultResult').isVisible());
      const text = await page.locator('#consultMessage').inputValue();
      assert.ok(text.includes(expected));
      assert.ok(text.includes('학생 이름: 테스트학생'));
      assert.ok(text.includes('<script>테스트 문구</script>'));
      assert.deepEqual(await page.evaluate(() => window.testOpened), [['http://pf.kakao.com/_yWFTn/chat', '_blank', 'noopener,noreferrer']]);
      assert.equal(await page.evaluate(() => localStorage.length), 0);
    }
    console.log('PASS: all course defaults, clipboard denial/manual text, safe user text, no persistent storage, external send intercepted');
    await page.goto('file:///' + path.join(root, 'index.html').replaceAll('\\','/'));
    await page.locator('.course-card.elementary').click();
    assert.ok(page.url().includes('elementary.html'));
    assert.ok(await page.locator('.page-logo img').evaluate(el => el.naturalWidth > 0));
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS: file:// page navigation and assets; zero page errors');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
