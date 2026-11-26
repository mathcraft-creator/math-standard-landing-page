const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const { parseFeed } = require('../api/_rss.js');
const handler = require('../api/blog.js');
const news = JSON.parse(read('data/news.json')).items;
const SITE = 'https://math-standard.co.kr';

const FEED = `<rss><channel><item><category><![CDATA[농어촌 전형]]></category>
<title><![CDATA[제목 &amp; 부제]]></title><link><![CDATA[https://blog.naver.com/standrad-of-math/1?fromRss=true]]></link>
<guid>https://blog.naver.com/standrad-of-math/1</guid>
<description><![CDATA[본문 요약 <img src="https://blogthumb.pstatic.net/AA/b.png?type=s3" />]]></description>
<pubDate>Wed, 25 Nov 2026 21:30:00 +0900</pubDate></item>
<item><title>bad</title><guid>javascript:alert(1)</guid><description></description><pubDate>x</pubDate></item></channel></rss>`;

test('news: RSS items parse into safe posts with loadable thumbnails', () => {
  const posts = parseFeed(FEED);
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0], {
    id: '1', url: 'https://blog.naver.com/standrad-of-math/1', title: '제목 & 부제', category: '농어촌 전형',
    date: '2026-11-25', summary: '본문 요약', thumb: 'https://mblogthumb-phinf.pstatic.net/AA/b.png?type=w320',
  });
});

test('news: /api/blog returns cached JSON and fails closed', async () => {
  const realFetch = global.fetch;
  const call = async () => {
    const out = { headers: {} };
    const res = { setHeader: (k, v) => { out.headers[k] = v; }, status(c) { out.status = c; return res; }, send(b) { out.body = b; }, json(b) { out.body = JSON.stringify(b); } };
    await handler({}, res);
    return out;
  };
  try {
    global.fetch = async () => ({ ok: true, text: async () => FEED });
    const ok = await call();
    assert.equal(ok.status, 200);
    assert.match(ok.headers['cache-control'], /s-maxage=1800/);
    assert.equal(JSON.parse(ok.body).posts.length, 1);
    global.fetch = async () => ({ ok: false, status: 500 });
    const bad = await call();
    assert.equal(bad.status, 502);
  } finally { global.fetch = realFetch; }
});

test('news: each item has a detail page with event data and booking link', () => {
  for (const i of news) {
    const html = read(`news/${i.slug}/index.html`);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE}/news/${i.slug}/">`));
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
    assert.equal(ld['@type'], 'Event');
    assert.equal(ld.startDate, i.startsAt);
    assert.ok(Date.parse(i.endsAt) > Date.parse(i.startsAt));
    assert.ok(html.includes(`href="${i.applyUrl}"`));
    assert.ok(html.includes(`href="${i.blogUrl}"`));
    assert.ok(fs.existsSync(path.join(root, i.image)), i.image);
    assert.ok(read('news/index.html').includes(`href="../news/${i.slug}/"`));
  }
});

test('news: the 12/16 briefing shows on the main page and the middle page', () => {
  const index = read('index.html');
  const strip = index.match(/<!-- news:start -->([\s\S]*?)<!-- news:end -->/)[1];
  assert.match(strip, /href="\.\/news\/2026-12-16-pre-middle1-briefing\/"/);
  assert.match(strip, /12월 16일\(수\) 오전 11시 · 예비 중1 학부모 설명회/);
  assert.match(index, /<nav class="explorer-nav"[^>]*><a href="\.\/news\/">학원 소식<\/a><a href="\.\/blog\/">블로그<\/a>/);
  assert.ok(index.includes('<script src="./assets/news.js" defer></script>'));
  const middle = read('middle/index.html').match(/<!-- news:start -->([\s\S]*?)<!-- news:end -->/)[1];
  const hrefs = [...middle.matchAll(/<a href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(hrefs.length, 3);
  assert.equal(new Set(hrefs).size, 3);
  assert.ok(!hrefs.includes('https://blog.naver.com/standrad-of-math'), 'posts link to the article, not the blog home');
});

test('news: blog page lists real posts with topic filters', () => {
  const html = read('blog/index.html');
  const { posts } = JSON.parse(read('data/blog-posts.json'));
  assert.ok(posts.length >= 10);
  const links = [...html.matchAll(/<li class="pcard"[^>]*>\s*<a href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(links.length, posts.length);
  assert.ok(links.every(u => /^https:\/\/blog\.naver\.com\/standrad-of-math\/\d+$/.test(u)));
  for (const c of new Set(posts.map(p => p.category))) assert.ok(html.includes(`data-cat="${c}">`), c);
  assert.ok(html.includes('referrerpolicy="no-referrer"'));
});

test('news: pages are deployed and listed', () => {
  for (const d of ['news', 'blog', 'api']) assert.match(read('.vercelignore'), new RegExp(`^!${d}\\r?$`, 'm'));
  for (const u of ['/news/', '/blog/', `/news/${news[0].slug}/`]) assert.ok(read('sitemap.xml').includes(`<loc>${SITE}${u}</loc>`), u);
  assert.ok(read('llms.txt').includes(`${SITE}/news/`) && read('llms.txt').includes(`${SITE}/blog/`));
});
