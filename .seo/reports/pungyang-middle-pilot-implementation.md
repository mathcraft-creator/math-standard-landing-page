# 풍양중 School/Exam Pilot 구현 보고서

- 구현일: 2026-09-26 (KST)
- 상태: `READY FOR PRODUCTION` — 원본 PDF 대조와 최종 QA 완료
- 범위: 공개 시험 데이터, 풍양중 School Hub, 2026학년도 중3 1학기 기말고사 분석
- 배포 상태: 로컬 구현·검증 완료, commit/push/deploy 미실행

## Public Data

### Source

- 내부 구조화 JSON: `풍양중_3학년_2026_1학기_기말고사_내부표준.json`
- 분석 보고서: `풍양중학교_3_기말고사_분석보고서.docx`
- 원자료 검토 기록: `.seo/reports/pungyang-middle-source-review.md`
- 공개 파일: `data/exams/pungyang-middle/2026-g3-s1-final.json`
- 계약 스키마: `data/schemas/public-exam.schema.json`

원자료 문서의 내용은 데이터로만 취급했다. 시험 문제 전문, OCR 원문, 이미지, 내부 파일 경로와 개인정보는 공개 JSON에 포함하지 않았다.

### Classification

| 분류 | 공개 데이터 |
| --- | --- |
| Observed Fact | 시험 식별, 총 21문항·100점, 선택형 17문항·80점, 논술형 4문항·20점 |
| Structured / Calculated Data | 단원별 문항 수·배점, 문항 비율 42.9%·23.8%·33.3%, 배점 비율 40%·26%·34% |
| Academy Analysis | 난이도 상 6·중 10·하 5와 시험 구성 해석 |
| Recommendation | 단원별 개념·문제풀이·논술형 학습 제안 |

### Validation result

`tests/exam-data.test.cjs`에서 필수 필드, 합계, 백분율 반올림, provenance, 분류, 공개 안전성을 검사했다. 공개 데이터 전용 5개 검사가 모두 통과한 뒤 HTML 구현을 진행했다.

### Provenance state

- `structuredDataReviewed: true`
- `reportReviewed: true`
- `originalExamPdfReviewed: true`
- 원본 PDF SHA-256: `f02f23439c25ef3e2ed619bfc0f1e30f98b18f0d9eacf4e862c75d573883f466`
- 최종 검수일·검수자: 2026-09-26, `academy-director`
- 난이도 분류: `Academy Analysis`
- 분석일: 2026-07-18
- 공개 데이터 생성일: 2026-09-22

## School Hub

- URL: `https://math-standard-landing-page.vercel.app/schools/pungyang-middle/`
- 로컬 파일: `schools/pungyang-middle/index.html`
- Primary intent: 풍양중 수학 시험·내신 정보
- H1: `풍양중 수학, 실제 시험을 분석해 준비합니다`
- Metadata: 고유 title, description, canonical, Open Graph, Twitter
- 주요 섹션: 직접 답변, 실제 시험 카드, 개념 확인·문제풀이·질문/첨삭·오답관리·재테스트·학교별 시험대비, 근거 기반 FAQ 5개, 상담 CTA
- 화면 Breadcrumb: 홈 > 중·고등 > 풍양중 수학

## Exam Analysis

- URL: `https://math-standard-landing-page.vercel.app/exams/pungyang-middle/2026-g3-s1-final/`
- 로컬 파일: `exams/pungyang-middle/2026-g3-s1-final/index.html`
- Primary intent: 2026 풍양중 3학년 1학기 기말고사 수학 분석
- H1: `2026 풍양중 3학년 1학기 기말고사 수학 분석`
- 표시 데이터: 전체·선택형·논술형 구성, 단원별 문항 수·배점·비율, 난이도 문항 수·비율, 분석 기준과 학습 제안
- Academy Analysis disclosure: `수학의 기준 자체 분석 기준이며 학교의 공식 난이도 분류가 아닙니다.`
- 화면 Breadcrumb: 홈 > 풍양중 수학 > 2026 중3 1학기 기말고사

DOCX 서술의 하 4·중 11·상 6은 사용하지 않았다. 문항별 표를 재집계한 하 5·중 10·상 6만 Academy Analysis로 공개했다.

## SEO

- 각 페이지에 검색 의도가 다른 고유 title, description, canonical, Open Graph, Twitter 정보를 추가했다.
- School Hub JSON-LD: `WebPage`, `Thing`, `EducationalOrganization`, `BreadcrumbList`, `FAQPage`
- Exam Analysis JSON-LD: `WebPage`, `Article`, `EducationalOrganization`, `BreadcrumbList`
- 기존 `/#academy`, `/#secondary-academy`의 공식 명칭, NAP, 관계와 sameAs를 재사용했다.
- 풍양중학교는 학원 소유 기관이나 지점으로 표현하지 않았다.
- `secondary.html`의 풍양중 학교 영역에서 School Hub로 진입하는 링크를 추가했다.
- Hub와 Exam 사이, 두 페이지와 중·고등관·상담 경로를 상호 연결했다.
- `sitemap.xml`과 `llms.txt`에 두 canonical URL을 추가했다.
- `.vercelignore`에서 `schools`, `exams`, `data` 공개 경로를 허용했다.

## Validation

- Public data gate: 5/5 PASS
- School pilot route/metadata/data/link tests: 5/5 PASS
- 전체 Node tests: 27/27 PASS
- Content/data consistency: 총계, 형식, 단원, 난이도 값이 공개 JSON과 HTML에서 일치
- 로컬 HTTP: School Hub 200, Exam Analysis 200, public JSON 200
- Desktop browser: 두 페이지의 헤더, 히어로, Breadcrumb, CTA, 카드 레이아웃 정상
- Mobile browser: 390×844에서 두 페이지 정상, 본문 가로 넘침 없음
- 모바일 표: 컨테이너 내부 가로 스크롤로 처리
- Browser console errors: 0
- JSON-LD parsing 및 로컬 자산·내부 링크: 자동검사 통과

## Known Limitations

난이도는 학교 공식 분류가 아니라 학원 자체 분석이다. 원본 시험 문제와 이미지는 공개하지 않았다. 원본 PDF 직접 대조와 로컬 Production 준비 검수 결과는 `.seo/reports/pungyang-middle-source-review.md`와 `.seo/reports/pungyang-middle-final-qa.md`에 기록했다.
