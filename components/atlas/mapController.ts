// ═══════════════════════ LEAFLET MAP CONTROLLER ═══════════════════════
// Leaflet stays imperative (it needs `window` and manages its own DOM). The
// React chrome owns UI state and drives this controller via `render()`, which
// reads the latest state through `getState()`. Marker rendering, glyph/colour
// logic, halos, and divIcon markup are kept byte-faithful to the original app.
import L from 'leaflet';
import {
  VALUES, DRIVERS, type AtlasPoint,
} from '@/lib/schema';
import { t } from '@/lib/i18n';
import { esc } from '@/lib/escape';
import { clusterPoints, summarizeCluster, dominantDriver, type Cluster } from '@/lib/density';

export interface AtlasState {
  data: AtlasPoint[];
  epoch: string;
  lens: string;
  thread: string;
  activeValues: Set<string>;
}

export interface AtlasMap {
  render: () => void;
  /** Zoom the map so the given points separate (used by the group drawer). */
  zoomToPoints: (ids: string[]) => void;
  invalidateSize: () => void;
  destroy: () => void;
}

export function createAtlasMap(
  el: HTMLElement,
  getState: () => AtlasState,
  onOpenPoint: (id: string) => void,
  onOpenCluster: (ids: string[]) => void,
): AtlasMap {
  const VALUE_MAP = new Map(VALUES.map((v) => [v.id, v]));
  const ECO_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'eco');
  const INST_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'inst');
  let markers: L.Marker[] = [];

  const map = L.map(el, { center: [22, 10], zoom: 2.2, minZoom: 2, maxZoom: 7, zoomControl: true });
  // Keyless Esri Dark Gray Canvas (base + labels). CARTO's free basemaps began
  // requiring an API key and now stamp "API KEY REQUIRED" over every tile. Esri
  // tile paths are {z}/{y}/{x}; the canvas stops at zoom 16 (the map caps at 7).
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
  const ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';
  L.tileLayer(`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, attribution: ATTRIBUTION }).addTo(map);
  L.tileLayer(`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { opacity: .35, maxZoom: 16 }).addTo(map);

  // The glyph stamped inside a marker depends on the active lens: the primary
  // value's glyph (moral) or the matching ecological/institutional driver glyph.
  function markerGlyph(d: AtlasPoint, lens: string) {
    if (lens === 'moral') {
      const prim = d.values.find((v) => v.role === 'primary')!;
      return VALUE_MAP.get(prim.valueId)!.icon;
    }
    const pool = lens === 'ecological' ? ECO_DRIVERS : INST_DRIVERS;
    const match = d.drivers.find((drv) => pool.includes(drv));
    return match && DRIVERS[match].icon ? DRIVERS[match].icon : '';
  }

  function markerColor(d: AtlasPoint, lens: string) {
    if (lens === 'moral') {
      const prim = d.values.find((v) => v.role === 'primary')!;
      return VALUE_MAP.get(prim.valueId)!.color;
    } else if (lens === 'ecological') {
      const match = d.drivers.find((drv) => ECO_DRIVERS.includes(drv));
      return match ? DRIVERS[match].color : '#524e43';
    } else {
      const match = d.drivers.find((drv) => INST_DRIVERS.includes(drv));
      return match ? DRIVERS[match].color : '#524e43';
    }
  }

  // A single point drawn as its own marker (unchanged look and behaviour).
  function addPoint(d: AtlasPoint, lens: string, isDimmed: boolean) {
    const prim = d.values.find((v) => v.role === 'primary')!;
    const size = Math.round(24 + prim.intensity * 26);
    const col = markerColor(d, lens);
    const opacity = lens === 'moral' ? (0.62 + prim.intensity * .38) : 0.88;
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    const border = d.confidence < 0.65 ? `2px dashed ${col}` : `2px solid ${col}`;
    const shadow = `0 0 0 1.5px rgba(255,255,255,.18),0 0 16px ${col}66,0 6px 18px rgba(0,0,0,.5)`;
    const haloSize = Math.round(size * (1.5 + prim.intensity * 1.3));
    const haloOp = (0.10 + prim.intensity * 0.22).toFixed(3);
    const haloDur = (4.6 - prim.intensity * 1.4).toFixed(2);
    const halo = isDimmed ? '' : `<div class="mhalo" style="width:${haloSize}px;height:${haloSize}px;background:radial-gradient(circle,${col}cc 0%,${col}55 38%,${col}00 72%);--ho:${haloOp};animation-duration:${haloDur}s"></div>`;

    const icon = L.divIcon({
      className: '',
      html: `<div class="mwrap" style="width:${size}px;height:${size}px">${halo}<div class="mc ${isDimmed ? 'dimmed' : ''}" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 32% 28%,${col}ff,${col}${alphaHex});border:${border};box-shadow:${shadow};"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${markerGlyph(d, lens)}</svg></div></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    const m = L.marker([d.lat, d.lng], { icon, zIndexOffset: Math.round(prim.intensity * 100) });
    if (!isDimmed) {
      m.bindPopup(`<div class="mp"><div class="mp-region">${esc(d.region)}</div><div class="mp-hint">${t('markerHint')}</div></div>`, { maxWidth: 220 });
      m.on('click', () => onOpenPoint(d.id));
    }
    m.addTo(map);
    markers.push(m);
  }

  // Several points that would overlap at this zoom, drawn as one bubble. Size
  // grows with the log of the count, so a 90-point group does not swallow the map.
  function addGroup(c: Cluster, lens: string, isDimmed: boolean, zoom: number) {
    const n = c.members.length;
    const size = Math.min(76, Math.round(30 + 10 * Math.log2(n)));
    let col = '#524e43';
    if (lens === 'moral') {
      const top = summarizeCluster(c.members).values[0];
      const val = top ? VALUE_MAP.get(top.valueId) : undefined;
      if (val) col = val.color;
    } else {
      const key = dominantDriver(c.members, lens === 'ecological' ? ECO_DRIVERS : INST_DRIVERS);
      if (key) col = DRIVERS[key].color;
    }
    const shadow = `0 0 0 3px ${col}38,0 0 0 4.5px rgba(255,255,255,.14),0 6px 18px rgba(0,0,0,.5)`;
    const icon = L.divIcon({
      className: '',
      html: `<div class="mwrap" style="width:${size}px;height:${size}px"><div class="mc mcl ${isDimmed ? 'dimmed' : ''}" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 32% 28%,${col}f2,${col}99);border:2px solid ${col};box-shadow:${shadow};"><span class="mcl-n">${n}</span></div></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    const at = map.unproject(L.point(c.x, c.y), zoom);
    const m = L.marker(at, { icon, zIndexOffset: 200 + n });
    if (!isDimmed) {
      m.bindTooltip(
        `<div class="mp-region">${n} ${esc(t('clusterGrouped'))}</div><div class="mp-hint">${esc(t('clusterHint'))}</div>`,
        { direction: 'top', offset: [0, -Math.round(size / 2)], className: 'cl-tip' },
      );
      m.on('click', () => onOpenCluster(c.members.map((x) => x.id)));
    }
    m.addTo(map);
    markers.push(m);
  }

  function render() {
    const { data, epoch, lens, thread, activeValues } = getState();
    markers.forEach((m) => m.remove());
    markers = [];

    const visible = data.filter((d) => {
      if (d.epoch !== epoch) return false;
      return d.values.some((v) => v.role === 'primary' && activeValues.has(v.valueId));
    });

    // Group in projected pixel space at the current zoom. Pixel space has no
    // wrap-around, so Fiji (178°E) and Tonga (175°W) are never merged across the
    // antimeridian, and a group always spans a small, contiguous area.
    const zoom = map.getZoom();
    const project = (d: AtlasPoint) => { const p = map.project([d.lat, d.lng], zoom); return { x: p.x, y: p.y }; };

    // "Follow a thread": the followed thread and everything else are grouped
    // separately, so the rest collapses into a few quiet grey groups instead of
    // dozens of faded markers.
    const followed = thread === 'all' ? visible : visible.filter((d) => d.thread === thread);
    const others = thread === 'all' ? [] : visible.filter((d) => d.thread !== thread);

    const draw = (list: AtlasPoint[], isDimmed: boolean) => {
      for (const c of clusterPoints(list, project)) {
        if (c.members.length === 1) addPoint(c.members[0], lens, isDimmed);
        else addGroup(c, lens, isDimmed, zoom);
      }
    };
    draw(others, true);      // dimmed first, so followed markers sit on top
    draw(followed, false);
  }

  // Groups depend on zoom, so re-group whenever the zoom settles.
  map.on('zoomend', render);

  function zoomToPoints(ids: string[]) {
    const wanted = new Set(ids);
    const pts = getState().data.filter((d) => wanted.has(d.id));
    if (!pts.length) return;
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number]));
    const max = map.getMaxZoom();
    const fit = map.getBoundsZoom(bounds, false, L.point(70, 70));
    // Always move in by at least a level, so the group visibly starts to separate.
    const target = Math.min(max, Math.max(map.getZoom() + 1, Number.isFinite(fit) ? fit : 0));
    map.flyTo(bounds.getCenter(), target, { duration: 0.6 });
  }

  return {
    render,
    zoomToPoints,
    invalidateSize: () => { try { map.invalidateSize(); } catch { /* ignore */ } },
    destroy: () => { try { map.remove(); } catch { /* ignore */ } },
  };
}
