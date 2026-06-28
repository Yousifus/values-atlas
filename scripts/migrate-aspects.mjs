// Migrate Values Atlas data points to schemaVersion 2 (additive aspects layer).
//
// For every point that lacks an `aspects` array, this adds:
//   - schemaVersion: 2
//   - aspects: [{ type: "values-synthesis", readings: [...] }]
// built ENTIRELY from existing flat fields (note, altReading, cost, confidence,
// contested, contestNote, sources). No new scholarship is invented and the
// original flat fields are kept in place (backward compatible).
//
// The script is idempotent: re-running it leaves already-migrated points alone.
// Output preserves 2-space formatting + a trailing newline to minimize diff noise.
//
// Usage:  node scripts/migrate-aspects.mjs
//   add   --check  to verify without writing (exit 1 if changes would be made).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'public', 'data', 'atlas.json');

const checkOnly = process.argv.includes('--check');

/** Build the single values-synthesis aspect from a point's existing fields. */
function buildValuesSynthesisAspect(point) {
  const readings = [];

  // Reading 1 — the primary reading (note) plus its metadata.
  const primary = { text: point.note };
  if (typeof point.confidence === 'number') primary.confidence = point.confidence;
  if (typeof point.contested === 'boolean') primary.contested = point.contested;
  if (point.contestNote) primary.contestNote = point.contestNote;
  if (Array.isArray(point.sources) && point.sources.length) {
    primary.sources = [...point.sources];
  }
  readings.push(primary);

  // Reading 2 — the counter-reading / alternative perspective, if present.
  if (point.altReading) {
    readings.push({ text: point.altReading });
  }

  // Reading 3 — the shadow / cost, preserved verbatim with a clear label.
  if (point.cost) {
    readings.push({ text: `The Shadow / Cost: ${point.cost}` });
  }

  return { type: 'values-synthesis', readings };
}

function migratePoint(point) {
  if (Array.isArray(point.aspects)) return false; // already migrated
  point.schemaVersion = 2;
  point.aspects = [buildValuesSynthesisAspect(point)];
  return true;
}

function main() {
  const raw = readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('atlas.json did not parse to an array; aborting.');
    process.exit(1);
  }

  let migrated = 0;
  for (const point of data) {
    if (migratePoint(point)) migrated += 1;
  }

  const next = JSON.stringify(data, null, 2) + '\n';

  if (checkOnly) {
    if (next !== raw) {
      console.error(`migrate-aspects --check: ${migrated} point(s) would change.`);
      process.exit(1);
    }
    console.log('migrate-aspects --check: up to date.');
    return;
  }

  if (next === raw) {
    console.log(`No changes needed (${data.length} points already migrated).`);
    return;
  }

  writeFileSync(DATA_PATH, next, 'utf8');
  console.log(`Migrated ${migrated} of ${data.length} point(s) to schemaVersion 2.`);
}

main();
