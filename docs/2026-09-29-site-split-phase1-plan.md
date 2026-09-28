# 중·고등 / 초등 사이트 분리 PHASE 1

사용자의 2026-09-29 요청서가 기존 3페이지 통합사이트 계획보다 우선한다. 이 계획은 로컬 구현·검증만 포함한다. commit, push, merge, 프로젝트 생성, Preview/Production 배포, 계정 설정 변경, redirect는 수행하지 않는다.

## 설계

- 한 저장소를 유지하고 기존 루트를 중·고등 사이트로, `elementary-site/`를 초등 독립 document root로 사용한다. 별도 저장소는 Pilot 및 Git 이력을 불필요하게 분산하므로 선택하지 않는다.
- `secondary.html`의 수업 콘텐츠를 `index.html`에 보존하고 브랜드·내부 메뉴·상담 선택을 중·고등으로 정리한다. 루트 인증 태그는 원문 그대로 유지한다. secondary는 삭제하지 않고 canonical/OG를 루트로 통일한다.
- `elementary.html`, `schools/`, `exams/`, `data/`, Pilot 테스트·기존 보고서·공통 assets·Vercel 연결 파일은 보존한다. Pilot의 홈 링크는 이미 index.html이며, 남아 있는 secondary 링크는 계속 작동하므로 PHASE 1에서 손대지 않는다.
- 기존 `/#academy`, `/#secondary-academy`, `/#website` 식별자를 유지한다. 루트 academy 이름을 중·고등 브랜드로 정리하고 기존 통합 명칭을 alternateName으로 기록한다. 보호 대상의 이전 명칭은 단계적 전환 기록으로 명시한다.
- 초등은 자신의 CSS·JS·원본 로고 복사본만 사용한다. 브랜드 링크 외에 중·고등 HTML·asset·entity URL을 참조하지 않는다.
- 미확정 초등 canonical/og:url은 생략하고 `noindex, follow`, robots의 `Disallow: /`, sitemap template, null productionOrigin 설정으로 준비 상태를 표현한다. 외부 도메인을 추측하지 않는다.
- 중·고등 푸터의 작은 초등 링크는 기존 `elementary.html`로 연결하고 PHASE 2 변경 위치를 표시한다. 초등 푸터는 기존 Production 루트로 연결한다.
- 기존 root `.vercelignore`의 allowlist를 유지하며 `/elementary-site/`를 명시적으로 제외한다. 초등 root에는 별도 allowlist를 둔다. 기존 `vercel.json`과 `.vercel/project.json`은 변경하지 않는다.

## 구현·검증 순서

- [x] Git / 파일 목록 / baseline 확인: clean main, HEAD=main=local origin/main `db4ea58d4ac7413b066ed7891285675ef37b7cda`; Node 28/28 PASS.
- [x] 분리 계약 테스트 추가 후 예상 실패 확인. 기존 28개 테스트의 목적·수를 유지하며 통합사이트 전용 기대값을 새 요구사항으로 교체한다. Pilot/data/interaction 테스트는 수정하지 않는다.
- [x] 중·고등 root, secondary canonical, 초등 독립 root 및 pending SEO 구현.
- [x] sitemap, llms, 배포 제외 규칙 검증. 신규 URL 준비 상태는 PASS 대신 PENDING PRODUCTION URL로 기록한다.
- [x] Node 전체 테스트, 두 독립 로컬 서버, 390×844 / 1440px 및 보조 크기에서 기능·레이아웃·오류 검수. 상담 전송은 가로챈다.
- [x] 보호 파일 SHA-256 및 Git diff 확인. `node --check`, XML·JSON-LD parse, `git diff --check` 실행.
- [x] `.seo/reports/site-split-phase1.md`, README, WORKLOG 및 기존 계획서에 결과와 PHASE 2 항목 기록.

## PHASE 2 경계

실제 초등 도메인 확정, canonical/OG/entity/sitemap/robots/llms의 실제 URL 적용, 교차 링크 확정, legacy 중복 처리 승인, Vercel 설정·배포·Google/Naver 등록은 별도 사용자 승인 후 진행한다. Git push가 자동 배포를 유발할 수 있으므로 승인 후에도 연결 상태를 먼저 확인한다.
