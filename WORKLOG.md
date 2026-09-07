# 작업 기록 및 인계

## 현재 상태 — 2026-09-07

### 이탈 상담 안내 복원

- 사용자 요청으로 메인·초등·중고등 페이지에 `#exitOfferDialog`와 공통 `assets/exit-offer.js`를 추가했습니다. 페이지별로 다른 상담 권유 문구, 상담 양식 이동·카카오톡·닫기 버튼을 제공합니다.
- 8초 이상 체류 후 PC는 마우스가 화면 상단 바깥으로 나갈 때, 모바일은 600px 이상 읽고 240px 이상 위로 돌아갈 때 표시합니다. 페이지 방문당 한 번이며, 입력 필드 포커스·다른 모달·상담 진행 중에는 표시하지 않습니다.
- 모바일 뒤로가기나 탭 닫기를 가로채지 않습니다. 모바일의 되돌림 스크롤은 이탈 의도 추정 신호이며 실제 탭 닫기 감지가 아닙니다.
- 닫기·Escape·배경 클릭, 상담 필드 포커스 유지, 페이지 간 정상 이동을 보존했습니다. native dialog의 지연 close 이벤트가 상담 포커스를 덮는 문제를 회귀 검사로 확인해 수정했습니다.
- `tests/browser-exit-check.cjs`: 세 페이지 PC 표시·체류시간 조건·1회 제한·상담 이동·포커스, 모바일 표시·닫기·히스토리 비개입 검사 PASS. 기존 12개 Node 검사 및 전체 브라우저 회귀 검사 PASS. 공통 품질 검사 기존 SKIP/WARN 동일.
- Vercel production 배포: `dpl_AgkxT3yQ2pxkcGr2HSRaMJFcnpJY`, https://math-standard-landing-page.vercel.app.
- 이 기록이 아래 초기 구현 시 ‘이탈 팝업 제거’ 결정에 우선합니다.

### Vercel production 배포 완료

- 공개 주소: https://math-standard-landing-page.vercel.app
- 초등: https://math-standard-landing-page.vercel.app/elementary.html
- 중고등: https://math-standard-landing-page.vercel.app/secondary.html
- 프로젝트: standard-of-math-s-projects/math-standard-landing-page
- 최종 deployment: dpl_2LZQjYvKeKkem2FvNttUuad8kpoT (READY, production)
- 배포 명령: `npx --yes vercel@59.11.7 deploy --prod --yes`
- 배포 후 세 페이지 200 및 canonical 확인. JS·두 사진 200. WORKLOG와 계획서 요청은 404로 공개 제외 확인.
- 고정 production 도메인을 canonical·og:url에 반영한 뒤 재배포했습니다.
- Node 검사 12/12 PASS. GitHub push 없이 현재 로컬 파일을 CLI로 배포했습니다. 이후 수정은 같은 폴더에서 위 명령으로 다시 배포합니다.
- 아래 구현·로그인 대기 기록은 이전 단계의 이력입니다.


### Vercel 배포 요청

- 사용자가 Vercel 배포를 요청했습니다. Vercel CLI 59.11.7을 실행했으며 계정 로그인이 되어 있지 않아 device login을 시작했습니다.
- `vercel.json`: 별도 빌드 없는 정적 사이트, 루트 출력, 기존 `.html` 링크 유지 설정.
- `.vercelignore`: 루트 3개 HTML, assets/, vercel.json만 업로드하도록 제한. 계획서·작업 기록·테스트·이전 outputs/work 사본은 제외합니다.
- `.gitignore`: 로컬 .vercel 연결 정보·node_modules·환경 파일 제외.
- 배포 직전 Node 검사 12/12 PASS. 공통 품질 검사는 기존 SKIP/WARN과 동일합니다.
- 현재 온라인 배포는 아직 수행하지 않았습니다. 로그인 완료 후 `npx --yes vercel@59.11.7 whoami`로 인증을 확인하고 프로젝트 연결·production 배포를 진행합니다. 인증 코드가 만료되면 login을 다시 실행합니다. 코드나 토큰은 이 기록에 저장하지 않습니다.
- 로그인 URL을 기본 브라우저로 여는 Start-Process 명령은 정책에 의해 차단됐습니다. 사용자에게 로그인 링크를 제공해 직접 인증하도록 안내합니다.

승인된 계획에 따라 메인·초등·중고등 3페이지를 구현했습니다. 사용자가 제공한 첫 번째 사진은 메인 초등 카드에, 두 번째 사진은 중고등 카드에 원본 그대로 복사해 배치했습니다. 원격 푸시·배포는 수행하지 않았습니다.

작업 브랜치: `feat/three-page-landing`. 현재 파일을 직접 편집하고 `index.html`을 브라우저로 열어 이어서 확인할 수 있습니다. 사용자의 커밋·푸시 요청에 따라 이 작업 브랜치에 변경을 기록합니다.

## 2026-09-07 구현 작업

- `index.html`: 사진이 있는 초등·중고등 선택 카드, 공통 철학, 공통 FAQ, 상담·위치로 재구성했습니다.
- `elementary.html`: 진단·개별 진도, 홉/스텝/점프, 5단계 학습, 첨삭·C-AT·스마트 노트, 귀가보고서, 실제 후기 요약과 초등 FAQ를 구현했습니다.
- `secondary.html`: 플립러닝, 오답·MCS·재테스트, 학교별 시성비, 시험 전 4주~시험 후 과정, 지도 사례와 중고등 FAQ를 구현했습니다.
- `assets/site.css`, `assets/elementary.css`, `assets/secondary.css`: 공통 및 과정별 스타일을 분리하고 360/390/768/1440px 화면을 검수했습니다.
- `assets/site.js`: 상담 문장 복사와 실패 시 수동 복사, 전화 모달, FAQ 펼침, 구형 해시 연결을 통합했습니다. 모바일 뒤로가기 가로채기와 이탈 팝업을 제거했습니다.
- `assets/elementary-portrait.png`: `Adobe Express - file.png` 원본 복사본. `assets/secondary-portrait.png`: `프로필 45.png` 원본 복사본. 얼굴 수정이나 이미지 생성은 하지 않았습니다.
- JavaScript가 없을 때 제출 버튼은 비활성화됩니다. 로컬 제출 핸들러가 준비된 뒤에만 활성화해 입력 정보의 기본 GET 전송을 막습니다.
- 질문 위젯 링크는 답변을 펼치고 패널을 닫은 뒤 해당 질문에 키보드 포커스를 이동합니다. 원래 앵커 동작이 포커스를 되돌리는 브라우저 문제를 발견해 수정했습니다.
- 전화번호 복사는 Clipboard API 실패 시 실제 번호를 Range로 선택해 복사합니다. 모달 내부 여백 클릭은 닫힘으로 오인하지 않습니다.
- HTML 정리 중 초등·중고등 고민 섹션의 닫는 div 누락을 발견해 수정하고 컨테이너 검사에 회귀 항목을 추가했습니다.
- 웹사이트 소스는 정적 파일이며 별도 빌드가 필요 없습니다. 작업 중 사용한 상위 `.hermes/tools/landing-pages-build.cjs`는 초기 생성용 임시 도구로, 이후 수정이 반영되지 않았으므로 재실행하지 않습니다. 현재 프로젝트 파일이 기준입니다.

## 계획에서 조정한 사항과 배포 전 확인

- 점수 원자료와 공개 범위가 확인되지 않은 성적 숫자 대신, 만다라트에 기록된 학습 변화 과정을 익명 요약했습니다. 초등은 실제 후기 요약을 구분해 표시했습니다.
- 교재·보고서 실물 이미지가 없는 부분은 사실에 근거한 설명과 도식으로 구현했습니다. 가짜 증빙 이미지는 만들지 않았습니다.
- 페이지마다 고유 title·description·Open Graph 텍스트를 설정했습니다. canonical·공유 URL은 실제 배포 주소와 게시 경로를 확인한 뒤 설정합니다.
- `outputs/`, `work/`, 원본 만다라트와 사진 파일은 수정하지 않았습니다.
- 공개 배포를 요청받으면 실제 모집 학년·상담 시간·체험 조건과 사용 자료의 공개 범위를 최종 확인하고 루트 3페이지와 공통 자산을 함께 게시합니다.

## 완료한 작업

1. GitHub 저장소를 `D:\codex\math-standard-landing-page`에 복제했습니다. 당시 브랜치는 `main`, 기준 커밋은 `298c605`였습니다.
2. 현재 `index.html`을 기본 브라우저로 여는 명령을 실행했습니다. 앱 내 브라우저는 `iab` 연결이 불가능했습니다. 화면·기능 전체 검증은 하지 않았습니다.
3. 현재 HTML의 섹션·앵커·상담·전화 모달·FAQ·이탈 팝업 구조를 확인했습니다.
4. 공유폴더의 수학의 기준 DOCX 본문과 딱풀리는 수학 PDF 15페이지 텍스트를 검토했습니다.
5. 사용자가 ‘메인 + 초등 + 중·고등, 총 3페이지’를 선택했습니다.
6. 페이지별 콘텐츠·문구 초안·파일 구성·구현 순서·자료 확인 기준·검수 항목을 계획했습니다.
7. 이번 인계 작업에서 계획서를 `docs/2026-09-07-content-and-pages-plan.md`로 복사하고 `README.md`, `AGENTS.md`, 본 기록을 추가했습니다. 이후 계획 변경은 프로젝트 내부 사본을 기준으로 합니다.

## 중요한 결정과 근거

- 메인: 두 브랜드의 공통 철학, 과정 선택, 상담·위치 중심으로 짧게 구성합니다.
- 초등: 초3~초6, 개별 진도, 홉·스텝·점프 교재, 5단계 학습, C-AT 오답관리, 설명하기, 매일 귀가보고서가 핵심입니다.
- 중고등: 플립러닝, 메타인지 오답노트·재테스트, 학교별 시성비, 시험 전후 관리와 성장 사례가 핵심입니다. 재원 중1~고2와 신규 모집 중1~고1을 구분합니다.
- 과정을 클릭하면 같은 탭에서 독립 HTML 페이지로 이동합니다. 고등은 중등과 통합합니다.
- 초등 PDF p.12~13의 미작성 질문과 예시는 실제 성과로 쓰지 않습니다. 실제 후기는 p.6~9에 있습니다.
- 학원 제공 성적 사례는 원자료·시점을 확인해 사용하며 성적 보장이나 전원 성과로 확대하지 않습니다.
- 학교 IB 운영, 입시 제도, 비용·시간표 등은 현재 상태를 확인하지 않았습니다. 확정되지 않은 내용을 임의로 게시하지 않습니다.
- 원본 문서 경로와 섹션별 근거는 계획서 2절에 있습니다. 원본은 공유폴더에 있고 이 저장소에 복사하지 않았습니다.

## 이어서 작업할 때

1. 메인 사진 크기·문구·전용 페이지 순서에 대한 사용자 피드백을 반영합니다.
2. 실제 교재·보고서 이미지나 확인된 성적 자료가 제공되면 해당 섹션을 보강합니다.
3. 수정 후 `node --test tests/*.test.cjs`를 실행하고, 화면·동작을 변경했다면 README의 브라우저 검수도 실행합니다.
4. 배포 요청이 있으면 위 배포 전 확인 항목을 적용합니다.

## 검증 기록

### 구현 후 최종 검증

- `node --test tests/*.test.cjs`: 12/12 PASS. 상담 문장·구형 해시·복사 실패·전화번호 선택·모달 닫힘·FAQ 포커스·제출 활성화 순서·HTML 컨테이너·로컬 경로·사진 매핑을 검사했습니다.
- `node tests/browser-check.cjs`: PASS. Microsoft Edge에서 3개 페이지 × 360/390/768/1440px 화면의 이미지 로딩·가로 넘침을 확인했습니다.
- 모바일 과정 이동·정상 뒤로가기·새로고침·로고 홈 이동·4개 구형 해시 연결 PASS.
- 전화 모달 Escape·원래 버튼으로 포커스 복귀·Clipboard API 거부 시 실제 번호 선택 PASS.
- FAQ 위젯의 답변 펼침·패널 닫힘·질문 포커스 PASS.
- 3개 페이지의 과정 기본 선택값·수동 복사용 상담 문장·입력 문자열 안전 표시·로컬 저장 없음 PASS. 외부 창 열기는 테스트에서 가로채 실제 상담을 전송하지 않았습니다.
- JavaScript를 끈 실제 브라우저에서 버튼 비활성 및 Enter 입력 시 GET 전송 없음 PASS.
- `file://` 직접 열기·전용 페이지 이동·이미지 표시 PASS. 페이지 JavaScript 오류 0건.
- HTML/CSS 구문 분석·포맷 정리 및 `node --check assets/site.js`, `git diff --check` PASS.
- 제공 사진과 복사본의 SHA-256이 각각 일치합니다.
- 검수 스크린샷은 `docs/previews/`에 저장했습니다. 메인·초등·중고등 상단 및 사례 섹션을 시각적으로 확인했습니다.
- 독립 코드 리뷰 후 제출 기본 GET 방지, 전화 복사 fallback, FAQ 위젯 이동을 보완했습니다. 최종 검증 시 미해결 Critical/Important 지적 없음.
- 상위 품질 검사의 기존 school_exam_webapp_v2_4 부재 SKIP 및 somclass 구조 균형 WARN은 이번 정적 사이트와 무관하며 그대로 기록합니다.

- 계획 단계 사이트 범위 workspace audit: 13개 파일 확인, 512KB 초과 파일 없음.
- 상위 공통 품질 검사: school_exam_webapp_v2_4 부재 SKIP, somclass 소스·doGet PASS, 기존 구조 문자 균형 WARN. 이 결과는 랜딩페이지 기능 PASS를 의미하지 않습니다.
- 인계 단계: 프로젝트 내부 계획서와 원본 SHA-256 일치 PASS. README·AGENTS·WORKLOG·계획서 링크 대상 존재 PASS. 기존 HTML·assets·outputs·work에 Git diff 없음. 추가된 문서 4개는 아직 커밋하지 않았습니다.
- 인계 후 공통 품질 검사를 다시 실행했고 기존과 같은 PASS/SKIP/WARN 결과를 확인했습니다. 문서 변경으로 사이트 기능 검사를 수행한 것은 아닙니다.

## 환경 참고

- Windows PowerShell, 로컬 경로 `D:\codex\math-standard-landing-page`.
- VS Code의 `code` 명령 사용 가능.
- Python·Poppler는 당시 PATH에서 사용할 수 없었습니다. DOCX는 .NET ZIP/XML로 읽었고 PDF는 상위 `.hermes/tools/pdf-reader`에 설치한 `pdfjs-dist`로 텍스트를 추출했습니다. 사이트 실행에는 필요하지 않습니다.
- 이 저장소에 패키지 설치나 프레임워크 전환은 수행하지 않았습니다.

- 이탈 팝업 배포 후 공개 도메인에서 동일 브라우저 검사를 실행해 세 페이지 PC 및 모바일 동작 PASS를 확인했습니다.

## 2026-09-07 Git 기록

- 사용자 요청: 현재 변경 사항 커밋 및 GitHub 푸시.
- 브랜치: feat/three-page-landing. 원격: mathcraft-creator/math-standard-landing-page.
- 포함: 3페이지, 사진·공통 자산, 이탈 팝업, Vercel 설정, 계획·작업 기록, 테스트·검수 이미지.
- 제외: .vercel 로컬 연결 정보 및 환경 파일. main 병합 없이 작업 브랜치를 푸시한다.
- 커밋 전 Node 검사 12/12 PASS 및 git diff --check 통과.
