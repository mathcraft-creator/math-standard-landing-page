// Uses the same optional Playwright module convention as existing browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {createServer} = require('./curriculum-server.cjs');
const root = path.resolve(__dirname,'..');
const output = path.join(root,'output/playwright/curriculum');
fs.mkdirSync(output,{recursive:true});
const manifest = require('../docs/curriculum-source-manifest.json');
const results=[], metrics={}, errors=[];
const routes=['home','subjects','majors','univ','matrix','cross','basics','search'];
(async()=>{
  const server=createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.CURRICULUM_TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  async function check(name,run){
    try{await run();results.push({name,status:'PASS'});console.log('PASS '+name)}
    catch(e){results.push({name,status:'FAIL',reason:e.message});console.error('FAIL '+name+' '+e.message)}
  }
  const goto=async url=>{const response=await page.goto(base+url,{waitUntil:'domcontentloaded'});if(response)assert.equal(response.status(),200);return response;};
  async function measure(url){
    await goto(url);await page.locator('#app h1').waitFor();
    return page.evaluate(()=>{
      const start=performance.now();JSON.parse(document.getElementById('data').textContent);const parse=performance.now()-start;
      const nav=performance.getEntriesByType('navigation')[0];
      return {domContentLoadedMs:nav.domContentLoadedEventEnd,jsonParseMs:parse,transferBytes:nav.transferSize,heapBytes:performance.memory?.usedJSHeapSize||null};
    });
  }
  try{
    if(!process.env.CURRICULUM_TEST_ORIGIN)await check('original and integration performance baseline',async()=>{
      metrics.original=await measure('/'+encodeURIComponent(manifest.original));
      metrics.integrated=await measure('/curriculum');
    });
    await check('slashless, slash, direct detail and refresh',async()=>{
      for(const url of ['/curriculum','/curriculum/','/curriculum/index.html#s-0']){await goto(url);await page.locator('#app h1').waitFor();assert.equal(await page.locator('link[rel=canonical]').count(),1);}
      await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('#app h1').textContent(),'공통국어1');
    });
    const searchSummary=async term=>{
      await page.locator('#q').fill(term);await page.locator('#q').press('Enter');
      await page.waitForFunction(()=>location.hash==='#search');
      return {heading:await page.locator('#app h1').textContent(),summary:await page.locator('#app .lead').textContent()};
    };
    await check('four searches equal original results, including no-result 서울대학교',async()=>{
      metrics.search={};
      for(const term of ['미적분Ⅱ','경영학과','반도체','서울대학교']){
        let baseline;
        if(!process.env.CURRICULUM_TEST_ORIGIN){await goto('/'+encodeURIComponent(manifest.original));baseline=await searchSummary(term);}
        await goto('/curriculum');const start=Date.now();const actual=await searchSummary(term);
        metrics.search[term]={...actual,interactionMs:Date.now()-start};
        if(baseline)assert.deepEqual(actual,baseline);
        assert.ok(actual.heading.includes(term));
      }
    });
    await check('subjects, six detail tabs, majors, series and guide links',async()=>{
      await goto('/curriculum#subjects');await page.locator('#gside button[data-g="수학"]').click();
      await page.locator('#slist .card').first().click();assert.match(page.url(),/#s-\d+$/);
      for(let i=0;i<6;i++){await page.locator(`#dt button[data-i="${i}"]`).click();assert.ok((await page.locator('#dbody').textContent()).trim().length>0);}
      await page.locator('#tabs a[data-v=majors]').click();await page.locator('#ml .card').first().click();
      assert.match(page.url(),/#m-\d+$/);
      for(const route of ['sr-0','dg-0','ys-0']){await goto('/curriculum#'+route);assert.ok((await page.locator('#app h1').textContent()).length>0);}
    });
    await check('university filters and matrix expansion',async()=>{
      await goto('/curriculum#univ');assert.ok(await page.locator('#ures tbody tr').count()>0);
      await page.locator('#uq').fill('서울대');assert.ok(await page.locator('#ures tbody tr').count()>0);
      assert.ok((await page.locator('#ures').textContent()).includes('서울대'));
      await goto('/curriculum#matrix');await page.locator('#app .heat button[data-r]').first().click();
      assert.ok((await page.locator('#mdet').textContent()).length>0);
    });
    await check('cross diagnosis and basket restored exactly like original',async()=>{
      const texts=[];
      for(const url of process.env.CURRICULUM_TEST_ORIGIN?['/curriculum']:['/'+encodeURIComponent(manifest.original),'/curriculum']){
        await goto(url+'#cross');await page.locator('#clr').click();
        await page.locator('#pick').selectOption({label:'경영학과'});
        texts.push(await page.locator('#app').textContent());
      }
      if(texts.length===2)assert.equal(texts[0],texts[1]);
      const saved=await page.evaluate(()=>localStorage.getItem('xbasket'));assert.ok(JSON.parse(saved).length>0);
      await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('#app').textContent(),texts.at(-1));
      const storage=await page.evaluate(()=>localStorage.getItem('xbasket'));assert.equal(storage,saved);
    });
    await check('search and corrupt storage do not execute markup or break routing',async()=>{
      await goto('/curriculum');
      await searchSummary('<img src=x onerror="window.injected=1">');
      assert.equal(await page.locator('#app img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
      for(const value of ['null','{}','invalid','["map","__proto__",-1,99999,0,0,{"x":1}]']){
        await page.evaluate(value=>localStorage.setItem('xbasket',value),value);
        await goto('/curriculum#cross');await page.reload({waitUntil:'domcontentloaded'});assert.ok(await page.locator('#app h1').textContent());
        assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('xbasket'))),value.startsWith('[')?[0]:[]);
      }
      for(const hash of ['__proto__','constructor','s-99999','s-%3Cimg','unrecognized']){await goto('/curriculum#'+hash);assert.ok(await page.locator('#app h1').textContent());}
    });
    await check('five widths, all eight views and original landing pages fit',async()=>{
      metrics.viewSwitchMs=[];
      for(const width of [360,390,768,1280,1920]){
        await page.setViewportSize({width,height:900});await goto('/curriculum');
        for(const route of routes){
          const start=Date.now();await page.evaluate(route=>location.hash=route,route);
          await page.waitForFunction(route=>location.hash==='#'+route,route);
          assert.ok(await page.locator('#app h1').count());
          metrics.viewSwitchMs.push({width,route,ms:Date.now()-start});
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+route);
        }
        for(const url of ['/','/middle/','/elementary/']){
          await goto(url);assert.equal(await page.locator('h1').count(),1);
          const link=page.locator('header nav a[href$="curriculum"]');await link.waitFor({state:'visible'});
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+url);
          const rect=await link.boundingBox();assert.ok(rect.width>0&&rect.height>=40);
        }
        if([390,1280].includes(width)){
          if(width===390){
            await goto('/curriculum#basics');
            metrics.mobile=await page.evaluate(async()=>{
              const q=document.getElementById('q');q.value='반도체';const start=performance.now();q.dispatchEvent(new Event('input',{bubbles:true}));const searchSuggestionsMs=performance.now()-start;
              document.getElementById('drop').classList.remove('on');const frames=[];let last=performance.now();
              for(let i=0;i<15;i++){window.scrollBy(0,80);await new Promise(requestAnimationFrame);const now=performance.now();frames.push(now-last);last=now;}
              return {searchSuggestionsMs,scrollFrameMaxMs:Math.max(...frames),scrollFrameMeanMs:frames.reduce((a,b)=>a+b,0)/frames.length};
            });
          }
          await goto('/curriculum');await page.screenshot({path:path.join(output,'curriculum-'+width+'.png'),fullPage:true});
          await goto('/');await page.screenshot({path:path.join(output,'home-'+width+'.png'),fullPage:true});
        }
      }
    });
    await check('mobile menu, entry CTA, consultation and native back',async()=>{
      await page.setViewportSize({width:390,height:844});await goto('/');
      const requests=[];page.on('request',request=>requests.push(request.url()));
      await page.locator('.explorer-cta').click();assert.ok(page.url().endsWith('/curriculum'));
      await page.locator('#tabs a[data-v=subjects]').click();await page.goBack();assert.ok(!page.url().includes('#subjects'));
      await page.locator('[data-academy-link="middle/#contact"]').click();assert.ok(page.url().endsWith('/middle/#contact'));
      assert.ok(await page.locator('#contact a[href="http://pf.kakao.com/_yWFTn/chat"]').isVisible());
      await page.goBack();assert.ok(page.url().includes('/curriculum'));
      await page.locator('[data-academy-link="index.html"]').click();assert.ok(page.url().endsWith('/index.html'));
      requests.length=0;await page.reload({waitUntil:'domcontentloaded'});
      assert.ok(requests.every(url=>!/^\/curriculum(?:\/|$)/.test(new URL(url).pathname)),'home must not preload explorer');
    });
    if(!process.env.CURRICULUM_TEST_ORIGIN)await check('relative links under project prefix and local file',async()=>{
      for(const route of ['/landing/curriculum','/landing/curriculum/']){
        await goto(route);await page.locator('[data-academy-link="middle/#contact"]').click();assert.match(page.url(),/\/landing\/middle\/(index\.html)?#contact$/);
      }
      await page.goto('file:///'+path.join(root,'curriculum/index.html').replaceAll('\\','/'));
      assert.ok(await page.locator('#app h1').count());await page.locator('[data-academy-link="middle/#contact"]').click();assert.ok(page.url().endsWith('/middle/index.html#contact')||page.url().endsWith('/middle/#contact'));
      for(const file of ['index.html','middle/index.html','elementary/index.html']){
        await page.goto('file:///'+path.join(root,file).replaceAll('\\','/'));
        await page.locator('header nav a[href$="curriculum/index.html"]').click();
        assert.ok(page.url().endsWith('/curriculum/index.html'));assert.ok(await page.locator('#app h1').count());
      }
    });
    await check('dark mode, keyboard navigation, FAQ and consultation copy',async()=>{
      await goto('/curriculum');await page.emulateMedia({colorScheme:'dark'});
      assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(14, 14, 14)');
      await page.locator('#q').focus();await page.keyboard.type('미적분');await page.keyboard.press('Enter');assert.ok(page.url().endsWith('#search'));
      await goto('/curriculum#s-0');await page.evaluate(()=>{window.copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.copied=t}}})});
      await page.locator('#cpy').click();assert.ok((await page.evaluate(()=>window.copied)).includes('공통국어1'));
      await goto('/middle/');const faq=page.locator('details').first();await faq.locator('summary').click();assert.ok(await faq.evaluate(e=>e.open));
      assert.equal(await page.locator('form').count(),0,'current landing has no submission form');
      await page.emulateMedia({colorScheme:'light'});
    });
    await check('no uncaught JavaScript errors',async()=>assert.deepEqual(errors,[]));
  }finally{
    await browser.close();await new Promise(resolve=>server.close(resolve));
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({base,results,metrics,errors},null,2));
  }
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
