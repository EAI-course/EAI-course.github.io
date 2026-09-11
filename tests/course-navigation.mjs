const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.TEST_BASE_URL || 'http://127.0.0.1:4173')+'/');
  const nav=page.getByRole('navigation');
  assert.deepEqual(await nav.getByRole('link').allTextContents(),['课程内容','课程安排','课程项目','Microduck Lab','学习资源']);
  await page.getByRole('button',{name:'Switch to English',exact:true}).click();
  const links=await nav.getByRole('link').allTextContents();assert.equal(links[3],'Microduck Lab');assert.equal(links.length,5);
  await page.screenshot({path:'/private/tmp/microduck-course-nav-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  await nav.getByRole('link',{name:'Microduck Lab',exact:true}).click();
  await page.waitForURL('**/microduck/?lang=en');
  await page.getByRole('button',{name:'Fit robot',exact:true}).waitFor();
  await page.waitForFunction(()=>!document.querySelector('.duck-loading'));
  assert.equal(await page.locator('canvas').count(),1);
  await page.getByRole('tab',{name:'Joint motion',exact:true}).click();
  await page.getByRole('slider',{name:/left hip yaw/}).press('End');
  assert.ok(Number(await page.getByRole('slider',{name:/left hip yaw/}).getAttribute('aria-valuenow'))>29.9);
  await page.getByRole('link',{name:'← Embodied AI course',exact:true}).click();
  await page.getByRole('navigation').waitFor();
  await page.screenshot({path:'/private/tmp/microduck-course-nav-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: static build loads, course navigation order in both languages, mobile link access, direct lab entry, model loading, joint control, and return to course.');
}finally{await browser.close();}
