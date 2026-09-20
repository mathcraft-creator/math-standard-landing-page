# Production SEO/GEO 검증 보고서

## Deployment

- 사이트 변경 커밋: `4e1b29542b485cbb1a5afbf7abb91f24886a3a1a`
- 브랜치: `main`
- GitHub push: `origin/main`이 `47d9858`에서 `4e1b295`로 fast-forward
- 배포 일시: 2026-09-21 08:41 KST
- Vercel deployment: `dpl_J6C91ZtDWSyj8DaHBoFZ7nn2URwe`
- 배포 URL: https://math-standard-landing-page-4iero4c6v.vercel.app
- Production URL: https://math-standard-landing-page.vercel.app/
- 상태: READY, Production alias 확인
- 배포 방식: GitHub push 후 자동배포가 생성되지 않아 기존 프로젝트에 로컬 연결한 뒤 Vercel CLI로 수동 Production 배포

## HTTP Validation

2026-09-21 08:42 KST에 실제 Production HTTP 응답을 검사했습니다.

| URL | Status | Content-Type | 결과 |
|---|---:|---|---|
| `/` | 200 | `text/html; charset=utf-8` | 정상 |
| `/elementary.html` | 200 | `text/html; charset=utf-8` | 정상 |
| `/secondary.html` | 200 | `text/html; charset=utf-8` | 정상 |
| `/llms.txt` | 200 | `text/plain; charset=utf-8` | 정상 |
| `/robots.txt` | 200 | `text/plain; charset=utf-8` | 정상 |
| `/sitemap.xml` | 200 | `application/xml` | 정상 |
| `/__seo-validation-not-found-20260920` | 404 | `text/plain; charset=utf-8` | hard 404 정상 |

## Metadata Validation

| 항목 | Home | Elementary | Secondary |
|---|---|---|---|
| HTTP 200 | PASS | PASS | PASS |
| Title | PASS | PASS | PASS |
| Description | PASS | PASS | PASS |
| Canonical | PASS | PASS | PASS |
| Robots meta | 없음, `noindex` 없음 | 없음, `noindex` 없음 | 없음, `noindex` 없음 |
| Open Graph | PASS | PASS | PASS |
| Twitter metadata | PASS | PASS | PASS |
| H1 | PASS | PASS | PASS |
| JSON-LD | 1/1 valid | 1/1 valid | 1/1 valid |

확인된 제목과 canonical:

- Home: `수학의 기준 · 딱풀리는수학 | 진접 초등·중고등 수학` / `https://math-standard-landing-page.vercel.app/`
- Elementary: `딱풀리는수학 진접점 | 초3~초6 개별 맞춤·설명하는 수학` / `https://math-standard-landing-page.vercel.app/elementary.html`
- Secondary: `수학의 기준 진접본원 | 중·고등 플립러닝·학교별 내신` / `https://math-standard-landing-page.vercel.app/secondary.html`

각 페이지에서 `og:type`, `og:title`, `og:description`, `og:url`, `og:locale`, `og:site_name`과 `twitter:card`, `twitter:title`, `twitter:description`을 실제 응답 기준으로 확인했습니다.

## Structured Data

- 세 페이지 모두 `<script type="application/ld+json">` 1개를 제공하며 전부 JSON 파싱에 성공했습니다.
- 공통 `@context`: `https://schema.org`
- Home 타입: `WebSite`, `WebPage`, `EducationalOrganization` + `LocalBusiness`, `FAQPage`
- Elementary 타입: `WebPage`, 공통 교육기관, 초등 브랜드 `EducationalOrganization`, `BreadcrumbList`, `FAQPage`
- Secondary 타입: `WebPage`, 공통 교육기관, 중·고등 브랜드 `EducationalOrganization`, `BreadcrumbList`, `FAQPage`
- 모든 페이지에서 공통 학원 엔터티 `https://math-standard-landing-page.vercel.app/#academy`를 확인했습니다.
- 초등·중고등 브랜드의 `parentOrganization`이 공통 학원 엔터티를 참조합니다.
- 페이지 URL, WebPage `about`, 브랜드 URL과 `@id` 연결이 정상입니다.
- 평점, award, 가격, 영업시간, 검증되지 않은 성과 데이터는 포함하지 않았습니다.

Google Rich Results Test와 Schema.org Validator의 외부 판정은 실행하지 않았습니다. `Requires external validation`입니다.

## llms.txt

- HTTP 200
- Content-Type: `text/plain; charset=utf-8`
- HTML fallback이 아닌 실제 텍스트 파일
- 메인·초등·중고등 canonical URL 3개 포함
- 주소, 전화, 상담 전달 방식, 체험 안내와 두 공식 네이버 블로그 링크 확인
- robots.txt는 전체 경로를 허용하므로 충돌 없음

## robots / sitemap

- robots.txt: HTTP 200, `User-agent: *`, `Allow: /`
- robots.txt의 Sitemap: `https://math-standard-landing-page.vercel.app/sitemap.xml`
- sitemap.xml: HTTP 200, `application/xml`
- sitemap URL은 메인·초등·중고등 canonical 3개와 일치
- sitemap의 모든 URL은 Production canonical 도메인을 사용
- llms.txt를 차단하는 규칙 없음

## 404

- `/__seo-validation-not-found-20260920` 요청은 HTTP 404를 반환했습니다.
- 200 상태의 오류 페이지가 아니므로 soft 404 문제가 없습니다.

## External Validation Required

- Google Search Console 소유 확인 후 sitemap 제출 및 수집·색인 상태 확인
- 네이버 서치어드바이저 소유 확인 후 sitemap 제출 및 수집·색인 상태 확인
- Google Rich Results Test
- Schema.org Validator
- 실제 검색 결과와 AI 검색 서비스의 인용·노출 상태

## Issues

### P0

- 없음

### P1

- 없음

### P2

- GitHub `main` push 후 Vercel 자동배포가 생성되지 않았습니다. 이번 배포는 기존 프로젝트 연결을 확인한 뒤 Vercel CLI로 수동 실행했습니다. 자동배포가 필요하면 별도 승인 후 Git 연결 상태를 점검해야 합니다.
