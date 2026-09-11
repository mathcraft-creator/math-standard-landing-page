# 수학의 기준 · 딱풀리는수학 랜딩 페이지

진접 지역 수학학원 안내용 정적 웹사이트입니다. 메인·초등·중고등 3페이지와 과정별 상담 동선을 구현했습니다. 사이트 실행에는 패키지 설치나 빌드가 필요하지 않습니다.

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

위 경로는 이번 작업 환경의 도구 위치입니다. 다른 환경에서는 설치한 Playwright 모듈 경로로 바꾸거나, 모듈이 검색 가능한 경우 환경변수 없이 실행합니다. 검사 스크립트는 임시 로컬 서버를 열고 종료하며 상담 전송을 가로채 실제 메시지를 보내지 않습니다.

현재 작업 브랜치는 `feat/three-page-landing`입니다. Vercel production 배포 완료: https://math-standard-landing-page.vercel.app

각 페이지의 canonical·공유 URL을 설정했습니다. Vercel에는 로컬 파일을 CLI로 배포했습니다. GitHub 작업 브랜치는 `feat/three-page-landing`입니다. 재배포: `npx --yes vercel@59.11.7 deploy --prod --yes`. `.vercelignore`가 사이트 파일만 업로드하도록 제한합니다.
