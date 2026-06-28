'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  VALUES, EPOCHS, DRIVERS, THREADS, type AtlasPoint,
} from '@/lib/schema';
import {
  LANGS, initLang, setLang as setI18nLang, getLang,
  t, tValue, tDriver, tEpoch, tThread,
} from '@/lib/i18n';
import { initTour, startTour, destroyTour } from '@/lib/tour';
import { createAtlasMap, type AtlasMap, type AtlasState } from '@/components/atlas/mapController';
import { buildDrawerBody } from '@/components/atlas/drawerContent';
import {
  Sheet, SheetContent, SheetClose, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

const ECO_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'eco');
const INST_DRIVERS = Object.keys(DRIVERS).filter((k) => DRIVERS[k].group === 'inst');

// Inline SVG glyph (value/driver icons are stored as raw SVG-path strings).
function Glyph({ icon, className, style }: { icon: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style}>
      <svg
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    </span>
  );
}

function LensInfo({ lens }: { lens: string }) {
  if (lens === 'moral') {
    return (
      <>
        <div className="lbl">{t('lensMoralTitle')}</div>
        <div className="dcard"><p>{t('lensMoralDesc')}</p></div>
      </>
    );
  }
  const keys = lens === 'ecological' ? ECO_DRIVERS : INST_DRIVERS;
  const title = lens === 'ecological' ? t('lensEcoTitle') : t('lensInstTitle');
  const desc = lens === 'ecological' ? t('lensEcoDesc') : t('lensInstDesc');
  return (
    <>
      <div className="lbl">{title}</div>
      <div className="dcard">
        <p>{desc}</p>
        <div className="driver-legend">
          {keys.map((k) => (
            <div className="dlrow" key={k}>
              <Glyph className="dico" icon={DRIVERS[k].icon} style={{ color: DRIVERS[k].color }} />
              <span>{tDriver(k)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

interface ControlsProps {
  primary: boolean;
  lens: string;
  epoch: string;
  thread: string;
  activeValues: Set<string>;
  onThread: (id: string) => void;
  onToggleValue: (id: string) => void;
  onEpoch: (id: string) => void;
}

// Shared sidebar/sheet controls. `primary` attaches the tour target ids
// (#vgrid, #threadList) so the guided tour can still spotlight them on desktop.
function Controls({ primary, lens, epoch, thread, activeValues, onThread, onToggleValue, onEpoch }: ControlsProps) {
  return (
    <>
      <div className="sec">
        <div className="lbl">{t('followThread')}</div>
        <p style={{ fontSize: 'var(--xs)', color: 'var(--t2)', lineHeight: 1.5, marginTop: '-.3rem' }}>
          {primary ? t('followThreadDesc') : t('followThreadDescShort')}
        </p>
        <div className="thread-list" id={primary ? 'threadList' : undefined}>
          {THREADS.map((th) => (
            <button
              key={th.id}
              className={'thread-btn' + (th.id === thread ? ' active' : '')}
              onClick={() => onThread(th.id)}
            >
              {tThread(th.id)}
            </button>
          ))}
        </div>
      </div>

      <div className="sec">
        <div className="lbl">{t('values')}</div>
        <div className="vgrid" id={primary ? 'vgrid' : undefined}>
          {VALUES.map((v) => {
            const active = activeValues.has(v.id);
            return (
              <button
                key={v.id}
                className={'vpill' + (active ? ' active' : '')}
                onClick={() => onToggleValue(v.id)}
              >
                <Glyph className="vico" icon={v.icon} style={{ color: v.color }} />
                <span className="vname">{tValue(v.id)}</span>
                <svg className="vcheck" width="12" height="12" viewBox="0 0 12 12">
                  <polyline points="1,6 4.5,9.5 11,2" fill="none" stroke={v.color} strokeWidth={2} />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sec">
        <div className="lbl">{t('epochs')}</div>
        <div className="elist">
          {EPOCHS.map((ep) => (
            <button
              key={ep.id}
              className={'epbtn' + (ep.id === epoch ? ' active' : '')}
              onClick={() => onEpoch(ep.id)}
            >
              <span>{tEpoch(ep.id)}</span>
              <span className="epyr">{ep.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sec"><LensInfo lens={lens} /></div>
    </>
  );
}

export default function ValuesAtlas() {
  const [langCode, setLangCode] = useState<string>(() =>
    typeof window !== 'undefined' ? initLang() : 'en');
  const [data, setData] = useState<AtlasPoint[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [lens, setLens] = useState('moral');
  const [epoch, setEpoch] = useState('hunter');
  const [thread, setThread] = useState('all');
  const [activeValues, setActiveValues] = useState<Set<string>>(() => new Set(VALUES.map((v) => v.id)));
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mapElRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AtlasMap | null>(null);
  const stateRef = useRef<AtlasState>({ data, epoch, lens, thread, activeValues });
  const sheetBodyRef = useRef<HTMLDivElement>(null);

  const activeKey = useMemo(
    () => VALUES.map((v) => (activeValues.has(v.id) ? '1' : '0')).join(''),
    [activeValues],
  );

  const epochIndex = Math.max(0, EPOCHS.findIndex((e) => e.id === epoch));
  const epochShort = EPOCHS[epochIndex]?.short ?? '';
  const visibleCount = useMemo(
    () => data.filter((d) => d.epoch === epoch
      && d.values.some((v) => v.role === 'primary' && activeValues.has(v.valueId))).length,
    [data, epoch, activeValues],
  );

  const drawerPoint = openId ? data.find((d) => d.id === openId) ?? null : null;
  const drawerBodyHTML = useMemo(
    () => (drawerPoint ? buildDrawerBody(drawerPoint, data) : ''),
    // langCode is included so the body re-renders into the active language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openId, langCode, data],
  );

  // ── Create the Leaflet map once; React state drives it via render(). ──
  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;
    const ctrl = createAtlasMap(el, () => stateRef.current, (id) => setOpenId(id));
    ctrlRef.current = ctrl;
    ctrl.render();
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  // ── Re-render markers whenever the relevant state changes. ──
  useEffect(() => {
    stateRef.current = { data, epoch, lens, thread, activeValues };
    ctrlRef.current?.render();
  }, [data, epoch, lens, thread, activeKey, langCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load the dataset (client-side, static JSON). ──
  useEffect(() => {
    let cancelled = false;
    fetch('/data/atlas.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d: AtlasPoint[]) => { if (!cancelled) setData(d); })
      .catch((err) => {
        console.error('Failed to load atlas data:', err);
        if (!cancelled) setLoadError(true);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Guided tour: init + first-run auto-start. ──
  useEffect(() => {
    initTour();
    let seen: string | null = null;
    try { seen = localStorage.getItem('va_tour_seen'); } catch { /* ignore */ }
    let to: ReturnType<typeof setTimeout> | null = null;
    if (!seen) to = setTimeout(() => startTour(), 600);
    return () => {
      if (to) clearTimeout(to);
      destroyTour();
    };
  }, []);

  // ── Timeline playback. ──
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      setEpoch((prev) => {
        const idx = EPOCHS.findIndex((e) => e.id === prev);
        const next = (idx + 1) % EPOCHS.length;
        if (next === EPOCHS.length - 1) setIsPlaying(false);
        return EPOCHS[next].id;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [isPlaying]);

  // ── Rewire lineage-row clicks inside the drawer body (built as HTML). ──
  useEffect(() => {
    const el = sheetBodyRef.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLButtonElement>('.lin-row'));
    const handlers = rows.map((btn) => {
      const handler = () => {
        const epid = btn.getAttribute('data-epid');
        const pid = btn.getAttribute('data-pid');
        if (epid && epid !== epoch) setEpoch(epid);
        if (pid) setOpenId(pid);
      };
      btn.addEventListener('click', handler);
      return [btn, handler] as const;
    });
    return () => handlers.forEach(([btn, h]) => btn.removeEventListener('click', h));
  }, [drawerBodyHTML, epoch]);

  function changeLang(code: string) {
    setI18nLang(code);
    setLangCode(getLang());
  }

  function toggleValue(id: string) {
    setActiveValues((prev) => {
      const next = new Set(prev);
      if (next.has(id) && next.size > 1) next.delete(id);
      else if (!next.has(id)) next.add(id);
      return next;
    });
  }

  function selectEpoch(id: string) {
    setIsPlaying(false);
    setEpoch(id);
  }

  return (
    <TooltipProvider>
      <div className="app">
        {/* ── HEADER ── */}
        <header>
          <div className="logo">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="15" stroke="currentColor" opacity="0.16" />
              <circle cx="17" cy="17" r="9" stroke="currentColor" opacity="0.14" />
              <circle cx="17" cy="7" r="2.4" fill="#d0b25e" />
              <circle cx="26.5" cy="21" r="2.8" fill="#2eb074" />
              <circle cx="8" cy="23" r="2" fill="#cc4a4a" />
              <circle cx="23" cy="11" r="1.8" fill="#4a94cc" />
            </svg>
            <div>
              <h1>
                Values Atlas{' '}
                <span style={{ fontSize: 'var(--xs)', fontFamily: 'var(--mono)', color: 'var(--t3)', fontStyle: 'normal' }}>v4</span>
              </h1>
              <div className="logo-sub">{t('subtitle')}</div>
            </div>
          </div>

          <div className="hright">
            <div className="lens-tabs" id="lensTabs">
              {(['moral', 'ecological', 'institutional'] as const).map((id) => (
                <button
                  key={id}
                  className={'ltab' + (lens === id ? ' active' : '')}
                  data-lens={id}
                  onClick={() => setLens(id)}
                >
                  {t('lens_' + id)}
                </button>
              ))}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="tour-btn" aria-label={t('tourReplay')} onClick={() => startTour()}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M9.4 9.2a2.6 2.6 0 1 1 3.7 2.4c-.85.42-1.1.95-1.1 1.7" />
                    <circle cx="12" cy="16.6" r="0.4" fill="currentColor" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('tourReplay')}</TooltipContent>
            </Tooltip>

            <div className="lang-wrap">
              <svg className="lang-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <path d="M3 12h18" />
                <path d="M12 2.5c2.5 2.6 3.9 6 3.9 9.5s-1.4 6.9-3.9 9.5C9.5 18.9 8.1 15.5 8.1 12S9.5 5.1 12 2.5Z" />
              </svg>
              <Select value={langCode} onValueChange={changeLang}>
                <SelectTrigger
                  aria-label={t('language')}
                  className="!h-auto !w-fit !gap-1 !border-0 !bg-transparent !px-0 !py-1 !shadow-none focus-visible:!ring-0"
                  style={{ fontFamily: 'var(--mono)', fontSize: 'var(--xs)', color: 'var(--t2)' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="sidebar">
          <Controls
            primary
            lens={lens}
            epoch={epoch}
            thread={thread}
            activeValues={activeValues}
            onThread={setThread}
            onToggleValue={toggleValue}
            onEpoch={selectEpoch}
          />
        </aside>

        {/* ── MAP ── */}
        <main className="mapwrap">
          <div id="map" ref={mapElRef} />
          <div className="map-banner" id="banner">
            {loadError ? 'Error loading data. Please refresh.' : t('banner')}
          </div>
          <div className="map-counter">
            <strong id="cnt">{visibleCount}</strong>
            <span>{t('pointsInEpoch')}</span>
          </div>

          {/* Mobile controls trigger (CSS shows it only ≤900px). */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="mobile-ctrl-btn" aria-label="Open controls">
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <line x1="0" y1="2" x2="16" y2="2" />
                  <line x1="0" y1="7" x2="16" y2="7" />
                  <line x1="0" y1="12" x2="16" y2="12" />
                </svg>
                <span>{t('controls')}</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="z-[3100] gap-0 rounded-t-3xl border-t border-[var(--b1)] bg-[var(--s1)] p-0 text-[color:var(--t1)] max-h-[85dvh]"
            >
              <SheetTitle className="sr-only">{t('controls')}</SheetTitle>
              <SheetDescription className="sr-only">{t('subtitle')}</SheetDescription>
              <div className="sheet-body min-h-0 flex-1">
                <Controls
                  primary={false}
                  lens={lens}
                  epoch={epoch}
                  thread={thread}
                  activeValues={activeValues}
                  onThread={setThread}
                  onToggleValue={toggleValue}
                  onEpoch={selectEpoch}
                />
              </div>
            </SheetContent>
          </Sheet>
        </main>

        {/* ── TIMELINE ── */}
        <footer>
          <button className="play" aria-label="Play" onClick={() => setIsPlaying((p) => !p)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="tl-mid">
            <div className="tl-labs" id="tlLabs">
              {EPOCHS.map((ep) => (
                <span
                  key={ep.id}
                  className={'tl-lab' + (ep.id === epoch ? ' active' : '')}
                  onClick={() => selectEpoch(ep.id)}
                >
                  {ep.short}
                </span>
              ))}
            </div>
            <Slider
              aria-label="Timeline"
              className="atlas-timeline py-2 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-[var(--s3)] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[var(--gold)] [&_[data-slot=slider-thumb]]:bg-[var(--gold2)]"
              min={0}
              max={EPOCHS.length - 1}
              step={1}
              value={[epochIndex]}
              onValueChange={([v]) => selectEpoch(EPOCHS[v].id)}
            />
          </div>
          <div className="tl-cur">{epochShort}</div>
        </footer>

        {/* ── DETAIL DRAWER (non-modal: map stays interactive) ── */}
        <Sheet
          open={!!openId}
          modal={false}
          onOpenChange={(o) => { if (!o) setOpenId(null); }}
        >
          <SheetContent
            side="right"
            overlay={false}
            showCloseButton={false}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            className="z-[1500] !max-w-none w-[380px] gap-0 overflow-y-auto border-l border-[var(--b1)] bg-[var(--s1)] p-0 text-[color:var(--t1)] max-[900px]:w-[min(94vw,420px)]"
          >
            <div className="drawer-head">
              <SheetTitle asChild>
                <div className="drawer-region">{drawerPoint?.region ?? '—'}</div>
              </SheetTitle>
              <SheetClose className="drawer-close" aria-label="Close drawer">✕</SheetClose>
            </div>
            <SheetDescription className="sr-only">{t('secReadings')}</SheetDescription>
            <div
              className="drawer-body"
              ref={sheetBodyRef}
              dangerouslySetInnerHTML={{ __html: drawerBodyHTML }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
