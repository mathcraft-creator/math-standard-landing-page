// Rebuild jungsi/index.html from the shared explorer; never write to the supplied original.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const original = path.join('새 폴더', '2027정시_지역별전형분석_탐색기.html');
const input = fs.readFileSync(path.join(root, original));
let html = input.toString('utf8');
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error('Original source changed: ' + from.slice(0, 90));
  html = html.replace(from, to);
};
const url = 'https://math-standard.co.kr/jungsi/';
const title = '2027 정시 지역별 전형분석 탐색기 | 수학의 기준 진접본원';
const description = '한국대학교육협의회 『2027학년도 정시모집 지역별 전형분석 자료집』을 바탕으로 16개 지역 대학의 정시 전형을 지역·모집군·대학별로 찾아보는 무료 탐색기입니다.';
replace('<title>2027 정시 지역별 전형분석 탐색기</title>', `<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="수학의 기준 진접본원">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="theme-color" content="#d4002a">`);
replace('</head>', `<style>
/* Integration chrome only. It sits above the original header; the sticky filter bar keeps top:0. */
.academy-links{display:flex;flex-wrap:wrap;gap:8px;padding:8px max(4vw,14px);background:#13233f;color:#fff}
.academy-links a{display:inline-flex;align-items:center;min-height:40px;padding:5px 12px;color:#fff;text-decoration:none;border:1px solid #6d7c93;font-size:14px}
.academy-links a:last-child{border-color:#d7bc73;color:#f4dd9d}
.usage-note{margin:16px max(4vw,14px);padding:12px 14px;border:1px solid var(--line);background:var(--card);border-radius:8px;font-size:13px;color:var(--mute)}
.usage-note b{color:var(--ink)}.usage-note p{margin:4px 0 0}
.skip-link{position:absolute;left:12px;top:-100px;z-index:100;background:var(--card);color:var(--ink);padding:12px}
.skip-link:focus{top:8px}
@media(max-width:600px){.academy-links a{font-size:13px;padding:4px 10px}}
@media print{.academy-links,.usage-note,.skip-link{display:none}}
</style>
</head>`);
replace('<body>\n<header class="top">', `<body>
<a class="skip-link" href="#main">본문 바로가기</a>
<nav class="academy-links" aria-label="학원 안내">
  <a href="../index.html">수학의 기준 홈으로</a>
  <a href="../curriculum">고교학점제·진로 탐색</a>
  <a href="../rural/">농어촌 전형</a>
  <a href="../middle/index.html#contact">학습·진학 상담 신청</a>
</nav>
<header class="top">`);
replace('<h1>2027 정시 지역별 전형분석 탐색기<small>', '<h1>수학의 기준 | 2027 정시 지역별 전형분석 탐색기<small>');
replace('<footer class="src" id="srcBand"></footer>', `<aside class="usage-note" aria-label="자료 이용 안내">
  <b>자료 이용 안내</b>
  <p>이 탐색기는 한국대학교육협의회 대입상담센터 『2027학년도 정시모집 지역별 전형분석 자료집』을 바탕으로 AITAMS 진로진학연구소가 만든 공유 자료를 학원 홈페이지에 옮겨 실은 참고용 서비스입니다.</p>
  <p>모집인원·반영 비율·전형 일정은 대학 사정에 따라 바뀔 수 있습니다. 지원 전 반드시 각 대학 최종 모집요강과 대입정보포털 어디가(adiga.kr)를 확인하세요.</p>
</aside>
<footer class="src" id="srcBand"></footer>`);
// File URLs do not resolve directory indexes like an HTTP static host does.
// The skip link must not change location.hash, because the explorer routes on it.
replace('</body>', `<script>
if (location.protocol === 'file:') document.querySelectorAll('.academy-links a').forEach(a => { const h = a.getAttribute('href'); if (h.endsWith('curriculum')) a.setAttribute('href', h + '/index.html'); else if (h.endsWith('/')) a.setAttribute('href', h + 'index.html'); });
document.querySelector('.skip-link').addEventListener('click', e => { const m = document.querySelector('main'); if (!m) return; e.preventDefault(); m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView(); });
</script>
</body>`);
fs.mkdirSync(path.join(root, 'jungsi'), { recursive: true });
fs.writeFileSync(path.join(root, 'jungsi/index.html'), html);
const sha = crypto.createHash('sha256').update(input).digest('hex');
console.log(JSON.stringify({ original, originalBytes: input.length, originalSha256: sha, outputBytes: Buffer.byteLength(html) }, null, 2));
