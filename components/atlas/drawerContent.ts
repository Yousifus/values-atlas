// ═══════════════════════ DRAWER CONTENT BUILDERS ═══════════════════════
// The detail drawer body (value structure, ideological compass, lineage,
// drivers, status/evidence, readings, artifact/sources) is rich, deeply
// styled, and tied to the original CSS. To preserve it byte-faithfully it is
// produced here as HTML strings (exactly as the original imperative app did)
// and injected into the shadcn Sheet body via `dangerouslySetInnerHTML`. The
// lineage rows expose `data-epid`/`data-pid` so React can rewire their clicks.
import {
  VALUES, EPOCHS, DRIVERS, STATUS, EVIDENCE_COLORS, ASPECT_TYPES,
  type AtlasPoint, type Aspect, type Reading,
} from '@/lib/schema';
import {
  t, tValue, tDriver, tEpoch, tThread, tStatus, tEvidence, tAspect,
} from '@/lib/i18n';

const VALUE_MAP = new Map(VALUES.map((v) => [v.id, v]));

const COMPASS_PAIRS = [
  ['collectivism', 'individualism'],
  ['hierarchy', 'egalitarianism'],
  ['piety', 'curiosity'],
];

function buildCompassHTML(d: AtlasPoint) {
  const intens: Record<string, number> = {};
  d.values.forEach((v) => { intens[v.valueId] = v.intensity; });
  const rows = COMPASS_PAIRS.map(([lid, rid]) => {
    const l = intens[lid] || 0;
    const r = intens[rid] || 0;
    if (l === 0 && r === 0) return '';
    const lv = VALUE_MAP.get(lid)!, rv = VALUE_MAP.get(rid)!;
    const posRight = (r / (l + r)) * 100;
    const leanLeft = l >= r;
    return `<div class="cmp-row">
      <div class="cmp-head">
        <span class="cmp-side ${leanLeft ? 'on' : ''}" style="--c:${lv.color}">${tValue(lid)}</span>
        <span class="cmp-side cmp-r ${!leanLeft ? 'on' : ''}" style="--c:${rv.color}">${tValue(rid)}</span>
      </div>
      <div class="cmp-track"><span class="cmp-mid"></span><span class="cmp-ind" style="left:${posRight.toFixed(1)}%"></span></div>
    </div>`;
  }).join('');
  if (!rows) return '';
  return `<div class="dsec"><div class="dsec-title">${t('secCompass')}</div><div class="compass">${rows}</div></div>`;
}

// Lineage: this civilization's value journey as a vertical timeline — the
// dominant value of each epoch the thread appears in, current epoch emphasised,
// each step clickable (rewired in React) to walk the lineage.
function buildLineageHTML(d: AtlasPoint, data: AtlasPoint[]) {
  if (!d.thread || d.thread === 'none') return '';
  const epochOrder = EPOCHS.map((e) => e.id);
  const byEpoch = new Map<string, { point: AtlasPoint; valueId: string; intensity: number }>();
  data.filter((x) => x.thread === d.thread).forEach((p) => {
    const prim = p.values.find((v) => v.role === 'primary');
    if (!prim) return;
    const cur = byEpoch.get(p.epoch);
    if (!cur || prim.intensity > cur.intensity) {
      byEpoch.set(p.epoch, { point: p, valueId: prim.valueId, intensity: prim.intensity });
    }
  });
  const rows = epochOrder.filter((id) => byEpoch.has(id));
  if (rows.length < 2) return '';

  const tLabel = tThread(d.thread);
  const inner = rows.map((epId) => {
    const entry = byEpoch.get(epId)!;
    const ep = EPOCHS.find((e) => e.id === epId);
    const val = VALUE_MAP.get(entry.valueId);
    if (!ep || !val) return '';
    const cls = 'lin-row' + (epId === d.epoch ? ' cur' : '');
    return `<button class="${cls}" data-epid="${epId}" data-pid="${entry.point.id}">
      <span class="lin-node" style="color:${val.color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${val.icon}</svg></span>
      <span class="lin-yr">${ep.short}</span>
      <span class="lin-val" style="--c:${val.color}">${tValue(entry.valueId)}</span>
    </button>`;
  }).join('');

  return `<div class="dsec"><div class="dsec-title">${t('lineage')} · ${tLabel}</div><div class="lineage">${inner}</div></div>`;
}

// ─────────────────────────── ASPECTS (schemaVersion 2) ───────────────────────────
// The readings area is now structurally driven by `point.aspects[]` instead of
// the flat note/altReading/cost fields, so future aspect types (gender, myth,
// religion, …) render automatically. The migrated `values-synthesis` aspect is
// the single source of truth for the legacy content — it is no longer read from
// the flat fields here, avoiding duplicate display.

// One reading card. The first reading of an aspect is the "primary" reading and
// gets the headline card; the rest render as muted secondary cards. A confidence
// indicator and contested flag are shown when the reading carries them.
function buildReadingCardHTML(r: Reading, isPrimary: boolean): string {
  const cardCls = isPrimary ? 'reading-card' : 'reading-card reading-alt';
  const proseStyle = isPrimary ? '' : ' style="color:#c6b69d"';
  const typeLabel = isPrimary ? `<span class="type-label">${t('readingPrimary')}</span>` : '';

  const chips: string[] = [];
  if (typeof r.confidence === 'number') {
    chips.push(`<span>${Math.round(r.confidence * 100)}% ${t('conf')}</span>`);
  }
  // The primary reading's contested state is surfaced by the prominent flag box
  // above; only flag additional readings inline to avoid duplicate display.
  if (r.contested && !isPrimary) {
    chips.push(`<span style="color:#e68a44">⚠ ${t('contestedTitle')}</span>`);
  }
  const chipsHTML = chips.length
    ? `<div style="display:flex;gap:.65rem;flex-wrap:wrap;margin-top:.55rem;font-size:10px;font-family:var(--mono);color:var(--t3);text-transform:uppercase;letter-spacing:.06em">${chips.join('')}</div>`
    : '';
  const cnHTML = (r.contested && !isPrimary && r.contestNote)
    ? `<p style="font-size:var(--xs);color:#dca078;line-height:1.55;margin-top:.5rem">${r.contestNote}</p>`
    : '';

  return `<div class="${cardCls}">${typeLabel}<div class="prose"${proseStyle}><p>${r.text}</p></div>${chipsHTML}${cnHTML}</div>`;
}

function buildAspectSectionHTML(aspect: Aspect): string {
  if (!aspect.readings || !aspect.readings.length) return '';
  const def = ASPECT_TYPES[aspect.type];
  const icon = def?.icon
    ? `<span style="display:inline-flex;width:14px;height:14px;vertical-align:-2px;margin-right:.4rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">${def.icon}</svg></span>`
    : '';
  const title = `<div class="dsec-title">${icon}${tAspect(aspect.type)}</div>`;

  // Prominent contested flag, driven by the primary reading (preserves the
  // original drawer's look for contested points).
  const primary = aspect.readings[0];
  const contestedBox = (primary && primary.contested && primary.contestNote)
    ? `<div class="contested-flag"><div class="icon">⚠</div><div><strong style="color:#e68a44;font-family:var(--display);font-size:var(--base);display:block;margin-bottom:.3rem">${t('contestedTitle')}</strong><p>${primary.contestNote}</p></div></div>`
    : '';

  const cards = aspect.readings.map((r, i) => buildReadingCardHTML(r, i === 0)).join('');
  return `<div class="dsec">${title}${contestedBox}${cards}</div>`;
}

function buildAspectsHTML(d: AtlasPoint): string {
  if (!d.aspects || !d.aspects.length) return buildLegacyReadingsHTML(d);
  return d.aspects.map(buildAspectSectionHTML).join('');
}

// Fallback for any (pre-migration) point lacking aspects — mirrors the original
// flat-field rendering so nothing breaks if unmigrated data appears.
function buildLegacyReadingsHTML(d: AtlasPoint): string {
  let html = '';
  if (d.contested && d.contestNote) {
    html += `<div class="contested-flag"><div class="icon">⚠</div><div><strong style="color:#e68a44;font-family:var(--display);font-size:var(--base);display:block;margin-bottom:.3rem">${t('contestedTitle')}</strong><p>${d.contestNote}</p></div></div>`;
  }
  html += `<div class="dsec"><div class="dsec-title">${t('secReadings')}</div>`;
  html += `<div class="reading-card"><span class="type-label">${t('readingPrimary')}</span><div class="prose"><p>${d.note}</p></div></div>`;
  if (d.altReading) html += `<div class="reading-card reading-alt"><span class="type-label" style="color:#a68a5c">${t('readingAlt')}</span><div class="prose" style="color:#c6b69d"><p>${d.altReading}</p></div></div>`;
  if (d.cost) html += `<div class="reading-cost"><span class="type-label" style="color:#a85a5a">${t('readingCost')}</span><div class="prose" style="color:#d88a8a;font-size:var(--xs)"><p>${d.cost}</p></div></div>`;
  html += `</div>`;
  return html;
}

// Unified sources section: aggregates (de-duplicated) sources from every
// aspect reading, falling back to the legacy flat `sources` field.
function buildSourcesHTML(d: AtlasPoint): string {
  let sources: string[] = [];
  if (d.aspects && d.aspects.length) {
    const seen = new Set<string>();
    d.aspects.forEach((a) => a.readings.forEach((r) => {
      (r.sources || []).forEach((s) => { if (!seen.has(s)) { seen.add(s); sources.push(s); } });
    }));
  }
  if (!sources.length && d.sources && d.sources.length) sources = d.sources;
  if (!sources.length) return '';
  return `<div class="dsec" style="margin-top:.5rem"><div class="dsec-title">${t('secSources')}</div><div style="font-size:11px;font-family:var(--mono);color:var(--t3);line-height:1.6">${sources.join('<br>')}</div></div>`;
}

// Builds the full drawer body (everything below the sticky region header).
export function buildDrawerBody(d: AtlasPoint, data: AtlasPoint[]): string {
  // Values section
  let valHTML = `<div class="dsec"><div class="dsec-title">${t('secValueStructure')}</div>`;
  d.values.forEach((v) => {
    const val = VALUE_MAP.get(v.valueId)!;
    const roleCls = ({ primary: 'role-primary', coupled: 'role-coupled', counter: 'role-counter' } as Record<string, string>)[v.role];
    valHTML += `<div class="vrow">
      <span class="vico" style="color:${val.color};opacity:${v.role === 'counter' ? .45 : 1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${val.icon}</svg></span>
      <span class="vrow-name" style="opacity:${v.role === 'counter' ? .55 : 1}">${tValue(v.valueId)}</span>
      <span class="vrow-role ${roleCls}">${t('role_' + v.role)}</span>
      ${v.role !== 'counter' ? `<div class="ibar-wrap" style="width:70px"><div class="ibar"><div class="ibar-fill" style="width:${Math.round(v.intensity * 100)}%;background:${val.color}"></div></div><div class="ibar-label">${Math.round(v.intensity * 100)}%</div></div>` : ''}
    </div>`;
  });
  valHTML += `</div>`;

  const compassHTML = buildCompassHTML(d);
  const lineageHTML = buildLineageHTML(d, data);

  // Drivers section
  let drvHTML = `<div class="dsec"><div class="dsec-title">${t('secDrivers')}</div><div class="driver-chips">`;
  d.drivers.forEach((k) => {
    const drv = DRIVERS[k];
    if (!drv) return;
    const dico = drv.icon ? `<span class="dchip-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${drv.icon}</svg></span>` : '';
    drvHTML += `<span class="driver-chip" style="color:${drv.color};background:${drv.bg};border-color:${drv.border}">${dico}${tDriver(k)}</span>`;
  });
  drvHTML += `</div></div>`;

  // Status + Evidence
  const st = STATUS[d.status];
  const evColor = EVIDENCE_COLORS[d.evidence] || '#607580';
  const metaHTML = `<div style="display:flex;flex-direction:column;gap:1.25rem">
    <div class="dsec">
      <div class="dsec-title">${t('secStatus')}</div>
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem">
        <span class="status-badge ${st.cls}">${tStatus(d.status).label}</span>
        <span style="font-size:var(--xs);color:var(--t3);font-family:var(--mono)">${tEpoch(d.epoch)}</span>
      </div>
      <p style="font-size:var(--xs);color:var(--t2);line-height:1.5">${tStatus(d.status).desc}</p>
    </div>
    <div class="dsec">
      <div class="dsec-title">${t('secEvidence')}</div>
      <div class="evidence-row">
        <span class="ev-dot" style="background:${evColor}"></span><span class="ev-label">${tEvidence(d.evidence)}</span>
        <div class="conf-bar"><div class="conf-fill" style="width:${Math.round(d.confidence * 100)}%;background:${evColor}"></div></div>
        <span class="ev-label">${Math.round(d.confidence * 100)}% ${t('conf')}</span>
      </div>
    </div>
  </div>`;

  // Readings + contested flag — now structurally driven by point.aspects[].
  const aspectsHTML = buildAspectsHTML(d);

  // Artifact (a representative quote; not part of the aspect model).
  const artifactHTML = d.artifact
    ? `<div class="dsec"><div class="artifact">"${d.artifact}"</div></div>`
    : '';

  // Unified sources section (aggregated across all aspect readings).
  const sourcesHTML = buildSourcesHTML(d);

  return valHTML + compassHTML + lineageHTML + drvHTML + metaHTML + aspectsHTML + artifactHTML + sourcesHTML;
}
