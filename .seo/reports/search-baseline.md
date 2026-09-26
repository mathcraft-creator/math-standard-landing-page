# 검색 등록 준비 상태와 측정 베이스라인

- 점검일: 2026-09-21 (KST)
- 운영 사이트: `https://math-standard-landing-page.vercel.app/`
- 근거: 운영 URL 응답과 저장소의 [Production SEO 검증 보고서](./production-validation.md)
- 범위: Google Search Console, 네이버 서치어드바이저 등록 준비 및 풍양중 파일럿 측정 기준

## 1. 판정 요약

운영 사이트는 Google과 네이버의 **소유확인 및 사이트맵 제출을 시도할 수 있는 기술 상태**다. 홈페이지 `<head>`에 각 서비스의 소유확인 메타 태그가 있고, HTTPS 대표 URL, canonical, `robots.txt`, `sitemap.xml`이 운영 환경에서 정상 응답한다.

다만 메타 태그가 있다는 사실만으로 계정의 소유확인 성공, 사이트맵 처리 성공, URL 색인 또는 검색 순위를 증명할 수는 없다. 이 항목들은 각 서비스에 로그인한 뒤 확인해야 한다. 현재 문서에서는 이를 `외부 확인 필요`로 구분한다.

## 2. 기술 준비 상태

| 점검 항목 | 현재 상태 | 판정 | 다음 확인 |
| --- | --- | --- | --- |
| 운영 HTTPS | 대표 URL에서 정상 응답 | 준비됨 | 유지 |
| Google 소유확인 태그 | 홈페이지 `<head>`에 존재 | 준비됨 | Search Console에서 실제 확인 성공 여부 확인 |
| 네이버 소유확인 태그 | 홈페이지 `<head>`에 존재 | 준비됨 | 서치어드바이저에서 실제 확인 성공 여부 확인 |
| canonical | 홈, 초등, 중·고등 페이지에 운영 절대 URL 사용 | 준비됨 | 새 페이지마다 자기 참조 canonical 적용 |
| `noindex` | 운영 핵심 HTML 3개에서 발견되지 않음 | 준비됨 | 배포 후 재확인 |
| `robots.txt` | 루트에서 200, `text/plain`, 전체 수집 허용 및 sitemap 경로 제공 | 준비됨 | 도구 내 robots 검사 실행 |
| `sitemap.xml` | 루트에서 200, 현재 공개된 canonical 3개 포함 | 준비됨 | 두 검색 도구에 제출하고 처리 결과 확인 |
| 구조화 데이터 | 운영 HTML 3개의 JSON-LD 파싱 검증 완료 | 로컬·운영 구문 검증됨 | 외부 Rich Results Test와 Schema Validator 실행 |
| 색인 상태 | 계정 데이터 미확인 | 외부 확인 필요 | URL 검사와 색인 보고서 확인 |
| 검색 성과 | 노출·클릭·순위 데이터 미확인 | 측정 전 | 등록 후 기준 기간 설정 |

소유확인 토큰 원문은 이 보고서에 복사하지 않는다. 토큰은 홈페이지에 계속 남겨야 재검증이 유지된다. Google 공식 안내에 따르면 HTML 태그 방식은 URL-prefix 속성의 홈페이지 `<head>`를 확인하며, Google은 이후에도 태그 존재를 주기적으로 확인한다.

## 3. Google Search Console 체크리스트

속성 후보는 `https://math-standard-landing-page.vercel.app/` URL-prefix다. 현재 Vercel 도메인을 계속 대표 도메인으로 쓸 때의 기준이며, 나중에 자체 도메인을 연결하면 별도 속성과 canonical 전환 계획이 필요하다.

- [ ] Search Console에서 URL-prefix 속성을 추가한다.
- [ ] HTML 태그 방식으로 소유확인이 성공하는지 확인한다.
- [ ] 기존 태그와 콘솔이 제시한 태그가 다르면 배포된 태그를 임의로 덮어쓰지 말고 계정·속성부터 대조한다.
- [ ] `https://math-standard-landing-page.vercel.app/sitemap.xml`을 제출한다.
- [ ] 사이트맵 상태가 성공인지, 발견 URL 수가 현재 공개 URL 수와 맞는지 확인한다.
- [ ] 홈, `/elementary.html`, `/secondary.html`을 URL 검사에서 확인한다.
- [ ] 색인 미등록 사유, 선택된 canonical, 마지막 크롤링 시점을 기록한다.
- [ ] 성과 보고서에서 국가·기기·검색어 필터 없이 첫 기준 기간을 저장한다.

참고: [Google 소유권 확인](https://support.google.com/webmasters/answer/9008080), [Google 사이트맵 제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). 사이트맵 제출은 크롤링·색인을 보장하지 않으며 검색엔진에 URL을 알리는 신호다.

## 4. 네이버 서치어드바이저 체크리스트

- [ ] 서치어드바이저에서 `https://math-standard-landing-page.vercel.app/` 사이트를 추가한다.
- [ ] 홈페이지 메타 태그로 소유확인이 성공하는지 확인한다.
- [ ] 사이트 진단에서 HTTPS와 대표 URL 수집 상태를 확인한다.
- [ ] `https://math-standard-landing-page.vercel.app/robots.txt`를 수집·검증한다.
- [ ] `https://math-standard-landing-page.vercel.app/sitemap.xml`을 제출한다.
- [ ] 홈, `/elementary.html`, `/secondary.html`의 수집 현황과 제외 사유를 기록한다.
- [ ] 콘텐츠 노출과 검색어 데이터가 생기면 최초 기준 기간을 저장한다.

참고: [네이버 robots.txt 설정과 sitemap 안내](https://searchadvisor.naver.com/guide/seo-basic-robots), [네이버 검색 최적화 기본 안내](https://searchadvisor.naver.com/guide/seo-basic-intro).

## 5. 외부 구조화 데이터 검증

이번 단계에서는 외부 검사 도구의 결과를 완료로 기록하지 않는다. 다음 URL을 각 도구에서 직접 실행하고 오류·경고·감지 유형을 캡처하거나 날짜와 함께 기록한다.

검사 도구:

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

검사 대상:

| 페이지 | Rich Results Test | Schema.org Validator |
| --- | --- | --- |
| `https://math-standard-landing-page.vercel.app/` | Requires external validation | Requires external validation |
| `https://math-standard-landing-page.vercel.app/elementary.html` | Requires external validation | Requires external validation |
| `https://math-standard-landing-page.vercel.app/secondary.html` | Requires external validation | Requires external validation |

기록할 항목은 검사일, 감지된 구조화 데이터 유형, 오류, 경고, 검사 URL이다. 유효한 Schema.org 마크업과 Google의 검색결과 기능 지원 여부는 다른 개념이므로 두 도구 결과를 따로 보관한다.

## 6. 검색어 베이스라인

현재 Search Console과 네이버 성과 데이터에 접근해 측정한 값이 없으므로 순위, 노출, 클릭, CTR을 추정하지 않는다. 아래 상태값은 의도적으로 `Not measured yet`으로 통일한다.

| 그룹 | 검색어 | 주요 의도 | Google | 네이버 |
| --- | --- | --- | --- | --- |
| Core Local | 진접 수학학원 | 지역 학원 탐색 | Not measured yet | Not measured yet |
| Core Local | 진접동 수학학원 | 지역 학원 탐색 | Not measured yet | Not measured yet |
| Core Local | 남양주 진접 수학학원 | 지역 학원 탐색 | Not measured yet | Not measured yet |
| Middle School | 풍양중 수학 | 학교별 정보 탐색 | Not measured yet | Not measured yet |
| Middle School | 풍양중 수학학원 | 지역 학원 비교·상담 | Not measured yet | Not measured yet |
| Middle School | 풍양중 수학 시험 | 학교 시험 정보 | Not measured yet | Not measured yet |
| Middle School | 풍양중 수학 내신 | 내신 대비 정보·학원 탐색 | Not measured yet | Not measured yet |
| High School | 진접고 수학 | 학교별 정보 탐색 | Not measured yet | Not measured yet |
| High School | 진접고 수학학원 | 지역 학원 비교·상담 | Not measured yet | Not measured yet |
| High School | 진접고 수학 내신 | 내신 대비 정보·학원 탐색 | Not measured yet | Not measured yet |
| High School | 광동고 수학 | 학교별 정보 탐색 | Not measured yet | Not measured yet |
| High School | 광동고 수학학원 | 지역 학원 비교·상담 | Not measured yet | Not measured yet |
| Elementary | 해밀초 수학 | 학교별 학습 정보 | Not measured yet | Not measured yet |
| Elementary | 해밀초 수학학원 | 지역 학원 비교·상담 | Not measured yet | Not measured yet |
| Elementary | 해밀초 IB 수학 | 학교·교육과정 정보 | Not measured yet | Not measured yet |
| Elementary | 진접 초등 수학 | 지역·과정 탐색 | Not measured yet | Not measured yet |

## 7. 측정 방법

첫 측정일을 임의로 과거로 잡지 않는다. Search Console과 네이버 등록이 확인된 날을 `T0`로 기록한다.

- **T0:** 소유확인, 사이트맵 제출 상태, 현재 색인 URL, 검색어별 기존 노출·클릭·평균 게재순위를 내보낸다.
- **파일럿 공개일:** `/schools/pungyang-middle/`의 배포 시각, sitemap 반영, URL 검사 요청을 기록한다.
- **공개 후 14일:** 발견·크롤링·색인 여부와 초기 검색어를 확인한다. 데이터가 적으면 성과 결론을 내리지 않는다.
- **공개 후 28일:** 파일럿 검색어의 노출, 클릭, CTR, 평균 게재순위와 랜딩 페이지를 비교한다.
- **분기 점검:** 검색 의도 중복, 새 시험 데이터, 내부 링크와 콘텐츠 갱신 필요성을 검토한다.

성과 표에는 검색엔진, 기간, 검색어, 랜딩 페이지, 노출, 클릭, CTR, 평균 게재순위, 색인 상태를 함께 보관한다. 분석 도구가 설치되기 전에는 페이지 체류나 CTA 전환을 측정했다고 기록하지 않는다.

## 8. 현재 단계의 결론

코드 변경 없이 수행할 다음 외부 작업은 두 검색 도구에서 소유확인을 완료하고 동일한 sitemap URL을 제출하는 것이다. 풍양중 파일럿은 실제 시험 자료와 사용자 승인이 준비되기 전까지 공개 URL, sitemap, `llms.txt`에 추가하지 않는다.
