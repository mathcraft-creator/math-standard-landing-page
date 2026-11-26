const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../assets/course-planner-engine.js');
const catalog=require('../data/curriculum/subjects.json'),rules=require('../data/curriculum/rules.json');
const mappings=require('../data/curriculum/career-mappings.json');
const schools=['jinjeop','onam','jingeon'].map(id=>require(`../data/curriculum/schools/${id}/2027.json`));
const args=(school,goal='경영학과',extra={})=>({goalId:catalog.majors.find(m=>m.name===goal).id,locks:{},excludes:[],...extra});

test('planner: five distinct career scenarios produce only valid six-semester plans at all three schools',()=>{
  for(const school of schools)for(const goal of ['경영학과','컴퓨터공학과','전자공학과','간호학과','국어국문학과']){
    const input=args(school,goal),result=E.recommend(school,catalog,rules,input,{maxMs:5000});
    assert.equal(result.status,'ok',school.name+' '+goal);assert.ok(result.plans.length>0&&result.plans.length<=3);
    for(const plan of result.plans){
      const rows=plan.selectedIds.map(id=>school.offerings.find(o=>o.id===id));
      assert.equal(new Set(rows.map(o=>o.key)).size,rows.length,'no duplicate course across terms');
      for(const g of school.groups)assert.equal(rows.filter(o=>g.offerings.includes(o.id)).length,g.choose);
      assert.deepEqual(Array.from({length:6},(_,t)=>rows.filter(o=>o.term===t).reduce((n,o)=>n+o.credits,0)),school.expectedTermCredits);
      for(const required of school.offerings.filter(o=>o.kind==='required'))assert.ok(plan.selectedIds.includes(required.id));
      assert.deepEqual(E.validatePlan(school,plan.selectedIds,result.input).errors,[]);
    }
  }
});
test('planner: fixed and excluded choices alter the plan; impossible choice counts never get silently repaired',()=>{
  const s=schools[0],g=s.groups.find(g=>g.term===2&&g.choose===1),locked=g.offerings.at(-1),excluded=g.offerings[0];
  const input=args(s,'경영학과',{locks:{[g.id]:[locked]},excludes:[excluded]});
  const r=E.recommend(s,catalog,rules,input);assert.equal(r.status,'ok');
  for(const p of r.plans){assert.ok(p.selectedIds.includes(locked));assert.ok(!p.selectedIds.includes(excluded));}
  const over=E.recommend(s,catalog,rules,args(s,'경영학과',{locks:{[g.id]:g.offerings.slice(0,2)}}));
  assert.equal(over.status,'invalid');assert.equal(over.plans.length,0);
  const empty=E.recommend(s,catalog,rules,args(s,'경영학과',{excludes:g.offerings}));assert.equal(empty.status,'invalid');
  const required=s.offerings.find(o=>o.kind==='required');
  assert.equal(E.recommend(s,catalog,rules,args(s,'경영학과',{excludes:[required.id]})).status,'invalid');
});
test('planner: annual cross offerings complement each other and conflicting fixed assignments are rejected',()=>{
  const s=schools[0],a=s.groups.find(g=>g.kind==='cross'),b=s.groups.find(g=>g.id!==a.id&&g.annualPair===a.annualPair);
  const key=s.offerings.find(o=>o.id===a.offerings[0]).key,other=b.offerings.find(id=>s.offerings.find(o=>o.id===id).key===key);
  const result=E.recommend(s,catalog,rules,args(s,'경영학과',{locks:{[a.id]:[a.offerings[0]],[b.id]:[other]}}));
  assert.equal(result.plans.length,0);assert.equal(result.status,'no-plan');
});
test('planner: missing school and earlier unknown electives cannot become invented full plans',()=>{
  const missing={...schools[0],status:'missing',offerings:[],groups:[]};
  assert.equal(E.recommend(missing,catalog,rules,args(schools[0])).status,'missing');
  const s=schools[0],r=E.recommend(s,catalog,rules,args(s,'컴퓨터공학과',{startTerm:4}));
  assert.equal(r.status,'ok');assert.ok(r.plans[0].incomplete);
  assert.ok(!r.plans[0].selectedIds.some(id=>s.offerings.find(o=>o.id===id).term<4&&s.offerings.find(o=>o.id===id).kind!=='required'));
  assert.ok(r.plans[0].warnings.some(w=>w.includes('이전 학기 이수 기록')));
});

test('planner: Gwangdong yields six provisional terms for every goal without invented credit validation',()=>{
  const s=require('../data/curriculum/schools/kwangdong/2027.json');
  const signatures=new Set();
  for(const goal of [...catalog.majors,{id:'explore'}]){
    const result=E.recommend(s,catalog,rules,{goalId:goal.id},{maxMs:5000});
    assert.equal(result.status,'ok',goal.name);
    const plan=result.plans[0];signatures.add(plan.selectedIds.join('|'));
    assert.deepEqual(plan.credits,Array(6).fill(null));
    assert.deepEqual(E.validatePlan(s,plan.selectedIds,result.input).errors,[]);
    for(let t=0;t<6;t++)assert.ok(plan.selectedIds.some(id=>s.offerings.find(o=>o.id===id).term===t));
    assert.ok(plan.warnings.some(w=>w.includes('2015 교육과정')));
    assert.ok(plan.warnings.some(w=>w.includes('학교의 택N 조건이 아닙니다')));
    assert.ok(Object.values(plan.reasons).every(reason=>reason.includes('추정 배치')));
  }
  assert.ok(signatures.size>10,'different goals influence recommendations');
  const g=s.groups.find(g=>g.term===4&&g.name.startsWith('과학'));
  const input={goalId:'explore',locks:{[g.id]:[g.offerings[0]]},excludes:[g.offerings[1]]};
  const result=E.recommend(s,catalog,rules,input);
  assert.equal(result.status,'ok');assert.ok(result.plans[0].selectedIds.includes(g.offerings[0]));
  assert.ok(!result.plans[0].selectedIds.includes(g.offerings[1]));
  assert.equal(E.recommend(s,catalog,rules,{goalId:'explore',excludes:g.offerings}).status,'invalid');
  const past=E.recommend(s,catalog,rules,{goalId:'explore',startTerm:4});
  assert.ok(past.plans[0].incomplete);assert.ok(past.plans[0].selectedIds.every(id=>s.offerings.find(o=>o.id===id).term>=4));
});
test('planner: deterministic output, unknown queries, explicit career candidates, safe storage validation',()=>{
  const s=schools[1],input=args(s);
  assert.deepEqual(E.recommend(s,catalog,rules,input).plans.map(p=>p.selectedIds),E.recommend(s,catalog,rules,input).plans.map(p=>p.selectedIds));
  assert.ok(E.findGoals('개발자',catalog,mappings).some(m=>m.name==='컴퓨터공학과'));
  assert.ok(E.findGoals('반도체',catalog,mappings).some(m=>m.name==='전자공학과'));
  assert.equal(E.findGoals('<img src=x onerror=alert(1)>',catalog,mappings).length,0);
  assert.equal(E.recommend(s,catalog,rules,{goalId:'__proto__'}).status,'invalid');
  assert.ok(E.normalizeInput(s,{locks:JSON.parse('{"__proto__":["x"]}')}).errors.length);
  assert.ok(E.validateSaved({schemaVersion:1,schoolId:s.id,entryYear:2027,version:'old',input},s,catalog).errors.length);
  assert.equal(E.validateSaved({schemaVersion:1,schoolId:s.id,entryYear:2027,version:s.version,input},s,catalog).errors.length,0);
  assert.ok(E.validateSaved({schemaVersion:1,schoolId:s.id,entryYear:2025,version:s.version,input},s,catalog).errors.length);
});
test('planner: balance changes exploratory choices and time limits never return an unfinished plan',()=>{
  const s=schools[1];
  const a=E.recommend(s,catalog,rules,{goalId:'explore',mode:'major'});
  const b=E.recommend(s,catalog,rules,{goalId:'explore',mode:'balanced'});
  assert.equal(a.status,'ok');assert.equal(b.status,'ok');
  assert.notDeepEqual(a.plans[0].selectedIds,b.plans[0].selectedIds);
  const limited=E.recommend(s,catalog,rules,{goalId:'explore'},{maxMs:-1});
  assert.equal(limited.status,'limited');assert.deepEqual(limited.plans,[]);
});
