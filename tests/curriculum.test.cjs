const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('curriculum/index.html');
const manifest = JSON.parse(read('docs/curriculum-source-manifest.json'));
const json = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(json);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

test('curriculum: embedded data matches the complete original byte for byte', () => {
  assert.equal(sha(json), manifest.jsonSha256);
  assert.equal(Buffer.byteLength(json), manifest.jsonBytes);
  assert.deepEqual(Object.fromEntries(Object.entries(data).map(([k,v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length])), manifest.counts);
  const original = path.join(root, manifest.original);
  if (fs.existsSync(original)) assert.equal(sha(fs.readFileSync(original)), manifest.originalSha256);
  assert.equal(new Set(data.U.map(u => u.u)).size, 47);
  assert.equal(new Set(data.R.map(r => r.m)).size, 16);
});

test('curriculum: every subject, major and university relation resolves', () => {
  const subject = id => Number.isInteger(id) && data.S[id]?.id === id;
  const majors = new Set(data.M.map(m => m.n));
  const series = new Set(data.SR.map(s => s.n));
  for (const s of data.S) {
    assert.ok(subject(s.id));
    for (const key of ['uc','ur','ua']) for (const i of s[key]) assert.ok(data.U[i], `${s.n} ${key} ${i}`);
    for (const [name] of s.mj) assert.ok(majors.has(name), name);
    for (const name of s.sr) assert.ok(series.has(name), name);
  }
  for (const m of [...data.M, ...data.SR]) {
    for (const key of ['genS','carS','fusS']) for (const id of m[key]) assert.ok(subject(id), `${m.n} ${id}`);
    for (const id of m.units || []) assert.ok(data.U[id]);
  }
  for (const u of data.U) for (const key of ['sc','sr','sn']) for (const id of u[key]) assert.ok(subject(id), `${u.u} ${key} ${id}`);
});

test('curriculum: scripts compile and known search terms resolve in the original engine', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m => !m[0].startsWith('<script id="data"'));
  for (const [,script] of scripts) new vm.Script(script);
  let engine = scripts.at(-1)[1].replace(/saveB\(\);render\(\);\r?\n}/, 'globalThis.engine={search};\n}');
  const node = { addEventListener(){}, classList:{}, textContent:json };
  const sandbox = { document:{ getElementById:()=>node, querySelector:()=>node, addEventListener(){} }, window:{ addEventListener(){} }, localStorage:{ getItem:()=>null } };
  vm.runInNewContext(engine, sandbox);
  for (const term of ['미적분Ⅱ','경영학과','반도체','서울대']) {
    const r = sandbox.engine.search(term);
    assert.ok(Object.values(r).some(a => a.length > 0), term);
  }
  // The supplied data uses '서울대'; do not invent an alias or change search logic.
  assert.ok(Object.values(sandbox.engine.search('서울대학교')).every(a => a.length === 0));
});

test('curriculum: isolated resources, actual consultation and discoverable canonical', () => {
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.match(html, /rel="canonical" href="https:\/\/math-standard\.co\.kr\/curriculum"/);
  assert.match(html, /資料利用案内|자료 이용 안내/);
  assert.match(html, /href="\.\.\/middle\/index\.html#contact"/);
  assert.ok(read('middle/index.html').includes('id="contact"'));
  assert.doesNotMatch(html, /assets\/site\.(css|js)|fetch\(|eval\(|new Function/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/math-standard\.co\.kr\/curriculum<\/loc>/);
  assert.match(read('.vercelignore'), /^!curriculum$/m);
  const config = JSON.parse(read('vercel.json'));
  for (const source of ['/curriculum','/curriculum/']) assert.equal(config.rewrites.find(r=>r.source===source).destination,'/curriculum/index.html');
  for (const name of ['index.html','middle/index.html','elementary/index.html']) {
    const page = read(name);
    assert.match(page, /고교학점제·진로 탐색/);
    assert.doesNotMatch(page, /<script id="data"|3528623/);
  }
});
