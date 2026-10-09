// Runtime guard for public/data/atlas.json.
//
// The dataset is a plain static file that anyone can fork and hand-edit, and the
// ingest pipeline pulls text from external sources into it. The renderers assume
// well-formed points (`values.find(...)!`, `STATUS[d.status].cls`, ...), so one
// malformed entry used to be able to blank the whole map. This guard keeps the
// page alive: it normalises what it can, drops what it cannot render safely, and
// reports every drop in the console with the reason.
//
// It is intentionally lenient about *content* (the schema in
// public/data/atlas.schema.json and scripts/validate-data.mjs are the strict
// gate, run in CI) and strict about *shape*: ids, enums, numeric ranges, types.
//
// This is a safety net, not a substitute for escaping: free-text fields still go
// through esc() (lib/escape.ts) wherever they become HTML.
import {
  VALUES, EPOCHS, THREADS, DRIVERS, STATUS, ASPECT_TYPES,
  type AtlasPoint, type AtlasValue, type Aspect, type Reading,
} from '@/lib/schema';

const VALUE_IDS = new Set(VALUES.map((v) => v.id));
const EPOCH_IDS = new Set(EPOCHS.map((e) => e.id));
const THREAD_IDS = new Set(THREADS.map((t) => t.id).filter((id) => id !== 'all'));
const ROLES = new Set(['primary', 'coupled', 'counter']);
const ID_PATTERN = /^[a-z0-9-]+$/;

// Generous cap on any single free-text field. The longest value in the shipped
// data is under 400 characters; this only stops a runaway string from stalling
// the drawer.
const MAX_TEXT = 10_000;

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function text(v: unknown): string | undefined {
  return typeof v === 'string' ? v.slice(0, MAX_TEXT) : undefined;
}

function unit(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : undefined;
}

function textList(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.filter((s): s is string => typeof s === 'string').map((s) => s.slice(0, MAX_TEXT));
}

function cleanReading(r: unknown): Reading | null {
  if (!isObj(r)) return null;
  const body = text(r.text);
  if (!body) return null;
  const out: Reading = { text: body };
  const conf = unit(r.confidence);
  if (conf !== undefined) out.confidence = conf;
  if (typeof r.contested === 'boolean') out.contested = r.contested;
  const note = text(r.contestNote);
  if (note !== undefined) out.contestNote = note;
  const sources = textList(r.sources);
  if (sources) out.sources = sources;
  const keys = textList(r.citationKeys);
  if (keys) out.citationKeys = keys;
  const license = text(r.license);
  if (license !== undefined) out.license = license;
  const dataset = text(r.sourceDataset);
  if (dataset !== undefined) out.sourceDataset = dataset;
  if (isObj(r.translations)) {
    const tr: Record<string, string> = {};
    for (const [k, val] of Object.entries(r.translations)) {
      if (typeof val === 'string') tr[k] = val.slice(0, MAX_TEXT);
    }
    out.translations = tr;
  }
  return out;
}

function cleanAspect(a: unknown): Aspect | null {
  if (!isObj(a) || typeof a.type !== 'string' || !(a.type in ASPECT_TYPES)) return null;
  if (!Array.isArray(a.readings)) return null;
  const readings = a.readings.map(cleanReading).filter((r): r is Reading => r !== null);
  if (!readings.length) return null;
  return { type: a.type as Aspect['type'], readings };
}

function cleanValues(v: unknown): AtlasValue[] | null {
  if (!Array.isArray(v)) return null;
  const out: AtlasValue[] = [];
  for (const item of v) {
    if (!isObj(item)) continue;
    if (typeof item.valueId !== 'string' || !VALUE_IDS.has(item.valueId)) continue;
    if (typeof item.role !== 'string' || !ROLES.has(item.role)) continue;
    const intensity = unit(item.intensity);
    if (intensity === undefined) continue;
    out.push({ valueId: item.valueId, intensity, role: item.role as AtlasValue['role'] });
  }
  // The map and the drawer both need a primary value to draw anything.
  return out.some((x) => x.role === 'primary') ? out : null;
}

// Returns the cleaned point, or a string explaining why it was dropped.
function cleanPoint(p: unknown): AtlasPoint | string {
  if (!isObj(p)) return 'not an object';
  if (typeof p.id !== 'string' || !ID_PATTERN.test(p.id)) return 'missing or malformed id';
  if (typeof p.lat !== 'number' || !Number.isFinite(p.lat) || p.lat < -90 || p.lat > 90) return 'lat out of range';
  if (typeof p.lng !== 'number' || !Number.isFinite(p.lng) || p.lng < -180 || p.lng > 180) return 'lng out of range';
  if (typeof p.epoch !== 'string' || !EPOCH_IDS.has(p.epoch)) return `unknown epoch "${String(p.epoch)}"`;
  if (typeof p.status !== 'string' || !(p.status in STATUS)) return `unknown status "${String(p.status)}"`;
  const region = text(p.region);
  if (!region) return 'missing region';
  const values = cleanValues(p.values);
  if (!values) return 'no valid primary value';

  const thread = typeof p.thread === 'string' && THREAD_IDS.has(p.thread) ? p.thread : 'none';
  const drivers = (Array.isArray(p.drivers) ? p.drivers : [])
    .filter((d): d is string => typeof d === 'string' && d in DRIVERS);

  const point: AtlasPoint = {
    id: p.id,
    region,
    thread,
    lat: p.lat,
    lng: p.lng,
    epoch: p.epoch,
    values,
    drivers,
    status: p.status,
    evidence: typeof p.evidence === 'string' ? p.evidence : 'speculative',
    confidence: unit(p.confidence) ?? 0.5,
    contested: p.contested === true,
    note: text(p.note) ?? '',
  };

  const contestNote = text(p.contestNote);
  if (contestNote !== undefined) point.contestNote = contestNote;
  const altReading = text(p.altReading);
  if (altReading !== undefined) point.altReading = altReading;
  const cost = text(p.cost);
  if (cost !== undefined) point.cost = cost;
  const successor = text(p.successor);
  if (successor !== undefined) point.successor = successor;
  const artifact = text(p.artifact);
  if (artifact !== undefined) point.artifact = artifact;
  const sources = textList(p.sources);
  if (sources) point.sources = sources;
  if (typeof p.schemaVersion === 'number' && Number.isInteger(p.schemaVersion)) point.schemaVersion = p.schemaVersion;
  if (Array.isArray(p.aspects)) {
    const aspects = p.aspects.map(cleanAspect).filter((a): a is Aspect => a !== null);
    if (aspects.length) point.aspects = aspects;
  }
  // `media` and `bibliography` are not rendered yet. They are passed through as
  // plain arrays; whoever renders them must escape every field (lib/escape.ts).
  if (Array.isArray(p.media)) point.media = p.media as AtlasPoint['media'];
  if (Array.isArray(p.bibliography)) point.bibliography = p.bibliography as AtlasPoint['bibliography'];
  return point;
}

export interface SanitizedAtlas {
  points: AtlasPoint[];
  problems: string[];
}

export function sanitizeAtlas(raw: unknown): SanitizedAtlas {
  if (!Array.isArray(raw)) return { points: [], problems: ['dataset is not an array'] };
  const points: AtlasPoint[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const result = cleanPoint(item);
    if (typeof result === 'string') {
      const label = isObj(item) && typeof item.id === 'string' ? item.id : `#${index}`;
      problems.push(`dropped ${label}: ${result}`);
      return;
    }
    if (seen.has(result.id)) {
      problems.push(`dropped ${result.id}: duplicate id`);
      return;
    }
    seen.add(result.id);
    points.push(result);
  });
  return { points, problems };
}
