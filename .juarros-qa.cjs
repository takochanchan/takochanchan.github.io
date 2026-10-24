const fs=require('fs');
const {chromium}=require('/tmp/juarros-qa/node_modules/playwright');
(async()=>{
  fs.mkdirSync('juarros-qa',{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  const observations=[];
  for(const width of [1000,390]){
    const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:8765/OEBPS/cover.xhtml');
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`juarros-qa/${width}-cover.png`});
    await page.goto('http://127.0.0.1:8765/OEBPS/content.xhtml');
    await page.evaluate(()=>document.fonts.ready);
    const data=await page.evaluate(()=>{
      const tables=[...document.querySelectorAll('table')];
      const refs=[...document.querySelectorAll('a[id^="ref-"]')];
      const broken=refs.filter(x=>!document.getElementById(x.hash.slice(1)));
      const missingImages=[...document.images].filter(x=>!x.complete||!x.naturalWidth);
      return {tables:tables.length,notes:document.querySelectorAll('aside').length,refs:refs.length,broken:broken.length,missingImages:missingImages.length,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,images:[...document.querySelectorAll('figure')].map(x=>x.id),wideTable:tables.find(t=>[...t.rows[0].cells].reduce((n,c)=>n+c.colSpan,0)>=10)?.id,mergedTables:tables.filter(t=>t.querySelector('[rowspan="2"],[colspan="2"]')).slice(0,2).map(x=>x.id),lastTable:tables.at(-1).id,quotes:[...document.querySelectorAll('blockquote p')].map(x=>x.id)};
    });
    if(data.tables!==67||data.notes!==100||data.refs!==100||data.broken||data.missingImages)throw Error(JSON.stringify(data));
    await page.screenshot({path:`juarros-qa/${width}-frontmatter.png`});
    const selectors=[...data.images.map(x=>'#'+x),'#'+data.wideTable,...data.mergedTables.map(x=>'#'+x),'#'+data.lastTable,...data.quotes.map(x=>'#'+x),'#note-t2-19','#note-t3-7'];
    let index=0;
    for(const selector of [...new Set(selectors)]){
      const element=page.locator(selector);
      if(await element.count()!==1)throw Error('Missing '+selector);
      await element.evaluate(e=>e.scrollIntoView({block:'start'}));
      await page.screenshot({path:`juarros-qa/${width}-${String(index++).padStart(2,'0')}.png`});
      observations.push({width,selector,screenshot:`${width}-${String(index-1).padStart(2,'0')}.png`,box:await element.boundingBox()});
    }
    for(const key of ['prelim-1','t2-19','t3-7']){
      const ref=page.locator('#ref-'+key);
      await ref.evaluate(e=>e.scrollIntoView({block:'center'}));
      await ref.click();
      if(!page.url().endsWith('#note-'+key))throw Error('Note navigation failed '+key);
      await page.locator('#note-'+key+' a').first().click();
      if(!page.url().endsWith('#ref-'+key))throw Error('Note return failed '+key);
    }
    await page.goto('http://127.0.0.1:8765/OEBPS/nav.xhtml');
    await page.locator('nav a').first().click();
    if(!page.url().includes('content.xhtml#'))throw Error('TOC failed');
    observations.push({width,data,pageErrors:errors,noteNavigation:'passed',tocNavigation:'passed'});
    await page.close();
  }
  await browser.close();
  fs.writeFileSync('juarros-qa/results.json',JSON.stringify(observations,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
