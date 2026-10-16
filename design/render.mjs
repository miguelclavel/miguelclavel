// Screenshots every [data-shot] block of profile.html in light and dark,
// transparent background, 2x, as WebP, into ../assets/profile.
// Usage, from this folder: npm i --no-save puppeteer && node render.mjs
import puppeteer from 'puppeteer';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || here + '/../assets/profile';
const b = await puppeteer.launch({ headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 2 });
for (const theme of ['light', 'dark']) {
  await p.goto(pathToFileURL(here + '/profile.html').href + '?theme=' + theme, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  const fam = await p.evaluate(() => document.fonts.check('700 40px Inter'));
  for (const el of await p.$$('[data-shot]')) {
    const id = await el.evaluate(e => e.dataset.shot);
    await el.screenshot({ path: `${out}/${id}-${theme}.webp`, type: 'webp', quality: 88, omitBackground: true });
  }
  console.log(theme, 'inter loaded:', fam);
}
await b.close();
