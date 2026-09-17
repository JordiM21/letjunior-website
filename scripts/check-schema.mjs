/* Structured data must say exactly what the page says.
 *
 * Google discounts (and can penalise) FAQ schema whose answers do not appear
 * in the visible copy, and the easy way to get there is to edit an answer on
 * the page and forget the JSON-LD. This compares the two — against the page
 * WITH the schema block removed, or every answer would trivially match itself.
 */
import { readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!m) { console.error('ERROR: no JSON-LD block in index.html'); process.exit(1); }

let data;
try { data = JSON.parse(m[1]); }
catch (e) { console.error('ERROR: JSON-LD does not parse — ' + e.message); process.exit(1); }

const visible = html.replace(m[0], '')
  .replace(/<[^>]+>/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');

const faq = (data['@graph'] || []).find(g => g['@type'] === 'FAQPage');
const drift = [];
for (const q of (faq ? faq.mainEntity : [])) {
  if (!visible.includes(q.acceptedAnswer.text)) drift.push(q.name);
}

if (drift.length) {
  console.error('\nERROR: FAQ schema no longer matches the page:');
  drift.forEach(q => console.error('  ' + q));
  console.error('Re-run the schema build or fix the answer text.');
  process.exit(1);
}
console.log(`  schema: ${faq ? faq.mainEntity.length : 0} pregunta(s) coinciden con la página`);
