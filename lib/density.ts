// Density-aware presentation of the dataset.
//
// Why this exists: the atlas is meant to privilege no single region, era or
// source (see README "Project philosophy"). Bulk imports can still pile hundreds
// of points into a few places and eras (137 of the first 204 points came from one
// dataset, all clumped across the Pacific and Southeast Asia). Deleting data to
// fix that would be wrong, so balance is handled in the *view*: points that would
// overlap at the current zoom are grouped into one bubble, the group says what is
// in it, and every member stays one click away. Nothing is dropped or hidden.
//
// Everything here is pure (no DOM, no Leaflet) so it can be tested directly:
// scripts/check-clustering.mjs.
import type { AtlasPoint } from '@/lib/schema';

export interface XY { x: number; y: number }

export interface Cluster {
  /** Strongest point first (the cluster's "leader"), then by id. Never empty. */
  members: AtlasPoint[];
  /** Centroid of the members in the same projected pixel space as the input. */
  x: number;
  y: number;
}

/** Two markers closer than this many pixels would visibly overlap. */
export const CLUSTER_RADIUS_PX = 38;

export function primaryOf(p: AtlasPoint) {
  return p.values.find((v) => v.role === 'primary');
}

function strength(p: AtlasPoint): number {
  return primaryOf(p)?.intensity ?? 0;
}

function byStrength(a: AtlasPoint, b: AtlasPoint): number {
  return strength(b) - strength(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * Greedy leader clustering in projected pixel space.
 *
 * Points are visited strongest first; each joins the nearest existing leader
 * within `radius` pixels, otherwise becomes a new leader. Properties the tests
 * rely on:
 *   - conservation: every input point lands in exactly one cluster
 *   - determinism: same input, same output, regardless of input order
 *   - locality: a point is only ever grouped with a leader within `radius`
 */
export function clusterPoints(
  points: AtlasPoint[],
  project: (p: AtlasPoint) => XY,
  radius: number = CLUSTER_RADIUS_PX,
): Cluster[] {
  const leaders: { ax: number; ay: number; sx: number; sy: number; members: AtlasPoint[] }[] = [];
  for (const p of [...points].sort(byStrength)) {
    const { x, y } = project(p);
    let best: (typeof leaders)[number] | null = null;
    let bestDist = Infinity;
    for (const c of leaders) {
      const d = Math.hypot(x - c.ax, y - c.ay);
      if (d <= radius && d < bestDist) { best = c; bestDist = d; }
    }
    if (best) {
      best.members.push(p);
      best.sx += x;
      best.sy += y;
    } else {
      leaders.push({ ax: x, ay: y, sx: x, sy: y, members: [p] });
    }
  }
  return leaders.map((c) => ({ members: c.members, x: c.sx / c.members.length, y: c.sy / c.members.length }));
}

// ───────────────────────────── group summary ─────────────────────────────

export interface ClusterSummary {
  count: number;
  /** Primary values across the members, most common first. */
  values: { valueId: string; count: number; share: number }[];
  threads: { thread: string; count: number }[];
  evidence: { evidence: string; count: number }[];
  /** Source datasets named in the members' readings, by number of members. */
  datasets: { name: string; count: number }[];
  /** Members that name no source dataset (hand-curated entries). */
  curated: number;
  meanConfidence: number;
  contested: number;
}

function tally(keys: string[]): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
}

function datasetsOf(p: AtlasPoint): string[] {
  const names = new Set<string>();
  for (const aspect of p.aspects ?? []) {
    for (const reading of aspect.readings) {
      if (reading.sourceDataset) names.add(reading.sourceDataset);
    }
  }
  return [...names];
}

export function summarizeCluster(members: AtlasPoint[]): ClusterSummary {
  const count = members.length;
  const prim = tally(members.map((m) => primaryOf(m)?.valueId).filter((v): v is string => !!v));
  const datasetNames = members.flatMap(datasetsOf);
  return {
    count,
    values: prim.map((v) => ({ valueId: v.key, count: v.count, share: count ? v.count / count : 0 })),
    threads: tally(members.map((m) => m.thread)).map((t) => ({ thread: t.key, count: t.count })),
    evidence: tally(members.map((m) => m.evidence)).map((e) => ({ evidence: e.key, count: e.count })),
    datasets: tally(datasetNames).map((d) => ({ name: d.key, count: d.count })),
    curated: members.filter((m) => datasetsOf(m).length === 0).length,
    meanConfidence: count ? members.reduce((s, m) => s + m.confidence, 0) / count : 0,
    contested: members.filter((m) => m.contested).length,
  };
}

/**
 * The most common entry of `pool` among the members' drivers, for colouring a
 * cluster under the ecological / institutional lenses. Ties break alphabetically
 * so the colour never flickers between renders.
 */
export function dominantDriver(members: AtlasPoint[], pool: string[]): string | null {
  const hits = members.flatMap((m) => m.drivers.filter((d) => pool.includes(d)));
  return hits.length ? tally(hits)[0].key : null;
}

// ───────────────────────────── timeline density ─────────────────────────────

export interface EpochDensity {
  counts: Record<string, number>;
  max: number;
}

export function epochDensity(points: AtlasPoint[], epochIds: string[]): EpochDensity {
  const counts: Record<string, number> = {};
  for (const id of epochIds) counts[id] = 0;
  for (const p of points) if (p.epoch in counts) counts[p.epoch]++;
  return { counts, max: Math.max(0, ...Object.values(counts)) };
}

/**
 * Bar height for the timeline density strip. Log-scaled, so one crowded epoch
 * does not flatten the rest into invisibility (the same principle the Atlas
 * hex-map uses for territory area). Empty epochs get no bar at all: an empty
 * epoch should read as empty, not as a short bar.
 */
export function densityBarPx(count: number, max: number, maxPx = 12): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.max(2, Math.round((maxPx * Math.log1p(count)) / Math.log1p(max)));
}
