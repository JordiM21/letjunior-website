/* Rebuild the FAQPage schema from the FAQ actually on the page.
 *
 *   npm run assets   (runs this, then check-schema.mjs verifies it)
 *
 * The answers are never typed twice. Editing the FAQ in index.html and
 * forgetting the JSON-LD is the normal way this breaks, and Google discounts
 * FAQ schema whose answers do not appear in the visible copy.
 *
 * Any question whose markup still carries a TODO is left out on purpose:
 * structured data must not publish a fact the business has not settled.
 */
import { readFile, writeFile } from 'node:fs/promises';

const HTML = 'index.html';
let h = await readFile(HTML, 'utf8');

/* Stop at the last </details>. Anything after it — the WhatsApp line and the
   TODO comment next to it — belongs to the section, not to a question, and
   sweeping it in made the last question look unsettled when it is not. */
const from = h.indexOf('<div class="acc reveal">');
const lastClose = h.lastIndexOf('</details>');
if (from < 0 || lastClose < from) { console.error('ERROR: no FAQ block found'); process.exit(1); }
const block = h.slice(from, lastClose + '</details>'.length);

const clean = s => s.replace(/<[^>]+>/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const items = [];
let skipped = 0;
for (const chunk of block.split('<details').slice(1)) {
  if (/TODO/.test(chunk)) { skipped++; continue; }
  const q = chunk.match(/<summary>([\s\S]*?)<span class="plus"/);
  const a = chunk.match(/<div class="acc-body"><div><p>([\s\S]*?)<\/p>/);
  if (q && a) items.push([clean(q[1]), clean(a[1])]);
}
if (!items.length) { console.error('ERROR: no answerable FAQ items'); process.exit(1); }

const start = h.indexOf('      "mainEntity": [');
const end = h.indexOf('\n      ]', start);
if (start < 0 || end < 0) { console.error('ERROR: no mainEntity array in the JSON-LD'); process.exit(1); }

const body = items.map(([q, a]) =>
  `        {"@type":"Question","name":${JSON.stringify(q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(a)}}}`
).join(',\n');

h = h.slice(0, start) + '      "mainEntity": [\n' + body + h.slice(end);
await writeFile(HTML, h);

console.log(`  schema: ${items.length} pregunta(s) desde la página` +
            (skipped ? `, ${skipped} omitida(s) por TODO` : ''));
