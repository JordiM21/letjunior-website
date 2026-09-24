// Self-check for the time-zone math in cupo.js: node scripts/check-cupo.mjs
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const module = {};
vm.runInNewContext(readFileSync(new URL('../cupo.js', import.meta.url), 'utf8'), { module });
const { nextSlot, match } = module.exports;
const hm = (d, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);

// Summer: Rome is UTC+2, Mexico City UTC-6 (no DST since 2022).
const summer = new Date('2026-09-24T10:00:00Z'); // a Thursday
assert.strictEqual(nextSlot(1, '22:00', summer).toISOString(), '2026-09-28T20:00:00.000Z');
assert.strictEqual(hm(nextSlot(1, '22:00', summer), 'America/Mexico_City'), 'Mon 14:00');
// Winter: Rome UTC+1, so Mexico gets it an hour later.
const winter = new Date('2026-12-02T10:00:00Z');
assert.strictEqual(hm(nextSlot(1, '22:00', winter), 'America/Mexico_City'), 'Mon 15:00');
// A slot later today stays today; local weekday can roll back a day.
assert.strictEqual(hm(nextSlot(4, '23:00', summer), 'Europe/Rome'), 'Thu 23:00');
assert.strictEqual(hm(nextSlot(1, '01:00', summer), 'America/Los_Angeles'), 'Sun 16:00');

// Matching: only groups covering the age, 7:00–21:00 local, max 3, sorted by time.
const r = match(9, 'cero', { name: 'México', cc: 'MX', tz: 'America/Mexico_City' }, summer);
assert.ok(r.length >= 1 && r.length <= 3);
r.forEach(s => assert.ok(9 >= s.g.ages[0] && 9 <= s.g.ages[1] && s.mins >= 420 && s.mins <= 1260));
assert.deepStrictEqual(r.map(s => s.mins), r.map(s => s.mins).sort((a, b) => a - b));
console.log('cupo ok:', r.map(s => s.days + ' ' + s.time).join(' | '));
