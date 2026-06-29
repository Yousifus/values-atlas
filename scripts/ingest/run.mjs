// Orchestrator for the Tier 1 dataset ingestion pipeline.
//
// Runs one or more source modules against public/data/atlas.json. Every source
// is fully idempotent: its prior contributions are stripped (tagged readings /
// bibliography by sourceDataset; new points by id prefix) before re-applying, so
// the pipeline is safe to re-run any number of times.
//
// Usage:
//   node scripts/ingest/run.mjs                 # run all four sources, write
//   node scripts/ingest/run.mjs reba drh        # run a subset (Phase A), write
//   node scripts/ingest/run.mjs --check         # run all in-memory; exit 1 if
//                                                 atlas.json would change
//
// Source modules each export `async run(atlas) -> { source, enriched, added, readings }`.

import { readFileSync } from 'node:fs';
import {
  loadAtlas, saveAtlas, stripSource, bumpSchemaVersion, DATA_PATH,
} from './lib.mjs';
import { SOURCES } from './sources.mjs';
import { run as reba } from './reba.mjs';
import { run as drh } from './drh.mjs';
import { run as maddison } from './maddison.mjs';
import { run as pulotu } from './pulotu.mjs';

const MODULES = {
  reba: { fn: reba, source: SOURCES.reba.sourceDataset },
  drh: { fn: drh, source: SOURCES.drh.sourceDataset },
  maddison: { fn: maddison, source: SOURCES.maddison.sourceDataset },
  pulotu: { fn: pulotu, source: SOURCES.pulotu.sourceDataset, pointIdPrefix: 'pulotu-' },
};

// Fixed run order: Phase A (geo/value backbone) first, then Phase B.
const ORDER = ['reba', 'drh', 'maddison', 'pulotu'];

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const selected = args.filter((a) => !a.startsWith('--'));
  const toRun = (selected.length ? selected : ORDER).filter((k) => MODULES[k]);
  if (!toRun.length) {
    console.error(`No valid sources selected. Choose from: ${Object.keys(MODULES).join(', ')}`);
    process.exit(1);
  }

  let atlas = loadAtlas();
  const before = atlas.length;
  const stats = [];
  for (const key of ORDER) {
    if (!toRun.includes(key)) continue;
    const mod = MODULES[key];
    atlas = stripSource(atlas, mod.source, { pointIdPrefix: mod.pointIdPrefix || null });
    const s = await mod.fn(atlas);
    stats.push(s);
  }
  for (const p of atlas) bumpSchemaVersion(p);

  const next = `${JSON.stringify(atlas, null, 2)}\n`;

  console.log('\nTier 1 ingestion summary');
  console.log('─'.repeat(60));
  for (const s of stats) {
    console.log(`  ${s.source.padEnd(26)} enriched:${String(s.enriched).padStart(3)}  added:${String(s.added).padStart(4)}  readings:${String(s.readings).padStart(4)}`);
  }
  console.log('─'.repeat(60));
  console.log(`  atlas points: ${before} -> ${atlas.length}`);

  if (checkOnly) {
    const raw = readFileSync(DATA_PATH, 'utf8');
    if (next !== raw) {
      console.error('\n--check: atlas.json would change (pipeline not yet applied or not idempotent).');
      process.exit(1);
    }
    console.log('\n--check: atlas.json is up to date (idempotent).');
    return;
  }

  saveAtlas(atlas);
  console.log(`\nWrote ${DATA_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
