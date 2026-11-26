// Public production smoke check; never sends consultation messages.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const origin=process.env.PRODUCTION_TEST_ORIGIN||'https://math-standard.co.kr';
const output=path.resolve(__dirname,'../output/deployment-20261125');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    for(const route of ['/','/middle/','/elementary/','/curriculum/']){
      const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
      assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);
      results.push({route,status:'PASS'});
    }
    await page.goto(origin+'/curriculum/planner/',{waitUntil:'domcontentloaded'});
    await page.locator('#school:not([disabled])').waitFor();
    for(const school of ['jinjeop','onam','jingeon','kwangdong']){
      await page.locator('#school').selectOption(school);
      await page.waitForFunction(id=>document.querySelector('#schoolTitle')?.textContent.startsWith(({jinjeop:'진접고',onam:'오남고',jingeon:'진건고',kwangdong:'광동고'})[id]),school);
      await page.locator('#goalQuery').fill('컴퓨터공학과');await page.locator('[data-goal="major-54"]').click();
      await page.locator('#generate').click();await page.locator('#resultSection:not([hidden])').waitFor();
      assert.equal(await page.locator('#planTerms .term-card').count(),6);
      results.push({school,semesters:6,status:'PASS'});
    }
    assert.ok((await page.locator('#resultSummary').textContent()).includes('추정 추천'));
    assert.ok((await page.locator('#planWarnings').textContent()).includes('2015 교육과정'));
    assert.deepEqual(await page.locator('#planTerms .term-header span').allTextContents(),Array(6).fill('학점 미확인'));
    for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.locator('#resultSection').evaluate(el=>el.scrollIntoView({block:'start'}));
      await page.screenshot({path:path.join(output,`production-planner-${width}.png`)});
    }
    assert.deepEqual(errors,[]);console.log('PASS public production: 4 page entries, 4 schools × 6 terms, projection notices, mobile layout, no JS errors');
  }finally{
    fs.writeFileSync(path.join(output,'browser-production.json'),JSON.stringify({origin,results,errors},null,2));
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
