const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'elementary.html', 'secondary.html', 'elementary-site/index.html'];
for (const page of pages) {
  test(`${page}: standalone document, unique anchors and working local resources`, () => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.equal((html.match(/<div\b/g) || []).length, (html.match(/<\/div>/g) || []).length, 'all layout containers must close');
    assert.match(html, /<html lang="ko">/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
    for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|tel:|data:)/.test(value)) continue;
      const [file, hash] = value.split('#');
      let target = file ? path.resolve(root, path.dirname(page), file) : path.join(root, page);
      assert.ok(target === root || target.startsWith(root + path.sep), value);
      assert.ok(fs.existsSync(target), `${page} missing ${value}`);
      if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (hash) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${hash}"`), `missing anchor ${value}`);
    }
    assert.match(html, /id="consultMessage"[^>]*readonly/);
    assert.match(html, /id="phoneDialog"/);
    assert.match(html, /type="submit"\s+disabled/, 'submission must be disabled until the local handler is ready');
    assert.match(html, /<noscript\b/);
    assert.match(html, /data-phone-number/);
  });
}
test('independent home links use the correct brand assets and primary course CTAs', () => {
  for (const [file, logo, course] of [
    ['index.html', 'math-standard-name.jpg', '중·고등'],
    ['elementary-site/index.html', 'ddak-logo-name.png', '초등'],
  ]) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const brand = html.match(/<a class="brand"[\s\S]*?<\/a>/);
    assert.ok(brand, file);
    assert.ok(brand[0].includes('href="./"'));
    assert.ok(brand[0].includes(`src="./assets/${logo}"`));
    assert.ok(!brand[0].includes('target="_blank"'));
    assert.ok(html.includes(`<a class="button yellow" href="#apply">${course} 진단·1주 체험 문의 →</a>`));
    assert.doesNotMatch(html, /class="course-card /, 'course choice must not gate either independent home');
  }
});

test('home course CTAs have prominent and accessible visual states', () => {
  const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
  assert.match(css, /\.course-card\.elementary \.course-button\s*{[^}]*background:\s*#102e69;[^}]*color:\s*#fff;/s);
  assert.match(css, /\.course-card\.secondary \.course-button\s*{[^}]*background:\s*#ffd65a;[^}]*color:\s*#071a3c;/s);
  assert.match(css, /\.course-card:focus-visible\s*{[^}]*outline:/s);
  assert.match(css, /\.course-card:(?:hover|focus-visible) \.course-button \.arrow\s*{[^}]*transform:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-button\s*{[^}]*font-size:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-portrait\s*{[^}]*bottom:\s*72px;/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.course-button/s);
});
