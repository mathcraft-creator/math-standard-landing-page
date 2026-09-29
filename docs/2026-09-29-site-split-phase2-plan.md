# Site Split PHASE 2 — two deployment gates

사용자의 PHASE 2 요청서에 따라 신규 초등 프로젝트 생성·배포, 검증 후 기존 중·고등 전환, normal commit/push가 승인되었다. PHASE 1의 배포 금지 기록은 당시 이력이며 현재 실행 범위에는 이 계획이 우선한다.

## 보호 대상

기존 프로젝트 `math-standard-landing-page`, Production URL, `.vercel/project.json`, root vercel.json, Google/Naver 인증, Pilot HTML/JSON/schema/기존 보고서 및 기존 elementary.html을 보존한다. 프로젝트 rename/delete, 기존 alias 변경/삭제, 301, force push, amend, history rewrite, 검색·광고 계정 변경은 하지 않는다.

## GATE A

- [x] PHASE 1 uncommitted 변경 확인. branch `site-split-phase1`, HEAD/main/origin/main=`db4ea58`; baseline 37/37 및 JS/diff PASS.
- [x] 기존 Vercel 연결·Git 자동 배포 상태를 읽기 전용으로 확인하고 기존 Production/Pilot 응답 hash를 기록한다. GATE A 종료 전 기존 프로젝트 배포나 main push를 하지 않는다.
- [x] 별도 신규 프로젝트 생성: `ddaksoojj` 우선, root `elementary-site`, framework null, build/install 없음, output `.`. 기존 root 연결 파일을 바꾸거나 복사하지 않는다.
- [x] Vercel이 실제 배정한 Production 도메인을 조회한다. 신규 프로젝트 생성 직후 domains API에서 verified `ddaksoojj.vercel.app`을 확보하여 임시 배포 없이 SEO를 확정했다.
- [x] 실제 origin을 canonical/OG/Twitter URL/JSON-LD/sitemap/robots/llms/seo-config에 반영하고 HTML noindex와 robots 차단을 함께 해제한다. 화면에 없는 Schema 정보를 추가하지 않는다.
- [x] 테스트를 draft→확정 상태의 강한 계약으로 갱신하고 Node·독립 로컬 서버·배포 파일 목록 검사. 기존 검증 목적과 보호 hash를 유지한다.
- [x] 필요한 변경을 normal release commit으로 기록한다. 신규 프로젝트만 배포한다.
- [x] 실제 초등 HTTP/SEO/404/Desktop/390×844/상담·FAQ·이탈팝업·기존 브랜드 링크 검증. 기존 Production hash가 그대로인지 확인하고 **ELEMENTARY READY** 판정.

## GATE B (A 통과 뒤에만)

- [x] index/secondary의 초등 브랜드 링크를 확인된 신규 Production root로 변경한다. elementary legacy는 self canonical과 기존 본문을 그대로 유지한다.
- [ ] root 메타데이터/인증/3 URL sitemap/robots/llms 및 초등 제외 allowlist 최종 검사.
- [ ] normal commit/push를 허용된 범위에서 수행한다. Git 연결로 기존 프로젝트가 자동 배포될 수 있으면 A 검증 전에는 push하지 않는다. 기존 main 이력을 보존한다.
- [ ] 기존 프로젝트/도메인을 그대로 사용하여 root 배포. 신규/기존 deployment ID를 기록한다.
- [ ] 기존 root/legacy/Pilot/public JSON/discovery 파일 회귀, 보호 수치, noindex 부재, 양방향 브랜드 클릭, `/elementary-site/` 비노출 확인.
- [ ] `.seo/reports/site-split-phase2.md`, WORKLOG 및 사용자가 직접 할 Google/Naver/Powerlink 등록 주소를 기록하고 별도 documentation commit/push. 최종 Git 상태 확인.

## 완료 기준

실제 GATE A/B 검증을 모두 통과해야 SITE SPLIT COMPLETE로 판정한다. 배포·계정 접근이 막히면 실제 중단 위치와 이미 수행한 변경을 기록하며 미실행 검사를 PASS로 표시하지 않는다.
