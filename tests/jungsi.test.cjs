const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('jungsi/index.html');
const url = 'https://math-standard.co.kr/jungsi/';

test('jungsi: page has search and share metadata for the new domain', () => {
  assert.match(html, /<title>2027 정시 지역별 전형분석 탐색기 \| 수학의 기준 진접본원<\/title>/);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
  assert.match(html, /<meta name="description" content="[^"]{30,}">/);
  assert.equal((html.match(/<title>/g) || []).length, 1);
});

test('jungsi: original attribution and the final-guideline warning are kept', () => {
  assert.ok(html.includes('한국대학교육협의회'));
  assert.ok(html.includes('AITAMS 진로진학연구소'));
  assert.ok(html.includes('최종 모집요강'));
  assert.ok(!html.includes('claude.ai/artifact'));
});

test('jungsi: academy links point at existing pages', () => {
  const nav = html.match(/<nav class="academy-links"[\s\S]*?<\/nav>/)[0];
  for (const href of nav.match(/href="([^"]+)"/g).map(h => h.slice(6, -1))) {
    const target = path.join(root, 'jungsi', href.split('#')[0]);
    const exists = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
    assert.ok(exists, href);
  }
});

test('jungsi: embedded scripts parse and data loads', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length >= 2);
  for (const s of scripts) new vm.Script(s);
  const data = JSON.parse(html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.meta.regions.length, 16);
  assert.ok(data.univ.length > 150, `univ ${data.univ.length}`);
});

test('jungsi: page is deployed, listed and linked', () => {
  assert.match(read('.vercelignore'), /^!jungsi\r?$/m);
  assert.ok(read('sitemap.xml').includes(`<loc>${url}</loc>`));
  assert.ok(read('llms.txt').includes(url));
  assert.equal((read('middle/index.html').match(/href="\.\.\/jungsi\/"/g) || []).length, 2);
  assert.equal((read('index.html').match(/href="\.\/jungsi\/"/g) || []).length, 2);
});
