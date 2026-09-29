# Site Split PHASE 2 — 2026-09-29

## Gate A

- 시작: repository `D:\claude\math-standard-landing-page-main`, branch `site-split-phase1`; PHASE 1 uncommitted 변경을 보존. 당시 HEAD/main/origin/main=`db4ea58d4ac7413b066ed7891285675ef37b7cda`, 37/37 PASS. 재개 시 Gate A release `9305ca6` 및 배포가 완료돼 있었고 Gate B 변경이 미커밋 상태였음.
- 신규 프로젝트 `ddaksoojj`, ID `prj_UsZLFQh0vkNN7ZUeJh4BgXwak0oc`. Root Directory `elementary-site`, static, output `.`. 기존 연결 파일을 복사하지 않음.
- Vercel domains API의 실제 verified domain을 확인한 뒤 SEO 확정: https://ddaksoojj.vercel.app/
- canonical/OG/Twitter URL은 위 루트. HTML `index, follow`; robots `Allow: /`, Sitemap `https://ddaksoojj.vercel.app/sitemap.xml`.
- 실제 sitemap XML은 신규 루트 한 개. llms는 초등 브랜드·과정·상담 안내와 실제 URL만 사용. 템플릿·내부 설정은 공개되지 않음.
- JSON-LD의 `/#website`, `/#webpage`, `/#academy`, `/#faq-data`는 신규 origin의 독립 ID. academy는 EducationalOrganization/LocalBusiness. 기존 인증 태그 복사 없음.
- release commit `9305ca6`; deployment `dpl_9EEdfzvqLsqyS1rwk2iPg1MTsDeh`, READY.
- 10개 runtime 파일만 실제 CLI dry-run 및 배포에 포함. HTTP/Content-Type/정확한 source bytes/SEO/404/XML/JSON-LD 검증 PASS.
- 실제 Desktop 1440px 및 Mobile 390×844: 이미지·FAQ·전화·상담 복사 성공/실패·이탈 팝업·중고등 전환 클릭·native back PASS. 콘솔/page/resource 오류 0. 실제 상담 전송 없음.
- Gate A 종료 때 기존 Production 주요 7 URL hash가 배포 전과 동일. **ELEMENTARY READY** 이후에만 Gate B 진행.
- 근거: [HTTP](site-split-phase2-gate-a/http.json), [브라우저](site-split-phase2-gate-a/browser.json), [배포](site-split-phase2-gate-a-deployment.json), [배포 입력](site-split-phase2-gate-a-inputs.json).

## Gate B

- 기존 프로젝트 `math-standard-landing-page` / `prj_AlwQYATNVr6n7Pb9s9wWCtgCUgaa` 유지.
- 기존 대표 URL https://math-standard-landing-page.vercel.app/ 유지. 프로젝트 이름·도메인·alias·root 연결·기존 vercel.json 변경 없음. Git 자동 배포 연결 없음.
- root `.vercel/project.json` SHA-256: `f154a30543e5001627aee3a6d1b64c7fd6990755a82b50c3726085337c740929` (변경 없음).
- index를 수학의 기준 진접본원 중·고등 메인으로 전환. 기존 대표 canonical과 stable entity ID 및 상담·학교별 내신·풍양중 링크 유지. root/secondary의 작은 초등 브랜드 링크를 실제 신규 URL로 확정.
- release commit `9b5fa17e296674736298584ff43fb0b868d6194e`. main으로 fast-forward 후 normal push 성공. force/amend/history rewrite 없음.
- deployment `dpl_Hy4BNLqNkH26pJ8JQpQsyqZozdxn`, READY. Deployment URL https://math-standard-landing-page-8uzey0054.vercel.app . 기존 Production alias에 배포 완료.
- 실제 배포 21개 파일. 초등 폴더 제외. `/elementary-site/`, `/elementary-site/index.html`, `/elementary-site/assets/site.js` 모두 404.
- root, 두 Pilot, public JSON, 두 legacy, robots/sitemap/llms 모두 200 및 로컬 source bytes 일치. Pilot canonical·JSON-LD·publisher·Breadcrumb·provenance는 보호 원본 그대로. noindex 없음, robots 허용, sitemap 유지. Google 계정 내부 색인 상태는 이번 작업에서 조회하지 않음.
- 풍양중 데이터: 전체 **21/100**, 선택형 **17/80**, 논술형 **4/20**, 이차방정식 **9/40**, 인수분해 **5/26**, 통계 **7/34**, 난이도 **하5/중10/상6**. 난이도 **Academy Analysis**, humanReviewed true 유지. live JSON 값을 직접 assert했으며, HTML/JSON 원본 byte 일치와 기존 데이터·Pilot 테스트로 화면 집계 일치 확인.
- 중고등 sitemap은 루트, `/schools/pungyang-middle/`, `/exams/pungyang-middle/2026-g3-s1-final/` 정확히 3개. robots는 기존 sitemap과 허용 정책 유지. llms는 중고등·풍양중 Hub·시험분석 안내.
- Google verification `4zFCuW52coMGJ_e8J7AZI-Wz93dqFQlZFPkAnNHbB5Q` 유지.
- Naver verification `171a5a6dcfe42518d66f36ee407638acb8c02e42` 유지.
- 양방향 실제 브랜드 클릭 및 native back을 양쪽 사이트 × Desktop/Mobile에서 PASS. FAQ·전화·상담 복사·이탈 팝업·이미지·overflow 정상. console/page/resource 오류 0, 실제 상담 전송 없음.
- 근거: [HTTP](site-split-phase2-gate-b/http.json), [브라우저](site-split-phase2-gate-b/browser.json), [배포](site-split-phase2-gate-b-deployment.json), [배포 입력](site-split-phase2-gate-b-inputs.json).

## Legacy

- `secondary.html`: 200, canonical은 기존 루트, sitemap 제외, 301 없음.
- `elementary.html`: 200, 기존 본문·self canonical·파일 bytes 보존, sitemap 제외, cross-domain canonical/301 없음.
- 신규 초등 등록·색인 및 광고 준비 확인 후 기존 초등 주소의 301 이전을 별도 작업으로 권장. 기존 본문을 계속 제공해야 하는 요구가 있으면 cross-domain canonical을 대안으로 검토. 이번에는 적용하지 않음.

## Search Registration

- Google 신규 URL-prefix: `https://ddaksoojj.vercel.app/`.
- Naver 신규 사이트: `https://ddaksoojj.vercel.app/`.
- 두 곳 모두 신규 sitemap: `https://ddaksoojj.vercel.app/sitemap.xml`.
- 사용자가 신규 인증 태그 발급 → 초등에 실제 태그 적용/배포 → 소유 확인 및 제출. 기존 태그를 복사하지 않음.
- Powerlink: 신규 URL로 ‘딱풀리는수학 진접점’ 별도 비즈채널 등록 예정. 기존 승인 URL·광고 설정 변경 없음.
- 계정 작업은 수행하지 않음. 상세: [검색 등록 안내](../../docs/search-registration.md).

## Verification

- Node tests **37/37 PASS**. 기존 테스트 삭제·skip 없음; Pilot/data/interaction 원본 유지. 보호 26개 파일 hash 일치.
- main 통합 후에도 Node 37/37 PASS. 기존/초등 site.js 및 초등 exit-offer.js syntax PASS. git diff whitespace 검사 PASS.
- 로컬 독립 document root: 6개 경로 × 360/390/768/1440px, 링크·상담·FAQ·뒤로가기·no-JS·상대경로 PASS. [결과](site-split-phase2-local/results.json).
- 실제 Production Gate A/B의 HTTP·브라우저 검증 모두 PASS. 두 live sitemap XML parse 및 초등 JSON-LD parse PASS.
- 공통 `.hermes/scripts/run_quality_checks.ps1`는 현재 작업공간에 없어 SKIP. 위 사이트 검증으로 대체했다는 의미가 아님.
- QA 중 Edge 153 full-page screenshot 이후 touch emulation 해제가 재현되어 스크린샷을 동작 검사 뒤로 이동. 실제 체류 타이머로 재검증 통과. 사이트 JS는 수정하지 않음.

## Known Risks

- 신규 검색 소유 확인·사이트맵 제출·색인·파워링크 등록은 사용자 후속 작업. 기술적 수집 가능 상태가 검색 색인이나 광고 승인을 의미하지 않음.
- 기존 초등과 신규 초등의 유사 콘텐츠가 당분간 공존. 사용자 지정 단계적 이전 정책에 따름.
- 보호 우선으로 Pilot/legacy schema의 과거 통합 브랜드 명칭은 유지. stable entity ID와 publisher를 임의 변경하지 않음.
- Git 자동 배포는 연결하지 않았으므로 이후 변경도 각 프로젝트를 명확히 지정하여 배포해야 함.

## Final Decision

**SITE SPLIT COMPLETE**

두 독립 Production 운영 및 검증 완료. release 두 커밋은 main에 정상 푸시됐으며 최종 검증 기록은 별도 documentation commit으로 보관한다. 검색·광고 계정 작업과 legacy 후속 이전은 완료 범위에 포함하지 않는다.
