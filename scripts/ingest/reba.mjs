// Reba / Reitsma / Seto (2016) historical urbanization ingestion.
//
// Source: "Spatializing 6,000 years of global urbanization from 3700 BC to AD
// 2000" (Scientific Data, doi:10.1038/sdata.2016.34; SEDAC/Harvard Dataverse
// doi:10.7910/DVN/LMCQGX). CC-BY-4.0.
//
// Role: geo/temporal backbone. ENRICHES existing atlas points (never adds/
// removes points). For each point we find the nearest recorded urban
// settlement(s) within REBA_RADIUS_KM whose snapshot year maps to the point's
// epoch, take the largest, and:
//   - union institutional_scale / trade_networks drivers by population band
//   - attach a factual `commerce` reading (city, population, year) with the
//     source's geolocation reliability mapped to the reading's confidence.
// Every reading + citation carries sourceDataset + license + DOI (Path A).

import {
  download, parseCSVObjects, yearToEpoch, haversineKm,
  makeReading, addReading, addDriver, upsertCitation,
} from './lib.mjs';
import { SOURCES } from './sources.mjs';

const SRC = SOURCES.reba;
const REBA_URL = 'https://raw.githubusercontent.com/lennertVanSever/historic-global-urbanization/master/data/data.csv';

// Match radius: atlas points are coarse civilization centroids, so allow a
// generous but same-epoch-constrained radius. Documented in MAPPING.md.
const REBA_RADIUS_KM = 300;

// Population -> driver bands (deterministic; see MAPPING.md).
const POP_INSTITUTIONAL = 10000; // a standing urban administrative center
const POP_TRADE = 30000; // a large city implies trade-network integration

// SEDAC "Certainty" geolocation reliability (1 best .. 3 weakest) -> confidence.
const RELIABILITY_CONF = { 1: 0.8, 2: 0.6, 3: 0.4 };

function parseYearColumn(col) {
  const m = /^(BC|AD)_(\d+)$/.exec(col);
  if (!m) return null;
  const n = parseInt(m[2], 10);
  return m[1] === 'BC' ? -n : n;
}

function yearLabel(year) {
  return year < 0 ? `${-year} BCE` : `${year} CE`;
}

export async function run(atlas) {
  const rows = parseCSVObjects(await download('reba_urbanization.csv', REBA_URL));

  // Identify the year columns once.
  const yearCols = Object.keys(rows[0])
    .map((c) => ({ col: c, year: parseYearColumn(c) }))
    .filter((x) => x.year !== null);

  // Flatten to {lat,lng,city,reliability,year,pop} observations.
  const obs = [];
  for (const r of rows) {
    const lat = parseFloat(r.Latitude);
    const lng = parseFloat(r.Longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const reliability = parseInt(r.Certainty, 10);
    for (const { col, year } of yearCols) {
      const v = r[col];
      if (v === undefined || v === '') continue;
      const pop = parseInt(v, 10);
      if (!Number.isFinite(pop) || pop <= 0) continue;
      obs.push({ lat, lng, city: r.City, reliability, year, pop, epoch: yearToEpoch(year) });
    }
  }

  let enriched = 0;
  let readings = 0;
  for (const p of atlas) {
    // Candidate urban observations near this point AND in its epoch.
    const near = obs.filter((o) => o.epoch === p.epoch
      && haversineKm(p.lat, p.lng, o.lat, o.lng) <= REBA_RADIUS_KM);
    if (!near.length) continue;

    // Largest recorded settlement is the representative one for this point/epoch.
    near.sort((a, b) => b.pop - a.pop);
    const top = near[0];
    const distinctCities = new Set(near.map((o) => o.city)).size;

    if (top.pop >= POP_INSTITUTIONAL) addDriver(p, 'institutional_scale');
    if (top.pop >= POP_TRADE) addDriver(p, 'trade_networks');

    const conf = RELIABILITY_CONF[top.reliability] ?? 0.5;
    const others = distinctCities > 1 ? ` (largest of ${distinctCities} urban centres mapped nearby in this epoch)` : '';
    const text = `Reba, Reitsma & Seto (2016) map an urban settlement near here in the ${p.epoch} era: ${top.city}, ~${top.pop.toLocaleString('en-US')} inhabitants c. ${yearLabel(top.year)}${others}. Indicates standing urban scale and trade-network integration.`;

    addReading(p, 'commerce', makeReading(text, SRC.sourceDataset, SRC.license, {
      confidence: conf,
      citationKeys: SRC.citations.map((c) => c.key),
    }));
    for (const cite of SRC.citations) upsertCitation(p, cite, SRC.sourceDataset, SRC.license);
    enriched += 1;
    readings += 1;
  }

  return { source: SRC.sourceDataset, enriched, added: 0, readings };
}
