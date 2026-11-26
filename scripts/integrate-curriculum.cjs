// Rebuild only the integration copy; never write to the supplied original.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const original = '2022개정_과목전공_교차탐색관.html';
const input = fs.readFileSync(path.join(root, original));
let html = input.toString('utf8');
const rawData = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(rawData);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error('Original source changed: ' + from.slice(0, 90));
  html = html.replace(from, to);
};
const title = '고교학점제 과목·전공 탐색관 | 수학의 기준 진접본원';
const description = '2022 개정 교육과정의 고등학교 선택 과목과 대학 전공, 2028 대학별 권장과목을 함께 살펴보는 무료 진로 탐색 서비스입니다.';
replace('<title>과목·전공 교차 탐색관</title>', `<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://math-standard.co.kr/curriculum">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="https://math-standard.co.kr/curriculum">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="수학의 기준 진접본원">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="theme-color" content="#13233f">`);
replace('</head>', `<style>
/* Integration chrome only; original chart colours retain their meaning. */
header.top{border-top-color:#13233f}
.academy-links{display:flex;flex-wrap:wrap;gap:8px;padding:8px max(3vw,14px);background:#13233f;color:#fff}
.academy-links a{display:inline-flex;align-items:center;min-height:40px;padding:5px 12px;text-decoration:none;border:1px solid #6d7c93;font-size:14px}
.academy-links a:last-child{border-color:#d7bc73;color:#f4dd9d}
.brand b{font-size:clamp(15px,2vw,19px);line-height:1.5}
.brand b i{color:light-dark(#806019,#e0c477)}
.usage-note{max-width:1240px;margin:16px auto;padding:16px;border:1px solid var(--line);background:var(--soft);font-size:14px}
.usage-note p{margin:6px 0 0}.usage-note a{display:inline-block;margin:8px 0;min-height:24px}
.skip-link{position:absolute;left:12px;top:-100px;z-index:100;background:var(--bg);padding:12px}
.skip-link:focus{top:8px}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid light-dark(#806019,#e0c477);outline-offset:3px}
@media(max-width:600px){header.top{position:relative}.gs{flex-basis:100%}.brand span{line-height:1.6}.chip{white-space:normal;overflow-wrap:anywhere}.cards{grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr))}.bars .row{grid-template-columns:minmax(0,130px) minmax(0,1fr) 48px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>
</head>`);
replace('<header class="top">', `<a class="skip-link" href="#app">본문 바로가기</a>
<header class="top">
  <nav class="academy-links" aria-label="학원 안내">
    <a href="../index.html" data-academy-link="index.html">수학의 기준 홈으로</a>
    <a href="../curriculum/planner/index.html" data-academy-link="curriculum/planner/">학교별 6학기 선택 설계</a>
    <a href="../middle/index.html#contact" data-academy-link="middle/#contact">학습·진학 상담 신청</a>
  </nav>`);
replace('<b>과목·전공 <i>교차</i> 탐색관</b><span>2022 개정 교육과정 · 2028 대학별 권장과목</span>', '<b>수학의 기준 | 과목·전공 <i>교차</i> 탐색관</b><span>2022 개정 교육과정 · 고교학점제 · 2028 대입 참고자료</span>');
replace('<main id="app"></main>', `<aside class="usage-note" aria-labelledby="usage-title">
  <b id="usage-title">자료 이용 안내</b>
  <p>본 탐색관은 2022 개정 교육과정과 공개된 대학별 권장과목 자료를 바탕으로 제작한 참고용 서비스입니다. 대학별 권장과목은 필수 이수 조건과 다를 수 있으며, 실제 반영 기준은 대학별 최신 모집요강을 확인해야 합니다.</p>
  <p>교차 진단의 비율은 담은 과목과 권장 과목이 겹치는 정도이며, 공식적인 진로 적합성 판정이나 합격 가능성을 뜻하지 않습니다. 학교별 과목 개설 여부도 확인해 주세요.</p>
</aside>
<noscript><p class="usage-note">과목·학과 검색과 교차 진단에는 JavaScript가 필요합니다. 학습 상담은 <a href="../middle/index.html#contact">중·고등 상담 안내</a>에서 확인하세요.</p></noscript>
<main id="app" tabindex="-1"></main>
<script>
// Relative links also work on the slashless rewrite and under a project prefix.
if (location.pathname.endsWith('/curriculum')) {
  document.querySelectorAll('[data-academy-link]').forEach(a => a.setAttribute('href', './' + a.dataset.academyLink));
}
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('app').focus();
  document.getElementById('app').scrollIntoView();
});
</script>`);
replace("let basket=[];try{basket=JSON.parse(localStorage.getItem('xbasket')||'[]').filter(i=>S[i])}catch(e){}", `let basket=[];try{const saved=JSON.parse(localStorage.getItem('xbasket')||'[]');if(Array.isArray(saved))basket=[...new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<S.length&&S[i]?.id===i))]}catch(e){}`);
replace("({home:vHome,subjects:vSubjects,majors:vMajors,univ:vUniv,matrix:vMatrix,cross:vCross,basics:vBasics,search:vSearch}[v]||vHome)();", "const routes={home:vHome,subjects:vSubjects,majors:vMajors,univ:vUniv,matrix:vMatrix,cross:vCross,basics:vBasics,search:vSearch};\n  (Object.hasOwn(routes,v)?routes[v]:vHome)();");
replace('${a} 영역', '${esc(a)} 영역');
replace("${(s.area||[]).join('·')||'세부'} 영역 단위로 언급", "${esc((s.area||[]).join('·')||'세부')} 영역 단위로 언급");
fs.mkdirSync(path.join(root, 'curriculum'), { recursive: true });
fs.writeFileSync(path.join(root, 'curriculum/index.html'), html);
const manifest = {
  original, originalBytes: input.length, originalSha256: sha(input),
  jsonBytes: Buffer.byteLength(rawData), jsonSha256: sha(rawData),
  counts: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.length : Object.keys(value).length])),
  universities: new Set(data.U.map(u => u.u)).size,
  representativeUnits: new Set(data.R.map(r => r.m)).size
};
fs.writeFileSync(path.join(root, 'docs/curriculum-source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
