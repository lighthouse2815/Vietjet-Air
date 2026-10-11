import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../docs/reference/', import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { timestamp: new Date().toISOString(), url: 'https://www.vietjetair.com/vi', viewports: [] };
for (const [name, width, height] of [['desktop',1920,1080],['laptop',1440,900],['tablet',768,1024],['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height }, locale: 'vi-VN' });
  const entry = { name, width, height, errors: [] };
  page.on('pageerror', error => entry.errors.push(error.message));
  try {
    await page.goto(report.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.screenshot({path:`${output}${name}-initial.png`});
    for (const label of ['Từ chối tất cả', 'Để sau']) {
      await page.getByText(label, {exact:true}).filter({visible:true}).first().click({timeout:3000}).catch(()=>{});
    }
    for (const frame of page.frames().slice(1)) { await frame.getByText('Để sau', {exact:true}).click({timeout:700}).catch(()=>{}); }
    await page.waitForTimeout(1000);
    for (let y=0; y<10000; y+=650) {
      await page.evaluate(y=>window.scrollTo(0,y),y);
      await page.waitForTimeout(350);
      if (y > await page.evaluate(()=>document.body.scrollHeight)) break;
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${output}${name}-full.png`, fullPage: true });
    await page.screenshot({ path: `${output}${name}-top.png` });
    entry.url = page.url();
    entry.text = await page.locator('body').innerText();
    entry.elements = await page.locator('header, nav, h1, h2, h3, button, input, footer, img').evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      return { tag: el.tagName, text: el.innerText?.slice(0,150), src: el.getAttribute('src'), placeholder: el.getAttribute('placeholder'), rect: {x:r.x,y:r.y,width:r.width,height:r.height}, font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,background:s.backgroundColor,radius:s.borderRadius,transition:s.transition };
    }));
    entry.links = await page.locator('a').evaluateAll(a => a.map(e => ({text:e.innerText,href:e.href})));
    if (name === 'laptop') {
      await writeFile(`${output}reference-dom.html`, await page.content());
      for (const [key, text] of [['departure','Điểm khởi hành'],['date','Ngày đi'],['passengers','Hành khách'],['my-booking','CHUYẾN BAY CỦA TÔI']]) {
        try {
          if (key === 'departure') await page.locator('input[type=text]').filter({visible:true}).first().click({timeout:5000});
          else await page.getByText(text, {exact:true}).filter({visible:true}).first().click({timeout:5000});
          await page.waitForTimeout(700);
          await page.screenshot({path:`${output}interaction-${key}.png`});
          entry[key] = await page.locator('body').innerText();
          await page.keyboard.press('Escape');
        } catch (e) { entry[key] = {error:e.message}; }
      }
    }
  } catch (error) { entry.failure = error.message; await page.screenshot({path:`${output}${name}-failure.png`}).catch(()=>{}); }
  report.viewports.push(entry);
  await writeFile(`${output}audit.json`, JSON.stringify(report,null,2));
  console.log(name, entry.failure || `${entry.url} / ${entry.text?.length} characters`);
  await page.close();
}
await browser.close();
