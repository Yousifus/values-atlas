#!/usr/bin/env node
// Validates public/data/atlas.json. Run by CI on every PR and runnable locally:
//
//   pnpm validate:data
//
// Two layers:
//   1. The draft-07 JSON Schema in public/data/atlas.schema.json (types, enums,
//      ranges, required fields, no unknown properties).
//   2. Rules the schema cannot express: unique ids, no markup characters in any
//      string, https-only URLs, a primary value on every point.
//
// It also prints a balance report (points per epoch / thread / primary value).
// The report is informational and never fails the run; it exists so a bulk data
// import that floods one era, region or value is visible in the PR that adds it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import Ajv from 'ajv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Optional first argument: validate a different file (a fork's data, a draft).
const dataPath = process.argv[2] ? resolve(process.argv[2]) : join(root, 'public', 'data', 'atlas.json');
const schemaPath = join(root, 'public', 'data', 'atlas.schema.json');

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const errors = [];
const fail = (msg) => errors.push(msg);

// ── 1. JSON Schema ──
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(data)) {
  for (const e of validate.errors.slice(0, 40)) {
    fail(`schema: ${e.instancePath || '/'} ${e.message}${e.params && Object.keys(e.params).length ? ` ${JSON.stringify(e.params)}` : ''}`);
  }
  if (validate.errors.length > 40) fail(`schema: ... and ${validate.errors.length - 40} more`);
}

// ── 2. Rules beyond the schema ──
const seen = new Set();
const MARKUP = /[<>]/;
const URL_FIELDS = new Set(['url', 'doi']);

function walk(node, path, pointId) {
  if (typeof node === 'string') {
    // Markup characters have no business in this dataset: every string is plain
    // text and is HTML-escaped on the way out (lib/escape.ts). A '<' or '>' in
    // the data is a mistake or an injection attempt; fail the PR either way.
    if (MARKUP.test(node)) fail(`${pointId}: markup character in ${path}: ${JSON.stringify(node.slice(0, 60))}`);
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, pointId)); return; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (URL_FIELDS.has(k) && typeof v === 'string' && /^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https:\/\//i.test(v)) {
        fail(`${pointId}: non-https URL in ${path}.${k}: ${v.slice(0, 60)}`);
      }
      walk(v, `${path}.${k}`, pointId);
    }
  }
}

if (Array.isArray(data)) {
  data.forEach((p, i) => {
    const id = p && typeof p.id === 'string' ? p.id : `#${i}`;
    if (seen.has(id)) fail(`${id}: duplicate id`);
    seen.add(id);
    if (!p.values?.some((v) => v.role === 'primary')) fail(`${id}: no primary value`);
    walk(p, '', id);
  });
}

// ── Balance report (informational) ──
function tally(label, keyFn) {
  const counts = new Map();
  for (const p of data) counts.set(keyFn(p), (counts.get(keyFn(p)) ?? 0) + 1);
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = data.length;
  console.log(`\n${label}`);
  for (const [k, n] of rows) {
    const pct = Math.round((n / total) * 100);
    console.log(`  ${String(k).padEnd(16)} ${String(n).padStart(4)}  ${String(pct).padStart(3)}%  ${'#'.repeat(Math.ceil(pct / 2))}`);
  }
  return rows;
}

if (Array.isArray(data)) {
  console.log(`atlas.json: ${data.length} points`);
  const byEpoch = tally('points per epoch', (p) => p.epoch);
  const byThread = tally('points per thread', (p) => p.thread);
  const byValue = tally('points per primary value', (p) => p.values?.find((v) => v.role === 'primary')?.valueId ?? '(none)');
  const heavy = [];
  if (byEpoch[0] && byEpoch[0][1] / data.length > 0.4) heavy.push(`epoch "${byEpoch[0][0]}" holds ${byEpoch[0][1]} of ${data.length} points`);
  if (byThread[0] && byThread[0][1] / data.length > 0.4) heavy.push(`thread "${byThread[0][0]}" holds ${byThread[0][1]} of ${data.length} points`);
  if (byValue[0] && byValue[0][1] / data.length > 0.4) heavy.push(`primary value "${byValue[0][0]}" holds ${byValue[0][1]} of ${data.length} points`);
  if (heavy.length) console.log(`\nbalance notice (not a failure): ${heavy.join('; ')}`);
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nOK: atlas.json is valid.');
