# 검색엔진 등록 안내

기준 주소: https://math-standard-landing-page.vercel.app/

## 준비 상태

2026-09-11 robots.txt, 3페이지 사이트맵 및 사용자가 전달한 Google·네이버 소유 확인 태그를 production에 배포했습니다. 메인 head의 정확한 두 태그와 검색 파일의 HTTP 200 응답을 확인했습니다. 아래 발급 단계는 완료했으므로 각 서비스에서 소유 확인 버튼을 누른 뒤 사이트맵을 제출하면 됩니다. 계정에서의 소유 확인·제출 결과는 아직 확인하지 않았습니다.

## 사용자가 먼저 할 일: 소유 확인 태그 받기

1. [Google Search Console](https://search.google.com/search-console/)에 본인 Google 계정으로 로그인합니다.
2. 속성 추가에서 **URL 접두어**를 선택하고 `https://math-standard-landing-page.vercel.app/`을 입력합니다. 제공받은 vercel.app 주소는 도메인 DNS 소유 확인 대신 URL 접두어 방식을 사용합니다.
3. 소유 확인 방법 중 **HTML 태그**를 선택해 `google-site-verification` 메타태그 전체를 복사합니다. 확인 버튼은 태그 배포 후 누릅니다.
4. [네이버 서치어드바이저](https://searchadvisor.naver.com/)에 본인 네이버 계정으로 로그인하고 웹마스터 도구에서 `https://math-standard-landing-page.vercel.app`을 사이트로 추가합니다.
5. **HTML 태그** 방식의 `naver-site-verification` 메타태그 전체를 복사합니다.
6. 두 태그를 작업자에게 전달하면 루트 `index.html`의 `<head>`에 넣어 검색 파일과 함께 배포할 수 있습니다. 비밀번호·로그인 쿠키는 전달하지 않습니다.

## 태그 적용 후 배포

프로젝트 폴더에서 다음 명령을 실행합니다. Vercel 로그인 상태가 필요합니다. 작업자에게 태그 적용과 배포를 요청해도 됩니다.

```powershell
npx --yes vercel@59.11.7 deploy --prod --yes
```

배포 후 아래 두 주소가 200으로 응답하고 실제 파일 내용을 보여 주는지 확인합니다.

- https://math-standard-landing-page.vercel.app/robots.txt
- https://math-standard-landing-page.vercel.app/sitemap.xml

메인 페이지 소스의 `<head>`에서 두 인증 태그가 보이는지도 확인합니다. GitHub 푸시만으로 Vercel 배포가 된다고 가정하지 않습니다. 이 프로젝트는 기존에 CLI로 배포했습니다.

## 사용자가 배포 후 할 일: 확인·제출

1. Google Search Console과 네이버 서치어드바이저에서 소유 확인을 완료합니다.
2. Google Search Console의 **Sitemaps**에 `sitemap.xml`을 제출합니다.
3. Google의 **URL 검사**에서 아래 3개 URL을 각각 검사하고 **색인 생성 요청**을 합니다.
4. 네이버 웹마스터 도구의 **요청 → 사이트맵 제출**에 아래 사이트맵 전체 주소를 제출합니다. **요청 → 웹 페이지 수집**에서 페이지별 수집도 요청할 수 있습니다.

```text
https://math-standard-landing-page.vercel.app/
https://math-standard-landing-page.vercel.app/elementary.html
https://math-standard-landing-page.vercel.app/secondary.html

사이트맵: https://math-standard-landing-page.vercel.app/sitemap.xml
```

이후 각 도구의 색인·수집 보고서에서 진행 상태를 확인합니다. 수집 요청은 검색 노출이나 상위 순위를 보장하지 않습니다. 구글은 수집에 며칠~몇 주가 걸릴 수 있다고 안내합니다.

## AI 검색

ChatGPT 검색용 OAI-SearchBot은 현재 robots.txt의 전체 허용 규칙에 포함됩니다. Vercel 방화벽 등에서 해당 로봇을 별도로 막는지도 배포 환경에서 확인해야 합니다. GPTBot의 학습 허용 여부는 별도 정책이며, 학습 허용이 검색 노출의 필수 조건은 아닙니다. 이 설정만으로 ChatGPT 검색에 포함되었다고 판단할 수 없습니다.

구글 AI 검색에는 기본 검색 색인과 콘텐츠 품질이 중요합니다. Google Search용으로 llms.txt나 특별한 AI 마크업을 추가할 필요는 없습니다. 운영 중인 학원 블로그·업체 소개에 이 사이트 링크와 정확한 학원 정보를 유지하는 것도 권장합니다.

## 공식 참고

- [구글 소유 확인](https://support.google.com/webmasters/answer/9008080)
- [구글 수집 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [네이버 소유 확인](https://searchadvisor.naver.com/guide/faq-start-register)
- [네이버 사이트맵 제출](https://searchadvisor.naver.com/guide/request-feed)
- [OpenAI 검색 로봇](https://developers.openai.com/api/docs/bots)
- [구글 AI 검색 안내](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
