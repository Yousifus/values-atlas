#!/usr/bin/env node
// Security regression test: data-sourced text must never reach the page as markup.
//
//   pnpm test:escaping
//
// It loads the real renderers (components/atlas/drawerContent.ts, lib/validate.ts)
// through scripts/lib/load-ts.mjs, feeds them points whose free-text fields are
// full of hostile markup, and fails if any of it comes back unescaped. If someone
// adds a new interpolation of a data field without esc(), this is the check that
// catches it.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTs, root } from './lib/load-ts.mjs';

const { buildDrawerBody } = loadTs('components/atlas/drawerContent.ts');
const { sanitizeAtlas } = loadTs('lib/validate.ts');
const { esc } = loadTs('lib/escape.ts');

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) { failures++; console.error(`FAIL  ${name}${detail ? `\n      ${detail}` : ''}`); }
  else console.log(`ok    ${name}`);
};

// ── esc() itself ──
check('esc escapes & < > " \'', esc(`<a href="x" onclick='y'>&`) === '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;');
check('esc treats null/undefined as empty', esc(null) === '' && esc(undefined) === '');

// ── a real point, with every free-text field replaced by a payload ──
const atlas = JSON.parse(readFileSync(join(root, 'public', 'data', 'atlas.json'), 'utf8'));
const base = atlas.find((p) => p.aspects?.length && p.sources?.length) ?? atlas[0];
const PAYLOAD = (tag) => `<img src=x onerror=alert('${tag}')>"&</p><script>alert('${tag}')</script>`;
const poisoned = structuredClone(base);
const TEXT_KEYS = ['region', 'note', 'altReading', 'cost', 'artifact', 'contestNote', 'text'];
let n = 0;
const infect = (node) => {
  if (Array.isArray(node)) { node.forEach(infect); return; }
  if (!node || typeof node !== 'object') return;
  for (const k of Object.keys(node)) {
    if (TEXT_KEYS.includes(k) && typeof node[k] === 'string') node[k] = PAYLOAD(`${k}${n++}`);
    else if (k === 'sources' && Array.isArray(node[k])) node[k] = node[k].map(() => PAYLOAD(`src${n++}`));
    else infect(node[k]);
  }
};
infect(poisoned);
// Force the contested + alternate-reading branches so every template path runs.
poisoned.contested = true;
poisoned.contestNote = PAYLOAD('contest');
poisoned.altReading = PAYLOAD('alt');
poisoned.cost = PAYLOAD('cost');
poisoned.artifact = PAYLOAD('artifact');
poisoned.aspects?.forEach((a) => a.readings.forEach((r, i) => { r.contested = true; r.contestNote = PAYLOAD(`rc${i}`); }));

const html = buildDrawerBody(poisoned, [poisoned]);
check('drawer: no raw <img> from data', !/<img\b/i.test(html));
check('drawer: no raw <script> from data', !/<script\b/i.test(html));
check('drawer: no real tag carries an event handler', !/<[^>]*\sonerror\s*=/i.test(html));
check('drawer: payload text is present, escaped', html.includes('&lt;img src=x onerror=alert('));

// Legacy (pre-aspects) branch: flat fields.
const legacy = structuredClone(poisoned);
delete legacy.aspects;
const legacyHtml = buildDrawerBody(legacy, [legacy]);
check('legacy drawer: no raw <img>/<script> from data', !/<img\b/i.test(legacyHtml) && !/<script\b/i.test(legacyHtml));

// ── sanitizeAtlas ──
const clean = sanitizeAtlas([base]);
check('sanitize: keeps a valid point', clean.points.length === 1 && clean.problems.length === 0);
const hostile = sanitizeAtlas([
  { ...structuredClone(base), id: 'a"><img src=x>' },           // bad id
  { ...structuredClone(base), id: 'bad-epoch', epoch: '<script>' }, // bad enum
  { ...structuredClone(base), id: 'bad-lat', lat: 999 },          // out of range
  { ...structuredClone(base), id: 'bad-status', status: 'nope' }, // unknown status
  { ...structuredClone(base), id: 'dup' },
  { ...structuredClone(base), id: 'dup' },                        // duplicate
  'not an object',
  null,
]);
check('sanitize: drops hostile / malformed points, keeps one of the duplicates', hostile.points.length === 1 && hostile.points[0].id === 'dup', JSON.stringify(hostile.problems));
check('sanitize: reports a reason for every drop', hostile.problems.length === 7);
check('sanitize: non-array input yields no points', sanitizeAtlas({ not: 'an array' }).points.length === 0);

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll escaping checks passed.');
process.exit(failures ? 1 : 0);
