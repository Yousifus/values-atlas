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

export interface AtlasState {
  data: AtlasPoint[];
  epoch: string;
  lens: string;
  thread: string;
  activeValues: Set<string>;
}

export interface AtlasMap {
  render: () => void;
  invalidateSize: () => void;
  destroy: () => void;
}

export function createAtlasMap(
  el: HTMLElement,
  getState: () => AtlasState,
  onOpenPoint: (id: string) => void,
): AtlasMap {
  const VALUE_MAP = new Map(VALUES.map((v) => [v.id, v]));
  const ECO_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'eco');
  const INST_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'inst');
  let markers: L.Marker[] = [];

  const map = L.map(el, { center: [22, 10], zoom: 2.2, minZoom: 2, maxZoom: 7, zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', opacity: .35, maxZoom: 19 }).addTo(map);

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

  function render() {
    const { data, epoch, lens, thread, activeValues } = getState();
    markers.forEach((m) => m.remove());
    markers = [];

    const visible = data.filter((d) => {
      if (d.epoch !== epoch) return false;
      return d.values.some((v) => v.role === 'primary' && activeValues.has(v.valueId));
    });

    visible.forEach((d) => {
      const prim = d.values.find((v) => v.role === 'primary')!;
      const size = Math.round(24 + prim.intensity * 26);
      const col = markerColor(d, lens);
      const opacity = lens === 'moral' ? (0.62 + prim.intensity * .38) : 0.88;
      const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
      const border = d.confidence < 0.65 ? `2px dashed ${col}` : `2px solid ${col}`;
      const isDimmed = thread !== 'all' && d.thread !== thread;
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
        m.bindPopup(`<div class="mp"><div class="mp-region">${d.region}</div><div class="mp-hint">${t('markerHint')}</div></div>`, { maxWidth: 220 });
        m.on('click', () => onOpenPoint(d.id));
      }
      m.addTo(map);
      markers.push(m);
    });
  }

  return {
    render,
    invalidateSize: () => { try { map.invalidateSize(); } catch { /* ignore */ } },
    destroy: () => { try { map.remove(); } catch { /* ignore */ } },
  };
}
