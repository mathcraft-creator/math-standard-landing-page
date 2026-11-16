const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// 2026-11-16 쿡북 판: 고르는 화면(index) + 중·고등(middle/) + 초등(elementary/).
// 상담은 전화(tel:)와 카카오톡 채널 링크다. 문장 복사 폼은 없다.
const pages = ['index.html', 'middle/index.html', 'elementary/index.html'];
const kakao = 'http://pf.kakao.com/_yWFTn/chat';

for (const page of pages) {
  test(`${page}: standalone document, unique anchors and working local resources`, () => {
    const html = read(page);
    const dir = path.dirname(path.join(root, page));
    assert.equal((html.match(/<div\b/g) || []).length, (html.match(/<\/div>/g) || []).length, 'all layout containers must close');
    assert.match(html, /<html lang="ko">/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate IDs');
    for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|tel:|data:|mailto:)/.test(value)) continue;
      const [file, hash] = value.split('#');
      let target = file ? path.resolve(dir, file) : path.join(root, page);
      assert.ok(target.startsWith(root + path.sep), value);
      assert.ok(fs.existsSync(target), `${page} missing ${value}`);
      if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      assert.ok(fs.existsSync(target), `${page} missing ${value} (index.html)`);
      if (hash) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${hash}"`), `missing anchor ${value}`);
    }
    assert.match(html, /href="tel:0315225431"/, 'phone consultation link');
    assert.ok(html.includes(`href="${kakao}"`), 'kakao consultation link');
    assert.match(html, /prefers-reduced-motion/, 'motion must stop for reduced-motion users');
    // 이탈 방지 상담 안내(2026-11-17) — 공통 assets/exit-offer.js, 닫기 · 카톡 버튼
    const dialog = html.match(/<dialog id="exitOfferDialog"[\s\S]*?<\/dialog>/);
    assert.ok(dialog, `${page}: exit offer dialog`);
    assert.match(dialog[0], /id="exitOfferTitle"/);
    assert.match(dialog[0], /data-exit-close/);
    assert.ok(dialog[0].includes(`href="${kakao}"`), 'exit offer has kakao');
    assert.match(html, /<script src="(?:\.\.\/)?assets\/exit-offer\.js" defer><\/script>/);
  });
}

test('course pages put kakao next to phone and link to each other', () => {
  for (const [page, sibling] of [['middle/index.html', '../elementary/'], ['elementary/index.html', '../middle/']]) {
    const html = read(page);
    assert.ok(html.includes(`href="${sibling}"`), `${page} links to ${sibling}`);
    const dock = html.match(/<div class="dock">[\s\S]*?<\/div>/);
    assert.ok(dock, `${page}: mobile dock`);
    assert.match(dock[0], /href="tel:0315225431"/);
    assert.ok(dock[0].includes(`href="${kakao}"`));
    assert.ok(dock[0].indexOf('tel:') < dock[0].indexOf(kakao), 'kakao sits after phone');
    // 관리 단계 칸은 저절로 돌고, 스크롤을 붙잡지 않는다(2026-11-17)
    assert.match(html, /autoCycle/, `${page}: steps advance on their own`);
    assert.doesNotMatch(html, /pin\s*:\s*true/, `${page}: scroll is never pinned`);
  }
});

test('home chooser links both course pages with their logos', () => {
  const html = read('index.html');
  for (const [href, logo] of [['elementary/', 'assets/ddak-logo.png'], ['middle/', 'assets/gijun-logo.jpg']]) {
    const card = html.match(new RegExp(`<a[^>]*href="${href}"[\\s\\S]*?</a>`));
    assert.ok(card, href);
    assert.ok(card[0].includes(`src="${logo}"`), `${href} card shows ${logo}`);
    assert.ok(!card[0].includes('target="_blank"'));
  }
});

test('home course CTAs have prominent and accessible visual states', () => {
  // assets/site.css는 풍양중 School Hub·시험 분석 페이지가 계속 쓴다.
  const css = read('assets/site.css');
  assert.match(css, /\.course-card\.elementary \.course-button\s*{[^}]*background:\s*#102e69;[^}]*color:\s*#fff;/s);
  assert.match(css, /\.course-card\.secondary \.course-button\s*{[^}]*background:\s*#ffd65a;[^}]*color:\s*#071a3c;/s);
  assert.match(css, /\.course-card:focus-visible\s*{[^}]*outline:/s);
  assert.match(css, /\.course-card:(?:hover|focus-visible) \.course-button \.arrow\s*{[^}]*transform:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-button\s*{[^}]*font-size:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-portrait\s*{[^}]*bottom:\s*72px;/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.course-button/s);
});
