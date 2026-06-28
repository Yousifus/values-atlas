// ═══════════════════════ GUIDED TOUR ═══════════════════════
// A lightweight first-run walkthrough. Spotlights a target element with a
// dimming overlay and a step card; falls back to a centered card when the
// target is hidden (e.g. sidebar controls on mobile). Steps map 1:1 to the
// `tour` array in i18n.ts.
import { getTour, t, isRTL } from "./i18n";

// Selector for each step's spotlight target. `null` = centered card, no spotlight.
// A fallback selector is tried when the primary target is not visible.
const TARGETS: { sel: string | null; fallback?: string }[] = [
  { sel: null },                                              // 0 welcome
  { sel: '#map' },                                            // 1 the map
  { sel: '#lensTabs' },                                       // 2 lenses
  { sel: 'footer' },                                          // 3 timeline
  { sel: '#vgrid' },                                          // 4 filter values
  { sel: '#threadList' },                                     // 5 follow a thread
  { sel: '.leaflet-marker-icon', fallback: '#map' },         // 6 open a reading
  { sel: '.lang-wrap' },                                      // 7 language
];

let root: HTMLDivElement | null = null;
let spot: HTMLDivElement;
let card: HTMLDivElement;
let active = false;
let step = 0;

function visibleRect(sel: string | null): DOMRect | null {
  if (!sel) return null;
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  // Treat zero-size or off-screen elements as hidden.
  if (r.width < 2 || r.height < 2) return null;
  if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  return r;
}

function markSeen() {
  try { localStorage.setItem('va_tour_seen', '1'); } catch { /* ignore */ }
}

export function initTour() {
  if (root) return;
  root = document.createElement('div');
  root.className = 'tour-overlay';
  root.setAttribute('aria-hidden', 'true');
  spot = document.createElement('div');
  spot.className = 'tour-spot';
  card = document.createElement('div');
  card.className = 'tour-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  root.appendChild(spot);
  root.appendChild(card);
  document.body.appendChild(root);

  // Block background interaction; only card buttons act.
  root.addEventListener('click', (e) => { if (e.target === root) e.stopPropagation(); });
  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'Escape') endTour();
    else if (e.key === 'ArrowRight') go(step + 1);
    else if (e.key === 'ArrowLeft') go(step - 1);
  });
  window.addEventListener('resize', () => { if (active) position(); });
}

export function startTour() {
  if (!root) initTour();
  active = true;
  step = 0;
  root!.classList.add('show');
  render();
}

function endTour() {
  active = false;
  markSeen();
  if (root) root.classList.remove('show');
}

function go(n: number) {
  const total = getTour().length;
  if (n < 0) return;
  if (n >= total) { endTour(); return; }
  step = n;
  render();
}

function render() {
  const steps = getTour();
  const data = steps[step] || { title: '', body: '' };
  const total = steps.length;
  const last = step === total - 1;
  const dots = steps.map((_, i) =>
    `<span class="tour-dot${i === step ? ' on' : ''}"></span>`).join('');

  card.innerHTML = `
    <div class="tour-step">${step + 1} / ${total}</div>
    <div class="tour-title">${data.title || ''}</div>
    <div class="tour-body">${data.body || ''}</div>
    <div class="tour-dots">${dots}</div>
    <div class="tour-actions">
      <button class="tour-skip" type="button">${t(last ? 'done' : 'skip')}</button>
      <div class="tour-nav">
        ${step > 0 ? `<button class="tour-back" type="button">${t('back')}</button>` : ''}
        <button class="tour-next" type="button">${t(last ? 'done' : 'next')}</button>
      </div>
    </div>`;

  (card.querySelector('.tour-skip') as HTMLButtonElement).onclick = endTour;
  const backBtn = card.querySelector('.tour-back') as HTMLButtonElement | null;
  if (backBtn) backBtn.onclick = () => go(step - 1);
  (card.querySelector('.tour-next') as HTMLButtonElement).onclick = () => go(step + 1);

  position();
}

function position() {
  const target = TARGETS[step] || { sel: null };
  let rect = visibleRect(target.sel);
  if (!rect && target.fallback) rect = visibleRect(target.fallback);

  if (!rect) {
    // Centered card, no spotlight.
    spot.style.opacity = '0';
    card.classList.add('tour-center');
    card.style.top = '';
    card.style.left = '';
    return;
  }

  // Spotlight the target.
  const pad = 8;
  spot.style.opacity = '1';
  spot.style.top = `${rect.top - pad}px`;
  spot.style.left = `${rect.left - pad}px`;
  spot.style.width = `${rect.width + pad * 2}px`;
  spot.style.height = `${rect.height + pad * 2}px`;

  // Place the card near the spotlight, flipping above/below to stay on-screen.
  card.classList.remove('tour-center');
  const cw = card.offsetWidth || 320;
  const ch = card.offsetHeight || 200;
  const vw = window.innerWidth, vh = window.innerHeight;
  const gap = 16;

  let top = rect.bottom + gap;
  if (top + ch > vh - 12) {
    const above = rect.top - gap - ch;
    top = above > 12 ? above : Math.max(12, (vh - ch) / 2);
  }
  let left = isRTL()
    ? rect.right - cw
    : rect.left;
  left = Math.min(Math.max(12, left), vw - cw - 12);

  card.style.top = `${Math.round(top)}px`;
  card.style.left = `${Math.round(left)}px`;
}

// Allow callers (e.g. effect cleanup) to tear down the appended overlay so
// React strict-mode remounts don't stack multiple overlays on <body>.
export function destroyTour() {
  if (root && root.parentNode) root.parentNode.removeChild(root);
  root = null;
  active = false;
  step = 0;
}
