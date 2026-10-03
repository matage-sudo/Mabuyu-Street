import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = process.argv[2] || 'https://mabuyu-street.vercel.app';
const sizes = [[320, 568], [375, 667], [414, 896], [768, 1024], [1024, 768], [1280, 800], [1920, 1080]];
mkdirSync('shots', { recursive: true });

const browser = await chromium.launch();
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const offenders = new Set();
    document.querySelectorAll('body *').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && (b.right > vw + 1 || b.left < -1)) {
        const cls = typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).join('.') : '';
        offenders.add(el.tagName.toLowerCase() + cls);
      }
    });
    const tiny = [...document.querySelectorAll('a,button,input,select,textarea')]
      .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.width < 40 || b.height < 40); }).length;
    return { vw, scrollW, offenders: [...offenders].slice(0, 8), tiny };
  });
  const overflow = r.scrollW > r.vw;
  console.log(`${w}x${h}  ${overflow ? 'FAIL horizontal scroll' : 'OK'}  (page ${r.scrollW}px vs screen ${r.vw}px, small tap targets: ${r.tiny})`);
  if (r.offenders.length) console.log('   wider than screen:', r.offenders.join(' | '));
  await page.screenshot({ path: `shots/${w}x${h}.png`, fullPage: true });
  await page.close();
}
await browser.close();