'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  VALUES, EPOCHS, DRIVERS, STATUS, EVIDENCE_COLORS, THREADS,
  type AtlasPoint,
} from '@/lib/schema';
import {
  LANGS, initLang, setLang, getLang, t, tValue, tDriver, tEpoch, tThread, tStatus, tEvidence,
} from '@/lib/i18n';
import { initTour, startTour, destroyTour } from '@/lib/tour';

// The full app chrome, kept byte-faithful to the original index.html body so
// the imperative Leaflet logic below can query the same IDs/classes. It is
// injected via innerHTML inside the effect (client-only) rather than authored
// as JSX, which keeps the markup identical and lets React treat it as opaque.
const APP_HTML = `
<!-- HEADER -->
<header>
  <div class="logo">
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="15" stroke="currentColor" opacity=".16"/>
      <circle cx="17" cy="17" r="9" stroke="currentColor" opacity=".14"/>
      <circle cx="17" cy="7"  r="2.4" fill="#d0b25e"/>
      <circle cx="26.5" cy="21" r="2.8" fill="#2eb074"/>
      <circle cx="8"  cy="23" r="2"   fill="#cc4a4a"/>
      <circle cx="23" cy="11" r="1.8" fill="#4a94cc"/>
    </svg>
    <div>
      <h1>Values Atlas <span style="font-size:var(--xs);font-family:var(--mono);color:var(--t3);font-style:normal">v4</span></h1>
      <div class="logo-sub" data-i18n="subtitle">Multi-spine civilizational continuity</div>
    </div>
  </div>
  <div class="hright">
    <div class="lens-tabs" id="lensTabs">
      <button class="ltab active" data-lens="moral" data-i18n="lens_moral">Moral</button>
      <button class="ltab" data-lens="ecological" data-i18n="lens_ecological">Ecological</button>
      <button class="ltab" data-lens="institutional" data-i18n="lens_institutional">Institutional</button>
    </div>
    <button class="tour-btn" id="tourBtn" aria-label="Tour" title="Tour">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9.5"/><path d="M9.4 9.2a2.6 2.6 0 1 1 3.7 2.4c-.85.42-1.1.95-1.1 1.7"/><circle cx="12" cy="16.6" r=".4" fill="currentColor"/>
      </svg>
    </button>
    <div class="lang-wrap">
      <svg class="lang-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9.5"/><path d="M3 12h18"/><path d="M12 2.5c2.5 2.6 3.9 6 3.9 9.5s-1.4 6.9-3.9 9.5C9.5 18.9 8.1 15.5 8.1 12S9.5 5.1 12 2.5Z"/>
      </svg>
      <select id="langSelect" aria-label="Language"></select>
    </div>
  </div>
</header>

<!-- SIDEBAR (desktop only) -->
<aside class="sidebar">
  <div class="sec">
    <div class="lbl" data-i18n="followThread">Follow a Thread</div>
    <p style="font-size:var(--xs);color:var(--t2);line-height:1.5;margin-top:-.3rem" data-i18n="followThreadDesc">Highlight a continuous civilization across all epochs to see how its values mutated.</p>
    <div class="thread-list" id="threadList"></div>
  </div>
  <div class="sec"><div class="lbl" data-i18n="values">Values</div><div id="vgrid" class="vgrid"></div></div>
  <div class="sec"><div class="lbl" data-i18n="epochs">Epochs</div><div id="elist" class="elist"></div></div>
  <div class="sec" id="lensInfo"></div>
</aside>

<!-- MAP -->
<main class="mapwrap">
  <div id="map"></div>
  <div class="map-banner" id="banner" data-i18n="banner">Values are adaptive technologies — click a marker to read its ecology</div>
  <div class="map-counter"><strong id="cnt">0</strong><span data-i18n="pointsInEpoch">points in this epoch</span></div>

  <!-- Mobile controls toggle -->
  <button class="mobile-ctrl-btn" id="mobileCtrlBtn" aria-label="Open controls">
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <line x1="0" y1="2" x2="16" y2="2"/>
      <line x1="0" y1="7" x2="16" y2="7"/>
      <line x1="0" y1="12" x2="16" y2="12"/>
    </svg>
    <span data-i18n="controls">Controls</span>
  </button>
</main>

<!-- DETAILS DRAWER -->
<div class="drawer" id="drawer">
  <div class="drawer-head">
    <div class="drawer-region" id="drRegion">—</div>
    <button class="drawer-close" id="drawerClose" aria-label="Close drawer">✕</button>
  </div>
  <div class="drawer-body" id="drawerBody"></div>
</div>

<!-- MOBILE BOTTOM SHEET -->
<div class="sheet-backdrop" id="sheetBackdrop"></div>
<div class="mobile-sheet" id="mobileSheet" aria-modal="true" aria-label="Controls">
  <div class="sheet-header">
    <div class="sheet-handle"></div>
    <button class="sheet-close" id="sheetClose" aria-label="Close controls">✕</button>
  </div>
  <div class="sheet-body">
    <div class="sec">
      <div class="lbl" data-i18n="followThread">Follow a Thread</div>
      <p style="font-size:var(--xs);color:var(--t2);line-height:1.5;margin-top:-.3rem" data-i18n="followThreadDescShort">Highlight a civilization across all epochs.</p>
      <div class="thread-list" id="threadListMobile"></div>
    </div>
    <div class="sec"><div class="lbl" data-i18n="values">Values</div><div id="vgridMobile" class="vgrid"></div></div>
    <div class="sec"><div class="lbl" data-i18n="epochs">Epochs</div><div id="elistMobile" class="elist"></div></div>
    <div class="sec" id="lensInfoMobile"></div>
  </div>
</div>

<!-- TIMELINE -->
<footer>
  <button class="play" id="play" aria-label="Play">▶</button>
  <div class="tl-mid">
    <div class="tl-labs" id="tlLabs"></div>
    <div class="track" id="track">
      <div class="fill" id="fill"></div>
      <div class="thumb" id="thumb"></div>
    </div>
  </div>
  <div id="tlCur" class="tl-cur"></div>
</footer>
`;

export default function ValuesAtlas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Fresh nodes every run (also handles React strict-mode double invoke).
    host.innerHTML = APP_HTML;

    let disposed = false;
    let tourTimeout: ReturnType<typeof setTimeout> | null = null;

    // ═══════════════════════ STATE ═══════════════════════
    let DATA: AtlasPoint[] = [];
    let epoch = 'hunter';
    let activeLens = 'moral';
    let activeThread = 'all';
    const activeValues = new Set(VALUES.map((v) => v.id));
    let markers: any[] = [];
    let timer: ReturnType<typeof setInterval> | null = null;
    let dragging = false;
    let openDrawerId: string | null = null;

    const VALUE_MAP = new Map(VALUES.map((v) => [v.id, v]));
    const ECO_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'eco');
    const INST_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'inst');

    const $ = (id: string) => document.getElementById(id) as any;

    // ═══════════════════════ HELPERS ═══════════════════════
    function valueIcon(vid: string, px?: number) {
      const v = VALUE_MAP.get(vid)!;
      return `<span class="vico" style="color:${v.color}${px ? `;width:${px}px;height:${px}px` : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v.icon}</svg></span>`;
    }

    // The glyph stamped inside a marker depends on the active lens: the primary
    // value's glyph (moral) or the matching ecological/institutional driver's glyph.
    function markerGlyph(d: AtlasPoint) {
      if (activeLens === 'moral') {
        const prim = d.values.find((v) => v.role === 'primary')!;
        return VALUE_MAP.get(prim.valueId)!.icon;
      }
      const pool = activeLens === 'ecological' ? ECO_DRIVERS : INST_DRIVERS;
      const match = d.drivers.find((drv) => pool.includes(drv));
      return match && DRIVERS[match].icon ? DRIVERS[match].icon : '';
    }

    // ═══════════════════════ MAP INIT ═══════════════════════
    const map: any = L.map('map', { center: [22, 10], zoom: 2.2, minZoom: 2, maxZoom: 7, zoomControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', opacity: .35, maxZoom: 19 }).addTo(map);

    // ═══════════════════════ BUILD CONTROLS ═══════════════════════
    function buildVgrid(containerId: string) {
      const el = $(containerId);
      if (!el) return;
      el.innerHTML = '';
      VALUES.forEach((v) => {
        const b = document.createElement('button');
        b.className = 'vpill active';
        b.dataset.vid = v.id;
        b.innerHTML = `${valueIcon(v.id)}<span class="vname">${tValue(v.id)}</span><svg class="vcheck" width="12" height="12" viewBox="0 0 12 12"><polyline points="1,6 4.5,9.5 11,2" fill="none" stroke="${v.color}" stroke-width="2"/></svg>`;
        b.onclick = () => {
          if (activeValues.has(v.id) && activeValues.size > 1) {
            activeValues.delete(v.id);
            syncVpills(v.id, false);
          } else if (!activeValues.has(v.id)) {
            activeValues.add(v.id);
            syncVpills(v.id, true);
          }
          render();
        };
        el.appendChild(b);
      });
    }

    function syncVpills(vid: string, active: boolean) {
      document.querySelectorAll(`.vpill[data-vid="${vid}"]`).forEach((el) => el.classList.toggle('active', active));
    }

    function buildElist(containerId: string, tlLabsId: string | null) {
      const elistEl = $(containerId);
      const tlLabsEl = tlLabsId ? $(tlLabsId) : null;
      if (!elistEl) return;
      elistEl.innerHTML = '';
      if (tlLabsEl) tlLabsEl.innerHTML = '';
      EPOCHS.forEach((ep) => {
        const b = document.createElement('button');
        b.className = 'epbtn' + (ep.id === epoch ? ' active' : '');
        b.dataset.epid = ep.id;
        b.innerHTML = `<span>${tEpoch(ep.id)}</span><span class="epyr">${ep.short}</span>`;
        b.onclick = () => setEpoch(ep.id);
        elistEl.appendChild(b);

        if (tlLabsEl) {
          const s = document.createElement('span');
          s.className = 'tl-lab' + (ep.id === epoch ? ' active' : '');
          s.dataset.epid = ep.id;
          s.textContent = ep.short;
          s.onclick = () => setEpoch(ep.id);
          tlLabsEl.appendChild(s);
        }
      });
    }

    function buildTicks() {
      const track = $('track');
      if (!track) return;
      track.querySelectorAll('.tick').forEach((el: any) => el.remove());
      EPOCHS.forEach((ep) => {
        const tk = document.createElement('span');
        tk.className = 'tick' + (ep.id === epoch ? ' active' : '');
        tk.dataset.epid = ep.id;
        tk.style.left = (ep.pct * 100) + '%';
        tk.title = tEpoch(ep.id);
        tk.onclick = (e) => { e.stopPropagation(); setEpoch(ep.id); };
        track.appendChild(tk);
      });
    }

    function buildThreadList(containerId: string) {
      const el = $(containerId);
      if (!el) return;
      el.innerHTML = '';
      THREADS.forEach((th) => {
        const b = document.createElement('button');
        b.className = 'thread-btn' + (th.id === activeThread ? ' active' : '');
        b.dataset.thread = th.id;
        b.textContent = tThread(th.id);
        b.onclick = () => {
          activeThread = th.id;
          document.querySelectorAll('.thread-btn').forEach((btn) => btn.classList.toggle('active', (btn as HTMLElement).dataset.thread === th.id));
          render();
        };
        el.appendChild(b);
      });
    }

    // ═══════════════════════ LENS ═══════════════════════
    function driverLegendHTML(keys: string[]) {
      return keys.map((k) => {
        const v = DRIVERS[k];
        return `<div class="dlrow"><span class="dico" style="color:${v.color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v.icon}</svg></span><span>${tDriver(k)}</span></div>`;
      }).join('');
    }

    function updateLensInfo() {
      let html = '';
      if (activeLens === 'moral') {
        html = `<div class="lbl">${t('lensMoralTitle')}</div><div class="dcard"><p>${t('lensMoralDesc')}</p></div>`;
      } else if (activeLens === 'ecological') {
        html = `<div class="lbl">${t('lensEcoTitle')}</div><div class="dcard"><p>${t('lensEcoDesc')}</p><div class="driver-legend">${driverLegendHTML(ECO_DRIVERS)}</div></div>`;
      } else {
        html = `<div class="lbl">${t('lensInstTitle')}</div><div class="dcard"><p>${t('lensInstDesc')}</p><div class="driver-legend">${driverLegendHTML(INST_DRIVERS)}</div></div>`;
      }

      ['lensInfo', 'lensInfoMobile'].forEach((id) => {
        const el = $(id);
        if (el) el.innerHTML = html;
      });
    }

    // ═══════════════════════ EPOCH ═══════════════════════
    function positionThumb(pct: number) {
      $('fill').style.width = (pct * 100) + '%';
      $('thumb').style.left = (pct * 100) + '%';
    }

    function nearestEpoch(pct: number) {
      let closest = EPOCHS[0];
      EPOCHS.forEach((ep) => { if (Math.abs(ep.pct - pct) < Math.abs(closest.pct - pct)) closest = ep; });
      return closest;
    }

    function setEpoch(id: string) {
      epoch = id;
      document.querySelectorAll('[data-epid]').forEach((el) => el.classList.toggle('active', (el as HTMLElement).dataset.epid === id));
      const ep = EPOCHS.find((e) => e.id === id)!;
      if (!dragging) positionThumb(ep.pct);
      $('tlCur').textContent = ep.short;
      render();
    }

    // ═══════════════════════ RENDER ═══════════════════════
    function markerColor(d: AtlasPoint) {
      if (activeLens === 'moral') {
        const prim = d.values.find((v) => v.role === 'primary')!;
        return VALUE_MAP.get(prim.valueId)!.color;
      } else if (activeLens === 'ecological') {
        const match = d.drivers.find((drv) => ECO_DRIVERS.includes(drv));
        return match ? DRIVERS[match].color : '#524e43';
      } else {
        const match = d.drivers.find((drv) => INST_DRIVERS.includes(drv));
        return match ? DRIVERS[match].color : '#524e43';
      }
    }

    function render() {
      markers.forEach((m) => m.remove());
      markers = [];

      const visible = DATA.filter((d) => {
        if (d.epoch !== epoch) return false;
        return d.values.some((v) => v.role === 'primary' && activeValues.has(v.valueId));
      });

      $('cnt').textContent = String(visible.length);

      visible.forEach((d) => {
        const prim = d.values.find((v) => v.role === 'primary')!;
        const size = Math.round(24 + prim.intensity * 26);
        const col = markerColor(d);
        const opacity = activeLens === 'moral' ? (0.62 + prim.intensity * .38) : 0.88;
        const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        const border = d.confidence < 0.65 ? `2px dashed ${col}` : `2px solid ${col}`;
        const isDimmed = activeThread !== 'all' && d.thread !== activeThread;
        const shadow = `0 0 0 1.5px rgba(255,255,255,.18),0 0 16px ${col}66,0 6px 18px rgba(0,0,0,.5)`;
        const haloSize = Math.round(size * (1.5 + prim.intensity * 1.3));
        const haloOp = (0.10 + prim.intensity * 0.22).toFixed(3);
        const haloDur = (4.6 - prim.intensity * 1.4).toFixed(2);
        const halo = isDimmed ? '' : `<div class="mhalo" style="width:${haloSize}px;height:${haloSize}px;background:radial-gradient(circle,${col}cc 0%,${col}55 38%,${col}00 72%);--ho:${haloOp};animation-duration:${haloDur}s"></div>`;

        const icon = L.divIcon({
          className: '',
          html: `<div class="mwrap" style="width:${size}px;height:${size}px">${halo}<div class="mc ${isDimmed ? 'dimmed' : ''}" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 32% 28%,${col}ff,${col}${alphaHex});border:${border};box-shadow:${shadow};"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${markerGlyph(d)}</svg></div></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const m: any = L.marker([d.lat, d.lng], { icon, zIndexOffset: Math.round(prim.intensity * 100) });
        if (!isDimmed) {
          m.bindPopup(`<div class="mp"><div class="mp-region">${d.region}</div><div class="mp-hint">${t('markerHint')}</div></div>`, { maxWidth: 220 });
          m.on('click', () => openDrawer(d.id));
        }
        m.addTo(map);
        markers.push(m);
      });
    }

    // ═══════════════════════ DRAWER ═══════════════════════
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

    // Lineage: show this civilization's value journey as a vertical timeline in
    // the drawer — the dominant value of each epoch the thread appears in,
    // current epoch emphasised, each step clickable to walk the lineage.
    function buildLineageHTML(d: AtlasPoint) {
      if (!d.thread || d.thread === 'none') return '';
      const epochOrder = EPOCHS.map((e) => e.id);
      const byEpoch = new Map<string, any>();
      DATA.filter((x) => x.thread === d.thread).forEach((p) => {
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
        const entry = byEpoch.get(epId);
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

    function openDrawer(id: string) {
      const d = DATA.find((x) => x.id === id);
      if (!d) return;
      openDrawerId = id;

      $('drRegion').textContent = d.region;
      const body = $('drawerBody');

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
      const lineageHTML = buildLineageHTML(d);

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

      // Contested flag
      let contHTML = '';
      if (d.contested) {
        contHTML = `<div class="contested-flag"><div class="icon">⚠</div><div><strong style="color:#e68a44;font-family:var(--display);font-size:var(--base);display:block;margin-bottom:.3rem">${t('contestedTitle')}</strong><p>${d.contestNote}</p></div></div>`;
      }

      // Readings
      let readHTML = `<div class="dsec"><div class="dsec-title">${t('secReadings')}</div>`;
      readHTML += `<div class="reading-card"><span class="type-label">${t('readingPrimary')}</span><div class="prose"><p>${d.note}</p></div></div>`;
      if (d.altReading) readHTML += `<div class="reading-card reading-alt"><span class="type-label" style="color:#a68a5c">${t('readingAlt')}</span><div class="prose" style="color:#c6b69d"><p>${d.altReading}</p></div></div>`;
      if (d.cost) readHTML += `<div class="reading-cost"><span class="type-label" style="color:#a85a5a">${t('readingCost')}</span><div class="prose" style="color:#d88a8a;font-size:var(--xs)"><p>${d.cost}</p></div></div>`;
      readHTML += `</div>`;

      // Artifact & Sources
      let botHTML = '';
      if (d.artifact) botHTML += `<div class="dsec"><div class="artifact">"${d.artifact}"</div></div>`;
      if (d.sources && d.sources.length) botHTML += `<div class="dsec" style="margin-top:.5rem"><div class="dsec-title">${t('secSources')}</div><div style="font-size:11px;font-family:var(--mono);color:var(--t3);line-height:1.6">${d.sources.join('<br>')}</div></div>`;

      body.innerHTML = valHTML + compassHTML + lineageHTML + drvHTML + metaHTML + contHTML + readHTML + botHTML;
      $('drawer').classList.add('open');

      // Walk the lineage: each step jumps the map to that epoch and re-opens the
      // drawer on that era's representative point for the same civilization.
      body.querySelectorAll('.lin-row').forEach((btn: any) => {
        btn.onclick = () => {
          const { epid, pid } = btn.dataset;
          if (epid && epid !== epoch) setEpoch(epid);
          if (pid) openDrawer(pid);
        };
      });
    }

    $('drawerClose').onclick = () => { $('drawer').classList.remove('open'); openDrawerId = null; };

    // ═══════════════════════ MOBILE SHEET ═══════════════════════
    const mobileSheet = $('mobileSheet');
    const sheetBackdrop = $('sheetBackdrop');

    function openSheet() {
      mobileSheet.classList.add('open');
      sheetBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
      mobileSheet.classList.remove('open');
      sheetBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    $('mobileCtrlBtn').onclick = openSheet;
    $('sheetClose').onclick = closeSheet;
    sheetBackdrop.onclick = closeSheet;

    // Touch-to-swipe-down to dismiss
    let touchStartY = 0;
    mobileSheet.addEventListener('touchstart', (e: TouchEvent) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    mobileSheet.addEventListener('touchend', (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientY - touchStartY;
      if (diff > 60) closeSheet();
    }, { passive: true });

    // ═══════════════════════ TIMELINE (draggable) ═══════════════════════
    const track = $('track');

    function pctFromClientX(clientX: number) {
      const r = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    }

    function stopPlayback() {
      if (timer) { clearInterval(timer); timer = null; $('play').textContent = '▶'; }
    }

    function dragMove(clientX: number) {
      const pct = pctFromClientX(clientX);
      positionThumb(pct);
      const ne = nearestEpoch(pct);
      if (ne.id !== epoch) setEpoch(ne.id);
    }

    track.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      stopPlayback();
      dragging = true;
      track.classList.add('dragging');
      track.setPointerCapture(e.pointerId);
      dragMove(e.clientX);
    });

    track.addEventListener('pointermove', (e: PointerEvent) => {
      if (dragging) dragMove(e.clientX);
    });

    function endDrag(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      try { track.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      const ep = EPOCHS.find((x) => x.id === epoch)!;
      positionThumb(ep.pct); // animate snap to the nearest epoch
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    $('play').onclick = function (this: HTMLButtonElement) {
      if (timer) { stopPlayback(); return; }
      this.textContent = '⏸';
      let idx = EPOCHS.findIndex((e) => e.id === epoch);
      timer = setInterval(() => {
        idx = (idx + 1) % EPOCHS.length;
        setEpoch(EPOCHS[idx].id);
        if (idx === EPOCHS.length - 1) stopPlayback();
      }, 2000);
    };

    // ═══════════════════════ LENS TABS ═══════════════════════
    document.querySelectorAll('.ltab').forEach((btn: any) => {
      btn.onclick = () => {
        activeLens = btn.dataset.lens;
        document.querySelectorAll('.ltab').forEach((b) => b.classList.toggle('active', b === btn));
        updateLensInfo();
        render();
      };
    });

    // ═══════════════════════ LANGUAGE ═══════════════════════
    function applyStaticTranslations() {
      document.querySelectorAll('[data-i18n]').forEach((el: any) => {
        el.textContent = t(el.dataset.i18n);
      });
      document.querySelectorAll('[data-i18n-aria]').forEach((el: any) => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
      });
      const tip = $('tourBtn');
      if (tip) tip.title = t('tourReplay');
    }

    function rerenderAll() {
      buildVgrid('vgrid');
      buildVgrid('vgridMobile');
      buildElist('elist', 'tlLabs');
      buildElist('elistMobile', null);
      buildThreadList('threadList');
      buildThreadList('threadListMobile');
      buildTicks();
      VALUES.forEach((v) => syncVpills(v.id, activeValues.has(v.id)));
      updateLensInfo();
      applyStaticTranslations();
      render();
      if (openDrawerId && $('drawer').classList.contains('open')) {
        openDrawer(openDrawerId);
      }
    }

    function buildLangSelector() {
      const sel = $('langSelect');
      if (!sel) return;
      sel.innerHTML = LANGS.map((l) => `<option value="${l.code}">${l.name}</option>`).join('');
      sel.value = getLang();
      sel.onchange = () => {
        setLang(sel.value);
        rerenderAll();
      };
    }

    // ═══════════════════════ INIT ═══════════════════════
    async function init() {
      initLang();
      buildLangSelector();
      applyStaticTranslations();
      initTour();

      $('tourBtn').onclick = () => startTour();

      buildVgrid('vgrid');
      buildVgrid('vgridMobile');
      buildElist('elist', 'tlLabs');
      buildElist('elistMobile', null);
      buildTicks();
      buildThreadList('threadList');
      buildThreadList('threadListMobile');
      updateLensInfo();

      try {
        const res = await fetch('/data/atlas.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        DATA = await res.json();
      } catch (err) {
        console.error('Failed to load atlas data:', err);
        const banner = $('banner');
        if (banner) banner.textContent = 'Error loading data. Please refresh.';
        return;
      }

      if (disposed) return;

      setEpoch(epoch);

      let seen: string | null = null;
      try { seen = localStorage.getItem('va_tour_seen'); } catch { /* ignore */ }
      if (!seen) {
        tourTimeout = setTimeout(() => { if (!disposed) startTour(); }, 600);
      }
    }

    init();

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      if (tourTimeout) clearTimeout(tourTimeout);
      try { map.remove(); } catch { /* ignore */ }
      destroyTour();
      document.body.style.overflow = '';
      if (host) host.innerHTML = '';
    };
  }, []);

  return <div ref={hostRef} className="app" />;
}
