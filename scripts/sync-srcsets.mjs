/* Rewrite every <picture> srcset in index.html to match what actually exists.
 *
 *   npm run assets   (this runs automatically afterwards)
 *
 * Why this exists: the image pipeline never upscales, so a slot asking for
 * [280, 560, 840] gets only the widths its source can fill. A 456px screenshot
 * yields one file, not three. Hand-written srcsets drift out of sync with that
 * silently — the browser just fails to load and you get an empty box.
 *
 * So the widths are not written by hand at all. Point a <source> at any one
 * file in the set and this rewrites the whole srcset from disk, keeping the
 * sizes attribute you wrote. The <img> fallback is pointed at the largest webp.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const HTML = 'index.html';
const OUT = 'assets/optimized';

const widthsFor = async (dir, name) => {
  const re = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.(avif|webp)$`);
  const found = { avif: [], webp: [] };
  for (const f of await readdir(`${OUT}/${dir}`)) {
    const m = f.match(re);
    if (m) found[m[2]].push(Number(m[1]));
  }
  found.avif.sort((a, b) => a - b);
  found.webp.sort((a, b) => a - b);
  return found;
};

let html = await readFile(HTML, 'utf8');
let rewrites = 0, misses = [];

/* Every srcset that points into assets/optimized, whatever widths it claims. */
const SRCSET = /srcset="((?:assets\/optimized\/[^"]+))"/g;
const parts = [];
let last = 0, m;
while ((m = SRCSET.exec(html))) {
  const first = m[1].split(',')[0].trim().split(' ')[0];
  const hit = first.match(/^assets\/optimized\/([^/]+)\/(.+)-\d+\.(avif|webp)$/);
  if (!hit) continue;
  const [, dir, name, fmt] = hit;
  const w = await widthsFor(dir, name);
  if (!w[fmt].length) { misses.push(`${dir}/${name}.${fmt}`); continue; }
  const built = w[fmt].map(n => `${OUT}/${dir}/${name}-${n}.${fmt} ${n}w`).join(', ');
  if (built !== m[1]) rewrites++;
  parts.push(html.slice(last, m.index), `srcset="${built}"`);
  last = m.index + m[0].length;
}
parts.push(html.slice(last));
html = parts.join('');

/* Point each <img src> at the widest webp that exists for its set. */
html = html.replace(/src="(assets\/optimized\/([^/]+)\/(.+?)-\d+\.webp)"/g, (whole, _p, dir, name) => whole);
const IMG = /src="assets\/optimized\/([^/]+)\/(.+?)-(\d+)\.webp"/g;
const out = [];
last = 0;
while ((m = IMG.exec(html))) {
  const w = await widthsFor(m[1], m[2]);
  if (!w.webp.length) { misses.push(`${m[1]}/${m[2]}.webp`); continue; }
  const best = w.webp[w.webp.length - 1];
  out.push(html.slice(last, m.index), `src="${OUT}/${m[1]}/${m[2]}-${best}.webp"`);
  if (String(best) !== m[3]) rewrites++;
  last = m.index + m[0].length;
}
out.push(html.slice(last));
html = out.join('');

await writeFile(HTML, html);

/* Anything still pointing at a file that is not there is a hard error: it would
 * ship as a blank box, and nothing else in the build would complain. */
const refs = [...html.matchAll(/(assets\/optimized\/[^" ]+\.(?:avif|webp))/g)].map(r => r[1]);
const { existsSync } = await import('node:fs');
const broken = [...new Set(refs)].filter(p => !existsSync(p));

console.log(`  srcsets sincronizados (${rewrites} cambio(s))`);
if (misses.length) console.log('  sin salida generada: ' + [...new Set(misses)].join(', '));
if (broken.length) {
  console.error('\nERROR: referencias rotas en index.html:');
  broken.forEach(p => console.error('  ' + p));
  process.exit(1);
}
console.log(`  ${new Set(refs).size} referencias verificadas, todas existen\n`);
