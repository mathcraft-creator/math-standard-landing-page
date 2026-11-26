const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const audit=JSON.parse(read('docs/course-planner-data-audit.json'));
const catalog=JSON.parse(read('data/curriculum/subjects.json'));
const schools=['jinjeop','onam','jingeon'].map(id=>JSON.parse(read(`data/curriculum/schools/${id}/2027.json`)));

test('planner: 345 original cohort rows retain source cells, dates and verified choice counts',()=>{
  assert.equal(schools.reduce((n,s)=>n+s.offerings.length,0),345);
  assert.deepEqual(schools.map(s=>s.offerings.length),[122,111,112]);
  for(const school of schools){
    assert.equal(new Set(school.offerings.map(o=>o.id)).size,school.offerings.length);
    for(const o of school.offerings){
      assert.equal(o.year,school.entryYear+o.grade-1);assert.match(o.source.range,/^A\d+:S\d+$/);
      assert.equal(o.source.sheet,'2027입학생_3개년');assert.equal(o.source.date,'2026-10-30');
      assert.ok(o.credits>0);assert.ok(o.source.url.startsWith('https://'));assert.equal(o.source.verification,'공식 원문 확인');
    }
    for(const group of school.groups){
      for(const id of group.offerings) assert.equal(school.offerings.find(o=>o.id===id).groupId,group.id);
      const count=group.condition.match(/후보 (\d+)과목/);if(count)assert.equal(group.offerings.length,+count[1]);
      assert.equal(+group.condition.match(/택(\d+)/)[1],group.choose);
    }
  }
});
test('planner: workbooks match recorded versions and only authorized capture updates differ from the baseline',()=>{
  for(const file of audit.workbooks){
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'curriculum',file.file))).digest('hex'),file.sha256);
  }
  if(fs.existsSync(path.join(root,'output/curriculum-planning/source-audit.json'))){
    const old=JSON.parse(read('output/curriculum-planning/source-audit.json'));
    const updates=JSON.parse(read('docs/course-planner-workbook-updates.json')).updates;
    assert.equal(updates.length,2);
    for(const file of audit.workbooks){
      const update=updates.find(u=>u.file===file.file),original=old.find(s=>s.file===file.file).sha256;
      if(update){assert.equal(update.beforeSha256,original);assert.equal(update.afterSha256,file.sha256);assert.ok(/광동고|4개/.test(file.file));}
      else assert.equal(file.sha256,original);
    }
  }
});

test('planner: the 60 captured rows remain a separate unconfirmed observation, not a 2027 timetable',()=>{
  const data=JSON.parse(read('data/curriculum/schools/kwangdong/2027.json'));
  const evidence=JSON.parse(read('scripts/data/kwangdong-naver-capture-20261123.json'));
  assert.equal(data.status,'projected');assert.equal(data.offerings.length,134);
  assert.deepEqual(data.expectedTermCredits,Array(6).fill(null));
  assert.equal(data.observations.offerings.length,60);
  assert.deepEqual(Array.from({length:4},(_,t)=>data.observations.offerings.filter(o=>(o.grade-1)*2+o.semester-1===t).length),[12,11,19,18]);
  for(const o of data.observations.offerings){
    assert.equal(o.credits,null);assert.equal(o.year,null);assert.equal(o.entryYear,null);assert.equal(o.selectionGroup,null);
    const term=evidence.terms.find(t=>t.grade===o.grade&&t.semester===o.semester);
    assert.ok(term.groups[o.category].includes(o.name));assert.equal(o.source.sheet,'네이버캡처_20261123');
    assert.equal(o.mutedInCapture,term.mutedNames.includes(o.name));assert.equal(o.source.kind,'user-screenshot');
  }
});
test('planner: unknown credits and unmatched school courses are preserved without invented catalog matches',()=>{
  const missing=JSON.parse(read('data/curriculum/schools/kwangdong/2027.json'));
  assert.equal(missing.status,'projected');assert.ok(missing.offerings.every(o=>o.credits===null));
  for(const school of schools)for(const o of school.offerings){
    if(o.subjectId==null)assert.ok(audit.schools.find(s=>s.school===school.name).unmappedNames.includes(o.name));
    else assert.equal(catalog.subjects.find(s=>s.id===o.subjectId).key,o.key);
  }
  assert.equal(schools[0].offerings.find(o=>o.name==='확률과 통계').kind,'elective');
  assert.equal(schools[1].offerings.find(o=>o.name==='확률과 통계').kind,'required');
  assert.ok(!schools[0].offerings.some(o=>o.name==='인공지능 수학'));
});

test('planner: Gwangdong projection preserves reviewed NEIS names, original observation years and unknown conditions',()=>{
  const data=JSON.parse(read('data/curriculum/schools/kwangdong/2027.json'));
  const evidence=JSON.parse(read('scripts/data/kwangdong-neis-evidence-20261123.json'));
  assert.equal(data.projection.snapshotSha256,evidence.snapshotSha256);
  assert.equal(data.projection.warnings.length,5);
  assert.deepEqual(Array.from({length:6},(_,t)=>data.offerings.filter(o=>o.term===t).length),[14,13,19,18,35,35]);
  for(const o of data.offerings){
    const original=evidence.offerings.find(e=>e.name===o.name&&e.grade===o.grade&&e.semester===o.semester);
    assert.deepEqual(o.evidence,original);assert.equal(o.evidence.observedYear,2026);
    assert.equal(o.year,2027+o.grade-1);assert.equal(o.credits,null);assert.equal(o.kind,'elective');
    assert.ok(o.source.url.startsWith('https://open.neis.go.kr/hub/hisTimetable?'));
    assert.ok(!o.source.url.includes('KEY='));assert.ok(o.evidence.rowCount>0);
    assert.equal(o.evidence.curriculum,o.grade===3?'2015-reference':'2022-observed');
  }
  assert.ok(data.groups.every(g=>g.kind==='advisory'&&g.creditsEach===null&&g.condition.includes('미확인')));
});
test('planner: isolated entry, deployment allowlist, source exclusion and route configuration',()=>{
  const html=read('curriculum/planner/index.html');
  for(const [,relative]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(/^(https?:|tel:|#)/.test(relative))continue;
    assert.ok(fs.existsSync(path.resolve(root,'curriculum/planner',relative.split('#')[0])),relative);
  }
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  const structured=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(structured['@type'],'WebPage');assert.ok(structured.url.endsWith('/curriculum/planner/'));
  assert.match(html,/2030학년도/);assert.match(html,/2028 대학 권장과목을 현행 요건으로 적용하지 않습니다/);
  const ignore=read('.vercelignore');assert.match(ignore,/curriculum\/\*/);assert.match(ignore,/!curriculum\/planner\/index\.html/);
  assert.ok(ignore.indexOf('curriculum/*')>ignore.indexOf('!curriculum\n'));
  assert.ok(read('sitemap.xml').includes('/curriculum/planner/'));
  assert.ok(read('scripts/integrate-curriculum.cjs').includes('curriculum/planner/'));
  const config=JSON.parse(read('vercel.json'));assert.ok(config.redirects.some(r=>r.source==='/curriculum/planner'&&r.destination==='/curriculum/planner/'));
});
