# 사이트 분리 후 검색 등록 안내

2026-09-29 PHASE 2 완료. 두 Production 사이트의 HTTP·SEO·모바일 동작을 검증했습니다. 이번 작업에서 검색·광고 계정 설정은 변경하지 않았습니다.

## 신규 초등 사이트: 사용자가 직접 등록

- 브랜드: 딱풀리는수학 진접점
- Google Search Console 신규 URL-prefix 속성: `https://ddaksoojj.vercel.app/`
- 네이버 서치어드바이저 신규 사이트: `https://ddaksoojj.vercel.app/`
- 두 서비스에 제출할 사이트맵: `https://ddaksoojj.vercel.app/sitemap.xml`
- 대표 페이지와 색인 확인 대상: `https://ddaksoojj.vercel.app/`

각 계정에서 신규 사이트 소유 확인용 HTML 메타태그를 발급받아 초등 사이트 적용·배포를 요청합니다. 실제 발급 태그가 배포된 뒤 소유 확인과 사이트맵 제출을 완료합니다. 기존 중·고등 인증 태그를 신규 사이트에 복사하지 않았습니다. 비밀번호나 로그인 쿠키는 전달하지 않습니다.

네이버 파워링크는 신규 초등 URL로 ‘딱풀리는수학 진접점’ 별도 비즈채널 등록을 진행합니다. 기존 승인 URL과 광고 설정은 유지합니다.

## 기존 중·고등 사이트: 유지

대표 URL과 기존 Google·네이버 인증 태그는 유지했습니다. 사용자 제공 현황상 기존 검색 등록 및 풍양중 색인이 완료돼 있으며, 이번 작업에서 계정 내부 상태를 재확인하거나 변경하지 않았습니다.

사이트맵: `https://math-standard-landing-page.vercel.app/sitemap.xml`

현재 대표 URL은 아래 3개입니다.

- `https://math-standard-landing-page.vercel.app/`
- `https://math-standard-landing-page.vercel.app/schools/pungyang-middle/`
- `https://math-standard-landing-page.vercel.app/exams/pungyang-middle/2026-g3-s1-final/`

## Legacy 후속 작업

`secondary.html`은 HTTP 200과 루트 canonical을 유지하며 사이트맵에서 제외했습니다. 기존 `elementary.html`은 HTTP 200, 기존 본문과 self canonical을 유지합니다. 어느 쪽에도 301을 적용하지 않았습니다.

신규 초등 검색 등록·색인과 광고 준비를 확인한 뒤, 기존 초등 주소를 신규 루트로 301 이전하는 별도 작업을 권장합니다. 기존 주소에 본문을 계속 제공해야 한다면 cross-domain canonical을 대안으로 검토합니다. 이 후속 작업은 아직 적용하지 않았습니다.

최종 근거: [PHASE 2 보고서](../.seo/reports/site-split-phase2.md).
