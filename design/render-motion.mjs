// Writes the animated blocks (every [data-motion] element of profile.html) as SVG files,
// light and dark, into ../assets/profile. Each SVG holds the block's HTML and CSS in a
// foreignObject, in the system font (SF Pro on Apple devices), and animates with CSS only.
// Heights are measured in the system font and in a wider fallback, and the larger is used,
// so text that wraps differently on other systems still fits.
//
// Layouts:
//   desktop (default) — the 880px artboard
//   sm — phone artboard (profile.html ?layout=sm), written as {id}-sm-{theme}.svg
// Pass "sm", "desktop" or "all" as the third argument. Default is all.
// Usage, from this folder: npm i --no-save puppeteer && node render-motion.mjs [outdir] [layout]
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const puppeteer = existsSync(new URL('./node_modules/puppeteer/package.json', import.meta.url))
  ? require('puppeteer')
  : require('puppeteer-core');

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || here + '/../assets/profile';
const which = process.argv[3] || 'all';
// GitHub's profile README column tops out at 846px. Half and third tiles are
// shipped a few pixels under half and a third of that, so two and three still
// sit on one row where a percentage width is ignored. The viewBox stays the
// artboard size; only the SVG's own width and height change, which is what a
// webview uses as the intrinsic size.
const SHIP = { half: 420, third: 278 };
const layouts = [
  { name: 'desktop', query: '', suffix: '', ship: true },
  { name: 'sm', query: '&layout=sm', suffix: '-sm', ship: false },
].filter(l => which === 'all' || which === l.name);

const executablePath = process.env.CHROME_PATH
  || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
const b = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'],
});
const p = await b.newPage();
await p.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 1 });
for (const layout of layouts) {
  for (const theme of ['light', 'dark']) {
    await p.goto(pathToFileURL(here + '/profile.html').href + '?theme=' + theme + layout.query, { waitUntil: 'networkidle0' });
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
        blk.querySelectorAll('.icon *').forEach(e => e.setAttribute('pathLength', '1'));
        blk.querySelectorAll('.tile').forEach(t => {
          const w = t.offsetWidth, h = t.offsetHeight, id = 'edge' + n, pad = 8;
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('class', 'trace');
          svg.setAttribute('width', w + pad * 2); svg.setAttribute('height', h + pad * 2);
          svg.setAttribute('viewBox', `${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`);
          svg.style.left = (t.offsetLeft - pad) + 'px';
          svg.style.top = (t.offsetTop - pad) + 'px';
          svg.style.setProperty('--dur', (6 + (n * 7) % 4) + 's');
          svg.style.setProperty('--start', (1.2 + (n % 4) * 0.3).toFixed(2) + 's');
          const dur = 6 + (n * 7) % 4;
          svg.style.setProperty('--phase', (-((n * 377) % 1000) / 1000 * dur).toFixed(2) + 's');
          const rect = c => `<rect class="${c}" x="0.8" y="0.8" width="${w - 1.6}" height="${h - 1.6}" rx="21.2" pathLength="1000" stroke="url(#${id})"${c === 'halo' ? ` filter="url(#${id}b)"` : ''}/>`;
          svg.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
            `<stop offset="0" style="stop-color:var(--g1)"/><stop offset="1" style="stop-color:var(--g3)"/></linearGradient>` +
            `<filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>` +
            ['halo', 'tail', 'mid', 'head'].map(rect).join('');
          blk.appendChild(svg);
          n++;
        });
        const h1 = blk.getBoundingClientRect().height;
        root.classList.add('wide');
        const h2 = blk.getBoundingClientRect().height;
        root.classList.remove('wide');
        const kind = blk.classList.contains('half') ? 'half' : blk.classList.contains('third') ? 'third' : 'full';
        blocks.push({ id: blk.dataset.shot, kind, w: Math.round(blk.getBoundingClientRect().width), h: Math.ceil(Math.max(h1, h2)) + 6, html: new XMLSerializer().serializeToString(blk) });
      }
      return { css, blocks };
    });
    for (const block of blocks) block.html = embedImages(block.html);
    for (const { id, kind, w, h, html } of blocks) {
      let sw = w, sh = h;
      if (layout.ship && SHIP[kind] && w > SHIP[kind]) {
        sw = SHIP[kind];
        sh = Math.round(h * SHIP[kind] / w);
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${w} ${h}">` +
        `<foreignObject x="0" y="0" width="${w}" height="${h}">` +
        `<div xmlns="http://www.w3.org/1999/xhtml" class="${theme} motion${layout.suffix ? ' sm' : ''}" style="width:${w}px;margin:0">` +
        `<style><![CDATA[${css}]]></style>${html}</div></foreignObject></svg>\n`;
      writeFileSync(`${out}/${id}${layout.suffix}-${theme}.svg`, svg);
    }
    console.log(layout.name, theme, blocks.map(b => `${b.id} ${b.w}x${b.h}`).join(', '));
  }
}
await b.close();

// Photos go inside the SVG as data URIs (GitHub serves repo images with a strict
// policy, so an image file cannot load another file). Each one is resized and
// recompressed first so the SVGs stay small. sips on macOS, Pillow elsewhere.
function embedImages(html) {
  const tmp = mkdtempSync(join(tmpdir(), 'profile-img-'));
  return html.replace(/src="([^"]+\.(?:jpe?g|png))"/g, (m, rel) => {
    const src = resolve(here, rel);
    const dest = join(tmp, rel.replace(/[^a-z0-9.]/gi, '_') + '.jpg');
    const size = rel.startsWith('src/') ? 1100 : 820;
    resize(src, dest, size);
    return `src="data:image/jpeg;base64,${readFileSync(dest).toString('base64')}"`;
  });
}

function resize(src, dest, size) {
  const sips = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', String(size), src, '--out', dest], { stdio: 'ignore' });
  if (sips.status === 0) return;
  const py = spawnSync('python3', ['-c', `
from PIL import Image
im = Image.open(${JSON.stringify(src)}).convert("RGB")
im.thumbnail((${size}, ${size}))
im.save(${JSON.stringify(dest)}, "JPEG", quality=70, optimize=True)
`], { encoding: 'utf8' });
  if (py.status !== 0) throw new Error(py.stderr || ('resize failed: ' + src));
}
