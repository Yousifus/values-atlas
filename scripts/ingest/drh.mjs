// Database of Religious History — Standard Cross-Cultural Sample of Religion
// (DRH / SCCSR) ingestion.
//
// Source: the SCCSR CC-BY-4.0 data release (Zenodo doi:10.5281/zenodo.14967261;
// GitHub mirror religionhistory/SCCSR). We use the cleanly-structured
// `social_complexity.csv` table, which codes each SCCSR entry's political/social
// complexity (chiefdom / state / empire / colony). Cite Slingerland et al.
// (DRH) + the SCCSR Zenodo DOI.
//
// IMPORTANT — scope + provenance discipline (Path A):
//   * The DRH/SCCSR entry -> atlas-point links below are an EXPLICIT,
//     human-authored crosswalk. Each line is an interpretive decision a human
//     reviewer MUST audit (see MAPPING.md). We only include unambiguous matches.
//   * Social-complexity level is mapped DETERMINISTICALLY to corroborating
//     hierarchy/order values (added only if absent) + an institutional_scale
//     driver + a factual `governance` reading. We never overwrite existing
//     values/readings.
//   * The richer DRH religion-poll items (moralizing gods, legal code, human
//     sacrifice, supernatural monitoring, women officiate) live in the DRH poll
//     answer tables (Zenodo SQL dump), not in social_complexity.csv. Ingesting
//     those is the documented next reviewer-gated step (see MAPPING.md). The
//     Pulotu module already demonstrates the supernatural-punishment -> piety
//     mapping from the same DRH research programme (Watts et al.).

import {
  download, parseCSVObjects,
  makeReading, addReading, addDriver, addValueIfAbsent, upsertCitation,
} from './lib.mjs';
import { SOURCES } from './sources.mjs';

const SRC = SOURCES.drh;
const SC_URL = 'https://raw.githubusercontent.com/religionhistory/SCCSR/master/data_raw/social_complexity.csv';

// Explicit, auditable crosswalk: atlas point id -> exact SCCSR "Entry Name".
// Only unambiguous civilization matches are included (conservative by design).
const CROSSWALK = {
  'egypt-bronze': 'Ancient Egypt',
  'han-china': 'Han Confucianism',
  'shang-bronze': 'Chinese State Religion (Shang and Western Zhou)',
  'neo-assyria': 'Neo-Assyrian Scholars',
  'rome-empire': 'Roman private religion',
  'mongol-med': 'Khalka Mongols',
};

// Deterministic social-complexity -> corroborating value intensities.
const COMPLEXITY = {
  empire: { hierarchy: 0.8, order: 0.7, label: 'empire (large multi-ethnic polity)' },
  state: { hierarchy: 0.7, order: 0.65, label: 'state (centralized polity)' },
  chiefdom: { hierarchy: 0.55, order: 0.5, label: 'chiefdom (ranked society)' },
};

export async function run(atlas) {
  const rows = parseCSVObjects(await download('sccsr_social_complexity.csv', SC_URL));
  const byName = new Map(rows.map((r) => [r['Entry Name'], r]));
  const byId = new Map(atlas.map((p) => [p.id, p]));

  let enriched = 0;
  let readings = 0;
  for (const [pointId, entryName] of Object.entries(CROSSWALK)) {
    const point = byId.get(pointId);
    const row = byName.get(entryName);
    if (!point || !row) continue;
    const level = (row['Simplified Code'] || '').trim().toLowerCase();
    const spec = COMPLEXITY[level];
    if (!spec) continue; // skip "uncoded"/"colony"/unknown — too ambiguous to map

    // Corroborate (never overwrite) hierarchy/order; union institutional_scale.
    addValueIfAbsent(point, 'hierarchy', spec.hierarchy, 'coupled');
    addValueIfAbsent(point, 'order', spec.order, 'coupled');
    addDriver(point, 'institutional_scale');

    const text = `DRH / Standard Cross-Cultural Sample of Religion codes the corresponding entry "${entryName}" at social-complexity level: ${spec.label}. This corroborates the point's hierarchical, law-and-order institutional structure.`;
    addReading(point, 'governance', makeReading(text, SRC.sourceDataset, SRC.license, {
      confidence: 0.6,
      contested: true,
      contestNote: 'Interpretive crosswalk from a DRH/SCCSR entry to this atlas civilization-at-epoch point — NEEDS HUMAN REVIEW.',
      citationKeys: SRC.citations.map((c) => c.key),
    }));
    for (const cite of SRC.citations) upsertCitation(point, cite, SRC.sourceDataset, SRC.license);
    enriched += 1;
    readings += 1;
  }

  return { source: SRC.sourceDataset, enriched, added: 0, readings };
}
