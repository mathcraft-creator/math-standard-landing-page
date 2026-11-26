# 과목·전공 교차 탐색관 통합

작업일: 2026-11-20. 기능 브랜치: `feature/curriculum-explorer`. 시작 커밋: `84f8043`. Production 변경 없음.

## 기존 구조와 시작 상태

- 프레임워크·package.json·설치·빌드·린트 명령 없는 정적 HTML 사이트. `vercel.json`의 framework/buildCommand는 null, outputDirectory는 `.`이고 cleanUrls는 false다.
- 실제 운영 파일은 `index.html`, `middle/index.html`, `elementary/index.html`. `secondary.html`·`elementary.html`은 새 과정 주소로 이동한다. 예전 README/계획의 루트 3개 상세 파일 설명은 현재 구현보다 오래된 기록이다.
- 기존 메인 선택 카드, 과정 페이지의 교육·후기·FAQ·전화/카카오톡·이탈 안내를 보존했다. 현재 운영 HTML에는 상담 폼이 없다. `assets/site.js`의 문장 복사 폼 코드는 남아 있으나 현재 과정 페이지에서는 로드하지 않는다. 현재 HTML에는 상담 API·서버 저장·상담용 환경변수 사용이 없다.
- 시작 시 main은 origin/main과 일치했고, 사용자 제공 원본 HTML 하나만 미추적 상태였다. 이를 수정하거나 삭제하지 않고 기능 브랜치를 생성했다. 시작 기본 테스트 30/30 PASS.

## 통합 방식과 경로

원본을 React로 변환하지 않고 `curriculum/index.html`에 독립 문서로 통합했다. 원본 내부 JSON·검색 엔진·연계/진단 계산을 그대로 둔다. 랜딩에서 탐색관 스크립트·데이터를 미리 불러오지 않는다.

| 요청 | 대상 |
|---|---|
| `/curriculum` | `vercel.json` rewrite → `/curriculum/index.html` |
| `/curriculum/` | 같은 정적 문서로 명시적 rewrite |
| `/curriculum/index.html#s-0` | 상세 직접 접속 |
| `#home`, `#subjects`, `#majors`, `#univ`, `#matrix`, `#cross`, `#basics`, `#search` | 원본 해시 라우터 |
| 탐색관 상담 버튼 | 기존 `/middle/#contact` (슬래시/파일 접속에서는 `../middle/index.html#contact`) |

Canonical·og:url은 요청한 `https://math-standard-landing-page.vercel.app/curriculum`으로 한 번만 선언한다. 기존 사이트의 cleanUrls·trailingSlash 전역 동작은 변경하지 않았다. [Vercel 공식 rewrite 문서](https://vercel.com/docs/routing/rewrites)에 따라 신규 두 경로만 지정했다. 로컬 서버는 이 설정을 읽어 검증하지만, Vercel 배포 라우팅 자체를 증명하지는 않는다.

홈과 두 과정 페이지에 동일 메뉴를 추가했다. 작은 화면에서도 메뉴를 표시하며 과정 메뉴는 가로 스크롤로 사용할 수 있다. 홈과 중·고등의 교육 흐름 다음에 요청한 소개·4개 기능·무료 탐색 CTA·보조 안내를 실제 HTML로 넣었다.

탐색관에는 네이비·골드의 브랜드 안내와 홈/상담 링크, 이용 안내, 키보드 포커스·본문 바로가기를 추가했다. 기존 차트의 빨강 등 의미 있는 색과 출처 표기는 유지한다. CSS·JavaScript는 독립 문서 안에 있어 랜딩과 충돌하지 않는다. 다크모드는 원본의 시스템 색상 설정을 따른다. 원본에 별도 테마 선택·테마 저장 UI는 없다.

## 변경 파일

- 기존 수정: `index.html`, `middle/index.html`, `elementary/index.html`, `vercel.json`, `.vercelignore`, `sitemap.xml`, `llms.txt`, `README.md`, `WORKLOG.md`, `docs/2026-09-07-content-and-pages-plan.md`.
- 신규 서비스 파일: `curriculum/index.html`, `assets/curriculum-entry.css`, `assets/curriculum-entry.js`(file:// 접속일 때만 디렉터리 링크를 실제 index.html로 보정).
- 재생성·검증: `scripts/integrate-curriculum.cjs`, `tests/curriculum.test.cjs`, `tests/curriculum-server.cjs`, `tests/browser-curriculum-check.cjs`.
- 근거·보고서: 이 문서, `docs/curriculum-source-manifest.json`, `docs/curriculum-test-report.md`.
- 검수 산출물: `output/playwright/curriculum/`의 JSON·PNG. 사용자 제공 원본 HTML과 기존 이미지·압축 파일은 수정하지 않았다.

## 데이터 보존

원본 파일 3,595,960바이트. JSON은 3,528,623바이트이고 통합본과 바이트 단위로 동일하다. SHA-256 및 전체 키 개수는 source manifest에 기록했다. 모든 원본 객체 필드·순서·연결 배열이 동일한 JSON 해시로 검증된다.

| 데이터 | 원본 = 통합본 |
|---|---:|
| 과목 S | 290 |
| 학과 M | 119 |
| 계열 SR | 19 |
| 대학 | 47 |
| 대학별 모집단위 U | 1,358 |
| 대표 모집단위 | 16 |
| 대표 행 R / 열 RC | 240 / 16 |
| 동국대 DG / 연세대 YS | 65 / 84 |

과목→학과·계열·대학, 학과·계열→과목·모집단위, 대학→과목의 모든 참조를 검사했다. 검색 4개와 경영학과 권장과목 바구니의 진단 본문을 원본 실행 결과와 비교했다. 구체적인 결과·측정값은 테스트 보고서 참조.

## 보안 검토와 최소 수정

- 검색어는 원본 esc 함수로 `& < > " '`를 이스케이프하고, 자동완성의 data 속성과 검색 제목에도 적용한다. 이미지 onerror 형태 검색어를 실제 브라우저에 넣어 요소 생성·스크립트 실행이 없음을 검사한다.
- 원본은 저장소에서 읽은 임의 배열 항목에 `S[i]`만 검사해 문자열 프로퍼티도 통과할 수 있었다. 배열 여부·정수·범위·실제 과목 ID를 검사하고 중복을 제거한다. 손상 JSON·null·객체·문자열 ID·음수·범위 밖 ID를 시험한다. 저장/읽기 예외는 원본 try/catch를 유지한다.
- 잘못된 해시의 `__proto__` 등이 라우터 객체의 상속 프로퍼티에 접근하지 않도록 자체 키만 허용한다. 유효하지 않은 화면은 기존 홈 fallback을 유지한다. 해시를 HTML에 직접 삽입하지 않는다.
- 과목 영역 텍스트 두 곳에 누락된 HTML 이스케이프를 보완했다. 데이터 값은 수정하지 않았다. 기존 동적 HTML 경로를 검토했으며, 검색·사용자 저장값을 신뢰 HTML로 새로 삽입하지 않는다.
- 탐색관 외부 리소스는 기존 Google Fonts CSS/폰트다. 외부 API·추가 라이브러리·eval·새 개인정보 수집·전송 코드를 추가하지 않았다.
- 현재 저장소에는 CSP 설정이 없다. 원본과 기존 랜딩이 inline script/style을 사용하므로 이번 작업에서 전역 CSP를 추가하지 않았다. 나중에 CSP를 도입하면 스크립트 해시와 Google Fonts 허용 정책을 별도 검증해야 한다. Preview 응답 헤더와 브라우저 확장/기업 정책에 의한 CSP 충돌은 미검증이다.

## 성능과 접근성 범위

원본을 먼저 실행해 로컬 초기 DOM 준비·JSON 파싱·heap 표본을 수집한 뒤 통합본을 측정했다. 5개 viewport에서 8개 화면의 전환과 넘침을 검사하고 모바일 검색·스크롤 표본을 기록한다. 초기 통합에서는 데이터 분리·압축 소스 변형을 하지 않았다. 실측과 한계는 보고서에 기록한다.

키보드 검색·Escape 자동완성 닫기(원본), 포커스 스타일·본문 바로가기·현재 화면 내 메뉴 접근을 유지한다. 표는 원본의 모바일 행 라벨/가로 스크롤을 사용한다. 스크린리더와 실물 모바일 기기 전체 검증은 별도 필요하다.

## 최신화가 필요한 자료

이번 작업은 통합이며 교육정책·대학 요강을 최신 자료와 대조하여 갱신한 작업이 아니다. 다음 기준 연도를 화면/출처에 그대로 두었다.

- 2028 모집단위별 반영·권장과목: 어디가 2025-09-30 탑재 기준. 대학별 수정 공지와 최신 모집요강 대조 필요.
- 2026 서울교육연구정보원 과목 안내: 후속 개정·정오표 확인 필요.
- 동국대 2027 전공 가이드북 및 기준 연도가 명확하지 않은 연세대 안내서: 차기 판본 확인 필요.
- 교육과정 기초의 학점·평가·수능·자율전공·계약학과 정보: 적용 학년별 공식 안내 확인 필요.
- 학교별 실제 개설 과목과 공동교육과정: 학교별 최신 편성표 확인 필요.
- 학과명 키워드 자동 연결: 공식 적합성 판정이 아니며 누락/과대 연결 가능성을 원본과 동일하게 고지한다.
- ‘서울대학교’는 원본 검색 결과 0건이고 ‘서울대’로 검색 가능하다. 명칭 별칭 확장은 검색 로직 변경이므로 이번 보존 통합에 포함하지 않았다.

## Preview·Production·롤백

현재 Vercel CLI는 로그아웃 상태이며 이 작업 폴더에 `.vercel/project.json`도 없다. `vercel whoami`에서 worker timeout과 Logged out이 나왔다. 인증되지 않은 임시 배포나 새 프로젝트 생성은 하지 않았다. 로컬 완료를 배포 완료로 간주하지 않는다.

1. 같은 사용자 환경에서 Vercel 로그인 후 기존 `standard-of-math-s-projects/math-standard-landing-page` 프로젝트에만 연결한다. `npx --yes vercel@59.11.7 link --project math-standard-landing-page --scope standard-of-math-s-projects`.
2. 변경 파일을 검토하고 기본/브라우저 테스트를 실행한다. 이 정적 사이트는 별도 로컬 빌드 명령이 없다.
3. `npx --yes vercel@59.11.7 deploy --yes --scope standard-of-math-s-projects`로 Preview 배포한다. `--prod`는 사용하지 않는다. `.vercelignore`에 curriculum 폴더가 포함되고 원본/문서/검수 산출물이 제외됨을 확인한다.
4. Preview의 `/`, `/middle/`, `/elementary/`, 구형 주소, `/curriculum`, `/curriculum/`, `/curriculum/index.html#s-0`, sitemap·robots를 확인한다. 예상하지 않은 404와 redirect loop가 없어야 한다. 보호된 Preview라면 인증 가능한 브라우저 세션으로 검사한다. `CURRICULUM_TEST_ORIGIN`을 Preview origin으로 지정하면 브라우저 스크립트를 재사용할 수 있다(원본 파일 비교는 로컬 전용).
5. 신규 경로가 200 HTML인지, canonical·OG와 source JSON 해시가 동일한지, 실제 CSP·압축·캐시 헤더와 모바일 기능을 확인한다. Preview noindex/보호 설정은 Production 설정과 구분한다.
6. 사용자에게 Preview와 변경/위험을 제시하고 Production 승인을 받은 뒤에만 기존 프로젝트에 Production 배포한다. 이번 턴에는 커밋·push·배포를 수행하지 않았다.
7. 장애 시 Vercel에서 기존 정상 deployment를 다시 Production에 승격/롤백한다. Git에서는 이번 통합 커밋만 revert하고 같은 프로젝트로 재배포한다. 아직 커밋하지 않은 작업은 시작 커밋과 diff를 비교해 이 문서의 변경 파일만 되돌린다. 사용자 원본 HTML과 다른 작업은 보존한다. 라우팅·메뉴·sitemap·llms는 함께 되돌린다.
