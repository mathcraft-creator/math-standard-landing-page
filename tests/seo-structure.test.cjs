const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://math-standard-landing-page.vercel.app';
const pages = [
  ['index.html', `${baseUrl}/`],
  ['elementary/index.html', `${baseUrl}/elementary/`],
  ['middle/index.html', `${baseUrl}/middle/`],
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1]),
  );
}

function graphTypes(documents) {
  return documents
    .flatMap((document) => document['@graph'] || [document])
    .flatMap((item) => (Array.isArray(item['@type']) ? item['@type'] : [item['@type']]));
}

function graphItems(documents) {
  return documents.flatMap((document) => document['@graph'] || [document]);
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const [page, canonical] of pages) {
  test(`${page}: complete search and sharing metadata`, () => {
    const html = read(page);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replaceAll('.', '\\.') }"`));
    assert.match(html, /<meta property="og:locale" content="ko_KR"/);
    assert.match(html, /<meta property="og:site_name" content="딱풀리는수학 진접점 · 수학의 기준 진접본원"/);
    assert.match(html, /<meta name="twitter:card" content="summary"/);
    assert.match(html, /<meta name="twitter:title" content="[^"]+"/);
    assert.match(html, /name="twitter:description"\s+content="[^"]+"/);

    const documents = jsonLd(html);
    assert.ok(documents.length > 0, 'JSON-LD is required');
    const types = graphTypes(documents);
    assert.ok(types.includes('WebPage'), 'WebPage structured data is required');
    assert.ok(types.includes('EducationalOrganization'), 'EducationalOrganization structured data is required');
    // 고르는 화면(index)에는 FAQ가 없다. FAQ 구조화 데이터는 과정 페이지에만 필수이고, 있으면 화면과 같아야 한다.
    if (page !== 'index.html') assert.ok(types.includes('FAQPage'), 'FAQPage structured data is required');

    const faq = documents
      .flatMap((document) => document['@graph'] || [document])
      .find((item) => item['@type'] === 'FAQPage');
    if (!faq) return;
    assert.ok(faq.mainEntity.length >= 3);
    const text = visibleText(html);
    for (const item of faq.mainEntity) {
      assert.ok(text.includes(item.name), `FAQ question must be visible: ${item.name}`);
      assert.ok(text.includes(item.acceptedAnswer.text), `FAQ answer must be visible: ${item.name}`);
    }
  });
}

test('academy entities use one stable parent and explicit brand relationships', () => {
  const academyId = `${baseUrl}/#academy`;
  const expectedParent = {
    name: '딱풀리는수학 진접점 · 수학의 기준 진접본원',
    url: `${baseUrl}/`,
    telephone: '+82-31-522-5431',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '해밀예당1로 40 화성프라자 5층',
      addressLocality: '남양주시 진접읍',
      addressRegion: '경기도',
      addressCountry: 'KR',
    },
    areaServed: ['진접읍', '남양주시'],
  };

  for (const [page] of pages) {
    const items = graphItems(jsonLd(read(page)));
    const parent = items.find((item) => item['@id'] === academyId);
    assert.ok(parent, `${page}: stable academy entity is required`);
    for (const [key, value] of Object.entries(expectedParent)) {
      assert.deepEqual(parent[key], value, `${page}: academy ${key} must stay consistent`);
    }
  }

  for (const [page, brandId, brandName] of [
    ['elementary/index.html', `${baseUrl}/#elementary-academy`, '딱풀리는수학 진접점'],
    ['middle/index.html', `${baseUrl}/#secondary-academy`, '수학의 기준 진접본원'],
  ]) {
    const items = graphItems(jsonLd(read(page)));
    const brand = items.find((item) => item['@id'] === brandId);
    assert.ok(brand, `${page}: brand entity is required`);
    assert.equal(brand.name, brandName);
    assert.deepEqual(brand.parentOrganization, { '@id': academyId });
  }
});

test('crawler discovery files match deployed canonical URLs', () => {
  const robots = read('robots.txt');
  const sitemap = read('sitemap.xml');
  const llms = read('llms.txt');
  const vercelIgnore = read('.vercelignore');

  assert.match(robots, new RegExp(`Sitemap: ${baseUrl.replaceAll('.', '\\.')}/sitemap\\.xml`));
  for (const [, canonical] of pages) {
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), canonical);
    assert.ok(llms.includes(canonical), canonical);
  }
  assert.match(llms, /딱풀리는수학 진접점/);
  assert.match(llms, /수학의 기준 진접본원/);
  assert.match(vercelIgnore, /!llms\.txt/);
  assert.match(vercelIgnore, /^!middle$/m);
  assert.match(vercelIgnore, /^!elementary$/m);
});

test('legacy course URLs redirect to the new course pages', () => {
  for (const [legacy, target] of [['elementary.html', 'elementary/'], ['secondary.html', 'middle/']]) {
    const html = read(legacy);
    assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0; url=${target}">`), legacy);
    assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl.replaceAll('.', '\\.')}/${target}">`), legacy);
    assert.ok(html.includes(`location.replace('${target}'`), legacy);
  }
});
