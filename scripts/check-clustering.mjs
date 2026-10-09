#!/usr/bin/env node
// Regression test for density-aware grouping (lib/density.ts) and the group drawer.
//
//   pnpm test:clustering
//
// The promise this feature makes is "nothing is removed or hidden": grouping only
// changes how points are *drawn*. So the checks that matter most are
// conservation (every point lands in exactly one group, at every zoom, in every
// epoch, whatever order the input arrives in) and determinism.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTs, root } from './lib/load-ts.mjs';

const { clusterPoints, summarizeCluster, dominantDriver, epochDensity, densityBarPx, CLUSTER_RADIUS_PX } = loadTs('lib/density.ts');
const { buildClusterBody, clusterTitle } = loadTs('components/atlas/clusterContent.ts');

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) { failures++; console.error(`FAIL  ${name}${detail ? `\n      ${detail}` : ''}`); }
  else console.log(`ok    ${name}`);
};

// Web-Mercator projection at a given zoom, as Leaflet's default CRS does it.
function projector(zoom) {
  const size = 256 * 2 ** zoom;
  return (p) => {
    const lat = Math.max(-85.0511, Math.min(85.0511, p.lat)) * Math.PI / 180;
    return {
      x: ((p.lng + 180) / 360) * size,
      y: (0.5 - Math.log(Math.tan(Math.PI / 4 + lat / 2)) / (2 * Math.PI)) * size,
    };
  };
}

const atlas = JSON.parse(readFileSync(join(root, 'public', 'data', 'atlas.json'), 'utf8'));
const EPOCHS = [...new Set(atlas.map((p) => p.epoch))];
const ZOOMS = [2, 2.2, 3, 4, 5, 6, 7];

// Deterministic shuffle (no Math.random: keeps failures reproducible).
function shuffled(list, seed) {
  const a = [...list];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const partition = (clusters) => clusters.map((c) => c.members.map((m) => m.id).sort().join(',')).sort().join('|');

// ── conservation, locality, determinism on the real data ──
let conserved = true, local = true, deterministic = true, separated = true, detail = '';
for (const epoch of EPOCHS) {
  const pts = atlas.filter((p) => p.epoch === epoch);
  for (const z of ZOOMS) {
    const project = projector(z);
    const clusters = clusterPoints(pts, project, CLUSTER_RADIUS_PX);

    const ids = clusters.flatMap((c) => c.members.map((m) => m.id));
    if (ids.length !== pts.length || new Set(ids).size !== pts.length) {
      conserved = false; detail = `${epoch} z${z}: ${ids.length} placed, ${new Set(ids).size} unique, ${pts.length} expected`;
    }
    for (const c of clusters) {
      const lead = project(c.members[0]);
      for (const m of c.members) {
        const q = project(m);
        if (Math.hypot(q.x - lead.x, q.y - lead.y) > CLUSTER_RADIUS_PX + 1e-9) { local = false; detail = `${epoch} z${z}: ${m.id} is too far from its leader`; }
      }
    }
    // two different leaders must be farther apart than the radius (or they would have merged)
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const a = project(clusters[i].members[0]), b = project(clusters[j].members[0]);
        if (Math.hypot(a.x - b.x, a.y - b.y) <= CLUSTER_RADIUS_PX) { separated = false; detail = `${epoch} z${z}: two leaders within the radius`; }
      }
    }
    if (partition(clusterPoints(shuffled(pts, 7), project)) !== partition(clusterPoints(shuffled(pts, 99), project))) {
      deterministic = false; detail = `${epoch} z${z}: result depends on input order`;
    }
  }
}
check(`conservation: every point is in exactly one group (${EPOCHS.length} epochs x ${ZOOMS.length} zooms)`, conserved, detail);
check('locality: members are within the radius of their group leader', local, detail);
check('separation: distinct groups are farther apart than the radius', separated, detail);
check('determinism: same groups whatever the input order', deterministic, detail);

// ── synthetic crowd: grouping must collapse at world zoom and open up when zoomed in ──
const fakeCrowd = Array.from({ length: 100 }, (_, i) => ({
  id: `crowd-${i}`, region: `Crowd ${i}`, thread: 'oceania', lat: 5 + (i % 10) * 0.5, lng: 120 + Math.floor(i / 10) * 0.5,
  epoch: 'modern', values: [{ valueId: 'piety', intensity: 0.5 + (i % 5) / 10, role: 'primary' }],
  drivers: [], status: 'adaptive', evidence: 'ethnographic', confidence: 0.8, contested: false, note: '',
}));
const wide = clusterPoints(fakeCrowd, projector(2.2));
const near = clusterPoints(fakeCrowd, projector(7));
check('a 100-point crowd in a 5-degree box becomes a single group at world zoom', wide.length === 1 && wide[0].members.length === 100, `got ${wide.length} groups`);
check('...and opens up into many groups at the maximum zoom', near.length > 20, `got ${near.length} groups`);
check('...without losing any point at either zoom', wide[0].members.length === 100 && near.reduce((n, c) => n + c.members.length, 0) === 100);

// ── antimeridian: pixel-space grouping must not merge Fiji with Tonga ──
const base = (id, lng) => ({ ...fakeCrowd[0], id, lat: -17, lng });
let wrapped = false;
for (const z of ZOOMS) {
  const cl = clusterPoints([base('fiji', 178), base('tonga', -175)], projector(z));
  if (cl.length !== 2) wrapped = true;
}
check('points either side of the antimeridian are never merged across the map', !wrapped);

// ── summary ──
const oc = atlas.filter((p) => p.thread === 'oceania' && p.epoch === 'modern');
const sum = summarizeCluster(oc);
check('summary: count matches', sum.count === oc.length);
check('summary: primary-value counts add up to the group size', sum.values.reduce((n, v) => n + v.count, 0) === oc.length);
check('summary: thread counts add up to the group size', sum.threads.reduce((n, t) => n + t.count, 0) === oc.length);
check('summary: evidence counts add up to the group size', sum.evidence.reduce((n, e) => n + e.count, 0) === oc.length);
check('summary: named datasets + curated cover every member', sum.curated + sum.datasets.reduce((n, d) => n + d.count, 0) >= oc.length);
check('summary: values are sorted most common first', sum.values.every((v, i, a) => i === 0 || a[i - 1].count >= v.count));
check('dominantDriver is stable and null-safe', dominantDriver([], ['x']) === null
  && dominantDriver([{ drivers: ['b'] }, { drivers: ['a'] }], ['a', 'b']) === 'a');

// ── timeline density ──
const dens = epochDensity(atlas, ['hunter', 'modern', 'nonexistent']);
check('epochDensity counts per epoch and reports the max', dens.counts.modern === atlas.filter((p) => p.epoch === 'modern').length && dens.counts.nonexistent === 0 && dens.max === dens.counts.modern);
check('density bar: an empty epoch has no bar', densityBarPx(0, 94) === 0);
check('density bar: the fullest epoch reaches full height', densityBarPx(94, 94) === 12);
check('density bar: log scale keeps small epochs visible', densityBarPx(1, 94) >= 2 && densityBarPx(1, 94) < densityBarPx(6, 94));
check('density bar: log scale does not flatten mid-sized epochs', densityBarPx(46, 94) >= 9);

// ── group drawer ──
const hostile = structuredClone(oc.slice(0, 3));
hostile[0].region = `<img src=x onerror=alert('r')>`;
hostile[1].id = 'ok-id';
hostile[2].aspects = [{ type: 'values-synthesis', readings: [{ text: 't', sourceDataset: `<script>alert('d')</script>` }] }];
const html = buildClusterBody(hostile);
check('group drawer: no raw <img> or <script> from data', !/<img\b/i.test(html) && !/<script\b/i.test(html));
check('group drawer: hostile text is present, escaped', html.includes('&lt;img src=x') && html.includes('&lt;script&gt;'));
check('group drawer: every member appears once as a clickable row', (html.match(/class="cl-row"/g) || []).length === hostile.length);
check('group drawer: has the zoom button and a title with the count', html.includes('class="cl-zoom"') && /^\d+ /.test(clusterTitle(88)));

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll clustering checks passed.');
process.exit(failures ? 1 : 0);
