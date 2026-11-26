# 과목·전공 교차 탐색관 테스트 보고서

실행일: 2026-11-20. 대상: 기능 브랜치의 로컬 파일. Production·Preview 응답 검증 결과가 아니다.

## 실행 환경과 명령

Windows, Node.js 24.15.0, 실제 Microsoft Edge headless(Playwright), reduced-motion 설정. 탐색관은 시스템 다크모드도 별도 검사했다. Playwright는 기존 npm 도구 캐시에 있는 모듈을 사용했으며 프로젝트에 패키지를 설치하지 않았다.

```powershell
node --test tests/*.test.cjs
$env:PLAYWRIGHT_MODULE='C:/Users/ilys9/AppData/Local/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright'
node tests/browser-curriculum-check.cjs
node tests/browser-exit-check.cjs
powershell -NoProfile -File D:/codex/.hermes/scripts/run_quality_checks.ps1
git diff --check
```

다른 환경에서는 PLAYWRIGHT_MODULE을 설치된 경로로 바꾼다. HTTP 검사는 임시 로컬 서버에서 `vercel.json`의 rewrite를 읽어 수행한다. 원본 비교에는 루트의 사용자 제공 HTML이 필요하다.

## 최종 결과

| 검사 | 상태 | 근거/범위 |
|---|---|---|
| 시작 상태 기본 테스트 | PASS | 변경 전 30/30 |
| 통합 후 기본 테스트 | PASS | 기존 30개 + 신규 4개 = 34/34 |
| 데이터 해시·개수 | PASS | 원본 JSON 3,528,623바이트, SHA-256 일치, 전체 필드 보존 |
| 모든 과목·학과·계열·모집단위 참조 | PASS | Node에서 전체 참조 ID와 이름 검사 |
| 원본·통합본 측정 수집 | PASS | 먼저 원본 실행 후 통합본 측정. 성능 기준 통과를 뜻하지 않음 |
| `/curriculum`, `/curriculum/`, 상세 직접 접속·새로고침 | PASS | 로컬 HTTP 200 및 상세 제목 유지 |
| 홈·교과군 목록·과목 상세 6개 탭 | PASS | 수학 교과군·실제 카드·탭별 본문 확인 |
| 계열·학과·대학 전공 안내서 | PASS | 학과 카드, 계열 및 동국대/연세대 상세 진입 |
| 대학별 권장과목 | PASS | 모집단위 표 및 서울대 검색 필터 |
| 모집단위 매트릭스 | PASS | 행 선택 시 대학별 상세 확장 |
| 교차 진단·과목 바구니 | PASS | 경영학과 권장과목을 담은 진단 본문이 원본과 완전히 동일 |
| localStorage 복원 | PASS | 새로고침 후 바구니 저장 JSON과 진단 본문 유지 |
| 손상 localStorage | PASS | null·객체·비JSON·문자열/중복/음수/범위 밖 ID 처리 |
| 교육과정 기초·통합 검색 화면 | PASS | 5개 폭에서 표시·메뉴 전환 |
| 검색 4개 | PASS | 아래 결과를 원본 실행값과 비교 |
| 검색어 XSS·이상 해시 | PASS | onerror 이미지 문자열의 요소/스크립트 미생성, `__proto__`·constructor·없는 ID 등 정상 fallback |
| 360 / 390 / 768 / 1280 / 1920px | PASS | 탐색관 8화면 × 5폭, 기존 랜딩 3화면 × 5폭. 문서 가로 넘침 없음 |
| 모바일 메뉴·소개 CTA | PASS | 메뉴 표시·링크 이동·본문 CTA 진입 |
| 홈·상담 연결·브라우저 뒤로가기 | PASS | 홈 복귀, 기존 중고등 #contact 진입, 해시/페이지 뒤로가기 |
| 상대 경로·하위 URL·로컬 파일 | PASS | `/landing/curriculum`과 `/landing/curriculum/`, file:// 탐색관·세 진입 페이지 |
| 다크모드·키보드 검색·요약 복사 | PASS | 시스템 dark 계산 배경 확인, 키보드 Enter 검색, clipboard 모의 객체에서 실제 과목 요약 확인 |
| 기존 과정 FAQ | PASS | 실제 details 열림 확인 |
| 기존 이탈 상담 안내 회귀 | PASS | 기존 browser-exit-check: 세 페이지 체류시간/1회 제한/상담 이동, 모바일 닫기·정상 history·넘침 |
| 기존 SEO·신규 canonical/OG·발견 파일 | PASS | 기본 테스트의 기존 메타/JSON-LD 보존, 신규 canonical 1개 및 sitemap·배포 포함 |
| 기존 랜딩의 탐색관 대용량 데이터 미로딩 | PASS | 홈 요청 목록에 탐색관 문서/데이터 요청 없음 |
| uncaught JavaScript 오류 | PASS | 탐색관 브라우저 실행 오류 0 |
| 스크린샷 시각 검수 | PASS | 홈·탐색관 390/1280px 저장, 모바일 및 탐색관 데스크톱 실제 이미지 확인 |
| 상위 공통 품질 검사 | PASS | 종료 0, PASS=58 / WARN=2 / FAIL=0. 다른 GAS 프로젝트 검사이므로 이 사이트 검증을 대체하지 않음 |
| diff 공백 검사 | PASS | `git diff --check` |
| 실제 상담 전송·폼 제출 | NOT TESTED | 현재 운영 HTML에는 폼이 없음. 실제 전화/카카오톡 메시지를 보내지 않음 |
| 탐색관 복사 권한 거부·저장소 접근 자체 차단 | NOT TESTED | 정상 복사 모의·저장 JSON 손상은 확인. 브라우저 정책별 권한 거부는 별도 |
| 실물 모바일·저사양 CPU·저속망·스크린리더 | NOT TESTED | 이번에는 데스크톱 Edge viewport 검사 |
| 클라우드 빌드·Preview 라우팅/헤더 | NOT TESTED | 별도 정적 빌드 명령 없음. Vercel CLI 로그아웃 및 연결 파일 부재로 Preview 배포 미수행 |
| Production 배포·공개 응답·색인 | NOT TESTED | 사용자 승인 전 Production 미배포 |

최종 브라우저 검사는 12개 묶음이 모두 PASS다. 개발 도중 실패했던 자동화의 same-document navigation 응답 가정, 저장소 변조 후 reload 누락, CSS 파일명 오인 검사와 실제 모바일 메뉴 숨김은 수정 후 재검사했다. 최종 실패 항목은 없으며, 미수행 항목을 PASS로 간주하지 않는다.

## 검색 결과 (원본 = 통합본)

| 검색어 | 과목 | 학과 | 계열 | 모집단위 | 대학 안내서 |
|---|---:|---:|---:|---:|---:|
| 미적분Ⅱ | 2 | 0 | 0 | 0 | 0 |
| 경영학과 | 20 | 9 | 2 | 26 | 2 |
| 반도체 | 14 | 10 | 0 | 20 | 3 |
| 서울대학교 | 0 | 0 | 0 | 0 | 0 |

‘서울대학교’는 실제 데이터 표기가 ‘서울대’여서 원본에서도 결과가 없다. ‘서울대’ 검색은 Node 검색 엔진 테스트 및 대학 표 필터로 결과가 있음을 확인했다. 검색 정규화·별칭을 임의로 변경하지 않았다.

## 성능 표본과 한계

다음은 로컬 실행의 한 표본이다. 최종 재검사 원시값은 `output/playwright/curriculum/results.json`에 있으며 실행 때마다 덮어쓴다. Google Fonts 캐시·로컬 CPU·동일 browser context의 GC·자동화 왕복이 영향을 주므로 성능 향상이나 실제 모바일 체감 보장으로 해석하지 않는다.

| 항목 | 원본 | 통합본 |
|---|---:|---:|
| DOMContentLoaded | 약 1,849ms | 약 608ms |
| JSON 재파싱 | 약 19.4ms | 약 19.2ms |
| HTTP transfer (로컬 비압축, 헤더 포함) | 3,596,260B | 3,600,854B |
| JS heap 표본 | 약 12.4MB | 약 18.3MB |

- 화면 전환 자동화 소요 표본: 41~466ms. 자동화 통신/대기를 포함하며 순수 렌더링 시간이 아니다.
- 390px ‘반도체’ 자동완성 동기 처리: 3.5ms. 스크롤 15프레임 표본: 평균 약 15.6ms / 최대 약 16.8ms.
- heap은 원본→통합본을 같은 context에서 연속 실행한 비격리 값이다. 증가를 누수라고 판정하거나 메모리 안정성을 보장할 수 없다. 장시간·반복 사용의 peak/leak 검사는 NOT TESTED.
- 원본 약 3.6MB를 유지했으므로 느린 모바일망 초기 다운로드 부담은 남는다. 우선 실제 Preview의 압축·캐시 응답을 측정하고 필요할 때 JSON 분리·캐싱을 검토한다. 초기 단계에서 데이터 분리를 강제하지 않았다.

## 산출물과 재현

- `output/playwright/curriculum/results.json`: 12개 검사 상태·검색/전환/성능 값·JS 오류.
- `output/playwright/curriculum/curriculum-{390,1280}.png`: 탐색관 홈 전체 화면.
- `output/playwright/curriculum/home-{390,1280}.png`: 신규 소개가 포함된 메인 전체 화면.
- `docs/curriculum-source-manifest.json`: 원본과 데이터의 해시·개수.
- `tests/browser-check.cjs`는 구형 디자인 전용 선택자를 쓰므로 실행하지 않았다. 현재 디자인 회귀는 새 탐색관 검사(랜딩 3페이지 포함)와 현행 이탈 검사로 수행했다.
- 기존 이탈 검사에서 다시 생성된 `docs/previews/exit-offer-*.png`는 원상 복원해 기존 이미지 산출물을 변경하지 않았다.
