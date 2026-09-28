# Site Split — PHASE 1

Date: 2026-09-29 (Asia/Seoul)
Decision: **READY FOR PHASE 2** — local implementation and verification only.
No commit, push, merge, project creation, Preview/Production deployment, redirect, or search-account setting change was performed.

## Current Architecture

작업 저장소는 `D:/claude/math-standard-landing-page-main`, origin은 `https://github.com/mathcraft-creator/math-standard-landing-page.git`이다. 작업 전 branch는 `main`, working tree는 clean이었다. HEAD·main·로컬 origin/main은 모두 `db4ea58d4ac7413b066ed7891285675ef37b7cda`. 최종 read-only `git ls-remote origin refs/heads/main`도 같은 값을 반환했다. 작업 중 `site-split-phase1` 로컬 branch를 만들었으며 커밋은 만들지 않았다.

작업 전 최근 5개 커밋:

| SHA | 제목 |
|---|---|
| db4ea58 | docs: record home CTA production deployment |
| 0d25d73 | feat: emphasize home course detail links |
| 57a976d | docs: define home course CTA emphasis |
| 4f7aa82 | docs: record Pungyang Middle production deployment |
| a56a9ff | feat: publish Pungyang Middle School exam analysis pilot |

기존 구조는 통합 메인 + elementary/secondary 상세, 공통 site.css/site.js/exit-offer.js, 과정별 CSS 및 원본 이미지였다. Pilot은 schools/exams/data 및 전용 school-pilot.css로 구성되어 있었다. package.json, 별도 favicon, manifest는 없었으며 추가하지 않았다. 학교별 JSON-LD에는 WebPage·Article·BreadcrumbList·FAQPage·EducationalOrganization·LocalBusiness가 있으며, 기존 루트의 `/#academy` 및 `/#secondary-academy`를 참조한다. Google/Naver 인증 태그는 index.html에 있었다.

구현 후 로컬 구조:

```text
/
├── index.html                 중·고등 메인
├── secondary.html             legacy, canonical → /
├── elementary.html            legacy, 원본 유지
├── assets/                    기존 파일 전체 원본 유지
├── schools/ · exams/ · data/   Pilot 원본 유지
├── robots.txt · sitemap.xml · llms.txt
├── vercel.json · .vercelignore
├── tests/ · docs/ · WORKLOG.md · .seo/
└── elementary-site/
    ├── index.html
    ├── assets/
    │   ├── site.css · elementary.css
    │   ├── site.js · exit-offer.js
    │   └── ddak-logo-name.png
    ├── robots.txt · llms.txt
    ├── sitemap.xml.template
    ├── seo-config.json
    ├── vercel.json
    └── .vercelignore
```

`work/`와 기존 `docs/previews/` 이미지 및 역사적 .seo 보고서는 변경하지 않았다. 문서에 언급된 outputs 사본을 배포 소스로 사용하지 않았다.

## Protected Production Assets

기존 대표 주소 `https://math-standard-landing-page.vercel.app/`는 그대로이다. Production GET은 HTTP 200이며 기존 통합 메인의 두 과정 카드가 여전히 존재한다. 로컬 index 변경은 공개 사이트에 반영되지 않았다. 네이버 파워링크 승인 주소, 도메인, 프로젝트 이름, 연결 파일 `.vercel/project.json`, 기존 `vercel.json`을 변경하지 않았다. 광고/검색 계정 상태를 새로 판정하거나 변경하지 않았다.

보호 대상 26개 파일의 작업 전 SHA-256을 [보호 목록](site-split-protected.json)에 기록했다. 최종 자동 검사에서 전부 일치했다. 실제 공개 응답은 [읽기 전용 HTTP 확인](site-split-http.json)에 기록했다.

## Pungyang Pilot Protection

다음 URL은 HTTP 200이며 응답 body가 보호 중인 로컬 원본과 바이트 단위로 동일했다.

- `https://math-standard-landing-page.vercel.app/schools/pungyang-middle/`
- `https://math-standard-landing-page.vercel.app/exams/pungyang-middle/2026-g3-s1-final/`
- `https://math-standard-landing-page.vercel.app/data/exams/pungyang-middle/2026-g3-s1-final.json`

HTML, canonical, URL, JSON-LD, Article publisher, Breadcrumb, 시험 데이터, schema, provenance, 기존 Pilot/data 테스트, 과거 .seo 보고서를 수정하지 않았다. 21문항/100점, 선택형 17/80, 논술형 4/20, 이차방정식 9/40, 인수분해 5/26, 통계 7/34, 난이도 하5/중10/상6과 Academy Analysis 표시가 유지된다. 검증된 원본 PDF hash와 원장 검토 기록도 그대로다.

Pilot의 홈/로고는 이미 상대 경로로 index.html에 연결되어 새 중·고등 메인으로 돌아갈 수 있다. 일부 중·고등/상담 링크 및 Hub Breadcrumb의 중·고등 항목은 secondary.html을 유지한다. 파일 보호를 최우선으로 하여 이번에는 이를 수정하지 않았다. 실제 링크·화면/JSON-LD Breadcrumb 일치 검사가 통과했다.

## Middle/High Site Changes

- index.html은 기존 secondary의 학습/내신/오답/사례/FAQ/상담/위치/이탈 팝업을 유지한 중·고등 메인이다. 첫 화면에서 직접 중·고등 수업이 보인다.
- 헤더·푸터·OG site_name은 수학의 기준 진접본원이다. primary CTA는 진단·1주 체험 상담, 블로그는 기존 `standrad-of-math` 주소다. 원래 URL 철자를 임의 교정하지 않았다.
- 관심 과정에서 초등 선택을 제거하고 중·고등을 기본값으로 유지했다. 체험·성과·후기를 새로 만들지 않았다.
- 루트 → 풍양중 Hub 링크가 있다. `#math-standard-secondary`, `#fliplearning`, `#process`는 루트에서 직접 동작한다. 옛 `#ddak-elementary`는 실제 초등 legacy 링크가 있는 작은 브랜드 전환 영역으로 연결된다. HTTP/JS redirect를 새로 추가하지 않았다.
- secondary.html도 같은 중·고등 콘텐츠/브랜드를 유지하되 canonical과 og:url은 기존 도메인의 `/`이다. 루트에는 원래 Google/Naver 인증 태그를 유지한다.

## Elementary Site Structure

elementary-site/index.html은 초3~초6 딱풀리는수학 수업 콘텐츠를 보존한다. 자체 브랜드 헤더/푸터, 초등 기본 상담값, 기존 초등 블로그, 1주 체험/전화/카카오/지도/FAQ/이탈 팝업을 갖춘다. 중·고등으로 이동하는 링크는 하단의 작은 브랜드 전환 링크 하나이며 기존 Production 루트를 가리킨다. 다른 과정 선택지는 제거했다.

새 도메인은 생성·확정하지 않았다. `ddaksoojj.vercel.app`을 canonical이나 href에 추측해 넣지 않았다.

## Asset Independence

초등에 필요한 CSS 2개, JS 2개, 로고 1개를 내부 assets에 바이트 그대로 복사했다. 상위 `../assets` 참조나 외부 중·고등 asset 의존성이 없다. 기존 CSS/JS/이미지 원본은 수정하지 않았다. 공통 JS의 과거 home-only 해시 매핑은 코드 안에 있지만 초등 body는 elementary이므로 실행되지 않는다. 실제 링크/asset 요청은 초등 독립 root에서만 성공하도록 검수했다.

favicon/manifest는 원래 없었다. 브랜딩 자산을 변형하거나 가짜 아이콘을 만들지 않았다. 새 초등 로고는 제공된 기존 원본이다.

전화 `031-522-5431`, 카카오 `http://pf.kakao.com/_yWFTn/chat`, 지도 `https://naver.me/Gn0DQWNs`, 초등 블로그 `https://blog.naver.com/perfect-math1`, 중·고등 블로그 `https://blog.naver.com/standrad-of-math`는 저장소의 실제 링크를 유지했다. 모두 읽기 전용 HTTP 200을 확인했다. 카카오는 HTTPS로, 네이버 지도는 기존 place `1853687809`로 이동했다. 별도 플레이스 주소를 만들어 추가하지 않았다. 전화 링크는 브라우저/OS 호출 용도이며 실제 통화하지 않았다.

## SEO Separation

| 항목 | 중·고등 로컬 | 초등 로컬 |
|---|---|---|
| title / description / OG title / Twitter | 기존 중·고등 원고 기반 | 기존 초등 원고 기반 |
| canonical / og:url | 기존 도메인 `/` | **PENDING PRODUCTION URL**, 의도적으로 없음 |
| H1 | 중·고등 수업 H1 1개 | 초등 수업 H1 1개 |
| robots meta | 기존 수집 허용 상태, noindex 없음 | `noindex, follow` |
| WebSite / WebPage / academy | 기존 stable ID 유지 | 로컬 상대 fragment, 신규 origin으로 확정 예정 |
| FAQPage | 화면의 실제 질문·답변과 일치 | 화면의 실제 질문·답변과 일치 |
| Breadcrumb | 루트의 브랜드 표시, 불필요한 2단계 제거 | 루트의 브랜드 표시, 불필요한 2단계 제거 |
| Google / Naver 인증 | 원문 유지 | 복사하지 않음 |

루트와 초등 모두 기존 text summary Twitter Card를 유지한다. 새 OG 이미지나 실적 Schema를 만들지 않았다. 초등 URL 관련 항목은 Production SEO PASS로 판정하지 않는다. 임시 noindex와 robots 차단의 결합은 비공개 준비 상태를 위한 것이며 legacy canonical 정책이 아니다.

## Entity / JSON-LD Plan

기존 `/#academy`는 두 브랜드가 같은 주소·전화 아래 연결된 통합 조직을 의미했다. 이 식별자와 `/#secondary-academy`, `/#website`를 보존했다. 새 루트의 `/#academy` name은 수학의 기준 진접본원이며, 원래 통합 이름을 alternateName으로 남겼다. 전화/주소/지역은 그대로, sameAs는 중·고등 블로그다. WebPage.about 및 WebSite.publisher는 stable academy를 참조한다. 기존 secondary brand의 parentOrganization 연결도 유지한다.

보호 대상 Pilot 및 elementary legacy에는 이전 통합 조직 이름이 남아 있다. ID와 실체의 주소·전화 연결은 그대로이며 이는 단계적 전환의 한계다. 전체 명칭 통일은 별도 Pilot 수정 승인이 필요한 후속 검토로 기록한다. 이번 작업에서 Article.publisher 의미나 시험 관련 Schema를 바꾸지 않았다.

초등은 `#website`, `#webpage`, `#academy`, `#faq-data` 상대 ID로 독립 그래프를 구성했다. 기존 도메인의 primary ID 및 parentOrganization은 복사하지 않았다. 실제 Production origin 확인 후 `origin + '/#academy'` 등 절대 ID와 각 root url을 설정한다. `seo-config.json`에 정확한 변경 항목이 있다. 상대 ID의 파싱/관계 검사 PASS와 절대 Production identity 확정 PENDING을 구분한다.

## Legacy URL Plan

secondary.html은 유지하고 canonical/OG를 루트로 지정했다. sitemap에서 제거하고 내부 primary 메뉴는 루트/페이지 내 섹션으로 이동한다. 301은 적용하지 않았다.

elementary.html은 canonical·본문·기능을 포함해 원본 유지다. 신규 초등이 공개되기 전까지 기존 정상 주소로 사용한다.

| PHASE 2 후보 | 장점 | 한계 / 조건 |
|---|---|---|
| A. 기존 elementary에서 신규 초등 root로 cross-domain canonical | 기존 주소와 상담 동선 유지, 대표 주소 통합 신호 | 검색엔진이 선택하는 신호이므로 강제 이전은 아님; 신규 사이트가 먼저 정상 응답해야 함 |
| B. `noindex, follow` | legacy 검색 노출 제외 의도를 명확히 표시 | 대표 URL 통합의 대체 수단으로 권고하지 않음; 신규 페이지로 신호 이전 보장 없음 |
| C. 301 | 사용자와 검색엔진을 새 대표 주소로 직접 이전 | 검색·광고·운영 영향 확인 및 명시적 승인 필요 |

권고: 초등 신규 사이트의 정상 응답·동일 콘텐츠·self canonical을 확인한 후 A를 우선 검토하고, 검색 등록/광고 승인/운영 안정화 뒤 필요하면 별도 승인으로 C를 적용한다. B를 canonical과 동시에 기계적으로 적용하지 않는다. Google은 canonical 선택을 위해 redirect/rel=canonical/sitemap 신호를 설명하고 noindex를 canonical 선택 수단으로 권고하지 않는다. [Google 공식 문서](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

## Sitemap Plan

중·고등 로컬 sitemap은 루트, 풍양중 Hub, 시험분석의 정확히 3 URL이다. elementary/secondary legacy는 제외했다. 공개 Production sitemap은 기존 5 URL을 유지한다. 로컬 변경의 배포 후 의미는 발견 신호를 대표 canonical로 집중하는 것이며 기존 legacy 페이지를 삭제하거나 즉시 색인에서 제거하는 조치가 아니다.

초등은 `sitemap.xml.template`만 있고 실제 `sitemap.xml`은 없다. 템플릿의 `{{ELEMENTARY_ORIGIN}}/`는 로컬 설정용이며 배포 allowlist에서 제외된다. XML 파싱은 PASS, URL 확정과 실 sitemap 검증은 **PENDING PRODUCTION URL**이다. PHASE 2에서 실제 origin으로 렌더링한 sitemap.xml을 만든 뒤 검사한다.

## Robots Plan

기존 robots.txt는 원본 그대로이며 기존 도메인의 sitemap 위치를 유지한다. 초등은 임시 `Disallow: /`이고 가짜 Sitemap 주소가 없다. URL 확정 시 `Allow: /`, `Sitemap: <실제 초등 origin>/sitemap.xml`로 바꾸고 HTML noindex도 해제한다. 활성화 전 검수 항목이다.

## llms.txt Plan

중·고등 llms는 수학의 기준 중·고등 메인 및 두 Pilot 주소를 유지하며 초등/secondary legacy의 primary 안내를 제거했다. 초등 llms는 초등 학습·위치·상담·초등 블로그만 담는다. 초등 canonical은 **PENDING PRODUCTION URL**로 명시했다. 두 파일 모두 해당 배포 allowlist에 포함된다.

## Verification Tag Plan

기존 Google `4zFCuW52coMGJ_e8J7AZI-Wz93dqFQlZFPkAnNHbB5Q`와 Naver `171a5a6dcfe42518d66f36ee407638acb8c02e42`를 index.html에 그대로 유지했다. 초등 신규 사이트에는 기존 인증 태그를 복사하거나 추측해 만들지 않았다. 별도 property/site 등록과 신규 소유 확인은 PHASE 2 배포 후 사용자 승인 범위에서 진행한다.

## Vercel Project Plan

| 설정 | 기존 중·고등 | 신규 초등 권장 |
|---|---|---|
| Project Name | math-standard-landing-page 그대로 | **ddaksoojj 우선 후보**, 사용 가능 여부 확인 필요 |
| Root Directory | 저장소 root 그대로 | `elementary-site` |
| Framework Preset | 기존 유지 | Other (framework null) |
| Build Command | 기존 null 유지 | 없음 / null |
| Output Directory | 기존 `.` 유지 | `.` (초등 root 자체, 동봉 vercel.json) |
| Install Command | 기존 유지 | 없음; package.json 없음 |
| 외부 root 파일 포함 | 기존 유지 | 필요 없음; 상위 자산 사용하지 않음 |
| 대표 도메인 | 기존 URL 그대로 | 프로젝트 생성 후 실제 Production alias 확인 |

요청서 후반의 `ddak-math-jinjeop`은 예시이며 최우선 목표에 적힌 ddaksoojj를 이름 후보로 기록했다. 두 후보 모두 사용 가능 여부를 확인하거나 생성하지 않았다.

공식 문서에 따라 기존 root allowlist에 `/elementary-site/` 명시 제외를 더하고, 초등 root에는 별도 allowlist를 두었다. 프로젝트 root의 .vercelignore가 monorepo root의 파일보다 우선한다. [Vercel 공식 .vercelignore 문서](https://vercel.com/docs/deployments/vercel-ignore)

`ignore@7`의 gitignore 규칙 해석으로 실제 파일 목록을 검사했다. 기존 프로젝트는 21개 필수 사이트 파일을 포함하고 elementary-site/·docs/·tests/·.seo/·work/·.vercel/은 제외한다. 초등은 9개 런타임 파일을 포함하며 seo-config/template은 제외한다. [포함 파일 목록](site-split-deployment-files.json). 실제 Vercel 업로드 manifest와 HTTP `/elementary-site/` 비노출 확인은 배포가 허용된 PHASE 2의 추가 gate다. 로컬 일반 HTTP 서버는 Vercel ignore 규칙을 자동 적용하지 않는다.

## Test Results

| 검사 | 실제 결과 |
|---|---|
| Baseline Node | **28/28 PASS** (요청서의 예상 27개보다 1개 많음) |
| 신규 분리 테스트 구현 전 | 7개 중 6개 예상 실패, 보호 원본 검사 1개 통과 |
| 최종 Node | **37/37 PASS**, 삭제·skip한 test 없음 |
| JS syntax | assets/site.js, 초등 site.js/exit-offer.js, 신규 QA scripts PASS |
| sitemap XML | 중·고등 3 URL 및 초등 template XML 파싱 PASS; 초등 실 URL PENDING |
| JSON-LD | root·legacy 2개·초등·Pilot 2개, 총 6문서 파싱 PASS |
| git diff --check | PASS; 기존 Git line-ending 안내만 있음 |
| 보호 원본 SHA-256 | 26/26 일치 |
| 배포 allowlist | 기존 21개/초등 9개 포함 검사 PASS |
| Browser | 독립 2개 서버, 6경로 × 360/390/768/1440, 전부 PASS |
| Console / resource errors | page error 0, console error 0, 실패 HTTP 응답 0 |
| 공통 quality_checks | `D:/claude/.hermes/scripts/run_quality_checks.ps1` 부재, **SKIP** |

기존 exam-data·school-pilot·site-interactions 테스트 파일은 바이트 그대로다. 기존 SEO 테스트는 통합 이름/legacy self canonical/5개 발견 URL에 고정된 기대값을 분리 요구사항으로 변경했다. canonical·OG 일치, 부모 ID/주소/전화/지역/관계, FAQ 본문 일치 검사는 유지·강화했다. 기존 home 카드의 링크/이미지 검사는 독립 home의 올바른 로고·상담 CTA·same-tab 링크 검사로 대응시켰고 기존 CSS 상태 검사 및 원본 이미지 hash 검사는 유지했다. 기존 28개 사례의 검증 목적을 보존하며 초등 문서 검사 1개와 분리 검사 8개를 추가했다.

`tests/browser-check.cjs`는 새 browser-site-split.cjs로 연결되는 기존 진입점이다. 이전 통합 home selector에 묶인 검사를 분리 사이트 검수로 확장했다. 별도 기존 browser-exit-check도 실행하여 기존 3페이지의 팝업 검사를 통과했고, 그 실행에서 생성한 기존 preview 스크린샷은 원래 바이트로 복구했다.

브라우저 검사: 이미지/CSS/JS, 메뉴·direct visit·새로고침·뒤로가기, 루트의 이전 hash, 독립 root 홈, 모든 내부 링크·anchor, 전화 dialog/Escape/포커스 복귀, 전화번호 fallback 선택, FAQ open/Escape, 상담 복사 성공 및 clipboard 거부 시 수동 문장, 과정 기본값, 사용자 입력의 text 처리, localStorage 비저장, JS 비활성화 시 GET 제출 방지, 데스크톱·모바일 이탈 팝업, 하위 URL 상대 경로, file 직접 자산 로딩을 확인했다. 실제 상담 전송은 가로챘다.

모바일 팝업 검수 초기에 가상 clock과 실제 scroll 이벤트의 처리 시점 차이로 테스트가 실패했다. 실제 scroll 이벤트 수신을 기다리도록 QA를 수정한 뒤 통과했으며 사이트 JS는 원본 그대로다. 한글 작업 중 PowerShell ASCII pipe로 새 문구가 손상된 것은 UTF-8 전달로 수정하고 손상 문자 회귀 검사를 추가했다.

[브라우저 결과 JSON](site-split-browser/results.json)과 같은 폴더의 12개 데스크톱/모바일 PNG를 저장했다. hero 및 모바일 브랜드 전환 영역을 직접 시각 확인했다.

## Known Risks

1. 신규 domain/canonical/absolute entity/sitemap/OG URL 및 검색 인증은 의도적으로 PENDING이다. 초등 noindex/robots 차단을 활성화 단계에서 반드시 함께 해제한다.
2. Pilot과 elementary legacy의 기존 통합 브랜드 정의/일부 secondary 링크는 보호 요구에 따라 남아 있다. 기존 entity ID와 URL·데이터 의미는 보존했다.
3. canonical은 검색엔진의 대표 선택을 강제하지 않으며, 실제 색인·광고 승인 상태는 이번에 계정에서 재확인하지 않았다.
4. CSS/JS 복사본은 초등 독립성을 보장하지만 이후 공통 기능 수정 시 두 곳을 함께 검토해야 한다. 현재 파일 동일성은 테스트로 확인한다.
5. sitemap에서 legacy 제거는 로컬 준비다. Production 변경 시 새 대표 페이지의 수집 가능 여부를 먼저 확인한다.
6. 직접 file 열기의 자산/상담 로딩은 확인했지만 `./` 홈 URL 이동은 HTTP document root 기준이다. 전체 탐색은 README의 독립 로컬 서버로 검수한다.
7. Git push가 연결 프로젝트의 자동 배포를 일으킬 수 있으므로 PHASE 2 승인 직후에도 기존 자동 배포 설정을 먼저 읽기 전용으로 확인해야 한다. 이번에는 push하지 않았다.

## Phase 2 Required Actions

- [ ] PHASE 1 사용자 검토/명시적 승인. 현재 변경은 uncommitted 상태로 보존.
- [ ] 기존 Vercel 프로젝트/도메인/Root Directory/Git 배포 연결 상태 재확인. 기존 프로젝트 이름이나 도메인은 변경하지 않는다.
- [ ] 신규 프로젝트 이름 가용성 확인 후 초등 프로젝트 생성, Root Directory=`elementary-site`, 동봉 static 설정 사용. 상위 `.vercel/project.json`을 초등에 복사하지 않는다.
- [ ] 신규 Preview/Production URL을 실제로 확인한다. URL이 준비되기 전 무조건 기존 root를 먼저 배포하지 않는다.
- [ ] 초등 seo-config의 실제 origin을 확정하고 canonical·og:url·absolute JSON-LD·sitemap.xml·robots·llms를 함께 반영한다. noindex/Disallow 임시 상태를 해제한다.
- [ ] 실제 URL로 양방향 브랜드 링크를 확정한다. placeholder를 노출하지 않는다.
- [ ] legacy elementary 중복 처리안을 승인받아 반영한다. 301은 별도 명시적 승인 없이는 적용하지 않는다.
- [ ] 전체 Node/독립 서버/SEO/배포 allowlist 검사 재실행. 실제 배포 manifest에서 두 root 격리를 확인한다.
- [ ] 승인된 commit/push·배포 순서를 자동 배포 연결 여부에 맞춰 진행한다. 신규 초등 안정성 확인 후 기존 중·고등 root를 배포한다.
- [ ] 공개 루트/학교 Hub/시험분석/공개 JSON/인증/사이트맵을 회귀 검사하고 기존 도메인 `/elementary-site/` 및 내부 파일 비노출을 확인한다.
- [ ] 신규 Google Search Console property/Naver 사이트 별도 등록 및 소유 확인, 사이트맵 제출. 신규 네이버 파워링크 비즈채널은 별도 준비한다.

## Changed Files

전체 변경 파일 목록은 아래 최종 Git 기반 목록에 기록한다. 수정 전 clean 상태였으므로 모두 이번 PHASE 1의 로컬 변경이다.

- `.seo/reports/site-split-browser/elementary-1440.png`
- `.seo/reports/site-split-browser/elementary-390.png`
- `.seo/reports/site-split-browser/elementary-hero-1440.png`
- `.seo/reports/site-split-browser/elementary-hero-390.png`
- `.seo/reports/site-split-browser/elementary-switch-1440.png`
- `.seo/reports/site-split-browser/elementary-switch-390.png`
- `.seo/reports/site-split-browser/middle-high-1440.png`
- `.seo/reports/site-split-browser/middle-high-390.png`
- `.seo/reports/site-split-browser/middle-high-hero-1440.png`
- `.seo/reports/site-split-browser/middle-high-hero-390.png`
- `.seo/reports/site-split-browser/middle-high-switch-1440.png`
- `.seo/reports/site-split-browser/middle-high-switch-390.png`
- `.seo/reports/site-split-browser/results.json`
- `.seo/reports/site-split-deployment-files.json`
- `.seo/reports/site-split-http.json`
- `.seo/reports/site-split-phase1.md`
- `.seo/reports/site-split-protected.json`
- `.vercelignore`
- `README.md`
- `WORKLOG.md`
- `docs/2026-09-07-content-and-pages-plan.md`
- `docs/2026-09-29-site-split-phase1-plan.md`
- `elementary-site/.vercelignore`
- `elementary-site/assets/ddak-logo-name.png`
- `elementary-site/assets/elementary.css`
- `elementary-site/assets/exit-offer.js`
- `elementary-site/assets/site.css`
- `elementary-site/assets/site.js`
- `elementary-site/index.html`
- `elementary-site/llms.txt`
- `elementary-site/robots.txt`
- `elementary-site/seo-config.json`
- `elementary-site/sitemap.xml.template`
- `elementary-site/vercel.json`
- `index.html`
- `llms.txt`
- `secondary.html`
- `sitemap.xml`
- `tests/browser-check.cjs`
- `tests/browser-site-split.cjs`
- `tests/seo-structure.test.cjs`
- `tests/site-split.test.cjs`
- `tests/site-structure.test.cjs`
- `tests/vercelignore-check.cjs`

## Final Git State

Branch: `site-split-phase1`. HEAD·main·origin/main 및 실제 원격 main은 `db4ea58d4ac7413b066ed7891285675ef37b7cda`로 유지. 변경 파일은 unstaged/untracked 상태이며 staged 파일, 새 commit, push, merge는 없다. 최종 판정: **READY FOR PHASE 2**. 여기서 중단한다.
