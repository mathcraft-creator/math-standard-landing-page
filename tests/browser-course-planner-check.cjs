const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {createServer}=require('./curriculum-server.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'output/playwright/course-planner');
fs.mkdirSync(output,{recursive:true});
const results=[],errors=[],metrics=[];
(async()=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.PLANNER_TEST_ORIGIN||`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const requests=[];page.on('request',r=>requests.push(r.url()));
  const check=async(name,run)=>{try{await run();results.push({name,status:'PASS'});console.log('PASS '+name)}catch(e){results.push({name,status:'FAIL',reason:e.message});console.error('FAIL '+name+': '+e.message)}};
  async function open(prefix=''){
    await page.goto(base+prefix+'/curriculum/planner/',{waitUntil:'domcontentloaded'});
    await page.locator('#school:not([disabled])').waitFor();await page.locator('#schoolTitle').waitFor();
  }
  async function selectSchool(id){await page.locator('#school').selectOption(id);await page.waitForFunction(id=>document.getElementById('schoolTitle')?.textContent.startsWith(({jinjeop:'진접고',onam:'오남고',jingeon:'진건고',kwangdong:'광동고'})[id]),id);}
  async function goal(query,id){await page.locator('#goalQuery').fill(query);await page.locator(`[data-goal="${id}"]`).click();}
  async function generate(){const started=Date.now();await page.locator('#generate').click();await page.locator('#resultSection:not([hidden])').waitFor({timeout:20000});metrics.push({width:await page.evaluate(()=>innerWidth),ms:Date.now()-started});}
  try{
    await check('direct URL, slash redirect, metadata and project-prefix resources',async()=>{
      const redirect=await context.request.get(base+'/curriculum/planner',{maxRedirects:0});assert.equal(redirect.status(),308);
      await open();assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://math-standard.co.kr/curriculum/planner/');
      await open('/landing');await goal('경영학과','major-12');await generate();assert.equal(await page.locator('.term-card').count(),6);
      await open();
    });
    await check('all three schools generate six semesters with exact term credits',async()=>{
      for(const id of ['jinjeop','onam','jingeon']){
        await selectSchool(id);await goal('경영학과','major-12');await generate();
        const credits=await page.locator('.term-header span').allTextContents();
        assert.deepEqual(credits,id==='jinjeop'?['30학점','29학점','30학점','29학점','30학점','29학점']:Array(6).fill('29학점'));
        assert.equal(await page.locator('#alternatives button').count(),3);
      }
    });
    await check('career matching requires explicit choice and malicious input remains text',async()=>{
      await page.locator('#goalQuery').fill('<img src=x onerror="window.injected=1">');
      assert.equal(await page.locator('#goalOptions img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
      await page.locator('#generate').click();assert.ok((await page.locator('#message').textContent()).includes('희망학과 후보'));
      await goal('반도체','major-49');await generate();assert.ok((await page.locator('#resultSummary').textContent()).includes('전자공학과'));
    });
    await check('fixed and excluded subjects recalculate, alternatives and source details work',async()=>{
      await selectSchool('jinjeop');await goal('컴퓨터공학과','major-54');await generate();
      await page.locator('#alternatives button').nth(1).click();assert.equal(await page.locator('#alternatives button').nth(1).getAttribute('aria-pressed'),'true');
      const detail=page.locator('#planTerms .source').first();await detail.locator('summary').click();assert.ok((await detail.textContent()).includes('2027입학생_3개년'));
      const group=page.locator('#catalog-jinjeop-g4');await group.evaluate(el=>el.closest('details').open=true);
      const lock=group.locator('[data-option=lock]').last();await lock.check();
      await page.locator('#resultSection:not([hidden])').waitFor({timeout:20000});
      assert.ok((await page.locator('#planTerms').textContent()).includes('영미 문학 읽기'));
      const exclusion=group.locator('[data-option=exclude]').first();await exclusion.check();await page.locator('#resultSection:not([hidden])').waitFor({timeout:20000});
      assert.equal(await page.locator('#planTerms .plan-course b').filter({hasText:'주제 탐구 독서'}).count(),0);
    });
    await check('overfull selection yields an error and never leaves a stale printable plan',async()=>{
      const group=page.locator('#catalog-jinjeop-g4');await group.evaluate(el=>el.closest('details').open=true);
      await group.locator('[data-option=lock]').nth(1).check();
      await page.waitForFunction(()=>document.getElementById('message').classList.contains('error'));
      assert.ok(await page.locator('#resultSection').evaluate(el=>el.hidden));
      await page.emulateMedia({media:'print'});assert.equal(await page.locator('#resultSection').isVisible(),false);await page.emulateMedia({media:'screen'});
      await page.locator('#resetPlan').click();await generate();
    });
    await check('rapid consecutive edits recompute the final input instead of canceling the update',async()=>{
      const group=page.locator('#catalog-jinjeop-g5');await group.evaluate(el=>el.closest('details').open=true);
      await group.locator('[data-option=exclude]').nth(0).check();await group.locator('[data-option=exclude]').nth(1).check();
      await page.locator('#resultSection:not([hidden])').waitFor({timeout:20000});
      assert.ok((await page.locator('#message').textContent()).includes('추천안을 만들었습니다'));
    });
    await check('save, reload, restore and outdated or corrupt storage protection',async()=>{
      await page.locator('#savePlan').click();assert.ok((await page.locator('#message').textContent()).includes('저장했습니다'));
      await page.reload({waitUntil:'domcontentloaded'});await page.locator('#schoolTitle').waitFor();await page.locator('#restorePlan').click();await page.locator('#resultSection:not([hidden])').waitFor();
      assert.ok((await page.locator('#resultSummary').textContent()).includes('컴퓨터공학과'));
      await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('som-course-planner-v1'));s.version='old';localStorage.setItem('som-course-planner-v1',JSON.stringify(s))});
      await page.locator('#restorePlan').click();await page.waitForFunction(()=>document.getElementById('message').textContent.includes('자료가 갱신'));
      await page.evaluate(()=>localStorage.setItem('som-course-planner-v1','{broken'));
      await page.locator('#restorePlan').click();assert.ok((await page.locator('#message').textContent()).includes('읽지 못했습니다'));
    });
    await check('past unknown choices stay incomplete and Gwangdong projection is enabled',async()=>{
      await page.locator('#exploreGoal').click();await page.locator('#startTerm').selectOption('4');await generate();
      assert.ok((await page.locator('#resultSummary').textContent()).includes('이전 이수 기록'));
      assert.ok((await page.locator('#planTerms').textContent()).includes('이전 이수 기록 미입력'));
      await selectSchool('kwangdong');assert.equal(await page.locator('#generate').isDisabled(),false);
      assert.ok((await page.locator('#schoolOverview').textContent()).includes('추정 추천'));
      assert.ok(await page.locator('#resultSection').evaluate(el=>el.hidden));
    });
    await check('Kwangdong capture catalog keeps all 60 rows and NEIS verification with goal highlights',async()=>{
      await selectSchool('kwangdong');
      assert.ok(await page.locator('#captureSection').isVisible());assert.equal(await page.locator('.capture-card').count(),4);
      assert.equal(await page.locator('.capture-chip').count(),60);
      assert.deepEqual(await page.locator('.capture-card .term-header span').allTextContents(),['12개 표시','11개 표시','19개 표시','18개 표시']);
      assert.ok((await page.locator('#captureSection').textContent()).includes('입시캐스트'));
      assert.ok((await page.locator('#captureSection').textContent()).includes('적용 학년도와 입학연도'));
      await goal('컴퓨터공학과','major-54');assert.ok(await page.locator('.capture-chip.is-related').count()>0);
      await page.locator('#goalQuery').fill('다른 목표 입력');assert.equal(await page.locator('.capture-chip.is-related').count(),0);
      assert.ok((await page.locator('#captureSection').textContent()).includes('60과목 모두 2026'));
      for(const width of [360,390,768,1280]){
        await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        if([390,1280].includes(width)){
          await page.locator('#captureSection').evaluate(el=>el.scrollIntoView({block:'start'}));
          await page.screenshot({path:path.join(output,`kwangdong-capture-${width}.png`)});
        }
      }
    });
    await check('Kwangdong six-term projection supports edits, save restore, copy and print with uncertainty labels',async()=>{
      await page.locator('#startTerm').selectOption('0');await goal('컴퓨터공학과','major-54');await generate();
      assert.equal(await page.locator('#planTerms .term-card').count(),6);
      assert.deepEqual(await page.locator('#planTerms .term-header span').allTextContents(),Array(6).fill('학점 미확인'));
      assert.ok((await page.locator('#resultSummary').textContent()).includes('추정 추천'));
      assert.ok((await page.locator('#planWarnings').textContent()).includes('2015 교육과정'));
      assert.ok(!(await page.locator('#planTerms').textContent()).includes('null'));
      const group=page.locator('#catalog .group-box').filter({has:page.locator('h3',{hasText:'과학 추천 구성'})}).last();
      await group.evaluate(el=>el.closest('details').open=true);
      const lock=group.locator('[data-option=lock]').last();const id=await lock.getAttribute('data-course');await lock.check();
      await page.locator('#resultSection:not([hidden])').waitFor();
      assert.ok(await page.locator(`[data-course="${id}"][data-option=lock]`).isChecked());
      await page.locator('#savePlan').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#schoolTitle').waitFor();
      await page.locator('#restorePlan').click();await page.locator('#resultSection:not([hidden])').waitFor();
      assert.ok((await page.locator('#resultSummary').textContent()).includes('광동고'));
      await page.evaluate(()=>{window.copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.copied=t}}})});
      await page.locator('#copyPlan').click();const text=await page.evaluate(()=>window.copied);
      assert.ok(text.includes('2026-11-23')&&text.includes('학점 미확인')&&text.includes('2015 교육과정')&&text.includes('학교의 택N 조건이 아닙니다'));
      for(const width of [360,390,768,1280]){
        await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        if([390,1280].includes(width)){await page.locator('#resultSection').evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(output,`kwangdong-projected-${width}.png`)});}
      }
      await page.emulateMedia({media:'print'});assert.ok((await page.locator('#planWarnings').textContent()).includes('2015 교육과정'));
      assert.equal(await page.locator('#captureSection').isVisible(),false);
      await page.pdf({path:path.join(output,'kwangdong-projected-print.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});
    });
    await check('five widths, mobile controls, screenshots and print output',async()=>{
      await selectSchool('onam');await page.locator('#startTerm').selectOption('0');await goal('간호학과','major-78');await generate();
      for(const width of [360,390,768,1280,1920]){
        await page.setViewportSize({width,height:900});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),String(width));
        assert.ok(await page.locator('#generate').isVisible());
        if([390,1280].includes(width)){
          await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`planner-${width}.png`)});
          await page.locator('#resultSection').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`planner-result-${width}.png`)});
        }
      }
      await page.emulateMedia({media:'print'});assert.equal(await page.locator('.term-card').count(),6);
      assert.equal(await page.locator('.input-panel').isVisible(),false);await page.pdf({path:path.join(output,'planner-print.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});
    });
    await check('copy success, copy denial fallback, storage denial and keyboard actions',async()=>{
      await page.evaluate(()=>{window.copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.copied=t}}})});
      await page.locator('#copyPlan').click();assert.ok((await page.evaluate(()=>window.copied)).includes('간호학과'));
      await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
      await page.locator('#copyPlan').click();assert.ok(await page.locator('#manualCopy').isVisible());assert.ok((await page.locator('#copyText').inputValue()).includes('오남고'));
      await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('denied')}});await page.locator('#savePlan').click();assert.ok((await page.locator('#message').textContent()).includes('저장을 사용할 수 없습니다'));
      await page.locator('#goalQuery').focus();await page.keyboard.press('Control+A');await page.keyboard.type('unknown career');assert.equal(await page.locator('#goalOptions button').count(),0);
      await page.locator('#exploreGoal').focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#chosenGoal').textContent()).includes('전공 미정'));
    });
    await check('existing navigation, native back and no workbook or heavy explorer preload',async()=>{
      requests.length=0;await open();assert.ok(!requests.some(url=>/\.xlsx(?:\?|$)/.test(url)));
      assert.ok(!requests.some(url=>new URL(url).pathname==='/curriculum/index.html'));
      await page.locator('nav a').first().click();assert.ok(page.url().endsWith('/curriculum/index.html'));
      await page.goBack();await page.locator('#schoolTitle').waitFor();
      await page.locator('nav a').last().click();assert.ok(page.url().endsWith('/middle/index.html#contact'));
      await page.goBack();await page.locator('#schoolTitle').waitFor();
    });
    await check('failed school fetch cannot reuse the previous school recommendation',async()=>{
      await context.route('**/data/curriculum/schools/onam/2027.json',route=>route.abort());
      await page.locator('#school').selectOption('onam');
      await page.waitForFunction(()=>document.getElementById('message').classList.contains('error'));
      await page.locator('#exploreGoal').click();assert.ok(await page.locator('#generate').isDisabled());
      assert.ok((await page.locator('#schoolOverview').textContent()).includes('불러오지 못했습니다'));
      await context.unroute('**/data/curriculum/schools/onam/2027.json');
      await context.route('**/data/curriculum/schools/onam/2027.json',async route=>{await new Promise(r=>setTimeout(r,150));await route.abort()});
      await page.locator('#school').selectOption('onam');await selectSchool('jingeon');
      await page.waitForTimeout(220);assert.equal(await page.locator('#message').evaluate(el=>el.classList.contains('error')),false);
      assert.ok((await page.locator('#schoolTitle').textContent()).startsWith('진건고'));
      await context.unroute('**/data/curriculum/schools/onam/2027.json');
    });
    await check('no uncaught JavaScript errors',async()=>assert.deepEqual(errors,[]));
  }finally{
    await browser.close();await new Promise(r=>server.close(r));
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({base,results,metrics,errors},null,2));
  }
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
