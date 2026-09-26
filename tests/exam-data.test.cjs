const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicDataPath = path.join(root, 'data', 'exams', 'pungyang-middle', '2026-g3-s1-final.json');
const schemaPath = path.join(root, 'data', 'schemas', 'public-exam.schema.json');

function readJson(file) {
  assert.ok(fs.existsSync(file), `missing ${path.relative(root, file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sum(items, key) {
  return items.reduce((total, item) => total + item[key], 0);
}

test('public exam JSON satisfies the validated source contract', () => {
  const data = readJson(publicDataPath);

  assert.equal(data.examId, 'pungyang-middle-2026-g3-s1-final');
  assert.deepEqual(data.school, { id: 'pungyang-middle', name: '풍양중학교' });
  assert.equal(data.academicYear, 2026);
  assert.equal(data.grade, 3);
  assert.equal(data.semester, 1);
  assert.equal(data.examType.id, 'final');
  assert.equal(data.subject, '수학');

  assert.equal(data.summary.totalQuestions, sum(data.questionFormat, 'questions'));
  assert.equal(data.summary.totalScore, sum(data.questionFormat, 'score'));
  assert.equal(data.summary.totalQuestions, sum(data.units, 'questions'));
  assert.equal(data.summary.totalScore, sum(data.units, 'score'));
  assert.equal(data.summary.totalQuestions, sum(data.difficulty.levels, 'questions'));

  assert.deepEqual(
    data.questionFormat.map(({ id, questions, score }) => ({ id, questions, score })),
    [
      { id: 'selected-response', questions: 17, score: 80 },
      { id: 'constructed-response', questions: 4, score: 20 },
    ],
  );
  assert.deepEqual(
    data.units.map(({ id, questions, score }) => ({ id, questions, score })),
    [
      { id: 'quadratic-equations', questions: 9, score: 40 },
      { id: 'factorization', questions: 5, score: 26 },
      { id: 'statistics', questions: 7, score: 34 },
    ],
  );
  assert.deepEqual(
    data.difficulty.levels.map(({ id, questions }) => ({ id, questions })),
    [
      { id: 'high', questions: 6 },
      { id: 'medium', questions: 10 },
      { id: 'low', questions: 5 },
    ],
  );
});

test('calculated metrics use one documented rounding policy', () => {
  const data = readJson(publicDataPath);
  assert.equal(data.calculatedMetrics.questionPercentageDecimals, 1);
  assert.equal(data.calculatedMetrics.scorePercentageDecimals, 0);
  assert.equal(sum(data.units, 'questionPercentage'), 100);
  assert.equal(sum(data.units, 'scorePercentage'), 100);
  assert.deepEqual(
    data.units.map(({ id, questionPercentage, scorePercentage }) => ({
      id,
      questionPercentage,
      scorePercentage,
    })),
    [
      { id: 'quadratic-equations', questionPercentage: 42.9, scorePercentage: 40 },
      { id: 'factorization', questionPercentage: 23.8, scorePercentage: 26 },
      { id: 'statistics', questionPercentage: 33.3, scorePercentage: 34 },
    ],
  );
});

test('public exam provenance distinguishes facts, calculations, analysis, and recommendations', () => {
  const data = readJson(publicDataPath);
  assert.equal(data.summary.classification, 'Observed Fact');
  assert.ok(data.units.every((unit) => unit.classification === 'Structured / Calculated Data'));
  assert.equal(data.difficulty.classification, 'Academy Analysis');
  assert.match(data.difficulty.disclosure, /수학의 기준 자체 분석 기준/);
  assert.deepEqual(data.difficulty.criteria, [
    { id: 'low', name: '하', definition: '기본 개념 또는 기본 공식 적용 중심' },
    { id: 'medium', name: '중', definition: '개념 결합 또는 조건 해석 필요' },
    { id: 'high', name: '상', definition: '복합 조건 또는 다단계 사고 필요' },
  ]);
  assert.equal(data.analysis.classification, 'Academy Analysis');
  assert.equal(data.recommendations.classification, 'Recommendation');
  assert.ok(data.provenance.analysisMethod);
  assert.equal(data.provenance.reviewedBy, 'academy-director');
  assert.equal(data.provenance.humanReviewed, true);
  assert.equal(data.provenance.reviewedAt, '2026-09-26');
  assert.deepEqual(data.provenance.sourceVerification, {
    structuredDataReviewed: true,
    reportReviewed: true,
    originalExamPdfReviewed: true,
    originalExamPdfSha256: 'f02f23439c25ef3e2ed619bfc0f1e30f98b18f0d9eacf4e862c75d573883f466',
  });
});

test('public exam JSON excludes raw questions and personal data', () => {
  const data = readJson(publicDataPath);
  const forbiddenKeys = new Set([
    'student',
    'studentName',
    'studentScore',
    'parent',
    'parentName',
    'phone',
    'problemText',
    'questionText',
    'ocrText',
    'sourcePath',
    'sourceFile',
    'examImage',
  ]);

  function inspect(value) {
    if (Array.isArray(value)) return value.forEach(inspect);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!forbiddenKeys.has(key), `public JSON contains forbidden key: ${key}`);
      inspect(child);
    }
  }

  inspect(data);
  assert.doesNotMatch(JSON.stringify(data), /<보기>|구하시오|학생 이름|학부모/);
});

test('public exam schema documents the required top-level contract', () => {
  const schema = readJson(schemaPath);
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  for (const key of [
    'examId',
    'school',
    'academicYear',
    'grade',
    'semester',
    'examType',
    'summary',
    'questionFormat',
    'units',
    'difficulty',
    'calculatedMetrics',
    'analysis',
    'recommendations',
    'provenance',
  ]) {
    assert.ok(schema.required.includes(key), `schema missing required key: ${key}`);
  }
});
