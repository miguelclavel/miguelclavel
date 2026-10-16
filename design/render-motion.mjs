// Writes the animated blocks (every [data-motion] element of profile.html) as SVG files,
// light and dark, into ../assets/profile. Each SVG holds the block's HTML and CSS in a
// foreignObject, in the system font (SF Pro on Apple devices), and animates with CSS only.
// Heights are measured in the system font and in a wider fallback, and the larger is used,
// so text that wraps differently on other systems still fits.
// Usage, from this folder: npm i --no-save puppeteer && node render-motion.mjs
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || here + '/../assets/profile';
const b = await puppeteer.launch({ headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 1 });
for (const theme of ['light', 'dark']) {
  await p.goto(pathToFileURL(here + '/profile.html').href + '?theme=' + theme, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  const { css, blocks } = await p.evaluate(() => {
    const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n');
    const root = document.querySelector('.theme');
    root.classList.add('motion');
    const blocks = [];
    const ns = 'http://www.w3.org/2000/svg';
    let n = 0;
    for (const blk of document.querySelectorAll('[data-motion]')) {
      for (const sel of ['.sig i', '.stat', '.mark b', '.q', '.row', '.chip'])
        blk.querySelectorAll(sel).forEach((e, i) => e.style.setProperty('--i', i));
      // Kit icons draw themselves: every shape gets a path length of 1.
      blk.querySelectorAll('.icon *').forEach(e => e.setAttribute('pathLength', '1'));
      // The light around each box, sized in pixels, each box at its own pace.
      blk.querySelectorAll('.tile').forEach(t => {
        const w = t.offsetWidth, h = t.offsetHeight, id = 'edge' + n;
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'trace');
        svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.style.setProperty('--dur', (8 + (n * 7) % 5) + 's');
        svg.style.setProperty('--start', (1.4 + (n % 4) * 0.35).toFixed(2) + 's');
        svg.style.setProperty('--from', String((n * 377) % 1000));
        svg.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
          `<stop offset="0" style="stop-color:var(--g1)"/><stop offset="1" style="stop-color:var(--g3)"/></linearGradient></defs>` +
          ['glow', 'line'].map(c => `<rect class="${c}" x="0.8" y="0.8" width="${w - 1.6}" height="${h - 1.6}" rx="21.2" pathLength="1000" stroke="url(#${id})"/>`).join('');
        t.appendChild(svg);
        n++;
      });
      const h1 = blk.getBoundingClientRect().height;
      root.classList.add('wide');
      const h2 = blk.getBoundingClientRect().height;
      root.classList.remove('wide');
      blocks.push({ id: blk.dataset.shot, w: Math.round(blk.getBoundingClientRect().width), h: Math.ceil(Math.max(h1, h2)) + 2, html: new XMLSerializer().serializeToString(blk) });
    }
    return { css, blocks };
  });
  for (const b of blocks) b.html = embedImages(b.html);
  for (const { id, w, h, html } of blocks) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<foreignObject x="0" y="0" width="${w}" height="${h}">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" class="${theme} motion" style="width:${w}px;margin:0">` +
      `<style><![CDATA[${css}]]></style>${html}</div></foreignObject></svg>\n`;
    writeFileSync(`${out}/${id}-${theme}.svg`, svg);
  }
  console.log(theme, blocks.map(b => `${b.id} ${b.w}x${b.h}`).join(', '));
}
await b.close();

// Photos go inside the SVG as data URIs (GitHub serves repo images with a strict
// policy, so an image file cannot load another file). Each one is resized and
// recompressed first so the SVGs stay small.
function embedImages(html) {
  const tmp = mkdtempSync(join(tmpdir(), 'profile-img-'));
  return html.replace(/src="([^"]+\.(?:jpe?g|png))"/g, (m, rel) => {
    const src = resolve(here, rel), out = join(tmp, rel.replace(/[^a-z0-9.]/gi, '_') + '.jpg');
    const size = rel.startsWith('src/') ? '1100' : '820';
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', size, src, '--out', out], { stdio: 'ignore' });
    return `src="data:image/jpeg;base64,${readFileSync(out).toString('base64')}"`;
  });
}
