const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const baseUrl = 'https://math-standard-landing-page.vercel.app';
const hubFile = 'schools/pungyang-middle/index.html';
const examFile = 'exams/pungyang-middle/2026-g3-s1-final/index.html';
const hubUrl = `${baseUrl}/schools/pungyang-middle/`;
const examUrl = `${baseUrl}/exams/pungyang-middle/2026-g3-s1-final/`;

function read(file) {
  const absolute = path.join(root, file);
  assert.ok(fs.existsSync(absolute), `missing ${file}`);
  return fs.readFileSync(absolute, 'utf8');
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1]),
  );
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

function assertLocalResources(file, html) {
  const sourceDir = path.dirname(path.join(root, file));
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|tel:|mailto:|data:)/.test(value)) continue;
    const [resource, hash] = value.split('#');
    const target = resource ? path.resolve(sourceDir, resource) : path.join(root, file);
    assert.ok(target.startsWith(root + path.sep), `${file}: unsafe path ${value}`);
    assert.ok(fs.existsSync(target), `${file}: missing ${value}`);
    if (hash && fs.statSync(target).isFile()) {
      assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${hash}"`), `${file}: missing anchor ${value}`);
    }
  }
}

for (const page of [
  {
    file: hubFile,
    canonical: hubUrl,
    h1: '풍양중 수학, 실제 시험을 분석해 준비합니다',
    breadcrumb: ['홈', '중·고등', '풍양중 수학'],
    requiredTypes: ['WebPage', 'BreadcrumbList', 'FAQPage', 'EducationalOrganization'],
  },
  {
    file: examFile,
    canonical: examUrl,
    h1: '2026 풍양중 3학년 1학기 기말고사 수학 분석',
    breadcrumb: ['홈', '풍양중 수학', '2026 중3 1학기 기말고사'],
    requiredTypes: ['WebPage', 'Article', 'BreadcrumbList', 'EducationalOrganization'],
  },
]) {
  test(`${page.file}: complete metadata, structured data, and local resources`, () => {
    const html = read(page.file);
    assert.match(html, /<html lang="ko">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description"\s+content="[^"]+"/);
    assert.ok(html.includes(`<link rel="canonical" href="${page.canonical}"`));
    assert.ok(html.includes(`<meta property="og:url" content="${page.canonical}"`));
    assert.match(html, /<meta property="og:locale" content="ko_KR"/);
    assert.match(html, /<meta property="og:site_name" content="딱풀리는수학 진접점 · 수학의 기준 진접본원"/);
    assert.match(html, /<meta property="og:title" content="[^"]+"/);
    assert.match(html, /<meta property="og:description" content="[^"]+"/);
    assert.match(html, /<meta name="twitter:card" content="summary"/);
    assert.match(html, /<meta name="twitter:title" content="[^"]+"/);
    assert.match(html, /<meta name="twitter:description" content="[^"]+"/);
    assert.doesNotMatch(html, /noindex/i);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(visibleText(html).includes(page.h1));

    const items = graphItems(jsonLd(html));
    const types = items.flatMap((item) => (Array.isArray(item['@type']) ? item['@type'] : [item['@type']]));
    for (const type of page.requiredTypes) assert.ok(types.includes(type), `${page.file}: missing ${type}`);
    assert.ok(items.some((item) => item['@id'] === `${baseUrl}/#academy`));
    assert.ok(items.some((item) => item['@id'] === `${baseUrl}/#secondary-academy`));

    const webPage = items.find((item) => item['@type'] === 'WebPage');
    assert.deepEqual(webPage.isPartOf, { '@id': `${baseUrl}/#website` });
    const breadcrumb = items.find((item) => item['@type'] === 'BreadcrumbList');
    assert.deepEqual(
      breadcrumb.itemListElement.map((item) => item.name),
      page.breadcrumb,
    );
    const visibleBreadcrumb = html.match(/<div class="breadcrumb">([\s\S]*?)<\/div>/);
    assert.ok(visibleBreadcrumb, `${page.file}: missing visible breadcrumb`);
    assert.deepEqual(
      [...visibleBreadcrumb[1].matchAll(/<(?:a|span)(?:\s[^>]*)?>([^<]+)<\/\w+>/g)]
        .map((match) => match[1].trim())
        .filter((value) => value !== '/'),
      page.breadcrumb,
    );

    assertLocalResources(page.file, html);
  });
}

test('school hub FAQ structured data exactly matches visible answers', () => {
  const html = read(hubFile);
  const text = visibleText(html);
  const faq = graphItems(jsonLd(html)).find((item) => item['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 5);
  for (const item of faq.mainEntity) {
    assert.ok(text.includes(item.name), item.name);
    assert.ok(text.includes(item.acceptedAnswer.text), item.name);
  }
});

test('exam page displays values from the validated public JSON', () => {
  const data = JSON.parse(read('data/exams/pungyang-middle/2026-g3-s1-final.json'));
  const html = read(examFile);
  assert.ok(html.includes(`data-exam-id="${data.examId}"`));

  for (const [field, value] of [
    ['totalQuestions', data.summary.totalQuestions],
    ['totalScore', data.summary.totalScore],
    ['selectedQuestions', data.questionFormat[0].questions],
    ['selectedScore', data.questionFormat[0].score],
    ['constructedQuestions', data.questionFormat[1].questions],
    ['constructedScore', data.questionFormat[1].score],
  ]) {
    assert.ok(html.includes(`data-field="${field}" data-value="${value}"`), `${field}=${value}`);
    const visibleValue = html.match(
      new RegExp(`data-field="${field}" data-value="${value}">([^<]+)<\\/span>`),
    );
    assert.ok(visibleValue, `${field}: missing visible value`);
    assert.equal(visibleValue[1], `${value}${field.endsWith('Score') ? '점' : '문항'}`);
  }

  for (const unit of data.units) {
    const row = html.match(new RegExp(`<tr data-unit-id="${unit.id}"[^>]*>[\\s\\S]*?<\\/tr>`));
    assert.ok(row, unit.id);
    assert.ok(row[0].includes(`>${unit.name}</th>`), `${unit.id}: ${unit.name}`);
    assert.deepEqual(
      [...row[0].matchAll(/<td data-value="([^"]+)">([^<]+)<\/td>/g)].map((match) => ({
        value: match[1],
        text: match[2],
      })),
      [
        { value: String(unit.questions), text: `${unit.questions}문항` },
        { value: String(unit.questionPercentage), text: `${unit.questionPercentage}%` },
        { value: String(unit.score), text: `${unit.score}점` },
        { value: String(unit.scorePercentage), text: `${unit.scorePercentage}%` },
      ],
    );
  }

  for (const level of data.difficulty.levels) {
    const row = html.match(new RegExp(`<tr data-difficulty-id="${level.id}"[^>]*>[\\s\\S]*?<\\/tr>`));
    assert.ok(row, level.id);
    assert.ok(row[0].includes(`>${level.name}</th>`), `${level.id}: ${level.name}`);
    assert.deepEqual(
      [...row[0].matchAll(/<td data-value="([^"]+)">([^<]+)<\/td>/g)].map((match) => ({
        value: match[1],
        text: match[2],
      })),
      [
        { value: String(level.questions), text: `${level.questions}문항` },
        { value: String(level.questionPercentage), text: `${level.questionPercentage}%` },
      ],
    );
  }
  assert.match(html, /수학의 기준 자체 분석 기준/);
  assert.match(html, /학교의 공식 난이도 분류가 아닙니다/);
  assert.doesNotMatch(html, /하 4|중 11/);
  assert.doesNotMatch(html, /<보기>|구하시오/);
});

test('pilot pages and discovery files form one internal link graph', () => {
  const secondary = read('secondary.html');
  const hub = read(hubFile);
  const exam = read(examFile);
  const sitemap = read('sitemap.xml');
  const llms = read('llms.txt');
  const vercelIgnore = read('.vercelignore');

  assert.match(secondary, /href="\.\/schools\/pungyang-middle\/"[^>]*>풍양중 수학 시험분석/);
  assert.match(hub, /href="\.\.\/\.\.\/secondary\.html"/);
  assert.match(hub, /href="\.\.\/\.\.\/exams\/pungyang-middle\/2026-g3-s1-final\/"/);
  assert.match(hub, /href="\.\.\/\.\.\/secondary\.html#apply"/);
  assert.match(exam, /href="\.\.\/\.\.\/\.\.\/schools\/pungyang-middle\/"/);
  assert.match(exam, /href="\.\.\/\.\.\/\.\.\/secondary\.html"/);
  assert.match(exam, /href="\.\.\/\.\.\/\.\.\/secondary\.html#apply"/);

  for (const url of [hubUrl, examUrl]) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
    assert.ok(llms.includes(url), url);
  }
  assert.match(vercelIgnore, /!schools/);
  assert.match(vercelIgnore, /!exams/);
  assert.match(vercelIgnore, /!data/);
});
