# 작업 기록 및 인계

## 2026-09-21 SEO/GEO 커밋·푸시·Production 검증

- 사이트 변경 커밋: `4e1b29542b485cbb1a5afbf7abb91f24886a3a1a` (`feat: add structured SEO and AI discovery metadata`). 요청된 7개 파일, 455 insertions를 포함했습니다.
- `origin/main`을 `47d9858`에서 `4e1b295`로 일반 fast-forward push했습니다. force push·amend·기존 이력 변경은 수행하지 않았습니다.
- GitHub push 후 자동배포가 생성되지 않아 기존 `standard-of-math-s-projects/math-standard-landing-page` 연결을 확인하고 Vercel CLI로 Production 배포했습니다.
- Vercel deployment: `dpl_J6C91ZtDWSyj8DaHBoFZ7nn2URwe`, READY. 배포 URL `https://math-standard-landing-page-4iero4c6v.vercel.app`을 고정 Production URL `https://math-standard-landing-page.vercel.app`에 alias한 상태를 확인했습니다.
- 실제 HTTP 검증: 메인·초등·중고등·llms.txt·robots.txt·sitemap.xml 모두 200. 세 HTML의 title, description, canonical, Open Graph, Twitter, H1, noindex 부재, JSON-LD를 확인했습니다.
- JSON-LD는 각 페이지 1개 블록 모두 파싱 성공했습니다. 공통 `/#academy` 엔터티와 초등·중고등 브랜드의 parentOrganization 연결도 Production 응답에서 확인했습니다.
- llms.txt는 `text/plain; charset=utf-8`의 실제 파일이며 HTML fallback이 아닙니다. robots.txt와 충돌하지 않고 canonical URL 3개를 포함합니다.
- 존재하지 않는 `/__seo-validation-not-found-20260920`은 실제 HTTP 404를 반환해 soft 404가 아님을 확인했습니다.
- 검증: Node 17/17 PASS, SEO 구조 테스트 5/5 PASS, `git diff --check` 통과.
- P0/P1 문제 없음. P2: GitHub push 자동배포가 생성되지 않아 이번에는 수동 CLI 배포가 필요했습니다. 설정은 변경하지 않았습니다.
- 상세 보고서: `.seo/reports/production-validation.md`.
- 남은 외부 확인: Google Search Console, 네이버 서치어드바이저, Google Rich Results Test, Schema.org Validator, 실제 검색·AI 검색 노출 상태.

## 2026-09-20 SEO/AEO 구조화 데이터 보강

- 원격 main과 로컬 기준을 비교해 기존 정적 HTML 본문, 페이지별 title·description·canonical, robots.txt, sitemap.xml, 검색엔진 소유 확인 태그가 유지되고 있음을 확인했습니다.
- 메인·초등·중고등 페이지에 한국어 공유 메타(og:locale, og:site_name, Twitter 카드)와 JSON-LD를 추가했습니다. 공통 교육기관·지역·연락처 정보, 페이지별 WebPage, 실제 본문과 일치하는 FAQPage, 상세 페이지 BreadcrumbList를 포함합니다.
- 허위 평점·리뷰·성적·가격·운영시간은 구조화 데이터에 넣지 않았습니다. 공통 학원은 모든 페이지에서 동일한 `/#academy` @id와 주소·전화번호를 사용하고, 초등·중고등 브랜드는 parentOrganization으로 연결했습니다. 학교명은 제휴로 오해될 수 있는 areaServed에서 제외하고 실제 본문에만 유지했습니다.
- llms.txt에 주요 공개 페이지와 확인 가능한 학원 정보를 정리하고 .vercelignore 배포 허용 목록에 추가했습니다. llms.txt는 AI 검색 순위를 보장하는 요소가 아니라 공개 콘텐츠 탐색을 돕는 보조 안내 파일입니다.
- tests/seo-structure.test.cjs를 추가해 canonical, 공유 메타, JSON-LD 파싱·타입, 화면 FAQ와 구조화 FAQ의 일치, robots·sitemap·llms.txt URL 및 배포 포함 여부를 검사합니다.
- 검증: 새 테스트 RED 4건을 확인한 뒤 구현했고, 전체 Node 테스트 16/16 PASS 및 git diff --check 통과를 확인했습니다. 화면 본문·CSS·JavaScript를 변경하지 않아 브라우저 시각 회귀 검사는 생략했습니다.
- 이번 작업은 로컬 변경만 수행했습니다. 커밋·GitHub 푸시·Vercel 배포·검색엔진 제출은 수행하지 않았습니다.
- 남은 운영 작업: 변경 검토 후 커밋·푸시·배포, 공개 URL의 JSON-LD·llms.txt 응답 확인, Google Search Console·네이버 서치어드바이저에서 사이트맵 제출과 수집·색인 상태 확인.

## 2026-09-11 검색 설정 커밋·푸시

- 사용자 요청으로 배포된 검색 설정과 관련 문서를 main에 커밋하고 origin/main으로 푸시합니다.
- 포함 파일: index.html의 Google·최신 네이버 인증 태그, robots.txt, sitemap.xml, .vercelignore, README.md, docs/search-registration.md, docs/2026-09-07-content-and-pages-plan.md, WORKLOG.md.
- 커밋 전 Node 12/12 PASS, git diff --check 통과. 상위 공통 품질 검사는 종료 코드 0, 기존 SKIP/WARN 동일.
- 앞선 기록의 미커밋 상태는 이 작업으로 정리합니다. 남은 작업은 사용자 계정에서 소유 확인·사이트맵 제출 및 색인 확인입니다.

## 2026-09-11 네이버 인증 태그 교체

- 사용자 요청에 따라 index.html의 네이버 인증값을 171a5a6dcfe42518d66f36ee407638acb8c02e42로 교체했습니다. 변경 파일은 index.html과 WORKLOG.md입니다.
- Vercel production 배포 완료: dpl_D3B8hRqUV6PjmU2pcBz3gtNrmAG7 (READY), https://math-standard-landing-page.vercel.app.
- 검증: Node 12/12 PASS, git diff --check 통과. 공개 메인 200, head의 새 네이버 태그·이전 값 제거·기존 Google 태그 보존 확인 PASS.
- 상위 공통 품질 검사 종료 코드 0, 기존 SKIP/WARN 동일. 화면·동작 변경이 없어 브라우저 검수는 재실행하지 않았습니다.
- 남은 작업: 사용자 네이버 소유 확인 및 사이트맵 제출. 이번 변경은 CLI로 배포했으며 Git 커밋·푸시는 수행하지 않았습니다.

## 2026-09-11 네이버 소유 확인 태그 배포

- 사용자 제공 네이버 메타태그를 index.html의 head에 추가했습니다. 기존 Google 태그를 유지했습니다.
- 변경 파일: index.html, README.md, docs/search-registration.md, docs/2026-09-07-content-and-pages-plan.md, WORKLOG.md.
- 기존 팀을 명시한 Vercel CLI 명령으로 production 배포 완료: dpl_64wGtNb2oqDT923bB3dmsdz9fGGn (READY), https://math-standard-landing-page.vercel.app.
- 검증: Node 12/12 PASS, git diff --check 통과. 공개 홈페이지 HTTP 200 및 head 내 정확한 네이버·Google 인증 태그 확인 PASS. robots.txt·sitemap.xml HTTP 200.
- 상위 공통 품질 검사 종료 코드 0: 기존 school_exam_webapp_v2_4 부재 SKIP, somclass 소스·doGet PASS, 구조 문자 균형 WARN. 화면·동작 변경이 없어 브라우저 검수는 재실행하지 않았습니다.
- 남은 작업: 사용자 계정에서 양쪽 소유 확인·사이트맵 제출 및 색인 상태 확인. 이번 변경의 Git 커밋·푸시는 수행하지 않았습니다.

## 2026-09-11 Google 소유 확인 태그 및 검색 파일 배포

- 사용자 제공 Google 메타태그를 index.html의 head에 적용했습니다. 채팅의 마크다운 이스케이프 역슬래시를 제외하고 실제 값의 밑줄을 보존했습니다.
- 기존 로컬 robots.txt, sitemap.xml, .vercelignore 변경을 함께 production에 배포했습니다. README, 검색 등록 안내, 계획서와 이 기록에 현재 상태를 반영했습니다.
- 최초 배포는 Not authorized로 실패했으나 로그인 및 기존 팀·프로젝트 조회 확인 후 `npx --yes vercel@59.11.7 deploy --prod --yes --scope standard-of-math-s-projects`로 성공했습니다.
- Deployment: dpl_2soLPzp4EE4F5v8cgdHghwDCZDeU, READY/production. 공개 주소: https://math-standard-landing-page.vercel.app.
- 검증: Node 12/12 PASS, git diff --check 통과. 공개 메인 200 및 head 내 정확한 Google 태그 확인 PASS, robots.txt·sitemap.xml·초등·중고등 200. 공개 사이트맵 XML 파싱·URL 3개 및 robots의 사이트맵 참조 확인 PASS.
- 공개 검증 첫 시도는 PowerShell HOME 읽기 전용 변수명 충돌로 실행 오류가 났으며, 전용 변수명으로 변경해 재실행한 위 결과를 최종 근거로 사용했습니다.
- 상위 공통 품질 검사 종료 코드 0, 기존 SKIP/WARN 동일. 화면·상담 동작 변경이 없어 브라우저 검수는 재실행하지 않았습니다.
- 남은 작업: 사용자 Google 소유 확인 및 사이트맵 제출, 네이버 인증 태그 전달·적용·배포 및 네이버 계정 확인·제출. 검색 색인 완료를 의미하지 않습니다. 이번 변경은 CLI로 배포했으며 Git 커밋·푸시는 수행하지 않았습니다.

## 2026-09-11 검색 노출 로컬 준비 완료

- 사용자 요청: 현재 로컬에서 가능한 검색 준비를 먼저 적용하고 직접 해야 할 일 안내.
- 변경 파일: robots.txt, sitemap.xml, .vercelignore, README.md, docs/search-registration.md, docs/2026-09-07-content-and-pages-plan.md, WORKLOG.md.
- robots.txt는 전체 수집 허용 및 사이트맵 위치를 안내합니다. 사이트맵에는 기존 canonical과 같은 메인·초등·중고등 3개 URL만 포함하며, 두 파일을 Vercel 업로드 허용 목록에 추가했습니다.
- README의 병합 전 브랜치 설명을 갱신하고, 검색 등록 안내에 Google URL 접두어·HTML 태그와 네이버 HTML 태그 발급, 배포, 소유 확인, 사이트맵 및 개별 URL 제출 순서를 기록했습니다.
- 검증: node --test tests/*.test.cjs 12/12 PASS. .NET XML 파싱, 3개 URL과 HTML canonical 일치, 두 검색 파일의 배포 목록 포함, robots의 사이트맵 주소 확인 PASS. git diff --check 통과.
- 상위 공통 품질 검사 종료 코드 0: school_exam_webapp_v2_4 부재 SKIP, somclass 소스·doGet PASS, 기존 구조 문자 균형 WARN.
- HTML/CSS/JS와 상담·이동 동작을 변경하지 않아 브라우저 검수는 재실행하지 않았습니다. 검색 파일은 로컬 검증이며 공개 배포 결과를 의미하지 않습니다.
- 이번 변경은 로컬에만 준비했습니다. 커밋·푸시·재배포·검색엔진 제출은 수행하지 않았습니다.
- 남은 작업: 사용자가 Google·네이버에서 발급한 실제 인증 태그 전달 → index.html에 태그 적용 및 배포 → 공개 파일 확인 → 사용자 계정에서 소유 확인·사이트맵 제출·색인 상태 확인.

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

## 2026-09-11 커밋·푸시 확인

- 사용자 요청: GitHub에 커밋 및 푸시.
- 시작 시 작업 트리는 깨끗했으며, 로컬과 GitHub의 feat/three-page-landing은 모두 6317079로 일치했습니다.
- 변경 파일: WORKLOG.md에 이번 확인 결과를 추가했습니다.
- 기본 검사: node --test tests/*.test.cjs, 12/12 PASS.
- 상위 공통 품질 검사: 종료 코드 0. school_exam_webapp_v2_4 부재 SKIP, somclass 소스·doGet PASS, 구조 문자 균형 WARN. 사이트 동작 검사 결과와는 별개입니다.
- 사이트 소스 변경이 없어 브라우저 검수는 다시 실행하지 않았습니다.
- 이 기록을 작업 브랜치에 커밋하고 origin/feat/three-page-landing으로 푸시합니다. 남은 구현 작업은 추가하지 않았습니다.

## 2026-09-11 main 대상 PR 준비

- 사용자 요청: feat/three-page-landing에서 main으로 PR 생성.
- 기존 열린 PR이 없음을 GitHub에서 확인했습니다.
- 변경 파일: WORKLOG.md에 PR 준비 및 검증 결과를 기록했습니다.
- node --test tests/*.test.cjs: 12/12 PASS. git diff --check origin/main...HEAD 통과.
- 브라우저 검수는 재실행하지 않았으며 기존 구현 검수 기록을 PR에 구분해 기재합니다. 상위 공통 품질 검사는 같은 세션의 직전 실행 결과(종료 코드 0, 기존 SKIP/WARN)를 참고합니다.
- PR 범위: 메인·초등·중고등 페이지 분리, 공통 상담·FAQ와 이탈 안내, 자산·테스트·배포 설정 및 문서. 병합은 수행하지 않습니다.

## 2026-09-11 PR 병합 및 검색 노출 점검

- 사용자 요청에 따라 PR #1을 main에 병합했습니다. 병합 커밋: 5bc9f4f4b583dd8414062e54ae07e678ee4789bd. 로컬 main도 origin/main으로 fast-forward했습니다.
- 변경 파일: WORKLOG.md에 병합 결과와 검색 점검을 기록했습니다. 사이트 기능·검색 설정·Vercel 재배포는 이번 요청에서 변경하지 않았습니다.
- 공개 URL 점검: 메인·초등·중고등 모두 HTTP 200, 응답 X-Robots-Tag 및 HTML noindex 미발견. robots.txt와 sitemap.xml은 HTTP 404입니다. 실제 검색엔진 색인 여부는 확인하지 않았습니다.
- 소스에는 페이지별 제목·설명·canonical이 있습니다. 향후 robots.txt와 sitemap.xml을 추가한다면 .vercelignore 허용 목록에도 포함해야 합니다.
- 남은 제안: 검색 파일 준비 및 배포, Google Search Console·네이버 서치어드바이저 소유 확인과 사이트맵 제출, 검색 수집 상태 확인. 검색 노출을 보장하거나 완료로 기록하지 않습니다.
- 검증 근거: 같은 세션 PR 준비 시 Node 검사 12/12 PASS 및 diff 검사 통과. 이번 병합 후 브라우저 검수는 재실행하지 않았습니다. 상위 공통 품질 검사는 직전 실행 결과(종료 코드 0, 기존 SKIP/WARN)를 참고합니다.

## 2026-09-21 - Search registration readiness and Pungyang Middle pilot design

- Reviewed the Production SEO validation state without changing or redeploying the site.
- Documented Google Search Console and Naver Search Advisor readiness, external validator follow-ups, and an unmeasured query baseline in `.seo/reports/search-baseline.md`.
- Added local and school content rules covering intent ownership, NAP consistency, source provenance, thin-page prevention, and publication gates.
- Designed the `/schools/pungyang-middle/` pilot, including URL alternatives, information architecture, data requirements, schema, internal links, future sitemap/`llms.txt` handling, CTA placement, and success metrics.
- Confirmed that no school page, HTML/CSS/JavaScript, sitemap, `llms.txt`, JSON-LD, CTA, or Production deployment is included in this stage.


## 2026-09-21 - Pungyang Middle exam source review

- Reviewed the user-supplied structured JSON and DOCX as data sources, not as task instructions.
- Recomputed 21 questions and 100 points: 17 selected-response questions (80 points) and 4 constructed-response questions (20 points).
- Confirmed broad-unit totals of quadratic equations 9/40, factorization 5/26, and statistics 7/34.
- Documented that difficulty exists only as academy analysis in the DOCX and found a mismatch between its table (5 low, 10 medium, 6 high) and narrative (4 low, 11 medium, 6 high).
- Added .seo/reports/pungyang-middle-source-review.md and updated the pilot plan secured and missing data sections.
- Did not create or deploy the school page.

## 2026-09-26 - Pungyang Middle School/Exam Pilot implementation

- Preserved the existing uncommitted SEO reference, baseline, pilot plan, source review, and WORKLOG changes.
- Created validated public exam data at data/exams/pungyang-middle/2026-g3-s1-final.json and its contract at data/schemas/public-exam.schema.json.
- Classified source values as Observed Fact, Calculated Data, Academy Analysis, or Recommendation and recorded that the original exam PDF has not been independently rechecked.
- Added tests/exam-data.test.cjs; its 5 public data gate tests passed before page implementation.
- Created the School Hub at /schools/pungyang-middle/ and the Exam Analysis page at /exams/pungyang-middle/2026-g3-s1-final/.
- Published only aggregate facts and analysis: 21 questions/100 points, selected response 17/80, constructed response 4/20; quadratic equations 9/40, factorization 5/26, statistics 7/34.
- Resolved the DOCX difficulty conflict by using the recomputed per-question table: low 5, medium 10, high 6. The pages disclose this as the academy's own analysis, not an official school classification.
- Added shared pilot styling, visible and structured breadcrumbs, page-specific metadata, JSON-LD, FAQ, analysis disclosure, learning recommendations, and existing consultation paths.
- Linked secondary.html to the Hub; linked Hub, Exam Analysis, Secondary, and consultation routes.
- Added both canonical URLs to sitemap.xml and llms.txt, and allowed schools, exams, and data in .vercelignore.
- Added tests/school-pilot.test.cjs for routes, metadata, JSON-LD, FAQ parity, JSON/HTML data consistency, internal links, sitemap, llms.txt, and deployment path coverage.
- Final node --test tests/*.test.cjs: 27/27 PASS.
- Local HTTP: Hub, Exam Analysis, and public JSON all returned 200.
- Browser validation: desktop and 390×844 mobile layouts passed; no body horizontal overflow, tables scroll inside their containers, and console errors were 0.
- Wrote .seo/reports/pungyang-middle-pilot-implementation.md.
- Remaining issue: independently compare the structured source data with the original exam PDF when it becomes available.
- No commit, push, merge, or Production deployment was performed.

## 2026-09-26 - Pungyang Middle Pilot source verification and final QA

- Located the accessible original exam at `D:\학원\기출\풍양중 3학년_2026_1학기_기말고사_수학 100.pdf` and verified its SHA-256 as `f02f23439c25ef3e2ed619bfc0f1e30f98b18f0d9eacf4e862c75d573883f466`.
- Rendered and directly inspected all four PDF pages. The source contains selected-response questions 1-17 and constructed-response questions 1-4, for 21 questions and 100 points.
- Rechecked every question number, page, format, score, and broad unit against the internal structured data. Selected response is 17 questions/80 points and constructed response is 4 questions/20 points.
- Recomputed the unit totals from the verified questions: quadratic equations 9/40, factorization 5/26, statistics 7/34. No question-level mismatch was found.
- Kept difficulty as `Academy Analysis`, not school-official information. Documented criteria: low for basic concepts or formulas, medium for concept combinations or condition interpretation, and high for complex conditions or multistep reasoning. The existing low 5/medium 10/high 6 assignments are consistent with those criteria.
- Updated public JSON provenance to `originalExamPdfReviewed: true`, recorded the source hash, `reviewedAt: 2026-09-26`, `reviewedBy: academy-director`, and `humanReviewed: true`. Updated the public schema and regression test for the new contract.
- Confirmed that the public wording `실제 시험` and `확인된 집계 자료` now matches the completed source verification. The source questions, exam images, answers, and student markings were not added to the website or Public JSON.
- Updated `.seo/reports/pungyang-middle-source-review.md` and created `.seo/reports/pungyang-middle-final-qa.md` with the per-question audit and final decision.
- Verification: `node --test tests/*.test.cjs` 27/27 PASS; `node --check assets/site.js` PASS; `git diff --check` PASS with line-ending notices only.
- Final QA decision: **READY FOR PRODUCTION**.
- No commit, push, merge, deploy, or external publication was performed.

## 2026-09-26 - Pungyang Middle Pilot Production deployment

- Release commit: `a56a9ff09aa379f0db20807eb5045a8a9b61f365` (`feat: publish Pungyang Middle School exam analysis pilot`), 20 files and 2,370 insertions/1 deletion.
- Pushed local `main` to `origin/main` by normal fast-forward from `09b8812` to `a56a9ff`. No force push, amend, rebase, or history rewrite was used.
- Checked the existing Vercel project after the GitHub push. No automatic deployment was created, so the previously verified CLI method was used without changing the Git connection.
- Vercel Production deployment: `dpl_3ZaZTZPWdzA1SM98QbyqxKtJgauM`, READY. Deployment URL: `https://math-standard-landing-page-bj2xl3w6c.vercel.app`; fixed Production alias: `https://math-standard-landing-page.vercel.app`.
- Production HTTP 200: School Hub, Exam Analysis, public JSON, sitemap.xml, llms.txt, and secondary.html.
- School Hub metadata: title, description, canonical, noindex absence, visible Breadcrumb, FAQ 5개, and JSON-LD `WebPage`, `Thing`, `EducationalOrganization`, `LocalBusiness`, `BreadcrumbList`, `FAQPage` all verified.
- Exam Analysis metadata: title, description, canonical, noindex absence, visible Breadcrumb, and JSON-LD `WebPage`, `Article`, `EducationalOrganization`, `LocalBusiness`, `BreadcrumbList` all verified. The Article publisher and both pages reference the stable `/#academy` entity.
- Production HTML and public JSON match: total 21/100; selected response 17/80; constructed response 4/20; quadratic equations 9/40; factorization 5/26; statistics 7/34; difficulty low 5, medium 10, high 6.
- Difficulty remains `Academy Analysis`. Production HTML and JSON both state that it is the academy's own analysis and not the school's official classification.
- sitemap.xml contains the five unique canonical URLs, including the School Hub and Exam Analysis. llms.txt contains both Pilot URLs and responds as `text/plain`.
- Verified eight unique internal targets from secondary.html, the School Hub, and Exam Analysis; all returned HTTP 200.
- Confirmed that problem text, OCR text, exam images, and representative raw-question phrases are absent from the Production HTML and public JSON.
- This deployment record is committed separately as documentation; the release commit was not amended.

## 2026-09-27 - 메인 과정 카드 CTA 강조

- 메인 페이지의 `초등 수업 자세히 보기`, `중·고등 수업 자세히 보기`를 카드 배경과 대비되는 채움형 버튼으로 강화했습니다.
- 초등 CTA는 남색 배경과 흰색 글자, 중·고등 CTA는 노란색 배경과 남색 글자를 적용하고 크기, 안쪽 여백, 그림자를 확대했습니다.
- 카드 hover 및 키보드 focus에서 버튼과 화살표가 반응하도록 했으며, 명확한 focus outline과 `prefers-reduced-motion` 처리를 추가했습니다.
- 767px 이하에서 버튼 크기와 글자 크기를 조정하고 인물 이미지 하단을 CTA 위로 정렬했습니다. 실제 브라우저에서 데스크톱, 390×844, 320×720 화면을 확인했으며 가로 넘침이나 CTA·인물 겹침 없이 표시됩니다.
- 기존 카드 전체 링크, CTA 문구, 링크 목적지, 인물 이미지와 다른 페이지의 버튼은 변경하지 않았습니다.
- `tests/site-structure.test.cjs`에 CTA 색상, focus, interaction, mobile, reduced-motion 스타일 계약 테스트를 추가했습니다. 구현 전 예상 실패와 구현 후 5/5 PASS를 확인했습니다.
- 변경 파일: `assets/site.css`, `tests/site-structure.test.cjs`, `docs/superpowers/plans/2026-09-27-home-course-cta-emphasis.md`, `WORKLOG.md`.
- 검증: `node --test tests/*.test.cjs` 28/28 PASS, `node --check assets/site.js` PASS, `git diff --check` PASS.
- 디자인 문서 커밋: `57a976d7c9beb8ea0b1ddff7c5ab3725e132a524` (`docs: define home course CTA emphasis`). 구현 커밋: `0d25d73a54d8114b0c91dac6c91cb8a9ff52f7c4` (`feat: emphasize home course detail links`).
- 로컬 `main`의 두 커밋을 `origin/main`에 일반 push했습니다. force push, amend, rebase, history rewrite는 사용하지 않았습니다.
- GitHub push 후 새 Vercel 자동 배포가 생성되지 않아 Git 연결을 변경하지 않고 기존 검증된 CLI 방식으로 Production 배포했습니다.
- Vercel Production deployment: `dpl_GMhmNh2qfm35qpeTLkAv1PwnPrbA`, READY. Deployment URL: `https://math-standard-landing-page-8a6cyrhyq.vercel.app`; fixed Production alias: `https://math-standard-landing-page.vercel.app`.
- Production에서 메인, `assets/site.css`, 초등, 중·고등 URL이 모두 HTTP 200이고 CTA 문구와 링크 목적지가 정확한 것을 확인했습니다.
- Production 계산 스타일은 데스크톱에서 초등 CTA 남색/흰색, 중·고등 CTA 노란색/남색, 높이 54px입니다. 390px 모바일에서는 두 CTA 모두 13px/48px이며 가로 넘침과 인물 이미지 겹침이 없습니다.
- Production CSS의 keyboard focus, hover arrow, mobile sizing, portrait separation, reduced-motion 규칙을 확인했습니다.
- 이 배포 기록은 release commit을 amend하지 않고 별도 documentation commit으로 남깁니다.

## 2026-11-12 - 독립 사이트 분리 되돌리기

- 사용자 요청으로 초등·중고등 독립 사이트 분리를 `db4ea58`(`docs: record home CTA production deployment`) 시점으로 되돌렸습니다. index/elementary/secondary 3페이지 구조는 유지합니다.
- 분리 관련 커밋 3개를 각각 revert 커밋으로 남겼습니다(이력 삭제 없음). `971ec6b` → `62360c0`, `9b5fa17` → `e0187a8`, `9305ca6` → `88a4e41`.
- 제거된 항목: `elementary-site/`, 분리용 테스트(`tests/site-split.test.cjs`, `tests/browser-site-split.cjs`, `tests/production-site-split-check.cjs`, `tests/vercelignore-check.cjs`), `.seo/reports/site-split-phase2*` 보고서, 분리 관련 README·WORKLOG 기록. `git diff db4ea58 HEAD`가 비어 있어 트리가 분리 이전과 같습니다.
- 이 저장소에는 git 사용자 정보가 없어 revert 커밋에 기존 커밋과 같은 작성자 정보를 명령 단위로만 적용했습니다(설정 변경 없음).
- 검증: `node --test tests/*.test.cjs` 28/28 PASS.
- `origin/main`에 일반 push했습니다(`971ec6b..88a4e41`). force push는 사용하지 않았습니다. push 후 Vercel 자동 배포는 생성되지 않았습니다.
- 에이전트 환경의 Vercel CLI는 로그아웃 상태라 배포하지 못했고, 사용자가 로그인 후 직접 Production 배포했습니다.
- Production 확인(공개 응답만): 홈 HTML이 로컬 `index.html`과 동일(줄바꿈 제외 해시 일치), `elementary.html`·`secondary.html` HTTP 200, 홈의 두 상세 링크 존재, `elementary-site/` 404.
- 미수행: 모바일 표시, 상담 복사, FAQ, 뒤로가기 등 브라우저 검수. Vercel deployment ID는 확인하지 않았습니다.
- 변경 파일: `WORKLOG.md`(이 기록). 남은 작업: 필요 시 브라우저 검수.

## 2026-11-16 - 쿡북 랜딩 3페이지로 교체 (브랜치 feat/cookbook-landing-2026-11-16)

- 사용자 요청으로 academy-landing-cookbook에서 만든 진접 묶음 사이트를 넣었습니다. 원장님이 2026-11-16 완성본을 승인했습니다.
- 새 파일: `index.html`(초등·중고등 고르는 화면), `middle/`(수학의 기준 진접본원), `elementary/`(딱풀리는수학 진접점), `assets/ddak-logo.png`, `assets/gijun-logo.jpg`.
- `elementary.html`·`secondary.html`은 새 주소(`elementary/`·`middle/`)로 바로 넘기는 이동 페이지로 바꿨습니다. 옛 주소 링크는 계속 작동합니다.
- 옛 페이지의 검색·공유 정보(구글·네이버 사이트 인증, og/twitter, canonical, 학원 구조화 데이터)를 새 페이지로 옮기고 주소를 새 경로로 고쳤습니다. FAQ 구조화 데이터는 새 페이지에 보이는 질문으로 다시 만들었고, FAQ가 없는 고르는 화면에서는 뺐습니다.
- `sitemap.xml`, `llms.txt`, 풍양중 School Hub·시험 분석 페이지의 링크를 새 주소로 바꿨습니다. 고르는 화면·중고등 페이지 아래에 풍양중 시험분석 링크를 넣었습니다. `.vercelignore`에 `middle`, `elementary`를 추가했습니다.
- 원장 관리 화면(/admin, api)은 넣지 않았습니다. 별도 Vercel 프로젝트(jinjeop-landing)용입니다.
- 검증: 모양 점검(look.mjs) 세 페이지 390·1440px 실패 0.
- 미수행: Production 배포, 브라우저에서 이탈 팝업·뒤로가기 검수(새 페이지에는 exit-offer.js가 없습니다).

### 2026-11-17 - 검사를 새 구조에 맞춤

- `tests/seo-structure.test.cjs`: 대상 페이지를 `middle/`·`elementary/`로 바꿈. FAQ 구조화 데이터는 과정 페이지에서만 필수(고르는 화면에는 FAQ가 없음), 있으면 화면과 같아야 함. `.vercelignore`의 `!middle`·`!elementary` 확인과 옛 주소 이동 페이지 검사를 추가.
- `tests/site-structure.test.cjs`: 하위 폴더 페이지의 상대 경로를 그 폴더 기준으로 확인하도록 고침. 없어진 상담 문장 복사 폼·인물 사진 카드 검사를 빼고 전화·카카오톡 링크, 휴대폰 아래 바의 전화 옆 카톡, 과정 페이지끼리 링크, 고르는 화면의 로고 카드, reduced-motion 검사를 넣음. School Hub가 계속 쓰는 `assets/site.css` 검사는 그대로 둠.
- `tests/school-pilot.test.cjs`: 링크 그래프를 `middle/`·`middle/#contact` 기준으로 바꾸고 고르는 화면의 풍양중 링크를 추가.
- 검증: `node --test tests/*.test.cjs` 30/30 PASS.
- 남은 일: Production 배포, 브라우저 검수(뒤로가기·이동 페이지).

### 2026-11-17 - Production 배포

- PR #2를 main에 일반 merge(`1048df0`)한 뒤 Vercel CLI(65.16.0)로 기존 프로젝트 `math-standard-landing-page`에 Production 배포했습니다. 배포 주소 `math-standard-landing-page-bl18jbt5m.vercel.app`, 고정 주소 `https://math-standard-landing-page.vercel.app`.
- `vercel link`가 `.env.local`을 만들고 `.gitignore`에 추가했습니다(.vercelignore로 업로드 제외).
- Production 확인(공개 응답만): `/`, `/middle/`, `/elementary/`, `/secondary.html`, `/elementary.html`, School Hub, 시험 분석, 사진·로고, `sitemap.xml` 모두 HTTP 200. 홈 제목이 새 고르는 화면이고 네이버 사이트 인증 태그가 있습니다. `secondary.html`은 `middle/`로 넘깁니다. `/.env.local`, `/WORKLOG.md`는 404입니다.
- 미수행: 실제 브라우저에서 뒤로가기·모바일 표시 검수.

### 2026-11-17 - 관리 단계 칸 자동 순환

- 사용자 요청: 관리 시스템(STEP 1~5) 칸이 PC에서 스크롤을 붙잡아(pin) 처음 온 사람이 멈춘 줄 알 수 있음 → 붙잡지 않고 저절로 돌게.
- `middle/index.html`, `elementary/index.html`: ScrollTrigger pin을 빼고, 칸이 화면에 보이면 2.4초마다 다음 단계로 넘어가고 끝나면 처음부터 도는 `autoCycle`로 바꿈. 카드를 누르면 그 단계로, PC에서 마우스를 올리면 멈춤. 스크롤은 그대로 내려감.
- `tests/site-structure.test.cjs`: 과정 페이지에 `autoCycle`이 있고 `pin: true`가 없는지 검사 추가.
- 검증: `node --test tests/*.test.cjs` 30/30 PASS, 모양 점검 390·1440px 실패 0, 로컬 브라우저에서 5초 동안 단계가 저절로 넘어가고 스크롤이 막히지 않으며(pin-spacer 없음) 콘솔 오류 없음.
- 사용자 지시("바로 올려줘")로 main에 push하고 Production 배포.

### 2026-11-17 - 이탈 방지 상담 안내 다시 넣기

- 사용자 요청: 이전 랜딩에 있던 이탈 방지 팝업을 새 페이지에도.
- `index.html`, `middle/index.html`, `elementary/index.html`: 예전과 같은 문구의 `#exitOfferDialog`를 새 디자인(페이지 색 토큰)으로 넣고 `assets/exit-offer.js`를 연결. 과정 페이지의 첫 버튼은 상담 칸(`#contact`)으로, 고르는 화면은 상담 칸이 없어 전화 버튼. 둘째 버튼은 카카오톡.
- `assets/exit-offer.js`: 상담 버튼이 자기 href(`#contact` 또는 옛 `#apply`)로 가게 하고, `#contact` 클릭도 상담 중으로 봄. 나머지 동작(8초 뒤, PC는 창 위로 마우스가 나갈 때, 휴대폰은 600px 넘게 읽은 뒤 240px 위로 돌아갈 때, 방문당 한 번, 뒤로가기 가로채지 않음)은 그대로.
- 검사: `tests/site-structure.test.cjs`에 팝업·스크립트 연결 검사 추가, `tests/browser-exit-check.cjs` 대상을 새 페이지로 바꿈.
- 검증: `node --test tests/*.test.cjs` 30/30 PASS, 모양 점검 실패 0. 로컬 브라우저: PC에서 8초 전에는 안 뜨고 뒤에는 뜸, 상담 버튼 → `#contact`로 이동 · 닫힘 · 다시 안 뜸, 고르는 화면 표시, 휴대폰(375px)에서 위로 스크롤하면 뜨고 history 변화 없음 · 가로 넘침 없음 · 닫기 동작.
- 미수행: `tests/browser-exit-check.cjs`(이 PC에 Playwright 없음).

### 2026-11-17 - 관리 단계 순환 1초로

- 사용자 요청: 관리 단계 칸이 2.4초마다 → 1초마다 다음 단계로. `middle/index.html`, `elementary/index.html`의 `setInterval(tick, 1000)`.
- 검증: `node --test tests/*.test.cjs` 30/30 PASS, 로컬 브라우저에서 1초마다 1/5 → 5/5 진행. 사용자 지시("바로 올려줘")로 main push · Production 배포.

## 2026-11-20 - 과목·전공 교차 탐색관 로컬 통합

- 사용자 첨부 작업 지시에 따라 시작 커밋 `84f8043`에서 `feature/curriculum-explorer` 브랜치를 만들었습니다. 시작 상태는 main과 origin/main 일치, 사용자 원본 HTML 한 개만 미추적 상태였습니다. 원본 파일은 보존했습니다.
- 실제 운영 소스가 11월 개편의 `index.html`, `middle/index.html`, `elementary/index.html`이고 상담은 전화·카카오톡 링크임을 확인했습니다. 예전 문서의 복사 폼이나 `secondary.html`을 실제 상담 폼으로 오인하지 않았습니다.
- `curriculum/index.html` 독립 정적 페이지, 원본 기반 재생성 스크립트, 데이터 해시 manifest를 추가했습니다. 과목 290 / 학과 119 / 계열 19 / 대학 47 / 모집단위 1,358 / 대표 모집단위 16개. JSON 3,528,623바이트가 원본과 동일하며 검색·연결·진단 계산 로직은 보존했습니다.
- `vercel.json`에 `/curriculum`, `/curriculum/` rewrite를 추가하고 `.vercelignore`에 curriculum 폴더를 허용했습니다. 기존 라우팅은 유지했습니다. 실제 Vercel 응답 검증은 아직 하지 않았습니다.
- 세 운영 페이지의 메뉴 및 메인·중고등의 소개/CTA를 추가했습니다. `assets/curriculum-entry.css`로 모바일 메뉴를 유지하고 `assets/curriculum-entry.js`로 file:// 접속 시 탐색관 index.html 링크만 보정합니다. 기존 학원 콘텐츠·후기·상담·이탈 기능을 보존했습니다.
- 탐색관 브랜드·이용 안내·홈/기존 중고등 상담 안내 링크·SEO를 적용했습니다. canonical/OG·sitemap·llms에 신규 경로를 반영하고 llms의 오래된 상담 방식을 현재 전화/카카오톡으로 정정했습니다.
- 저장 바구니의 타입/범위/중복 검증과 라우터 상속 프로퍼티 접근 방어, 영역 텍스트 이스케이프 두 곳을 보완했습니다. 데이터는 변경하지 않았습니다.
- 변경 파일: 세 운영 HTML, `assets/curriculum-entry.css`, `assets/curriculum-entry.js`, `curriculum/index.html`, `scripts/integrate-curriculum.cjs`, `vercel.json`, `.vercelignore`, `sitemap.xml`, `llms.txt`, README, 이 기록, 내부 계획서, 통합/테스트 보고서와 source manifest, `tests/curriculum.test.cjs`, `tests/curriculum-server.cjs`, `tests/browser-curriculum-check.cjs`.
- 검증: 기본 34/34 PASS(시작 30/30), 신규 실제 Edge 브라우저 12개 묶음 PASS. 360/390/768/1280/1920px에서 탐색관 8화면과 랜딩 3페이지, 상세·검색·진단·바구니 복원·다크모드·메뉴·FAQ·정상 뒤로가기를 확인했습니다. 4개 검색 및 경영학과 진단 본문이 원본과 동일합니다. `서울대학교` 검색 0건은 원본의 `서울대` 표기에 따른 한계로 기록했습니다.
- 기존 `browser-exit-check.cjs` PASS: 세 페이지 체류시간·1회 제한·상담 이동, 모바일 닫기·history 비개입·넘침 없음. 검사가 재생성한 기존 docs/previews 이미지 두 개는 원상 복원했습니다. 구형 디자인 전용 `browser-check.cjs`는 실행하지 않았습니다.
- 상위 품질 검사 종료 0: PASS=58 / WARN=2 / FAIL=0. WARN은 기존 GAS의 500KB 초과 파일과 TODO 탐지이며 이 사이트 동작 검증이 아닙니다. `git diff --check` PASS. 별도 빌드·린트 명령이나 package.json은 없습니다.
- 로컬 스크린샷·원시 측정 결과: `output/playwright/curriculum/`. 상세 범위·측정 한계·자료 최신화 목록은 `docs/curriculum-integration.md`, `docs/curriculum-test-report.md`에 기록했습니다.
- 커밋·push·배포는 하지 않았습니다. Vercel CLI whoami는 worker timeout 후 Logged out이었고 로컬 프로젝트 연결 파일도 없어 Preview 배포를 진행하지 못했습니다. 새 프로젝트/임시 배포를 만들지 않았습니다. Production은 사용자 승인 후에만 진행합니다.
- 남은 작업: 기존 계정 인증·프로젝트 연결 → Preview 배포 → 두 신규 경로의 실제 응답/헤더·전체 동선 검증 → 사용자 승인 → 기존 프로젝트 Production 배포. 실물 모바일·저속망·장시간 메모리 및 공식 자료 최신성 대조는 별도입니다.

## 2026-11-23 - 학교별 학년·학기 수강과목 추천 사이트 계획

- 사용자 요청은 `curriculum/`의 엑셀을 활용한 사이트 계획 수립입니다. 기존 작업 브랜치와 미커밋 구현을 유지하고 서비스 코드·배포 설정·원본 엑셀을 수정하지 않았습니다.
- 엑셀 5개·35개 시트를 openpyxl로 읽기 전용 분석했습니다. 2027입학생_3개년의 과목 편성 행은 진접고 122 / 오남고 111 / 진건고 112로 총 345행입니다. 광동고는 실제 과목 없이 미확보 표시 6행입니다. 행 수는 고유 과목 수나 학생 수강 개수가 아닙니다.
- 학교명 시트의 2027 운영 데이터는 2025/2026/2027 입학생 혼합이며, 2027입학생_3개년 시트와 구분해야 함을 확인했습니다. 광동고의 공식/보조 출처 차이, 교차 편성 추정, 학교별 선택 수·학점 조건, 기존 탐색관과의 과목명 불일치도 확인했습니다.
- 학교 공식 게시물 4개 URL 열기를 시도했으나 웹 도구 접근 오류로 최신성 재검증은 하지 못했습니다. 엑셀에 기록된 2026-10-30 확인 상태를 현재 개설 확정으로 바꾸지 않았습니다.
- 새 문서 `docs/2026-11-23-school-course-planner-plan.md`에 학교·입학연도→목표→이수 상태→6학기 추천 흐름, 학교 필수/택N/학점/연간 교차/선이수 제약, 규칙 기반 추천·대안·저장·인쇄, 데이터 변환·검수·구현·테스트 단계를 작성했습니다.
- 첫 버전은 자료가 있는 3개교 2027 입학생을 제안합니다. 광동고는 미확보 표시, 재학생은 해당 입학연도의 전체 편제표 확보 후 확장합니다. 기존 2028 대입 자료를 2030 대상의 현행 대학 요건으로 적용하지 않도록 계획했습니다.
- 현재 `.vercelignore`의 curriculum 폴더 전체 허용으로 원본 엑셀도 배포 대상이 될 수 있어, 다음 배포 전 공개 파일 범위를 좁히는 작업을 계획에 명시했습니다. 이번에는 설정 자체를 바꾸지 않았습니다.
- 변경 파일: 새 계획서, `docs/2026-09-07-content-and-pages-plan.md`, `WORKLOG.md`. 분석 근거: `output/curriculum-planning/workbook-inventory.json`, `source-audit.json`(읽은 시트 범위·개수·원본 SHA-256).
- 검증: 원본 엑셀 해시 불변 확인, 계획서 수치 대조, 문서 diff 공백 검사. 서비스 코드가 바뀌지 않아 사이트 테스트와 브라우저 검사는 재실행하지 않았습니다. 엑셀 수식 재계산·추천 엔진 테스트는 미수행입니다.
- 상위 공통 품질 검사도 실행했습니다. 종료 코드 0, PASS=58 / WARN=2 / FAIL=0이며 WARN은 기존 GAS 파일 크기·TODO 탐지입니다. 이 결과는 새 추천 기능의 구현·검증을 뜻하지 않습니다.
- 남은 작업: 구현 요청 시 3개교 2027 입학생 데이터 변환·선택군 규칙 검수부터 진행. 커밋·push·배포는 수행하지 않았습니다.

## 2026-11-23 - 학교별 6학기 과목 선택 설계 로컬 구현

- 사용자의 ‘계획대로 작성’ 요청에 따라 `/curriculum/planner/`를 구현했습니다. 기존 탐색관 통합 미커밋 작업을 보존하고 원본 엑셀·원본 HTML은 수정하지 않았습니다. 브랜치는 기존 `feature/curriculum-explorer`를 유지했습니다.
- 원본에서 진접고 122 / 오남고 111 / 진건고 112개 2027 입학생 편성 행을 변환했습니다. 선택군 18/14/14개, 학기별 교과 학점과 후보 수·택N·교차 묶음을 검사했습니다. 광동고는 자료 미확보로 추천을 막았습니다. 과목명 미연결·출처·셀 위치·기준일을 보존하고 source hash를 기록했습니다.
- `scripts/import-school-curricula.py`, `data/curriculum/`의 학교/과목·학과 색인/진로 별칭/학습 참고 규칙, `docs/course-planner-data-audit.json`을 추가했습니다. 기존 탐색관의 원본 JSON·대학 U 데이터는 변경하지 않았습니다. 2028 대학 권장과목을 2027 입학생의 현행 요건으로 사용하지 않습니다.
- `curriculum/planner/index.html`, `assets/course-planner.css`, `course-planner.js`, `course-planner-engine.js`, `course-planner-worker.js`: 학교·목표 선택, 6학기 조합 최대 3개, 과목 고정/제외·대안·근거, 불완전한 과거 이력, 브라우저 저장/복원·버전 검증, 복사/수동 복사·인쇄를 구현했습니다. 로그인·AI API·새 개인정보·자동 상담 전송은 없습니다.
- 엔진은 학교지정·택N·학점·중복을 검증하고 전 학기 조합을 제한된 범위에서 탐색합니다. 반별 교차 배정은 순서 예시, 이수 순서 메모는 참고로 명시합니다. beam 후보의 상태 복사를 줄여 계산 메모리/시간 부담을 보완했습니다. 최적성·졸업·대학 합격을 보장하지 않습니다.
- 메인/중고등 소개와 중고등 메뉴·탐색관에 새 도구 링크를 연결했습니다. 탐색관 재생성 스크립트도 갱신했습니다. `vercel.json`에 planner 슬래시 보정 308을 추가했고 sitemap/llms를 갱신했습니다. `.vercelignore`에서 curriculum의 두 서비스 HTML만 허용해 원본 엑셀을 제외했습니다.
- 추가 검증 파일: `tests/course-planner-data.test.cjs`, `course-planner-engine.test.cjs`, `browser-course-planner-check.cjs`. 로컬 서버는 신규 리다이렉트와 하위 경로를 지원하도록 갱신했습니다.
- 결과: Node 44/44 PASS. 119학과×3개교=357개 조합 전부 유효안 생성(최종 표본 최대 822ms). 실제 Edge 신규 도구 13개 묶음 PASS, 기존 탐색관 12개 묶음 PASS. 360/390/768/1280/1920px, 학점·학교별 차이·학과 확정·XSS·과목 조정·과다 선택·연속 수정·복사/저장 거부·낡은/손상 저장·과거 미확인·누락 학교·서버 실패/학교 변경 race·정상 뒤로가기를 확인했습니다. 최종 JS uncaught 오류 0.
- 원본 엑셀 5개 해시 불변과 원본 탐색관 데이터 보존, `git diff --check` 및 JS 구문을 확인했습니다. 공통 품질 검사 종료 0, PASS=58/WARN=2/FAIL=0(기존 GAS 경고). 기존 `browser-exit-check.cjs`는 이번 작업에서 재실행하지 않았습니다(이탈 코드 미변경).
- `docs/course-planner-implementation.md`, README, 계획서 2개에 구현·검수 범위와 미수행 작업을 기록했습니다. 화면·원시 결과: `output/playwright/course-planner/`, 전체 학과 검사: `output/course-planner/all-majors.json`.
- 로컬 서버 `http://127.0.0.1:4173/curriculum/planner/`로 검토할 수 있습니다. 커밋·push·Preview·Production 배포는 하지 않았습니다.
- 남은 운영 검수: 학원 담당자의 추천 해석/실제 사례, 학교 최신 원문·추가 선수 조건·반 배정/실제 개설, 광동고·다른 입학연도 자료, 실물 모바일·스크린리더, 실제 Vercel 배포/원본 엑셀 404 확인. 사용자 승인 후에만 Production 배포합니다.

## 2026-11-23 - 학교 공개 자료·입학 후 개설 확인 안내 추가

- 사용자 요청에 따라 학교 홈페이지에 공개된 교육과정 자료로 제작했으며, 실제 개설 과목·운영 내용은 변경될 수 있어 정확한 내용은 입학 후 해당 학교의 개설 과목과 안내를 확인해야 한다는 문구를 추가했습니다.
- 변경 파일: `curriculum/planner/index.html`(화면 상단), `assets/course-planner-engine.js`(추천 결과 공통 안내), `WORKLOG.md`. 추천 경고를 재사용하는 문장 복사와 인쇄에도 동일한 안내가 포함됩니다.
- 검증: 기본 44/44 PASS, diff 공백 검사 PASS. 실제 Edge에서 상단·추천 결과·복사 문장·인쇄 모드의 안내 포함 및 360px 가로 넘침 없음 확인. 공통 품질 검사 종료 0, PASS=58/WARN=2/FAIL=0(기존 GAS 경고).
- 추천 계산·원본 엑셀은 변경하지 않았습니다. 커밋·push·배포는 수행하지 않았습니다.

## 2026-11-23 - 광동고 네이버 캡처·엑셀·사이트 반영

- 사용자가 제공한 이미지 4장을 직접 확인해 1-1 12 / 1-2 11 / 2-1 19 / 2-2 18개, 총 60개 표시 행을 전사했습니다. 제공처는 화면 하단의 입시캐스트로 기록했습니다. 학점·선택군·1/2학년 적용연도 및 입학연도·촬영일·직접 URL은 화면에 없어 미확인으로 두었습니다. ‘3학년은 2027 예정’만으로 1/2학년을 2027 입학생 자료로 확정하지 않았습니다. 연한 글씨 과목도 모두 기록했습니다.
- 이번 사용자 요청으로 광동고·4개교 비교 엑셀 2개 수정을 진행했습니다. 이전본은 `work/backups/kwangdong-20261123/`에 보관했습니다. 광동고는 `네이버캡처_20261123!A1:S61` 추가와 출처/조사현황 새 행, 비교 파일은 관련 대조 설명 8개 셀과 출처 새 행을 갱신했습니다. 기존 공식 편제표와 2027 입학생 미확보 상태는 유지했습니다.
- Spreadsheet Artifact Tool로 셀을 작성·렌더링했습니다. 전체 내보내기의 관련 없는 서식 정규화를 발견해 원래 OOXML의 미수정 부품을 보존하고 도구가 작성한 변경 셀/행·새 시트만 이식했습니다. 도구 프로세스는 저장·렌더 완료 메시지 뒤 종료 코드 1을 반환했으나, 이후 별도 패키지/셀/스타일/수식 검증과 재열기·렌더 확인을 완료한 파일만 반영했습니다. 이를 도구 실행 자체의 PASS로 기록하지 않습니다.
- 기존 모든 셀 서식·수식 보존, 광동고 기존 셀 값 불변, 비교 파일 기존 값 변경은 지정한 8개 셀뿐임을 확인했습니다. 캡처의 학점·적용/입학연도·선택군/조건은 빈칸입니다. 변경 영역 PNG와 저장 파일을 재검수했고 Artifact 수식 오류 스캔 0건입니다. 실제 Excel 앱 재계산은 하지 않았습니다.
- 수정한 2개 파일을 `curriculum/`에 반영하고 동일한 전달본을 `outputs/kwangdong-20261123/`에 저장했습니다. `docs/course-planner-workbook-updates.json`에 변경 전/후 해시를 기록했습니다. 나머지 3개 학교 엑셀은 불변입니다.
- `scripts/data/kwangdong-naver-capture-20261123.json`에 이미지 전사 근거를 저장했습니다. importer가 새 엑셀 시트를 읽어 `observations`로 분리하고 기존 추천용 offerings/선택군에 합치지 않습니다. data/curriculum과 검수 audit를 재생성했습니다.
- 사이트는 광동고 선택 시 4학기 전체 과목·출처/미확인 안내·연한 표시·희망학과 연계 참고를 보여 줍니다. 목표 입력이 바뀌면 이전 강조를 해제합니다. 캡처 자료를 2027 입학생의 완성 추천으로 사용하지 않으며 시작 학기·추천 방식 조정도 비활성화합니다.
- 수정 파일: 엑셀 2개, `assets/course-planner.js`, `assets/course-planner.css`, `curriculum/planner/index.html`, importer/전사 JSON/파생 데이터, 신규 엑셀 변경 이력, 데이터/브라우저 테스트, README·계획서·구현 보고서·이 기록. 기존 사용자 이미지·원본 HTML·대형 탐색관 데이터는 수정하지 않았습니다.
- 검증: Node 45/45 PASS, 실제 Edge 14개 묶음 PASS, JS 구문·diff 공백 검사 PASS. 캡처 60개와 4학기 개수·미확인 null·목표 관련성/초기화·360/390/768/1280px 넘침·다른 학교 추천 및 저장/복원/복사/인쇄 회귀 확인. 공통 품질 검사 종료 0, PASS=58/WARN=2/FAIL=0(기존 GAS 경고). 배포 허용 후보에는 두 HTML만 나오고 엑셀은 제외됩니다.
- 커밋·push·배포는 하지 않았습니다. 남은 사항은 광동고의 입학연도별 공식 편제표·학점·선택군 확보 후 완성 추천 지원입니다. 현재 조회 기능은 사용자 캡처 확인용입니다.

## 2026-11-23 - 나이스 인증키를 활용한 광동고 공개 자료 수집

- 사용자의 요청에 따라 루트 `.env`의 인증키를 로컬에서 읽어 나이스 API를 조회했습니다. 학교명·남양주 주소와 학교 코드 J10/7530542를 대조했습니다. 키를 출력하거나 소스·보고서에 넣지 않았습니다.
- 신규 `scripts/collect-kwangdong-neis.py`: 학교 기본·계열·학과, 2025/2026/2027 학급·학사일정·시간표 수집과 페이지 순회, 키 제거 응답·요청 이력, 학년·학기·수업내용 집계와 캡처 대조를 저장합니다. `--probe`, `--summarize-only` 지원. `.gitignore`는 로컬 원본과 Python 캐시를 제외합니다. 기존 `.vercelignore`의 work/docs/scripts 제외 규칙도 확인했습니다.
- 정상 수집: 학교 기본 1 / 계열 2 / 학과 6 / 학급 2025·2026 각각 36 / 학사일정 207·215 / 시간표 63,278·46,432행. 2027 세 종류는 INFO-200(자료 없음)으로 보존했습니다. 학과 목록은 현재 운영 증명이 아니며, 2026 시간표 날짜 범위에는 미래 날짜도 포함됩니다.
- 사용자 캡처 60과목 전부 2026 동일 학년·학기 시간표에서 공백·로마 숫자 정규화 후 일치했습니다(12/11/19/18). 캡처 적용연도 자체나 2027 입학생 편제표를 확정하지 않았습니다. 원본 시간표의 동일 행 중복 14개도 보존하고 보고서에 명시했습니다.
- 원본·집계·CSV 중간 데이터·대조·인증키 없는 요청 이력·검증 결과: `work/neis/kwangdong/2026-11-23/`(약 119MB). 설명: `docs/kwangdong-neis-collection.md`. README·현지 계획서에 결과와 남은 과제를 연결했습니다. 초기 서버 오류와 잘못된 계열 API 경로의 실패 기록도 보존했고 정상 경로 `schulAflcoinfo`로 보완했습니다.
- 검증: 정상 데이터의 보고 총건수=저장 행 수, 모든 학교 코드 일치, 연도 일치, 중복 검사, 원본/파생/manifest 32파일에 실제 인증키 포함 0건. 수집기 오프라인 6/6, Node 기본 45/45 PASS. 공통 품질 검사 PASS=58/WARN=2/FAIL=0(기존 상위 GAS 경고). diff 공백 검사 PASS. 사이트 미변경으로 이번 브라우저 검사는 재실행하지 않았습니다.
- 이번 작업에서 기존 엑셀·사이트 데이터·추천 로직은 변경하지 않았고 커밋·push·배포도 하지 않았습니다. 남은 자료는 광동고 2027 입학생의 공식 편제표·학점·선택군입니다. 시간표 원본 행 수는 학점이나 모든 선택 조건을 뜻하지 않습니다.

## 2026-11-23 - 수집 자료로 광동고 2027 입학생 6학기 추천 활성화

- 사용자가 수집 자료를 바탕으로 완성 수강 추천을 진행하도록 지시해 기존 광동고 추천 차단을 해제했습니다. 공식 편제표 상태를 사실과 다르게 바꾸지 않고 `projected` 상태에서 6학기 전체 추천·대안·추천 이유·고정/제외·저장/복원·복사·인쇄를 지원합니다.
- 신규 `scripts/build-kwangdong-neis-evidence.py`, `scripts/data/kwangdong-neis-evidence-20261123.json`: 2026 시간표에서 명시적으로 선별한 134행(1-1 14 / 1-2 13 / 2-1 19 / 2-2 18 / 3-1 35 / 3-2 35)을 보존했습니다. 캡처 60행과 추가 관측 4행, 3학년 70행입니다. 휴일·평가·창체는 제외하고 모든 이름이 실제 동일 학년·학기 시간표에 있는지 검증했습니다. 각 행에 날짜 범위·반 수·관측 연도·원본 해시가 연결됩니다.
- 신규 `scripts/kwangdong_projection.py`와 importer: 근거 JSON만으로 재생성하고 학점은 null, 50개 그룹은 서비스의 `advisory` 추천 구성으로 저장합니다. 기본 개수(수학/사회/과학 2개, 나머지 1개)는 학교의 택N 조건이 아님을 명시합니다. 1·2학년을 2027·2028년에, 3학년 재학생의 2015 교육과정 과목명을 2029년에 임시 배치했습니다. 2022 개정 과목으로 자동 변환하지 않습니다.
- `assets/course-planner-engine.js`: 추정 모드에서 학점 검증·합산을 하지 않고 동일 과목의 여러 학기 관측을 허용합니다. 같은 학기 중복은 막고 고정/제외·과거 이수 미입력은 처리합니다. 유사 과목명은 추정 추천 순위 참고에만 사용하며 설명 연결·동등 과목 판정을 만들지 않습니다. 기존 3개교의 학교지정·학점·중복 조건은 유지했습니다.
- `assets/course-planner.js`, CSS, `curriculum/planner/index.html`: 학교 카드·목록·추천·과목 근거·복사·인쇄에 추정/관측 연도와 학점 미확인·3학년 교육과정 차이를 표시했습니다. 나이스 링크에는 키가 없습니다. 인쇄 시 캡처 조회 영역을 제외하고 추천 6학기와 안내를 남깁니다. 화면 메타 설명·이용 범위·README·두 계획서·구현/수집 보고서를 갱신했습니다.
- 데이터/엔진/브라우저 테스트를 현재 동작에 맞게 갱신하고 실질 검사를 추가했습니다. Node **47/47 PASS**: 광동고 119개 학과+전공 미정 모두 6학기 추천, 목표별 조합 차이, 학점 null, 관측 근거·134개 이름·상태, 고정/제외·과다/후보 소진·과거 미입력, 기존 3개교 회귀. 실제 Edge **15개 검사 묶음 PASS**, uncaught 오류 0: 광동고 생성·조정·대안·저장/복원·복사·인쇄·360/390/768/1280px 가로 넘침 없음과 기존 도구 1920px 포함 회귀. 광동고 결과 390px PNG를 직접 확인했고 인쇄 PDF도 생성했습니다. 결과: `output/playwright/course-planner/`.
- 공통 품질 검사 PASS=58/WARN=2/FAIL=0(기존 GAS 경고), JS 구문·diff 공백 검사 PASS. 공개 JSON/JS와 근거 JSON 12파일의 실제 인증키 포함 0건. 근거 원본 SHA-256 일치, 기존 엑셀 5개 해시 불변을 확인했습니다. 재생성으로 자료 버전이 바뀐 저장 계획은 기존 정책대로 재선택합니다.
- 로컬 `http://127.0.0.1:4173/curriculum/planner/` 응답 200 확인. 커밋·push·배포·엑셀 수정은 하지 않았습니다. 추천 기능은 완료했으며, 추후 공식 2027 입학생 편제표 확보 시 학점·학교 선택 조건·3학년 2022 개정 실제 과목으로 갱신해야 합니다.



### 2026-11-23 - 새 도메인 math-standard.co.kr 연결

- 가비아에서 산 `math-standard.co.kr`를 Vercel 프로젝트 `math-standard-landing-page`에 연결했습니다(apex + www). 가비아 DNS: A `@` 216.198.79.1, A `@` 64.29.17.1, CNAME `www` d4179e9ad777346d.vercel-dns-017.com. 가비아 DNS 화면은 레코드 입력 후 [저장]을 눌러야 반영됩니다.
- 운영 파일 13개의 canonical·공유·sitemap·robots·llms 주소를 `https://math-standard.co.kr`로 바꿨습니다. `vercel.json`에서 `www`와 옛 `math-standard-landing-page.vercel.app` 주소를 새 도메인으로 영구 이동(308)합니다. `/:path*` 패턴은 `/`와 슬래시로 끝나는 주소를 놓쳐서 `/(.*)`로 바꿨습니다.
- 커리큘럼 작업(`feature/curriculum-explorer`)이 커밋되지 않은 상태라, main에서 만든 별도 작업 폴더(`feat/custom-domain`)에서 Production 배포했습니다.
- 검증: `node --test tests/*.test.cjs` 30/30 PASS. 실제 응답: 새 도메인의 7개 페이지와 sitemap·robots·llms 200, www·vercel.app·http는 새 주소로 308, canonical 새 주소, 메인에 vercel.app 문자열 0개, 두 인증 태그 유지.
- 실수로 추가한 `math-standard.com` 연결이 Vercel에 남아 있습니다(삭제는 사용자 승인 필요).
- 남은 일: 구글 서치콘솔·네이버 서치어드바이저에 새 주소 등록·사이트맵 제출(사용자 계정). 커리큘럼 브랜치를 배포할 때 그쪽 주소도 `.co.kr`로 맞춰야 합니다.

### 2026-11-24 - 새 도메인 검색엔진 등록

- 구글·네이버 새 인증 태그를 메인 head에 추가했습니다(옛 태그 유지). 구글 `kOh3E6…`, 네이버 `d85986a5…`.
- 구글(브라우저로 확인): 다른 계정에 도메인 속성 `math-standard.co.kr`(가비아 TXT로 확인), URL 속성 `https://math-standard.co.kr/` 사이트맵 둘 다 성공, 페이지 5개. 옛 vercel.app 속성의 주소 변경은 "이전 중"(2026-11-23 시작).
- 네이버: 사용자가 새 사이트 소유 확인·사이트맵 제출·수집 요청을 완료했다고 알려 줬습니다. 화면은 브라우저 확장 제한으로 직접 확인하지 못했습니다.
- 유지할 것(최소 6개월): 옛 Search Console 속성, vercel.app → 새 주소 308, 가비아 TXT, 옛 인증 태그.

## 2026-11-25 - CLAUDE 작업 확인 및 새 도메인 전체 기능 배포

- 사용자 요청: CLAUDE 작업내용 확인 후 새 도메인 배포. 도메인은 사용자에게 `https://math-standard.co.kr`로 확인했습니다. CLAUDE의 해당 프로젝트 작업 기록과 최신 origin/main `ec41492`를 확인했습니다. 도메인 연결·검색엔진 등록은 별도 작업 폴더에서 완료됐고 현재 feature 브랜치는 기존 기준점에 머물러 있었습니다.
- Git fetch 후 최신 main의 도메인 변경을 현재 미커밋 기능과 소스 수준에서 통합했습니다. 구글·네이버 새/옛 인증 태그 각각 2개, `www`와 옛 vercel.app의 루트·하위 경로 308, 기존 planner 리다이렉트와 탐색관 rewrite를 모두 보존했습니다. 변경 전 텍스트 백업: `work/backups/deploy-20261125/`. Git 브랜치 변경·일괄 restore·사용자 파일 삭제는 하지 않았습니다.
- 메인·과정·별칭·학교·시험·탐색관·planner HTML, 공개 schema의 주소, robots/sitemap/llms와 통합 생성기를 새 도메인으로 바꿨습니다. llms의 광동고 미지원 안내도 현재 추정 추천으로 갱신했습니다. 테스트의 대표 주소를 변경하고, 탐색관 VM 검사에서 Windows 줄바꿈도 허용하도록 수정했습니다. 새 공개 동작 검사: `tests/browser-production-check.cjs`.
- Vercel 기존 프로젝트 `prj_AlwQYATNVr6n7Pb9s9wWCtgCUgaa` / scope `standard-of-math-s-projects`에 다시 연결했습니다. CLI가 생성한 `.vercel/`·`.env.local`은 기존 ignore로 제외됩니다. 인증 Preview 조회 시 CLI가 프로젝트의 자동화용 protection bypass를 생성했으며 인증값은 출력·소스·공개 파일에 넣지 않았습니다. Preview 인증 설정은 해제하지 않았습니다.
- Preview `dpl_86RQ3vjy2PhbBoHxyvYsqrufpTBK`, `https://math-standard-landing-page-9rkrmer7b.vercel.app`, READY. 보호된 Preview에서 planner 200·새 canonical, 실제 광동고 원본 엑셀과 `.env` 404 확인 후 Production 진행했습니다.
- Production **`dpl_D5g1WD59FpNZiYyDimMKAutBjWo7`**, READY. 고유 URL `https://math-standard-landing-page-nm2ldt502.vercel.app`, 운영 alias **https://math-standard.co.kr**.
- 최종 검증: Node 47/47 PASS; 로컬 Edge planner 15개 묶음, 기존 탐색관 12개 묶음 PASS. 공통 품질 PASS=58/WARN=2/FAIL=0(상위 GAS 기존 경고). 공개 JSON·JS·HTML 14파일에 실제 NEIS 키 포함 0건. 새 도메인 공개 HTTP 23건 PASS: 8개 HTML 경로/robots/sitemap/llms/광동고 JSON 정상, `.env`·`.env.local`·WORKLOG·수집 원본·실제 엑셀 404, www·옛 주소 루트·슬래시 경로·query 유지 308. 메인 인증 태그 구글2·네이버2 확인.
- 운영 도메인 실제 Edge에서 주요 4개 페이지와 4개교×6학기 추천, 광동고 추정·2015 교육과정·학점 미확인 표시, 390/1280px 넘침 없음, uncaught 오류 0을 확인했습니다. 이탈 검사 첫 실행은 모바일 스크롤 표시 assertion이 실패했고, 재실행에서 PC 세 페이지·체류/상담/1회 표시와 모바일 스크롤·닫기·history·넘침 검사가 모두 PASS했습니다. 이를 첫 실행부터 PASS로 기록하지 않습니다. 검수 결과와 화면: `output/deployment-20261125/`, 기존 브라우저 보고서 폴더.
- README·계획서를 현재 운영 상태로 갱신했습니다. Git 커밋·push, DNS 수정, 불필요한 math-standard.com 연결 삭제, 검색엔진 계정 작업은 하지 않았습니다. 기존 원본 엑셀·나이스 키·미커밋 기능은 보존했습니다. 다음 Git 통합 시 새 main의 도메인 설정과 현재 기능을 모두 포함해야 합니다.

### 2026-11-26 - 커리큘럼 기능 Git 반영

- 11-25에 Production에 배포됐지만 커밋되지 않았던 커리큘럼 탐색관·과목 선택 도구를 커밋(`ffccb29`)하고 최신 main(`ec41492`)과 병합해 main에 push했습니다(`d38e3ed`). 사이트 파일·데이터·스크립트·테스트·문서 60개를 포함했습니다.
- 제외(로컬에만 보관): 원본 `2022개정_과목전공_교차탐색관.html`, `curriculum/*.xlsx` 5개, `output/`, `outputs/kwangdong-20261123/`, `work/backups/`.
- 충돌 4개(WORKLOG, llms.txt, sitemap.xml, vercel.json)는 이미 main을 통합해 배포한 브랜치 쪽으로 맞췄습니다. 병합 중 index.html에 새 인증 태그가 중복으로 들어가 배포본과 같게 되돌렸습니다.
- 검증: 비밀값 검색 0건, `node --test tests/*.test.cjs` 47/47 PASS. index.html·sitemap·llms·planner HTML이 운영 응답과 같고, vercel.json은 비공개(404)이며 이동·rewrite 동작은 실제 응답으로 확인했습니다. 운영과 내용이 같아 다시 배포하지 않았습니다.

### 2026-11-26 - 2028 농어촌 전형 탐색기 추가

- 사용자 요청: `새 폴더`의 농어촌 수시·정시 자료를 랜딩페이지에 추가. 단톡방에서 활용하라고 공유된 자료라는 사용자 설명에 따라 원 출처('[모두의 진학] 농어촌학생 요약 - 수시 & 정시 (2028)', 강원사대부고 박상근 선생님)를 화면 상단·하단·이용 안내에 그대로 밝혔습니다.
- 신규 `scripts/integrate-rural.cjs`: 원본 `새 폴더/2028_농어촌전형_탐색기_by Claude.html`(657,738 bytes, sha256 7278e080…)은 수정하지 않고 `rural/index.html`을 생성합니다. 제목·설명·canonical·OG, 학원 메뉴(홈·탐색관·상담), 자료 이용 안내만 덧붙였고 데이터·기능은 원본 그대로입니다.
- `.vercelignore`에 `!rural`, sitemap·llms.txt에 `/rural/`, 중고등 페이지 메뉴와 탐색관 안내 영역에 링크 2개를 추가했습니다. PDF·PPTX·원본 HTML은 배포·Git에서 제외합니다.
- 검증: 신규 `tests/rural.test.cjs` 포함 Node 52/52 PASS. 로컬 Edge 390/1280px에서 가로 넘침 0, 수시·정시 화면 전환, 학원 링크, 중고등 페이지 링크 이동, 스크립트 오류 0(사이트 공통 favicon 404만 있음). 화면: `output/playwright/rural/`.
