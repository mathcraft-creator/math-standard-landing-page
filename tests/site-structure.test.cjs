const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'elementary.html', 'secondary.html'];
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
      const target = path.resolve(root, file || page);
      assert.ok(target.startsWith(root + path.sep), value);
      assert.ok(fs.existsSync(target), `${page} missing ${value}`);
      if (hash) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${hash}"`), `missing anchor ${value}`);
    }
    assert.match(html, /id="consultMessage"[^>]*readonly/);
    assert.match(html, /id="phoneDialog"/);
    assert.match(html, /type="submit"\s+disabled/, 'submission must be disabled until the local handler is ready');
    assert.match(html, /<noscript\b/);
    assert.match(html, /data-phone-number/);
  });
}
test('home course links contain the correctly assigned portraits', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const name of ['elementary', 'secondary']) {
    const card = html.match(new RegExp(`<a[^>]*class="course-card ${name}"[\\s\\S]*?</a>`));
    assert.ok(card, name);
    assert.ok(card[0].includes(`href="./${name}.html"`));
    assert.ok(card[0].includes(`src="./assets/${name}-portrait.png"`));
    assert.ok(!card[0].includes('target="_blank"'));
  }
});
