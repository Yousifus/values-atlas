// D-PLACE "Pulotu" (Austronesian / Pacific religion) ingestion.
//
// Source: Watts et al. (2015) "Broad supernatural punishment but not moralizing
// high gods precede the evolution of political complexity in Austronesia"
// (PLOS ONE, doi:10.1371/journal.pone.0136783), distributed via the D-PLACE
// CLDF dataset `D-PLACE/dplace-dataset-pulotu`. CC-BY-4.0. NB: only this Pulotu
// subset of D-PLACE is permissively licensed; the EA / SCCS subsets are
// NonCommercial and are intentionally NOT touched.
//
// Role: ADDS new atlas points for the under-covered Oceania region (Austronesian
// societies). Each new point carries:
//   - coordinates + ethnographic time-focus -> epoch (deterministic),
//   - piety derived from belief-in-god(s) focus + supernatural punishment
//     (the "supernatural monitoring" -> piety mapping; this is the same DRH
//     research programme as the DRH/SCCSR module),
//   - aggression derived from recorded inter-/external warfare frequency,
//   - religion + myth aspects describing the coded beliefs,
// all stamped with sourceDataset + license + DOIs (Path A). Existing points are
// never mutated. New point ids are prefixed `pulotu-` so re-runs are idempotent
// (the orchestrator strips that prefix before re-adding).

import {
  download, parseCSVObjects, yearToEpoch, makeReading,
} from './lib.mjs';
import { SOURCES } from './sources.mjs';

const SRC = SOURCES.pulotu;
const BASE = 'https://raw.githubusercontent.com/D-PLACE/dplace-dataset-pulotu/master/cldf';

// Parameter ids in the Pulotu CLDF (from variables.csv).
const P = {
  timeFocus: '1',
  gods: '2',
  natureGods: '3',
  deifiedAncestors: '4',
  ancestralSpirits: '5',
  punishImpiety: '7', // supernatural monitoring / punishment for impiety
  punishSelfishness: '8',
  cultureHeroes: '13',
  natureForces: '14',
  costlySacrifices: '36',
  internalWarfare: '54',
  externalWarfare: '55',
};

// belief-in-god(s) focus code (0..3) -> piety base intensity.
const GODS_PIETY = { 0: 0, 1: 0.45, 2: 0.7, 3: 0.85 };
// warfare frequency code (1 frequent .. 4 rare) -> aggression intensity.
const WARFARE_AGG = { 1: 0.8, 2: 0.6, 3: 0.4, 4: 0.2 };

const yearLabel = (y) => (y < 0 ? `${-y} BCE` : `${y} CE`);

// Slugify a Pulotu society id into a schema-valid atlas id ([a-z0-9-]).
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export async function run(atlas) {
  const societies = parseCSVObjects(await download('pulotu_societies.csv', `${BASE}/societies.csv`));
  const data = parseCSVObjects(await download('pulotu_data.csv', `${BASE}/data.csv`));
  const codes = parseCSVObjects(await download('pulotu_codes.csv', `${BASE}/codes.csv`));

  // society|param -> raw value ; param|value -> code description
  const val = new Map();
  for (const r of data) {
    const k = `${r.Language_ID}|${r.Parameter_ID}`;
    if (!val.has(k)) val.set(k, r.Value);
  }
  const codeDesc = new Map();
  for (const c of codes) codeDesc.set(`${c.Parameter_ID}|${c.Name}`, c.Description);

  const get = (soc, param) => val.get(`${soc}|${param}`);
  const desc = (param, v) => codeDesc.get(`${param}|${v}`) || v;

  const citationKeys = SRC.citations.map((c) => c.key);
  const bibliography = SRC.citations.map((c) => ({ ...c, license: SRC.license, sourceDataset: SRC.sourceDataset }));

  const added = [];
  for (const soc of societies) {
    const lat = parseFloat(soc.Latitude);
    const lng = parseFloat(soc.Longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const tfRaw = get(soc.ID, P.timeFocus);
    const tfYear = parseInt(tfRaw, 10);
    const year = Number.isFinite(tfYear) ? tfYear : 1900; // documented fallback
    const epoch = yearToEpoch(year);

    // ── values ──
    const values = [];
    const godsCode = parseInt(get(soc.ID, P.gods), 10);
    let piety = Number.isFinite(godsCode) ? (GODS_PIETY[godsCode] ?? 0) : 0;
    if (get(soc.ID, P.punishImpiety) === '1') piety = Math.min(0.95, piety + 0.1);
    if (get(soc.ID, P.costlySacrifices) === '1') piety = Math.min(0.95, piety + 0.05);
    if (piety > 0) values.push({ valueId: 'piety', intensity: Math.round(piety * 100) / 100 });

    const intW = parseInt(get(soc.ID, P.internalWarfare), 10);
    const extW = parseInt(get(soc.ID, P.externalWarfare), 10);
    const warCodes = [intW, extW].filter((c) => Number.isFinite(c));
    if (warCodes.length) {
      const agg = WARFARE_AGG[Math.min(...warCodes)] ?? 0;
      if (agg > 0) values.push({ valueId: 'aggression', intensity: agg });
    }

    if (get(soc.ID, P.punishSelfishness) === '1') {
      values.push({ valueId: 'solidarity', intensity: 0.6 });
    }

    // Guarantee >=1 value (schema). Kin-based Pacific societies default to solidarity.
    if (!values.length) values.push({ valueId: 'solidarity', intensity: 0.5 });

    // Roles: highest intensity = primary, others = coupled.
    values.sort((a, b) => b.intensity - a.intensity);
    values.forEach((v, i) => { v.role = i === 0 ? 'primary' : 'coupled'; });

    // ── readings ──
    const godsDesc = desc(P.gods, get(soc.ID, P.gods));
    const punish = get(soc.ID, P.punishImpiety) === '1' ? 'present' : 'absent';
    const warDescParts = [];
    if (Number.isFinite(intW)) warDescParts.push(`internal warfare ${desc(P.internalWarfare, String(intW)).toLowerCase()}`);
    if (Number.isFinite(extW)) warDescParts.push(`external warfare ${desc(P.externalWarfare, String(extW)).toLowerCase()}`);

    const synthText = `Austronesian society documented in the Pulotu database (D-PLACE; Watts et al. 2015), ethnographic time focus c. ${yearLabel(year)}. Belief in god(s): ${godsDesc}. Supernatural punishment for impiety: ${punish}.${warDescParts.length ? ` Recorded ${warDescParts.join('; ')}.` : ''}`;

    const aspects = [
      {
        type: 'values-synthesis',
        readings: [makeReading(synthText, SRC.sourceDataset, SRC.license, {
          confidence: 0.6,
          contested: true,
          contestNote: 'Values derived deterministically from Pulotu coded variables (belief-in-gods focus, supernatural punishment, warfare frequency) — interpretive mapping; NEEDS HUMAN REVIEW.',
          citationKeys,
        })],
      },
    ];

    // religion aspect
    const relParts = [`belief in god(s): ${godsDesc}`];
    const natureGods = get(soc.ID, P.natureGods);
    if (natureGods) relParts.push(`nature god(s): ${desc(P.natureGods, natureGods)}`);
    const ancestors = get(soc.ID, P.deifiedAncestors);
    if (ancestors) relParts.push(`deified ancestor(s): ${desc(P.deifiedAncestors, ancestors)}`);
    relParts.push(`supernatural punishment for impiety: ${punish}`);
    if (get(soc.ID, P.costlySacrifices)) relParts.push(`costly sacrifices/offerings: ${desc(P.costlySacrifices, get(soc.ID, P.costlySacrifices)).toLowerCase()}`);
    aspects.push({
      type: 'religion',
      readings: [makeReading(`Indigenous religion (Pulotu coding) — ${relParts.join('; ')}.`, SRC.sourceDataset, SRC.license, {
        confidence: 0.65,
        citationKeys,
      })],
    });

    // myth aspect (only if culture-hero / nature-force beliefs are coded present)
    const heroes = get(soc.ID, P.cultureHeroes);
    const natForces = get(soc.ID, P.natureForces);
    if ((heroes && heroes !== '0') || (natForces && natForces !== '0')) {
      const mythParts = [];
      if (heroes && heroes !== '0') mythParts.push(`culture hero(es): ${desc(P.cultureHeroes, heroes)}`);
      if (natForces && natForces !== '0') mythParts.push(`forces of nature imbued with the supernatural: ${desc(P.natureForces, natForces)}`);
      aspects.push({
        type: 'myth',
        readings: [makeReading(`Myth & cosmology (Pulotu coding) — ${mythParts.join('; ')}.`, SRC.sourceDataset, SRC.license, {
          confidence: 0.6,
          citationKeys,
        })],
      });
    }

    const point = {
      id: `pulotu-${slug(soc.ID)}`,
      region: soc.Name,
      thread: 'none',
      lat,
      lng,
      epoch,
      values,
      drivers: ['maritime_expansion', 'kinship_intensity'],
      status: 'adaptive',
      evidence: 'ethnographic',
      confidence: 0.6,
      contested: true,
      contestNote: 'Point synthesized deterministically from the Pulotu (D-PLACE) coded dataset; epoch reflects the ethnographic time focus, and value/driver mappings are interpretive — NEEDS HUMAN REVIEW.',
      note: synthText,
      schemaVersion: 2,
      aspects,
      bibliography,
    };
    added.push(point);
  }

  // Append all new points (orchestrator has already stripped the `pulotu-` prefix).
  for (const p of added) atlas.push(p);
  return { source: SRC.sourceDataset, enriched: 0, added: added.length, readings: added.length };
}
