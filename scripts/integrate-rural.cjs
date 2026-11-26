// Rebuild rural/index.html from the shared explorer; never write to the supplied original.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const original = path.join('새 폴더', '2028_농어촌전형_탐색기_by Claude.html');
const input = fs.readFileSync(path.join(root, original));
let html = input.toString('utf8');
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error('Original source changed: ' + from.slice(0, 90));
  html = html.replace(from, to);
};
const url = 'https://math-standard.co.kr/rural/';
const title = '2028 농어촌학생 특별전형 탐색기 | 수학의 기준 진접본원';
const description = '2028학년도 농어촌학생 특별전형의 수시·정시 전형을 대학·지역·전형 유형·6년형/12년형 자격별로 찾아보는 무료 탐색기입니다.';
replace('<title>2028 농어촌전형 탐색기</title>', `<title>${title}</title>
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
<meta name="theme-color" content="#1f5640">`);
replace('</head>', `<style>
/* Integration chrome only. It sits above the sticky header so the original offsets still hold. */
.academy-links{display:flex;flex-wrap:wrap;gap:8px;padding:8px 20px;background:#13233f;color:#fff}
.academy-links a{display:inline-flex;align-items:center;min-height:40px;padding:5px 12px;color:#fff;text-decoration:none;border:1px solid #6d7c93;font-size:14px}
.academy-links a:last-child{border-color:#d7bc73;color:#f4dd9d}
.usage-note{margin:0 0 16px;padding:12px 14px;border:1px solid var(--line);background:var(--panel);border-radius:8px;font-size:13px;color:var(--muted)}
.usage-note b{color:var(--ink)}.usage-note p{margin:4px 0 0}
.skip-link{position:absolute;left:12px;top:-100px;z-index:100;background:var(--panel);color:var(--ink);padding:12px}
.skip-link:focus{top:8px}
@media(max-width:600px){.academy-links{padding:8px 16px}.academy-links a{font-size:13px;padding:4px 10px}}
</style>
</head>`);
replace('<body>\n<header class="top">', `<body>
<a class="skip-link" href="#main">본문 바로가기</a>
<nav class="academy-links" aria-label="학원 안내">
  <a href="../index.html">수학의 기준 홈으로</a>
  <a href="../curriculum">고교학점제·진로 탐색</a>
  <a href="../middle/index.html#contact">학습·진학 상담 신청</a>
</nav>
<header class="top">`);
replace('<h1>2028 농어촌학생 특별전형 탐색기</h1>', '<h1>수학의 기준 | 2028 농어촌학생 특별전형 탐색기</h1>');
replace('<footer class="ft">', `<aside class="usage-note" aria-label="자료 이용 안내">
  <b>자료 이용 안내</b>
  <p>이 탐색기는 공유받은 '[모두의 진학] 농어촌학생 요약 - 수시 &amp; 정시 (2028)'(강원사대부고 박상근 선생님)를 정리한 참고용 서비스입니다. 원문은 2028학년도 대학입학전형시행계획입니다.</p>
  <p>농어촌 전형 지원 자격은 거주지·학교 소재지·이수 기간과 대학별 세부 기준에 따라 달라집니다. 지원 전 반드시 각 대학 최종 모집요강을 확인하세요.</p>
</aside>
<footer class="ft">`);
// File URLs do not resolve directory indexes like an HTTP static host does.
replace('</body>', `<script>
if (location.protocol === 'file:') document.querySelectorAll('.academy-links a[href$="curriculum"]').forEach(a => a.setAttribute('href', a.getAttribute('href') + '/index.html'));
document.querySelector('.skip-link').addEventListener('click', e => { const m = document.querySelector('main'); if (!m) return; e.preventDefault(); m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView(); });
</script>
</body>`);
fs.mkdirSync(path.join(root, 'rural'), { recursive: true });
fs.writeFileSync(path.join(root, 'rural/index.html'), html);
const sha = crypto.createHash('sha256').update(input).digest('hex');
console.log(JSON.stringify({ original, originalBytes: input.length, originalSha256: sha, outputBytes: Buffer.byteLength(html) }, null, 2));
