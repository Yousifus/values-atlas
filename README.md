# Values Atlas

An interactive map of how human values emerge, couple, and shift across geography and deep time. Every data point is a civilization at a moment in time, showing which values were primary, which were coupled, and which were being actively suppressed.

**Live:** https://values-atlas.vercel.app · **Source:** https://github.com/Yousifus/values-atlas

Built with **Next.js (App Router) + TypeScript**, **Tailwind CSS + shadcn/ui**, and **Leaflet**. The map runs entirely client-side; the dataset is a plain static JSON file anyone can fork and edit.

---

## Why this exists

The atlas is a **mirror of history**. Stand on one patch of earth and scrub through time and you'll find it held radically different ideas of what it meant to be "good" — and that the virtues which rose weren't random. They were pressed into shape by ecological and institutional pressures: scarcity and surplus, kinship and bureaucracy, frontier and wall, plague and trade route.

Its deeper aim is to **dissolve false certainty** — to let anyone read the past through many lenses instead of the single lens they happened to inherit. It started from a small, ordinary frustration: arguing with a fixed opinion that refused to entertain the possibility it might be wrong. The answer wasn't a better argument; it was a better view. If you can *see* that morality has always been plural and situated, certainty loosens its grip on its own.

In spirit it's kin to grand-strategy games — Civilization, Humankind, Crusader Kings — which make the invisible forces of history legible and explorable. The atlas does the same thing for values: it turns the deep machinery of culture into something you can pan, zoom, filter, and trace.

And it is meant to be **universally accessible — to any human or AI agent — over the open internet**: free, forkable, and re-hostable now or decades from now. No backend, no database, no auth, no tracking. One page, one JSON file, the open web.

---

## Project philosophy

Portability and legibility are the *point*:

- **Client-side map**: no backend, no database, no auth, no tracking. The page renders a Leaflet map in the browser and reads one JSON file.
- **Single source of truth**: adding a data point means editing only `public/data/atlas.json`. No code changes required.
- **Ships in 11 languages**: the UI, schema labels, and guided tour are translated into English, Spanish, French, German, Portuguese, Italian, Chinese, Japanese, **Arabic (full RTL)**, Hindi, and Russian. The scholarly per-point readings stay in their original English by design (for now — see the roadmap).

---

## Tech stack

- **Next.js (App Router) + TypeScript** — the page dynamically imports the map client-only (`next/dynamic`, `ssr: false`).
- **Tailwind CSS v4 + shadcn/ui** — the chrome (controls, drawer, sheets, sliders, selects, tooltips) is real React dressed with shadcn components. The shadcn tokens are derived 1:1 from the original atlas palette, so the components feel like the same atlas rather than a generic starter. The original dark cartographic CSS is preserved verbatim and intentionally left unlayered so it still wins the cascade.
- **Leaflet** — loaded client-only, driven imperatively behind a small controller (`components/atlas/mapController.ts`) so the divIcon markers, popups, and animated halos behave exactly as designed.
- **pnpm** for package management, **Vercel** for hosting.

The whole dataset — currently **67 data points** — is a static JSON file anyone can hand-edit, fork, and re-host. That forkability is a feature, not an accident.

---

## Live & continuous deployment

The production site at https://values-atlas.vercel.app is git-connected to Vercel:

- Push to **`main`** → auto-deploys to production.
- Open a **branch / PR** → Vercel generates a preview URL automatically.

There's nothing to configure to deploy — no environment variables, database, or server secrets. Any push is a deploy.

---

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve the production build
```

Requires Node 18+ and pnpm.

---

## Project structure

```
app/
  layout.tsx          — root layout: metadata, CDN fonts (Satoshi/Boska/Space Mono)
  page.tsx            — home route; dynamically imports the map client-only (ssr: false)
  globals.css         — Tailwind v4 + shadcn tokens layered ON TOP of the original
                        atlas CSS (kept verbatim; the atlas rules stay unlayered so
                        the cartographic look is preserved exactly)
components/
  ValuesAtlas.tsx     — the interactive experience as React: lenses, drawer, timeline,
                        threads, filters, and the guided tour, composed from shadcn/ui
  atlas/
    mapController.ts   — imperative Leaflet controller (markers, halos, lens recolor)
    drawerContent.ts   — builds the per-point drawer body
  ui/                  — shadcn/ui primitives: button, card, badge, sheet, select,
                         slider, tooltip, toggle, toggle-group, scroll-area,
                         separator, dropdown-menu
lib/
  schema.ts           — VALUES, EPOCHS, DRIVERS, STATUS, EVIDENCE_COLORS, THREADS
                        config + inline SVG glyphs, and the AtlasPoint type
  i18n.ts             — all 11 language packs + RTL handling
  tour.ts             — first-run guided tour
  utils.ts            — `cn()` class helper used by the shadcn components
public/
  data/atlas.json         — the full dataset as pure JSON (edit this to add data)
  data/atlas.schema.json  — JSON Schema (draft-07) for validating data points
  favicon.svg
  robots.txt
components.json         — shadcn/ui configuration
postcss.config.mjs     — PostCSS / Tailwind pipeline
```

> **Why client-only, imperative Leaflet?** Leaflet needs `window`, so the map is
> loaded client-only via `next/dynamic({ ssr: false })`. The render/lens/drawer/
> timeline logic lives in a small imperative controller rather than react-leaflet,
> which keeps the divIcon markers, popups, and animated halos behaving identically
> to the original — while the surrounding chrome is now proper React + shadcn/ui.

---

## Adding a new data point

1. Open `public/data/atlas.json`.
2. Add a new object to the array using this template:

```json
{
  "id": "my-region-epoch",
  "region": "Region Name",
  "thread": "none",
  "lat": 0,
  "lng": 0,
  "epoch": "modern",
  "values": [
    { "valueId": "solidarity", "intensity": 0.85, "role": "primary" },
    { "valueId": "collectivism", "intensity": 0.70, "role": "coupled" },
    { "valueId": "individualism", "intensity": 0.15, "role": "counter" }
  ],
  "drivers": ["institutional_scale", "resource_scarcity"],
  "status": "adaptive",
  "evidence": "textual",
  "confidence": 0.75,
  "contested": false,
  "note": "Your primary reading of this value complex and its ecology.",
  "altReading": "A competing scholarly interpretation.",
  "cost": "What this value complex costs its participants.",
  "sources": ["Author, A. (Year). Title."]
}
```

3. That's it. No code changes required — refresh the page.

### Validate (optional)

```bash
npx ajv-cli validate -s public/data/atlas.schema.json -d public/data/atlas.json
```

---

## Data schema

Every entry in `public/data/atlas.json` is one **data point** — one civilization at one epoch.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique slug, kebab-case (e.g. `"san-hg"`) |
| `region` | `string` | Human-readable region name shown in the UI |
| `thread` | `string` | Civilization thread for "Follow a Thread". One of: `"arabia"`, `"china"`, `"india"`, `"europe"`, `"steppe"`, `"africa"`, `"americas"`, `"none"` |
| `lat` | `number` | Latitude (−90 to 90) |
| `lng` | `number` | Longitude (−180 to 180) |
| `epoch` | `string` | One of: `"hunter"`, `"early-agr"`, `"bronze"`, `"iron"`, `"axial"`, `"imperial"`, `"medieval"`, `"early-mod"`, `"industrial"`, `"modern"`, `"now"` |
| `values` | `array` | Array of value objects (see below) |
| `drivers` | `array` | Array of driver IDs (see below) |
| `status` | `string` | One of: `"adaptive"`, `"residual"`, `"reactive"`, `"reactivated"` |
| `evidence` | `string` | One of: `"ethnographic"`, `"textual"`, `"archaeological"`, `"inferred"`, `"speculative"` |
| `confidence` | `number` | 0.0–1.0 (displayed as a confidence bar) |
| `contested` | `boolean` | Whether the reading is disputed |
| `note` | `string` | Primary reading — the main scholarly interpretation |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `contestNote` | `string` | Required if `contested: true`. Explains the dispute. |
| `altReading` | `string` | A counter-reading or alternative perspective |
| `cost` | `string` | The shadow — what this value complex costs its participants |
| `successor` | `string` | ID of the data point this one "evolved into" |
| `artifact` | `string` | A primary source quote. Do not include outer quotes — the UI adds them. |
| `sources` | `array of strings` | Citation list (author, year, title format) |

### The `values` array

```json
{ "valueId": "egalitarianism", "intensity": 0.95, "role": "primary" }
```

| Field | Type | Description |
|-------|------|-------------|
| `valueId` | `string` | One of the value IDs below |
| `intensity` | `number` | 0.0–1.0. How strongly present — affects marker size. |
| `role` | `string` | `"primary"` (dominant — controls marker color & size), `"coupled"` (reinforces), `"counter"` (actively suppressed/opposed) |

**Rules:** exactly one value must be `"primary"`. Coupled values reinforce it; counter values are what it defines itself *against*.

### Available value IDs

`generosity`, `hospitality`, `solidarity`, `aggression`, `honor`, `piety`, `curiosity`, `individualism`, `collectivism`, `egalitarianism`, `order`, `hierarchy`

### Available driver IDs

Each driver belongs to a `group` (`"eco"` or `"inst"`) in `lib/schema.ts`, which controls coloring under the Ecological vs. Institutional lenses.

**Ecological / material** (`group: "eco"`): `resource_scarcity`, `pathogen_load`, `open_frontier`, `resource_competition`, `metallurgy`, `maritime_expansion`, `nomadic_mobility`

**Institutional / social** (`group: "inst"`): `weak_institutions`, `kinship_intensity`, `hydraulic_coordination`, `institutional_scale`, `trade_networks`, `literacy`, `monumental_religion`, `military_revolution`, `colonial_pressure`, `industrialization`, `secularism_threat`, `technological_surplus`

---

## Lenses

The three lenses re-color the map markers by different axes:

| Lens | Colors by | Marker glyph |
|------|-----------|--------------|
| **Moral** | Primary value (each value has a fixed color) | The primary value's glyph |
| **Ecological** | First matching `group: "eco"` driver | That driver's glyph |
| **Institutional** | First matching `group: "inst"` driver | That driver's glyph |

Both `VALUES` and `DRIVERS` carry an `icon` field — an inline SVG glyph (24×24, stroke-based) reused across markers, sidebar pills, the lens legend, and the drawer's driver chips.

---

## Roadmap / where this is going

This is honest, future-tense: the items below are **planned, not yet shipped**. Today the atlas is 67 points, each with a primary reading and a few flat fields. The direction is to deepen it without ever compromising integrity.

- **Typed aspects per point.** Broaden from a few flat readings to many structured, sourced **aspects** — gender dynamics, myth, religion, commerce, law/governance, daily life, architecture, dress, written scripts, and art — each a self-contained, multi-reading section rather than one paragraph.
- **A visual / media layer.** Public-domain and Creative Commons imagery of architecture, dress, scripts, and art, attached to the relevant aspects.
- **An integrity-locked research pipeline.** The atlas will surface *real published scholarship* — grounded in scholarly indexes like OpenAlex and Crossref, with DOIs/ISBNs — rather than inventing anything. AI acts strictly as a research assistant: it drafts *candidate* readings with citations into a **human review queue**. Nothing auto-publishes; a person approves every reading.
- **Translation of the readings themselves.** The UI already ships in 11 languages including Arabic RTL; the next step is translating the scholarly per-point content too.
- **A scholar-collaboration path.** Per-reading attribution and endorsement, plus a low-friction way for professors and domain experts to correct and contribute.

Throughout, the contribution model stays simple and transparent: **edit `public/data/atlas.json` and open a PR.** Forkable, reviewable, and re-hostable by anyone.

---

## Contributing

1. Fork the repo.
2. Edit the data (`public/data/atlas.json`) or the code.
3. Open a pull request.

Every PR gets an automatic Vercel preview URL, so changes are easy to see before they merge. Adding or correcting a data point requires no build step or code change — just edit the JSON.
