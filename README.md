# 수학의 기준 · 딱풀리는수학 랜딩 페이지

진접 지역 수학학원 안내용 정적 웹사이트입니다. 로컬 PHASE 1에서는 루트를 수학의 기준 중·고등 사이트로, `elementary-site/`를 딱풀리는수학 초등 독립 사이트로 분리했습니다. **아직 배포하지 않았습니다.** 사이트 실행에는 패키지 설치나 빌드가 필요하지 않습니다.

최신 작업 기준은 [PHASE 1 계획](docs/2026-09-29-site-split-phase1-plan.md)과 [검증·PHASE 2 인계 보고서](.seo/reports/site-split-phase1.md)입니다. 이 상태에서 commit/push/deploy하거나 Vercel 프로젝트를 만들지 않습니다. PHASE 2는 별도 승인 후 진행합니다.

## 이어서 작업하기

1. [작업 기록 및 인계](WORKLOG.md)를 읽어 완료한 작업과 다음 단계를 확인합니다.
2. [콘텐츠 개편·페이지 분리 계획](docs/2026-09-07-content-and-pages-plan.md)을 기준으로 작업합니다.
3. [프로젝트 작업 지침](AGENTS.md)을 확인합니다.

이 폴더를 편집기에서 작업 폴더로 열면 됩니다. 이전 대화가 없어도 위 문서에서 맥락을 확인할 수 있습니다.

```powershell
code D:\codex\math-standard-landing-page
```

## 현재 페이지 확인

서로 다른 터미널에서 두 document root를 독립 실행합니다. 중·고등은 `http://localhost:8000/`, 초등은 `http://localhost:8001/`입니다. `./` 홈 링크를 포함한 전체 이동 검수에는 HTTP 서버를 사용합니다. HTML 파일 직접 열기에서도 자산과 상담 스크립트 로딩은 확인했습니다.

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory .
# 별도 터미널
python -m http.server 8001 --bind 127.0.0.1 --directory elementary-site
```

## 파일 구성

- `index.html`: 수학의 기준 진접본원 중·고등 메인. 기존 대표 URL과 인증 유지.
- `elementary.html`: 기존 초등 legacy 페이지. 신규 배포 전까지 원본 유지.
- `secondary.html`: 중·고등 legacy 페이지. canonical은 루트 `/`이며 redirect 없음.
- `elementary-site/`: 자체 HTML·CSS·JS·로고·검색 안내 파일을 가진 초등 독립 root. URL 미확정 항목은 `seo-config.json`, `sitemap.xml.template` 참고.
- `assets/site.css`, `assets/site.js`: 공통 스타일·상담·전화·FAQ 기능.
- `assets/elementary.css`, `assets/secondary.css`: 과정별 스타일.
- `assets/elementary-portrait.png`, `assets/secondary-portrait.png`: 사용자가 제공한 첫 번째·두 번째 사진의 원본 복사본.
- `schools/pungyang-middle/index.html`: 풍양중 수학 시험·내신 정보 School Hub.
- `exams/pungyang-middle/2026-g3-s1-final/index.html`: 2026학년도 풍양중 3학년 1학기 기말고사 분석.
- `data/exams/pungyang-middle/2026-g3-s1-final.json`: 원본 대조를 마친 공개 시험 집계 데이터.
- `outputs/`: 별도 출력 사본. 현재 소스와 구분하고 배포 경로 확인 없이 동시 수정하지 않습니다.
- `work/`: 기존 작업용 자산.
- `docs/2026-09-07-content-and-pages-plan.md`: 이후 수정의 기준이 되는 프로젝트 내부 계획서.
- `WORKLOG.md`: 진행 상태, 결정 사항, 다음 작업과 검증 기록.
- `AGENTS.md`: 이 폴더에서 작업하는 에이전트를 위한 지침.
- `tests/`: Node 기본 테스트 및 선택적 브라우저 검수 스크립트.
- `docs/previews/`: 데스크톱·모바일 검수 스크린샷.

저장소: https://github.com/mathcraft-creator/math-standard-landing-page.git

## 검증

메인·초등·중고등에 이탈 상담 안내를 제공합니다. 8초 체류 후 PC 상단 마우스 이탈 또는 모바일에서 내용을 읽고 위로 크게 돌아가는 동작에 반응합니다. 페이지 방문당 한 번 표시하며, 뒤로가기를 가로채지 않습니다. 공통 로직은 `assets/exit-offer.js`입니다.

팝업 검수: Playwright 모듈 설정 후 `node tests/browser-exit-check.cjs`. `EXIT_TEST_ORIGIN=https://math-standard-landing-page.vercel.app`을 설정하면 배포본을 검사합니다.

Node.js가 있으면 별도 패키지 설치 없이 기본 검사를 실행합니다.

```powershell
node --test tests/*.test.cjs
```

선택적 브라우저 검사에는 Playwright와 Microsoft Edge가 필요합니다. Playwright는 프로젝트 밖 도구 폴더에 설치해도 됩니다.

```powershell
$env:PLAYWRIGHT_MODULE = 'D:/codex/.hermes/tools/browser-check/node_modules/playwright'
node tests/browser-check.cjs
```

위 경로는 이전 작업 환경의 예시입니다. 설치한 Playwright 모듈 경로로 바꾸거나, 모듈이 검색 가능한 경우 환경변수 없이 실행합니다. `browser-check.cjs`는 확장된 `browser-site-split.cjs`를 실행합니다. 두 독립 임시 HTTP 서버에서 6개 경로·4개 폭, 상담 복사 성공/실패, 전화/FAQ, 뒤로가기, 이탈 팝업, JS 비활성화, 상대 경로를 확인하고 서버를 종료합니다. 상담 전송과 외부 브라우저 이동은 가로챕니다. 증거는 `.seo/reports/site-split-browser/`에 저장합니다.

배포 입력 allowlist 검증은 저장소 밖에 `ignore@7`을 설치한 뒤 해당 모듈 경로를 지정합니다. 이 검사는 Vercel API/CLI를 호출하지 않습니다.

```powershell
npm install --prefix "$env:TEMP\math-site-split-qa" --no-audit --no-fund --ignore-scripts ignore@7
$env:IGNORE_MODULE = "$env:TEMP\math-site-split-qa\node_modules\ignore"
node tests/vercelignore-check.cjs
```

PR #1은 `main`에 병합했습니다. 기존 Vercel production 주소: https://math-standard-landing-page.vercel.app

기존 배포는 로컬 파일을 CLI로 업로드했습니다. 현재 PHASE 1에서는 재배포하지 않습니다. 루트 `.vercelignore`는 기존 사이트/Pilot/검색 파일만 포함하고 `elementary-site/`를 제외합니다. 초등에는 별도 `.vercelignore`가 있으며 내부 문서·설정·sitemap template은 업로드하지 않습니다.

## 검색 노출 준비

2026-09-11 `robots.txt`, `sitemap.xml`, Google·네이버 소유 확인 태그를 production에 배포하고 공개 응답을 확인했습니다. 사용자 계정에서 양쪽 소유 확인·사이트맵 제출을 진행해야 합니다. 자세한 순서는 [검색엔진 등록 안내](docs/search-registration.md)를 참고합니다. 배포 시 팀 권한 오류가 나면 기존 명령에 `--scope standard-of-math-s-projects`를 명시합니다.

- 현재 Production 사이트맵은 기존 5개 주소입니다. 로컬 중·고등 사이트맵은 루트·풍양중 Hub·시험분석의 3개 대표 주소이며 아직 배포하지 않았습니다.
- robots.txt는 검색로봇의 접근을 허용하고 사이트맵 위치를 안내합니다. 특정 AI 학습 로봇에 대한 별도 차단 정책은 추가하지 않았습니다.
- `.vercelignore`에 두 파일을 포함했습니다. 소유 확인은 HTML 메타태그 방식을 사용하면 별도 인증 파일의 배포 누락을 피할 수 있습니다.
- 기존 중·고등 도메인은 변경하지 않습니다. 신규 초등은 `PENDING PRODUCTION URL`이며 `noindex, follow` / `Disallow: /` 상태입니다. PHASE 2에서 실제 URL 확인 후 canonical·og:url·JSON-LD·robots·sitemap·llms를 일괄 확정하고 수집 차단을 해제합니다.
