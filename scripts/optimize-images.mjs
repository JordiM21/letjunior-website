/* Source assets in  → responsive AVIF + WebP out.
 *
 *   npm run assets
 *
 * Drop originals in assets/source/<slot>/ at the largest size you have.
 * This never overwrites a source file, and it never runs at page load —
 * the site only ever serves what lands in assets/optimized/.
 *
 * Each slot is named after the thing on the page it fills, and says three
 * things: how wide it renders, what shape it needs, and — because almost none
 * of these photos are studio portraits — where in the frame the subject
 * actually is. See the README inside each source folder.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { join, parse, relative } from 'node:path';
import { contentBox } from './content-box.mjs';

const SRC = 'assets/source';
const OUT = 'assets/optimized';

/* aspect: target width/height, or null to keep the shape of the source.
 * crop:   per-file { focus:[x,y], zoom, aspect, widths } overrides. focus is
 *         where the subject sits as a fraction of the frame; zoom < 1 crops in.
 * trim:   strip flat letterbox bars first (screen recordings arrive with them). */
const KINDS = {
  hero:               { widths: [400, 800, 1400], alpha: true,
                        note: 'The scene at the top of the page' },

  students:           { widths: [96, 192, 288], alpha: false, aspect: 1, trim: true,
                        note: 'Faces in the live-class mock in the hero',
                        crop: {
                          daniel:   { focus: [0.63, 0.60], zoom: 0.85 },
                          jeanpaul: { focus: [0.40, 0.48], zoom: 0.80 },
                          josue:    { focus: [0.50, 0.40], zoom: 0.78 },
                          mila:     { focus: [0.35, 0.30], zoom: 0.75 },
                          neila:    { focus: [0.45, 0.60], zoom: 0.74 },
                          samantha: { focus: [0.42, 0.48], zoom: 0.90 },
                          samir:    { focus: [0.52, 0.40], zoom: 0.88 }
                        } },

  teachers:           { widths: [280, 560, 840], alpha: false, aspect: 4 / 5,
                        note: 'Portraits in Conoce a tus profes',
                        crop: {
                          jordi: { focus: [0.50, 0.33], zoom: 0.55 },
                          sofia: { focus: [0.50, 0.29], zoom: 0.80 },
                          ersa:  { focus: [0.46, 0.36], zoom: 0.60 },
                          // Same folder, different jobs: the team shot is a wide
                          // band, and the class grab is a 16:9 tile in the hero
                          // cropped above its own on-screen call controls.
                          'teachers-grupo-noedit': { aspect: 16 / 9, widths: [600, 1200],
                                                     focus: [0.50, 0.44] },
                          'jordi-meeting':         { aspect: 16 / 9, widths: [400, 800],
                                                     focus: [0.46, 0.40], zoom: 0.98 }
                        } },

  'class-activities': { widths: [560, 1120, 1680], alpha: false,
                        note: 'Real photos of a class in progress' },

  reviews:            { widths: [112, 224], alpha: false, aspect: 1,
                        note: 'Reviewer avatars for the written reviews',
                        crop: {
                          'maria-jose-acevedo': { focus: [0.76, 0.19], zoom: 0.46 },
                          'antonio-mendez':     { focus: [0.45, 0.34], zoom: 0.92 },
                          'gustavo-bravo':      { focus: [0.53, 0.32], zoom: 0.76 },
                          'jose-ramirez':       { focus: [0.80, 0.44], zoom: 0.70 }
                        } },

  testimonials:       { widths: [400, 800], alpha: false,
                        note: 'Video posters for the family testimonials (16:9)' },

  'method-icons':     { widths: [64, 128, 256], alpha: true,
                        note: 'The three icons in Nuestro metodo' },

  characters:         { widths: [150, 300, 600], alpha: true,
                        note: 'Mascots and props' },

  brand:              { widths: [36, 72, 144], alpha: true,
                        note: 'The globe mark in the header and footer' }
};

const kb = n => (n / 1024).toFixed(1) + ' KB';

/* Largest rect of the wanted shape that fits `box`, shrunk by zoom, centred on
 * the focus point, then pushed back inside the box if it overhangs an edge. */
function cropRect(box, aspect, focus, zoom) {
  let cw = box.width, ch = box.height;
  if (aspect) {
    if (cw / ch > aspect) cw = ch * aspect; else ch = cw / aspect;
  }
  cw = Math.round(cw * zoom);
  ch = Math.round(ch * zoom);
  const [fx, fy] = focus;
  return {
    width: cw, height: ch,
    left: box.left + Math.round(Math.min(Math.max(box.width * fx - cw / 2, 0), box.width - cw)),
    top:  box.top  + Math.round(Math.min(Math.max(box.height * fy - ch / 2, 0), box.height - ch))
  };
}

async function walk(dir) {
  let out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(p));
    else if (/\.(png|jpe?g|webp|tiff?|avif)$/i.test(e.name)) out.push(p);
  }
  return out;
}

async function main() {
  const report = [];
  let inBytes = 0, outBytes = 0, count = 0;

  for (const [kind, cfg] of Object.entries(KINDS)) {
    if (!cfg.widths.length) continue;
    const files = await walk(join(SRC, kind));
    if (!files.length) continue;

    await mkdir(join(OUT, kind), { recursive: true });

    for (const file of files) {
      const { name } = parse(file);
      const per = (cfg.crop && cfg.crop[name]) || {};
      const meta = await sharp(file).metadata();
      inBytes += (await stat(file)).size;

      const box = cfg.trim
        ? await contentBox(file)
        : { left: 0, top: 0, width: meta.width, height: meta.height };

      const aspect = per.aspect ?? cfg.aspect ?? null;
      const needsCrop = aspect || per.focus || per.zoom;
      const rect = needsCrop
        ? cropRect(box, aspect, per.focus || [0.5, 0.5], per.zoom ?? 1)
        : (cfg.trim ? box : null);

      const widths = per.widths || cfg.widths;
      const avail = rect ? rect.width : meta.width;
      const use = widths.filter(w => w <= avail);
      if (!use.length) use.push(avail);

      const made = [];
      for (const w of use) {
        for (const fmt of ['avif', 'webp']) {
          const dest = join(OUT, kind, `${name}-${w}.${fmt}`);
          let pipe = sharp(file);
          if (rect) pipe = pipe.extract(rect);
          pipe = pipe.resize({ width: w, withoutEnlargement: true });
          const buf = fmt === 'avif'
            ? await pipe.avif({ quality: 55, effort: 6 }).toBuffer()
            : await pipe.webp({ quality: 82, alphaQuality: 90 }).toBuffer();
          await writeFile(dest, buf);
          outBytes += buf.length;
          made.push({ w, fmt, bytes: buf.length, path: relative('.', dest) });
        }
      }
      count++;
      report.push({ file: relative('.', file), kind, w: meta.width, h: meta.height,
                    crop: rect, made });

      const notes = [];
      if (box.width !== meta.width || box.height !== meta.height) {
        notes.push(`barras recortadas → ${box.width}x${box.height}`);
      }
      if (avail < Math.max(...widths)) notes.push(`solo da ${avail}px`);
      console.log(`  ${relative(SRC, file).padEnd(40)} ${meta.width}x${meta.height}` +
                  (notes.length ? `   ${notes.join('; ')}` : ''));
    }
  }

  if (!count) {
    console.log('\nNo hay imagenes todavia en assets/source/.');
    return;
  }

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(report, null, 2));
  console.log(`\n${count} imagen(es)`);
  console.log(`  originales: ${kb(inBytes)}`);
  console.log(`  generadas:  ${kb(outBytes)} en ${report.reduce((n, r) => n + r.made.length, 0)} archivos\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
