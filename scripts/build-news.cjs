// Build the 학원 소식 (/news/) and 블로그 (/blog/) pages, the upcoming-event strip on the
// main page and the 학원소식 list on the middle page, from data/news.json and the blog feed.
//   node scripts/build-news.cjs          build from the saved blog snapshot
//   node scripts/build-news.cjs --sync   refresh data/blog-posts.json from the RSS feed first
const fs = require('node:fs');
const path = require('node:path');
const { BLOG_URL, fetchPosts } = require('../api/_rss.js');

const root = path.resolve(__dirname, '..');
const SITE = 'https://math-standard.co.kr';
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const WEEK = '일월화수목금토';
const kst = iso => new Date(Date.parse(iso) + 9 * 3600e3);
const dayLabel = iso => { const d = kst(iso); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일(${WEEK[d.getUTCDay()]})`; };
const timeLabel = iso => { const d = kst(iso); const h = d.getUTCHours(), m = d.getUTCMinutes(); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시${m ? ` ${m}분` : ''}`; };
const dotDate = ymd => ymd.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$1. $2. $3.');

function replaceBetween(html, name, inner, file) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(html)) throw new Error(`${file}: missing <!-- ${name}:start/end --> markers`);
  return html.replace(re, `$1\n${inner}\n$2`);
}

function page({ r, title, description, canonical, head = '', body, scripts = '' }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="딱풀리는수학 진접점 · 수학의 기준 진접본원">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#13233f">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/news.css">
${head}</head>
<body>
<a class="skip" href="#main">본문 바로가기</a>
<header class="nbar">
  <div class="nin">
    <a class="nbrand" href="${r}">진접 수학 · 수학의 기준</a>
    <nav class="nnav" aria-label="주 메뉴">
      <a href="${r}news/"${canonical.endsWith('/news/') || canonical.includes('/news/2') ? ' aria-current="page"' : ''}>학원 소식</a>
      <a href="${r}blog/"${canonical.endsWith('/blog/') ? ' aria-current="page"' : ''}>블로그</a>
      <a href="${r}curriculum">고교학점제·진로 탐색</a>
      <a href="${r}rural/">농어촌 전형</a>
    </nav>
    <a class="ncall" href="tel:0315225431">상담 전화</a>
    <a class="ncall kakao" href="http://pf.kakao.com/_yWFTn/chat" target="_blank" rel="noopener">카톡 상담</a>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="nfoot">딱풀리는수학 진접점 · 수학의 기준 진접본원 · <a href="tel:0315225431">031-522-5431</a> · 남양주시 진접읍 해밀예당1로 40 화성프라자 5층</footer>
<script src="${r}assets/news.js" defer></script>
${scripts}</body>
</html>
`;
}

// ---------- data ----------
async function loadPosts() {
  const file = 'data/blog-posts.json';
  if (process.argv.includes('--sync')) {
    const posts = await fetchPosts();
    write(file, JSON.stringify({ source: BLOG_URL, fetchedAt: new Date().toISOString(), posts }, null, 2) + '\n');
    console.log(`synced ${posts.length} posts`);
  }
  return JSON.parse(read(file)).posts;
}

const items = JSON.parse(read('data/news.json')).items
  .slice().sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
const now = Date.now();
const upcoming = items.filter(i => Date.parse(i.endsAt) > now);
const past = items.filter(i => Date.parse(i.endsAt) <= now).reverse();

// ---------- pieces ----------
const when = i => `${dayLabel(i.startsAt)} ${timeLabel(i.startsAt)}`;
const newsCard = (i, r) => `<li class="ncard" data-ends="${i.endsAt}" data-starts="${i.startsAt}">
  <a href="${r}news/${i.slug}/">
    <img src="${r}${i.image}" width="800" height="800" alt="${esc(i.imageAlt)}" loading="lazy">
    <span class="nbody">
      <span class="nchips"><span class="chip">${esc(i.kind)}</span><span class="dday" data-dday></span></span>
      <b>${esc(i.title)}</b>
      <span class="nwhen">${esc(when(i))}</span>
      <span class="nsum">${esc(i.summary)}</span>
      <span class="nmore">자세히 보기 →</span>
    </span>
  </a>
</li>`;

const postCard = p => `<li class="pcard" data-cat="${esc(p.category)}">
  <a href="${esc(p.url)}" target="_blank" rel="noopener">
    ${p.thumb ? `<img src="${esc(p.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span class="noimg" aria-hidden="true">수학의 기준</span>'}
    <span class="pbody"><span class="chip">${esc(p.category)}</span><b>${esc(p.title)}</b><span class="psum">${esc(p.summary)}</span><time datetime="${p.date}">${dotDate(p.date)}</time></span>
  </a>
</li>`;

async function main() {
  const posts = await loadPosts();

  // /news/
  write('news/index.html', page({
    r: '../',
    title: '학원 소식 · 설명회 안내 | 수학의 기준 진접본원',
    description: '진접 수학학원 수학의 기준·딱풀리는수학의 설명회, 이벤트, 학원 소식을 모아 안내합니다.',
    canonical: `${SITE}/news/`,
    body: `<section class="nhero"><div class="nin">
  <p class="eyebrow">NEWS</p>
  <h1>학원 소식</h1>
  <p>설명회·이벤트 일정과 학원 소식을 안내합니다. 수업 이야기와 학습 정보는 <a href="../blog/">블로그</a>에서 볼 수 있습니다.</p>
</div></section>
<section class="nsec"><div class="nin">
  <h2>다가오는 설명회·이벤트</h2>
  <ul class="ngrid" data-upcoming>
${upcoming.map(i => newsCard(i, '../')).join('\n')}
  </ul>
  <p class="nempty" data-empty${upcoming.length ? ' hidden' : ''}>예정된 설명회·이벤트가 없습니다. 새 일정은 <a href="${BLOG_URL}" target="_blank" rel="noopener">네이버 블로그</a>와 카카오톡 채널로도 안내합니다.</p>
</div></section>
<section class="nsec past"${past.length ? '' : ' hidden'} data-past-wrap><div class="nin">
  <h2>지난 소식</h2>
  <ul class="ngrid" data-past>
${past.map(i => newsCard(i, '../')).join('\n')}
  </ul>
</div></section>`,
  }));

  // /news/<slug>/
  for (const i of items) {
    const url = `${SITE}/news/${i.slug}/`;
    const event = {
      '@context': 'https://schema.org', '@type': 'Event', name: `수학의 기준 ${i.title}`,
      description: i.summary, startDate: i.startsAt, endDate: i.endsAt, image: `${SITE}/${i.image}`, url,
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: '수학의 기준 진접본원', address: { '@type': 'PostalAddress', streetAddress: '해밀예당1로 40 화성프라자 5층', addressLocality: '남양주시 진접읍', addressRegion: '경기도', addressCountry: 'KR' } },
      organizer: { '@type': 'EducationalOrganization', name: '수학의 기준 진접본원', url: `${SITE}/` },
    };
    write(`news/${i.slug}/index.html`, page({
      r: '../../',
      title: `${i.title} · ${dayLabel(i.startsAt)} | 수학의 기준 진접본원`,
      description: `${when(i)}, ${i.summary}`,
      canonical: url,
      head: `<meta property="og:image" content="${SITE}/${i.image}">\n<script type="application/ld+json">${JSON.stringify(event)}</script>\n`,
      body: `<article class="nin detail" data-ends="${i.endsAt}" data-starts="${i.startsAt}">
  <p class="crumb"><a href="../">학원 소식</a> › ${esc(i.kind)}</p>
  <div class="dgrid">
    <img class="poster" src="../../${i.image}" width="800" height="800" alt="${esc(i.imageAlt)}">
    <div>
      <p class="nchips"><span class="chip">${esc(i.kind)}</span><span class="dday" data-dday></span><span class="ended" data-ended hidden>종료된 행사입니다</span></p>
      <h1>${esc(i.title)}</h1>
      <p class="dhead">${esc(i.headline)}</p>
      <dl class="facts">
${i.facts.map(([k, v]) => `        <div><dt>${esc(k)}</dt><dd>${k === '참석 문의' ? `<a href="tel:${v.replace(/-/g, '')}">${esc(v)}</a>` : esc(v)}</dd></div>`).join('\n')}
      </dl>
      <div class="dctas" data-apply>
        <a class="btn primary" href="${esc(i.applyUrl)}" target="_blank" rel="noopener">${esc(i.applyLabel)}</a>
        <a class="btn" href="tel:0315225431">전화로 문의하기</a>
      </div>
    </div>
  </div>
  <section class="agenda">
    <h2>설명회에서 다루는 내용</h2>
    <ol>
${i.agenda.map(a => `      <li>${esc(a)}</li>`).join('\n')}
    </ol>
    <p class="blogcta">설명회 준비 과정과 겨울방학 공부 팁은 블로그 글에 자세히 적었습니다. <a href="${esc(i.blogUrl)}" target="_blank" rel="noopener">블로그에서 전체 글 읽기 →</a></p>
  </section>
  <p class="back"><a href="../">← 학원 소식 목록</a> · <a href="../../blog/">블로그 글 보기</a></p>
</article>`,
    }));
  }

  // /blog/
  const cats = [...new Set(posts.map(p => p.category))];
  write('blog/index.html', page({
    r: '../',
    title: '블로그 · 수학 공부와 시험 분석 | 수학의 기준 진접본원',
    description: '진접 수학학원 수학의 기준 네이버 블로그 글을 주제별로 모았습니다. 학교별 시험 분석, 학습 정보, 농어촌 전형, 학원 수업 안내.',
    canonical: `${SITE}/blog/`,
    body: `<section class="nhero"><div class="nin">
  <p class="eyebrow">BLOG</p>
  <h1>블로그</h1>
  <p>수학의 기준 네이버 블로그에 올린 글입니다. 새 글을 올리면 이 목록에도 자동으로 추가됩니다. 글을 누르면 네이버 블로그에서 열립니다.</p>
</div></section>
<section class="nsec"><div class="nin">
  <div class="filters" role="group" aria-label="블로그 주제" data-filters>
    <button type="button" aria-pressed="true" data-cat="">전체</button>
${cats.map(c => `    <button type="button" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join('\n')}
  </div>
  <ul class="pgrid" data-posts>
${posts.map(postCard).join('\n')}
  </ul>
  <p class="nempty"><a href="${BLOG_URL}" target="_blank" rel="noopener">네이버 블로그 바로가기 →</a></p>
</div></section>`,
    scripts: `<script src="../assets/blog.js" defer></script>\n`,
  }));

  // main page strip
  let index = read('index.html');
  index = replaceBetween(index, 'news', upcoming.length ? `<section class="news-strip" aria-label="다가오는 설명회·이벤트" data-news-strip>
  <div class="in">
${upcoming.map(i => `    <a class="news-item" href="./news/${i.slug}/" data-ends="${i.endsAt}" data-starts="${i.startsAt}"><span class="chip">${esc(i.kind)}</span><span class="dday" data-dday></span><b>${esc(when(i))} · ${esc(i.title)}</b><span class="go-more">자세히 보기 →</span></a>`).join('\n')}
  </div>
</section>` : '', 'index.html');
  write('index.html', index);

  // middle page 학원소식
  let middle = read('middle/index.html');
  middle = replaceBetween(middle, 'news', `${upcoming.map(i => `      <li data-card data-ends="${i.endsAt}"><a href="../news/${i.slug}/"><span class="tag">${esc(i.kind)}</span><b>${esc(when(i))} ${esc(i.title)}</b><span class="meta"><time datetime="${i.startsAt.slice(0, 10)}">${i.startsAt.slice(0, 10)}</time><svg class="ico sm"><use href="#i-arrow"/></svg></span></a></li>`).join('\n')}
${posts.filter(p => !upcoming.some(i => i.blogUrl === p.url)).slice(0, 3 - Math.min(upcoming.length, 1)).map(p => `      <li data-card><a href="${esc(p.url)}" target="_blank" rel="noopener"><span class="tag">블로그</span><b>${esc(p.title)}</b><span class="meta"><time>${p.date}</time><svg class="ico sm"><use href="#i-arrow"/></svg></span></a></li>`).join('\n')}`, 'middle/index.html');
  write('middle/index.html', middle);

  console.log(JSON.stringify({ upcoming: upcoming.map(i => i.slug), past: past.length, posts: posts.length, categories: cats }));
}

main().catch(e => { console.error(e); process.exit(1); });
