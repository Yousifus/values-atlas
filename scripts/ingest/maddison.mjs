// Maddison Project Database (GGDC) ingestion.
//
// Source: Maddison Project Database 2023, Bolt & van Zanden (2024),
// doi:10.1111/joes.12618; DataverseNL doi:10.34894/INZBF2. CC-BY-4.0.
// We read the OWID CSV mirror (long format: Entity, Year, GDP per capita,
// Population, GDP).
//
// Role: ENRICHES existing atlas points with economic structure. Like DRH, the
// point -> (country, target year) links are an EXPLICIT, human-authored
// crosswalk (each is a reviewable interpretive decision; see MAPPING.md).
// GDP-per-capita bands map DETERMINISTICALLY to trade_networks /
// industrialization / technological_surplus drivers, plus a factual `commerce`
// reading carrying the figures + DOI provenance.

import {
  download, parseCSVObjects, makeReading, addReading, addDriver, upsertCitation,
} from './lib.mjs';
import { SOURCES } from './sources.mjs';

const SRC = SOURCES.maddison;
const MADDISON_URL = 'https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Maddison%20Project%20Database%202020%20(Bolt%20and%20van%20Zanden%20%282020%29)/Maddison%20Project%20Database%202020%20(Bolt%20and%20van%20Zanden%20%282020%29).csv';

// Explicit, auditable crosswalk: atlas point id -> { entity, year } in Maddison.
const CROSSWALK = {
  'abolition-brit': { entity: 'United Kingdom', year: 1820 },
  'victorian-britain': { entity: 'United Kingdom', year: 1870 },
  'meiji-japan': { entity: 'Japan', year: 1900 },
  'industrial-usa': { entity: 'United States', year: 1900 },
  'usa-frontier-mod': { entity: 'United States', year: 1900 },
  'ottoman-tanzimat': { entity: 'Turkey', year: 1870 },
  'socialist-movement': { entity: 'Germany', year: 1880 },
  'weimar-modern': { entity: 'Germany', year: 1925 },
  'soviet-russia': { entity: 'Russia', year: 1950 },
  'gandhi-india': { entity: 'India', year: 1940 },
  'dutch-em': { entity: 'Netherlands', year: 1700 },
  'tokugawa-em': { entity: 'Japan', year: 1700 },
  'qing-em': { entity: 'China', year: 1700 },
  'mughal-em': { entity: 'India', year: 1600 },
  'china-now': { entity: 'China', year: 2016 },
  'scandinavia-now': { entity: 'Sweden', year: 2016 },
  'southafrica-now': { entity: 'South Africa', year: 2016 },
  'sv-now': { entity: 'United States', year: 2016 },
  'un-now': { entity: 'Switzerland', year: 2016 },
};

// GDP-per-capita (int.$) bands -> drivers (deterministic; see MAPPING.md).
const TRADE_GDPPC = 2000;
const INDUSTRIAL_GDPPC = 3500;
const TECH_GDPPC = 10000;
const YEAR_TOLERANCE = 40; // accept nearest available year within this window

export async function run(atlas) {
  const rows = parseCSVObjects(await download('maddison_owid.csv', MADDISON_URL));
  // entity -> [{year, gdppc, pop}]
  const byEntity = new Map();
  for (const r of rows) {
    const year = parseInt(r.Year, 10);
    const gdppc = parseFloat(r['GDP per capita']);
    const pop = parseFloat(r.Population);
    if (!Number.isFinite(year)) continue;
    if (!byEntity.has(r.Entity)) byEntity.set(r.Entity, []);
    byEntity.get(r.Entity).push({ year, gdppc, pop });
  }
  const byId = new Map(atlas.map((p) => [p.id, p]));

  let enriched = 0;
  let readings = 0;
  for (const [pointId, target] of Object.entries(CROSSWALK)) {
    const point = byId.get(pointId);
    const series = byEntity.get(target.entity);
    if (!point || !series) continue;

    // Nearest year with a GDP-per-capita figure within tolerance.
    const candidates = series
      .filter((s) => Number.isFinite(s.gdppc))
      .map((s) => ({ ...s, dist: Math.abs(s.year - target.year) }))
      .filter((s) => s.dist <= YEAR_TOLERANCE)
      .sort((a, b) => a.dist - b.dist);
    if (!candidates.length) continue;
    const obs = candidates[0];

    if (obs.gdppc >= TRADE_GDPPC) addDriver(point, 'trade_networks');
    if (obs.gdppc >= INDUSTRIAL_GDPPC) addDriver(point, 'industrialization');
    if (obs.gdppc >= TECH_GDPPC) addDriver(point, 'technological_surplus');

    const popStr = Number.isFinite(obs.pop) ? `, population ≈ ${Math.round(obs.pop).toLocaleString('en-US')}` : '';
    const text = `Maddison Project Database 2023 (Bolt & van Zanden 2024) estimates real GDP per capita ≈ $${Math.round(obs.gdppc).toLocaleString('en-US')} (international dollars)${popStr} for ${target.entity}, ${obs.year}. Anchors the point's economic structure (trade integration / industrialization / technological surplus).`;
    addReading(point, 'commerce', makeReading(text, SRC.sourceDataset, SRC.license, {
      confidence: 0.7,
      citationKeys: SRC.citations.map((c) => c.key),
    }));
    for (const cite of SRC.citations) upsertCitation(point, cite, SRC.sourceDataset, SRC.license);
    enriched += 1;
    readings += 1;
  }

  return { source: SRC.sourceDataset, enriched, added: 0, readings };
}
