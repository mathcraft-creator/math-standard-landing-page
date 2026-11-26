# 수학의 기준 · 딱풀리는수학 랜딩 페이지

진접 지역 수학학원 안내용 정적 웹사이트입니다. 현재 운영 소스는 `index.html`, `elementary/index.html`, `middle/index.html`이며, `elementary.html`과 `secondary.html`은 이전 주소를 위한 이동 페이지입니다. 상담은 전화·카카오톡 버튼입니다. 사이트 실행에는 패키지 설치나 빌드가 필요하지 않습니다.

운영 주소: **https://math-standard.co.kr**. 2026-11-25 CLAUDE의 최신 main(`ec41492`)에 있는 도메인·검색엔진 인증·308 이동 설정을 현재 작업과 통합하고, 탐색관과 4개교 6학기 추천까지 Production 배포했습니다. 옛 vercel.app과 www는 새 주소로 이동합니다. 소스는 현재 작업 폴더에서 CLI로 배포했으며 이번 작업에서 Git 커밋·push는 하지 않았습니다.

## 과목·전공 교차 탐색관 (2026-11-20 로컬 통합)

- 탐색관: `curriculum/index.html`. Vercel의 `/curriculum`, `/curriculum/` 명시적 rewrite를 설정했습니다. 실제 Vercel 응답은 Preview 배포 후 확인해야 합니다.
- 원본 `2022개정_과목전공_교차탐색관.html`은 수정·배포하지 않습니다. 통합본만 `curriculum/`에서 제공합니다. 원본이 있는 작업 폴더에서는 `node scripts/integrate-curriculum.cjs`로 통합본을 재생성할 수 있습니다.
- 로컬 서버: `node tests/curriculum-server.cjs` → `http://127.0.0.1:4173/curriculum`.
- 자동 브라우저 검증: Playwright 모듈 경로를 `PLAYWRIGHT_MODULE`에 지정하고 `node tests/browser-curriculum-check.cjs`. 결과와 화면은 `output/playwright/curriculum/`에 생성됩니다. 기존 `tests/browser-check.cjs`는 이전 디자인 선택자를 사용하므로 현재 페이지 전체 검증용으로 사용하지 않습니다.
- [통합 구조·배포·롤백](docs/curriculum-integration.md), [테스트 보고서](docs/curriculum-test-report.md), [원본 데이터 해시·개수](docs/curriculum-source-manifest.json).
- 2026-11-25 사용자 요청으로 Preview·Production 배포와 새 도메인의 공개 응답·기능 검증을 완료했습니다.

## 학교별 6학기 과목 선택 설계

- 로컬 실행: `node tests/curriculum-server.cjs` → `http://127.0.0.1:4173/curriculum/planner/`.
- 진접고·오남고·진건고의 2027 입학생 편성 계획과 광동고의 **수집 자료 기반 6학기 추정 추천**을 제공합니다. 광동고는 나이스 2026 시간표에서 선별한 134개 학기별 과목 후보와 캡처 60행을 활용하며 학점은 미확인으로 둡니다. 3학년은 2015 교육과정 재학생의 과목명 참고이며 2029년 개설·2022 개정 대체 과목을 학교에서 확인해야 합니다. 희망학과별 추천 이유·대안과 고정/제외·저장·복사·인쇄를 지원합니다.
- 고정/제외 조정, 이수 기록 미입력 표시, 브라우저 입력 저장/복원, 문장 복사(차단 시 수동 복사), 인쇄/PDF 저장을 제공합니다. 로그인·외부 AI API·자동 상담 접수는 없습니다.
- 신규 도구는 JSON·Worker를 사용하므로 `file://` 대신 HTTP 서버로 확인합니다. 기존 랜딩의 파일 열기는 유지됩니다.
- 원본 엑셀을 갱신한 뒤 `python -X utf8 scripts/import-school-curricula.py`로 공개 JSON을 재생성합니다(Python·openpyxl 필요). 원본 엑셀은 수정하지 않습니다. 정해진 행 수·선택군·학점과 다르면 변환이 멈추므로 변경을 검토한 뒤 기준을 갱신합니다.
- 테스트: `node --test tests/*.test.cjs`, Playwright 모듈 설정 후 `node tests/browser-course-planner-check.cjs`.
- [구현·검증 보고서](docs/course-planner-implementation.md), [데이터 검수 기록](docs/course-planner-data-audit.json), [최초 계획](docs/2026-11-23-school-course-planner-plan.md).
- 원본 엑셀은 `.vercelignore`로 배포에서 제외하며, 새 도메인에서 원본 엑셀과 인증키 파일의 404를 확인했습니다. 실제 학교 개설 확정·졸업요건·2030 대학 요건을 판정하지 않습니다.
- 광동고 캡처는 학교 엑셀의 `네이버캡처_20261123` 시트에 별도 기록했습니다. 화면에 없는 학점·적용연도·입학연도·선택군은 비워 두었으며 기존 공식 편제표와 합치지 않습니다. 사용자 요청으로 수정한 광동고·4개교 비교 파일의 이전본은 `work/backups/kwangdong-20261123/`, 변경 이력은 `docs/course-planner-workbook-updates.json`에 있습니다.
- [광동고 나이스 수집 결과](docs/kwangdong-neis-collection.md): 로컬 인증키로 2025·2026 시간표 109,710행과 학교·학급·학사일정·계열·학과 정보를 수집했습니다. 캡처 60과목 모두 2026 같은 학년·학기 시간표에서 확인했습니다. 원본은 `work/neis/kwangdong/2026-11-23/`에 있으며 Git·배포에서 제외합니다. 재수집은 `python -X utf8 scripts/collect-kwangdong-neis.py`. 후속 사용자 요청으로 이 자료를 추정 추천에 활용했습니다. `scripts/build-kwangdong-neis-evidence.py`로 검토된 이름만 선별하며, importer는 저장된 근거 JSON만으로 재생성합니다. 서비스 추천 개수는 학교의 택N 조건이 아닙니다.

## 이어서 작업하기

1. [작업 기록 및 인계](WORKLOG.md)를 읽어 완료한 작업과 다음 단계를 확인합니다.
2. [콘텐츠 개편·페이지 분리 계획](docs/2026-09-07-content-and-pages-plan.md)을 기준으로 작업합니다.
3. [프로젝트 작업 지침](AGENTS.md)을 확인합니다.

이 폴더를 편집기에서 작업 폴더로 열면 됩니다. 이전 대화가 없어도 위 문서에서 맥락을 확인할 수 있습니다.

```powershell
code D:\codex\math-standard-landing-page
```

## 현재 페이지 확인

`index.html`을 브라우저로 엽니다. 별도의 패키지 설치나 빌드가 필요하지 않습니다.

```powershell
Start-Process (Join-Path (Get-Location) 'index.html')
```

## 파일 구성

- `index.html`: 초등·중고등 사진 선택 카드, 공통 철학·FAQ·상담.
- `elementary.html`: 초3~초6 딱풀리는수학 진접점 전용 페이지.
- `secondary.html`: 중·고등 수학의 기준 진접본원 전용 페이지.
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

팝업 검수: Playwright 모듈 설정 후 `node tests/browser-exit-check.cjs`. `EXIT_TEST_ORIGIN=https://math-standard.co.kr`을 설정하면 배포본을 검사합니다. 새 도메인 주요 페이지·4개교 추천 검수는 `node tests/browser-production-check.cjs`입니다.

Node.js가 있으면 별도 패키지 설치 없이 기본 검사를 실행합니다.

```powershell
node --test tests/*.test.cjs
```

선택적 브라우저 검사에는 Playwright와 Microsoft Edge가 필요합니다. Playwright는 프로젝트 밖 도구 폴더에 설치해도 됩니다.

```powershell
$env:PLAYWRIGHT_MODULE = 'D:/codex/.hermes/tools/browser-check/node_modules/playwright'
node tests/browser-check.cjs
```

위 경로는 이번 작업 환경의 도구 위치입니다. 다른 환경에서는 설치한 Playwright 모듈 경로로 바꾸거나, 모듈이 검색 가능한 경우 환경변수 없이 실행합니다. 검사 스크립트는 임시 로컬 서버를 열고 종료하며 상담 전송을 가로채 실제 메시지를 보내지 않습니다.

PR #1은 `main`에 병합했습니다. 기존 Vercel production 주소: https://math-standard-landing-page.vercel.app

각 페이지의 canonical·공유 URL을 설정했습니다. Vercel에는 로컬 파일을 CLI로 배포했습니다. 재배포: `npx --yes vercel@59.11.7 deploy --prod --yes`. `.vercelignore`가 사이트 파일과 검색 파일만 업로드하도록 제한합니다.

## 검색 노출 준비

2026-09-11 `robots.txt`, `sitemap.xml`, Google·네이버 소유 확인 태그를 production에 배포하고 공개 응답을 확인했습니다. 사용자 계정에서 양쪽 소유 확인·사이트맵 제출을 진행해야 합니다. 자세한 순서는 [검색엔진 등록 안내](docs/search-registration.md)를 참고합니다. 배포 시 팀 권한 오류가 나면 기존 명령에 `--scope standard-of-math-s-projects`를 명시합니다.

- 사이트맵은 메인·초등·중고등과 풍양중 School Hub·시험 분석의 canonical 5개 주소를 포함합니다.
- robots.txt는 검색로봇의 접근을 허용하고 사이트맵 위치를 안내합니다. 특정 AI 학습 로봇에 대한 별도 차단 정책은 추가하지 않았습니다.
- `.vercelignore`에 두 파일을 포함했습니다. 소유 확인은 HTML 메타태그 방식을 사용하면 별도 인증 파일의 배포 누락을 피할 수 있습니다.
- 도메인을 바꾸면 3페이지의 canonical·og:url, robots.txt의 사이트맵 주소, sitemap.xml의 주소를 함께 수정합니다.
