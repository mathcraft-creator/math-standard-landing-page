const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('rural/index.html');
const url = 'https://math-standard.co.kr/rural/';

test('rural: page has search and share metadata for the new domain', () => {
  assert.match(html, /<title>2028 농어촌학생 특별전형 탐색기 \| 수학의 기준 진접본원<\/title>/);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
  assert.match(html, /<meta name="description" content="[^"]{30,}">/);
  assert.equal((html.match(/<title>/g) || []).length, 1);
});

test('rural: original attribution and the final-guideline warning are kept', () => {
  assert.ok(html.includes('강원사대부고 박상근 선생님'));
  assert.ok(html.includes('모두의 진학'));
  assert.ok(html.includes('최종 모집요강'));
  assert.ok(!html.includes('claude.ai/artifact'));
});

test('rural: academy links point at existing pages', () => {
  const nav = html.match(/<nav class="academy-links"[\s\S]*?<\/nav>/)[0];
  for (const href of nav.match(/href="([^"]+)"/g).map(h => h.slice(6, -1))) {
    const target = path.join(root, 'rural', href.split('#')[0]);
    const exists = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
    assert.ok(exists, href);
  }
});

test('rural: embedded scripts parse and data loads', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length >= 2);
  for (const s of scripts) new vm.Script(s);
  const data = vm.runInNewContext(scripts[0].match(/const DATA=(\[[\s\S]*?\]);\n/)[1]);
  assert.ok(data.length > 600, `rows ${data.length}`);
  assert.ok(data.some(d => d.t === '수시') && data.some(d => d.t === '정시'));
});

test('rural: page is deployed, listed and linked', () => {
  assert.match(read('.vercelignore'), /^!rural\r?$/m);
  assert.ok(read('sitemap.xml').includes(`<loc>${url}</loc>`));
  assert.ok(read('llms.txt').includes(url));
  assert.equal((read('middle/index.html').match(/href="\.\.\/rural\/"/g) || []).length, 2);
});
