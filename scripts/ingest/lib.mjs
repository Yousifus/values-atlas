// Shared library for the Tier 1 dataset ingestion framework.
//
// Responsibilities:
//   - download + cache raw source files (idempotent, re-runnable offline once cached)
//   - parse CSV deterministically
//   - map a calendar year -> atlas epoch id (nearest representative epoch)
//   - haversine geo-distance + nearest-point matching
//   - load / save atlas.json with stable 2-space formatting + trailing newline
//   - stamp provenance (sourceDataset + license + citation) on readings/citations
//   - strip a single source's prior contributions so every run is idempotent
//
// No source-specific logic lives here; each scripts/ingest/<source>.mjs module
// imports these helpers. Nothing here invents scholarship — it only moves
// already-coded facts into the schema with mandatory provenance.

import {
  readFileSync, writeFileSync, mkdirSync, existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');
export const DATA_PATH = join(ROOT, 'public', 'data', 'atlas.json');
export const CACHE_DIR = join(__dirname, '.cache');

// ─────────────────────────── downloading ───────────────────────────

/**
 * Fetch a URL once and cache it under .cache/<name>. Subsequent runs read the
 * cached copy, so the pipeline is re-runnable offline after a first online run.
 * Pass { force:true } to re-download.
 */
export async function download(name, url, { force = false, binary = false } = {}) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const dest = join(CACHE_DIR, name);
  if (existsSync(dest) && !force) {
    return binary ? readFileSync(dest) : readFileSync(dest, 'utf8');
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'values-atlas-ingest' } });
  if (!res.ok) throw new Error(`download ${name}: HTTP ${res.status} for ${url}`);
  if (binary) {
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    return buf;
  }
  const txt = await res.text();
  writeFileSync(dest, txt, 'utf8');
  return txt;
}

// ─────────────────────────── CSV parsing ───────────────────────────

/** RFC-4180-ish CSV parser (handles quotes, escaped quotes, embedded commas/newlines). */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, ''); // strip BOM
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c === '\r') {
      // ignore; handled by \n
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Parse CSV into an array of objects keyed by the header row. */
export function parseCSVObjects(text) {
  const rows = parseCSV(text).filter((r) => r.length && !(r.length === 1 && r[0] === ''));
  if (!rows.length) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => { o[h] = r[i] !== undefined ? r[i] : ''; });
    return o;
  });
}

// ─────────────────────────── epochs ───────────────────────────

// Representative calendar year for each atlas epoch (negative = BCE). These are
// the same anchors the UI uses (lib/schema.ts EPOCHS "short" labels), expressed
// numerically so source years can be assigned deterministically.
export const EPOCH_YEARS = [
  ['hunter', -100000],
  ['early-agr', -10000],
  ['bronze', -3000],
  ['iron', -1200],
  ['axial', -500],
  ['imperial', 200],
  ['medieval', 1000],
  ['early-mod', 1600],
  ['industrial', 1820],
  ['modern', 1900],
  ['now', 2020],
];

/**
 * Map a calendar year to the epoch whose representative anchor year is nearest.
 * Deterministic; ties break toward the earlier epoch. Documented in MAPPING.md.
 */
export function yearToEpoch(year) {
  let best = EPOCH_YEARS[0][0];
  let bestDist = Infinity;
  for (const [id, anchor] of EPOCH_YEARS) {
    const d = Math.abs(year - anchor);
    if (d < bestDist) { bestDist = d; best = id; }
  }
  return best;
}

// ─────────────────────────── geo ───────────────────────────

const R_EARTH_KM = 6371;
const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in km between two lat/lng pairs. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Nearest atlas point to (lat,lng), optionally restricted to an epoch & radius. */
export function nearestPoint(atlas, lat, lng, { epoch = null, maxKm = Infinity } = {}) {
  let best = null;
  let bestKm = Infinity;
  for (const p of atlas) {
    if (epoch && p.epoch !== epoch) continue;
    const km = haversineKm(lat, lng, p.lat, p.lng);
    if (km < bestKm) { bestKm = km; best = p; }
  }
  if (!best || bestKm > maxKm) return null;
  return { point: best, km: bestKm };
}

// ─────────────────────────── atlas IO ───────────────────────────

export function loadAtlas() {
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(data)) throw new Error('atlas.json did not parse to an array');
  return data;
}

export function saveAtlas(atlas) {
  writeFileSync(DATA_PATH, `${JSON.stringify(atlas, null, 2)}\n`, 'utf8');
}

// ─────────────────────────── provenance + merge ───────────────────────────

/**
 * Build a reading object that always carries provenance. `extra` may set
 * confidence, contested, contestNote, citationKeys, sources, etc.
 */
export function makeReading(text, sourceDataset, license, extra = {}) {
  const r = { text };
  if (typeof extra.confidence === 'number') r.confidence = extra.confidence;
  if (typeof extra.contested === 'boolean') r.contested = extra.contested;
  if (extra.contestNote) r.contestNote = extra.contestNote;
  if (Array.isArray(extra.sources) && extra.sources.length) r.sources = extra.sources;
  if (Array.isArray(extra.citationKeys) && extra.citationKeys.length) r.citationKeys = extra.citationKeys;
  // Provenance (Path A) — mandatory on every ingested reading.
  r.license = license;
  r.sourceDataset = sourceDataset;
  return r;
}

/** Find or create an aspect of `type` on a point; returns the aspect. */
export function ensureAspect(point, type) {
  if (!Array.isArray(point.aspects)) point.aspects = [];
  let a = point.aspects.find((x) => x.type === type);
  if (!a) { a = { type, readings: [] }; point.aspects.push(a); }
  return a;
}

/** Add a reading to an aspect, deduped by exact text+sourceDataset. */
export function addReading(point, type, reading) {
  const a = ensureAspect(point, type);
  const dup = a.readings.some((r) => r.text === reading.text && r.sourceDataset === reading.sourceDataset);
  if (!dup) a.readings.push(reading);
}

/** Union a driver onto a point (additive; never removes existing drivers). */
export function addDriver(point, driverId) {
  if (!Array.isArray(point.drivers)) point.drivers = [];
  if (!point.drivers.includes(driverId)) point.drivers.push(driverId);
}

/** Add a value entry only if the valueId is not already present (never mutate existing). */
export function addValueIfAbsent(point, valueId, intensity, role) {
  if (!Array.isArray(point.values)) point.values = [];
  if (point.values.some((v) => v.valueId === valueId)) return false;
  point.values.push({ valueId, intensity, role });
  return true;
}

/** Upsert a bibliography citation keyed by `key`; always stamps provenance. */
export function upsertCitation(point, citation, sourceDataset, license) {
  if (!Array.isArray(point.bibliography)) point.bibliography = [];
  const stamped = { ...citation, license, sourceDataset };
  const i = point.bibliography.findIndex((c) => c.key === citation.key);
  if (i >= 0) point.bibliography[i] = stamped; else point.bibliography.push(stamped);
}

/**
 * Remove every prior contribution of a given sourceDataset so a re-run is
 * idempotent. Strips tagged readings, empty aspects we created, tagged
 * bibliography entries, and (optionally) whole points by id prefix.
 * NB: union-added drivers/values cannot be tagged individually, so they are
 * left in place; re-running recomputes the same deterministic set.
 */
export function stripSource(atlas, sourceDataset, { pointIdPrefix = null } = {}) {
  let next = atlas;
  if (pointIdPrefix) {
    // New points added by this source use a stable id prefix, so we can drop
    // them wholesale before re-adding (full replace from source = idempotent).
    next = next.filter((p) => !p.id.startsWith(pointIdPrefix));
  }
  for (const p of next) {
    if (Array.isArray(p.aspects)) {
      for (const a of p.aspects) {
        a.readings = a.readings.filter((r) => r.sourceDataset !== sourceDataset);
      }
      // Drop aspects that became empty (only ingestion readings lived there).
      p.aspects = p.aspects.filter((a) => a.readings.length > 0);
      if (!p.aspects.length) delete p.aspects;
    }
    if (Array.isArray(p.bibliography)) {
      p.bibliography = p.bibliography.filter((c) => c.sourceDataset !== sourceDataset);
      if (!p.bibliography.length) delete p.bibliography;
    }
  }
  return next;
}

/** Ensure a point declares the additive schemaVersion 2 once it carries aspects. */
export function bumpSchemaVersion(point) {
  if (Array.isArray(point.aspects) && point.aspects.length && !point.schemaVersion) {
    point.schemaVersion = 2;
  }
}
