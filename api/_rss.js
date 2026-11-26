// Shared by the /api/blog function and scripts/build-news.cjs. No dependencies.
const BLOG_ID = 'standrad-of-math';
const FEED_URL = `https://rss.blog.naver.com/${BLOG_ID}.xml`;
const BLOG_URL = `https://blog.naver.com/${BLOG_ID}`;

const decode = s => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
// Naver sometimes stores no-break spaces in titles and categories; filters compare plain text.
const clean = s => decode(s).replace(/\s+/g, ' ').trim();
const field = (item, tag) => {
  const m = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return m ? m[1].trim() : '';
};

// Naver serves list thumbnails from blogthumb.pstatic.net, which refuses other sites.
// The same path on mblogthumb-phinf with a size type loads on any page.
function thumbUrl(description) {
  const m = description.match(/<img[^>]+src="([^"]+)"/);
  if (!m) return '';
  const u = decode(m[1]).replace('://blogthumb.pstatic.net/', '://mblogthumb-phinf.pstatic.net/');
  return u.replace(/\?type=[^"&]*/, '') + '?type=w320';
}

function kstDate(pubDate) {
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return '';
  return new Date(t + 9 * 3600e3).toISOString().slice(0, 10);
}

function parseFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const link = field(item, 'guid') || field(item, 'link').split('?')[0];
    const description = field(item, 'description');
    const text = decode(description.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    return {
      id: link.split('/').pop(),
      url: link,
      title: clean(field(item, 'title')),
      category: clean(field(item, 'category')) || '기타',
      date: kstDate(field(item, 'pubDate')),
      summary: text.length > 110 ? text.slice(0, 110).replace(/\s+\S*$/, '') + '…' : text,
      thumb: thumbUrl(description),
    };
  }).filter(p => /^https:\/\/blog\.naver\.com\//.test(p.url) && p.title);
}

async function fetchPosts() {
  const res = await fetch(FEED_URL, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; math-standard-site)' } });
  if (!res.ok) throw new Error('RSS ' + res.status);
  const posts = parseFeed(await res.text());
  if (!posts.length) throw new Error('RSS has no posts');
  return posts;
}

module.exports = { BLOG_ID, BLOG_URL, FEED_URL, parseFeed, fetchPosts };
