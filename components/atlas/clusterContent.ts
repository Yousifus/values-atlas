// ═══════════════════════ CLUSTER (GROUP) DRAWER CONTENT ═══════════════════════
// When several points sit too close together to draw apart at the current zoom,
// the map shows one bubble (see lib/density.ts). Clicking it opens this summary:
// what the group is made of, where its readings come from, and every member, one
// click from its full reading. It is built as an HTML string and injected like the
// per-point drawer (drawerContent.ts), so the same rule applies: anything that
// comes from atlas.json goes through esc().
import { VALUES, EVIDENCE_COLORS, type AtlasPoint } from '@/lib/schema';
import { t, tValue, tThread, tEvidence } from '@/lib/i18n';
import { esc } from '@/lib/escape';
import { summarizeCluster, primaryOf } from '@/lib/density';

const VALUE_MAP = new Map(VALUES.map((v) => [v.id, v]));
const TOP_VALUES = 6;

export function clusterTitle(count: number): string {
  return `${count} ${t('clusterGrouped')}`;
}

function pct(n: number): number {
  return Math.round(n * 100);
}

export function buildClusterBody(members: AtlasPoint[]): string {
  const s = summarizeCluster(members);

  const intro = `<div class="dsec">
    <p class="cl-note">${esc(t('clusterNote'))}</p>
    <button class="cl-zoom" type="button">${esc(t('clusterZoom'))}</button>
  </div>`;

  const valueRows = s.values.slice(0, TOP_VALUES).map((v) => {
    const val = VALUE_MAP.get(v.valueId);
    if (!val) return '';
    return `<div class="vrow">
      <span class="vico" style="color:${val.color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${val.icon}</svg></span>
      <span class="vrow-name">${esc(tValue(v.valueId))}</span>
      <div class="ibar-wrap" style="width:96px"><div class="ibar"><div class="ibar-fill" style="width:${pct(v.share)}%;background:${val.color}"></div></div><div class="ibar-label">${v.count}</div></div>
    </div>`;
  }).join('');
  const values = valueRows
    ? `<div class="dsec"><div class="dsec-title">${esc(t('clusterTopValues'))}</div>${valueRows}</div>`
    : '';

  const threads = s.threads.length
    ? `<div class="dsec"><div class="dsec-title">${esc(t('clusterThreads'))}</div><div class="cl-meta">${
      s.threads.map((x) => `<span>${esc(x.thread === 'none' ? '—' : tThread(x.thread))} <b>${x.count}</b></span>`).join('')
    }</div></div>`
    : '';

  // Provenance, said plainly: how many members come from each source dataset,
  // and how many are hand-curated. This is where a bulk import shows itself.
  const sourceItems = s.datasets.map((d) => `<span>${esc(d.name)} <b>${d.count}</b></span>`);
  if (s.curated) sourceItems.push(`<span>${esc(t('clusterCurated'))} <b>${s.curated}</b></span>`);
  const sources = sourceItems.length
    ? `<div class="dsec"><div class="dsec-title">${esc(t('clusterSources'))}</div><div class="cl-meta">${sourceItems.join('')}</div></div>`
    : '';

  const evidence = s.evidence.length
    ? `<div class="dsec"><div class="dsec-title">${esc(t('secEvidence'))}</div><div class="cl-meta">${
      s.evidence.map((e) => `<span><i class="ev-dot" style="background:${EVIDENCE_COLORS[e.evidence] || '#607580'}"></i>${esc(tEvidence(e.evidence))} <b>${e.count}</b></span>`).join('')
    }<span>${pct(s.meanConfidence)}% ${esc(t('conf'))}</span>${
      s.contested ? `<span style="color:#e68a44">⚠ ${esc(t('contestedTitle'))} <b>${s.contested}</b></span>` : ''
    }</div></div>`
    : '';

  const rows = [...members]
    .sort((a, b) => (a.region < b.region ? -1 : a.region > b.region ? 1 : a.id < b.id ? -1 : 1))
    .map((m) => {
      const prim = primaryOf(m);
      const val = prim ? VALUE_MAP.get(prim.valueId) : undefined;
      return `<button class="cl-row" type="button" data-pid="${esc(m.id)}">
        <span class="cl-dot" style="background:${val ? val.color : '#524e43'}"></span>
        <span class="cl-name">${esc(m.region)}</span>
        <span class="cl-sub">${val ? esc(tValue(val.id)) : ''} · ${pct(m.confidence)}%</span>
      </button>`;
    }).join('');
  const list = `<div class="dsec"><div class="dsec-title">${esc(t('clusterMembers'))} · ${members.length}</div><div class="cl-list">${rows}</div></div>`;

  return intro + values + threads + sources + evidence + list;
}
