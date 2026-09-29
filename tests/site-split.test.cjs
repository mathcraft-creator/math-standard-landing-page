const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const base = 'https://math-standard-landing-page.vercel.app/';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const graph = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap(m => { const doc = JSON.parse(m[1]); return doc['@graph'] || [doc]; });

test('split: middle/high root keeps identity, ownership and school entry', () => {
  const html = read('index.html');
  assert.match(html, /<title>수학의 기준 진접본원[^<]*중·고등/);
  assert.match(html, /name="description"\s+content="[^"]*중·고등/);
  assert.ok(html.includes(`<link rel="canonical" href="${base}"`));
  assert.match(html, /href="\.\/schools\/pungyang-middle\/"/);
  assert.match(html, /data-page="secondary"/);
  assert.doesNotMatch(html, /class="course-card elementary"|<option[^>]*>딱풀리는수학/);
  assert.match(html, /name="google-site-verification" content="4zFCuW52coMGJ_e8J7AZI-Wz93dqFQlZFPkAnNHbB5Q"/);
  assert.match(html, /name="naver-site-verification" content="171a5a6dcfe42518d66f36ee407638acb8c02e42"/);
  const items = graph(html);
  assert.equal(items.find(x => x['@id'] === base + '#academy').name, '수학의 기준 진접본원');
  assert.equal(items.find(x => x['@id'] === base + '#website').name, '수학의 기준 진접본원');
  assert.deepEqual(items.find(x => x['@type'] === 'WebPage').about, { '@id': base + '#academy' });
  assert.ok(items.some(x => x['@id'] === base + '#secondary-academy'));
});

test('split: legacy pages remain reachable with explicit canonical strategy', () => {
  const secondary = read('secondary.html');
  assert.ok(secondary.includes(`<link rel="canonical" href="${base}"`));
  assert.ok(secondary.includes(`<meta property="og:url" content="${base}"`));
  assert.match(read('elementary.html'), /rel="canonical" href="https:\/\/math-standard-landing-page.vercel.app\/elementary.html"/);
  for (const file of ['index.html', 'secondary.html', 'elementary.html']) {
    assert.doesNotMatch(read(file), /http-equiv="refresh"/i);
  }
  assert.equal(JSON.parse(read('vercel.json')).redirects, undefined);
});

test('split: elementary metadata uses its verified independent production origin and is indexable', () => {
  const origin = 'https://ddaksoojj.vercel.app';
  const html = read('elementary-site/index.html');
  assert.match(html, /<title>딱풀리는수학 진접점[^<]*초3~초6/);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.ok(html.includes(`<link rel="canonical" href="${origin}/"`));
  assert.ok(html.includes(`<meta property="og:url" content="${origin}/"`));
  assert.ok(html.includes(`<meta name="twitter:url" content="${origin}/"`));
  assert.doesNotMatch(html, /noindex|PENDING PRODUCTION URL|site-verification|\{\{ELEMENTARY_ORIGIN\}\}/);
  const items = graph(html);
  const academy = items.find(x => x['@id'] === origin + '/#academy');
  assert.equal(academy.name, '딱풀리는수학 진접점');
  assert.deepEqual(academy['@type'], ['EducationalOrganization', 'LocalBusiness']);
  assert.equal(academy.parentOrganization, undefined);
  assert.deepEqual(academy.sameAs, ['https://blog.naver.com/perfect-math1']);
  assert.doesNotMatch(JSON.stringify(items), /math-standard-landing-page|secondary\.html|elementary\.html/);
  assert.deepEqual(items.find(x => x['@type'] === 'WebPage').about, { '@id': origin + '/#academy' });
  assert.deepEqual(items.map(x => x['@id']), ['website', 'webpage', 'academy', 'faq-data'].map(id => origin + '/#' + id));
  for (const item of items.filter(x => x['@type'] !== 'FAQPage')) assert.equal(item.url, origin + '/');
  assert.deepEqual(items.find(x => x['@type'] === 'FAQPage').mainEntityOfPage, { '@id': origin + '/#webpage' });
  assert.equal(JSON.parse(read('elementary-site/seo-config.json')).productionOrigin, origin);
  assert.match(read('elementary-site/robots.txt'), /^Allow: \/$/m);
  assert.doesNotMatch(read('elementary-site/robots.txt'), /Disallow:\s*\//);
  assert.ok(read('elementary-site/robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.deepEqual([...read('elementary-site/sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), [origin + '/']);
  assert.match(read('elementary-site/sitemap.xml.template'), /<loc>\{\{ELEMENTARY_ORIGIN\}\}\/<\/loc>/);
  assert.ok(read('elementary-site/llms.txt').includes(origin + '/'));
  assert.doesNotMatch(read('elementary-site/llms.txt'), /PENDING PRODUCTION URL/);
  assert.doesNotMatch(read('elementary-site/llms.txt'), /math-standard-landing-page|수학의 기준/);
});

test('split: elementary resources and every relative link stay inside its own document root', () => {
  const dir = path.join(root, 'elementary-site');
  const files = fs.readdirSync(dir, { recursive: true }).filter(f => /\.(html|css|js)$/.test(f));
  for (const file of files) {
    const absolute = path.join(dir, file);
    const source = fs.readFileSync(absolute, 'utf8');
    const refs = [...source.matchAll(/\b(?:src|href)="([^"]+)"/g), ...source.matchAll(/url\(["']?([^\)"']+)["']?\)/g)];
    for (const [, ref] of refs) {
      if (/^(https?:|tel:|data:)/.test(ref)) continue;
      const [pathname, hash] = ref.split('#');
      let target = pathname ? path.resolve(path.dirname(absolute), pathname) : absolute;
      assert.ok(target === dir || target.startsWith(dir + path.sep), `${file}: escape ${ref}`);
      assert.ok(fs.existsSync(target), `${file}: missing ${ref}`);
      if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (hash) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${hash}"`), ref);
    }
  }
  for (const asset of ['site.css', 'elementary.css', 'site.js', 'exit-offer.js', 'ddak-logo-name.png']) {
    assert.deepEqual(fs.readFileSync(path.join(dir, 'assets', asset)), fs.readFileSync(path.join(root, 'assets', asset)), asset);
  }
});

test('split: brand switches are real low-priority links and consultation stays brand-specific', () => {
  for (const file of ['index.html', 'secondary.html']) {
    const html = read(file);
    assert.match(html, /class="text-link" data-brand-switch="elementary" href="https:\/\/ddaksoojj\.vercel\.app\/"/);
    assert.match(html, /초등 \| 딱풀리는수학 진접점 ↗/);
    assert.match(html, /id="ddak-elementary"/);
    assert.match(html, /<option selected>수학의 기준 진접본원<\/option>/);
  }
  const elementary = read('elementary-site/index.html');
  assert.ok(elementary.includes(`data-brand-switch="secondary" href="${base}"`));
  assert.match(elementary, /중·고등 \| 수학의 기준 진접본원 ↗/);
  assert.doesNotMatch(elementary, /<option[^>]*>수학의 기준/);
  assert.match(elementary, /<option selected>딱풀리는수학 진접점<\/option>/);
});

test('split: discovery includes exactly root and protected Pilot canonicals', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(urls, [base, base + 'schools/pungyang-middle/', base + 'exams/pungyang-middle/2026-g3-s1-final/']);
  const llms = read('llms.txt');
  urls.forEach(url => assert.ok(llms.includes(url), url));
  assert.doesNotMatch(llms, /elementary.html|secondary.html|딱풀리는수학/);
  assert.match(read('.vercelignore'), /^\/elementary-site\/$/m);
  assert.match(read('elementary-site/.vercelignore'), /!index\.html/);
  assert.doesNotMatch(read('elementary-site/.vercelignore'), /!seo-config|!.*template/);
});

test('split: protected Pilot, legacy elementary, shared assets and original test contracts are byte-identical', () => {
  const baseline = JSON.parse(read('.seo/reports/site-split-protected.json'));
  for (const [file, hash] of Object.entries(baseline.sha256)) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
    assert.equal(actual, hash, `${file}: protected file changed`);
  }
});

test('split: authored Korean is intact and elementary FAQ schema matches the visible page', () => {
  for (const file of ['index.html', 'secondary.html', 'elementary-site/index.html', 'llms.txt', 'elementary-site/llms.txt', 'elementary-site/seo-config.json']) {
    assert.doesNotMatch(read(file), /\?\?|\uFFFD/, file);
  }
  const html = read('elementary-site/index.html');
  const text = html.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const faq = graph(html).find(x => x['@type'] === 'FAQPage');
  assert.ok(faq.mainEntity.length >= 3);
  for (const question of faq.mainEntity) {
    assert.ok(text.includes(question.name), question.name);
    assert.ok(text.includes(question.acceptedAnswer.text), question.name);
  }
});
