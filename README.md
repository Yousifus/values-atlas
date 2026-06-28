# Values Atlas

An interactive map of how human values emerge, couple, and shift across geography and deep time. Every data point is a civilization at a moment in time, showing which values were primary, which were coupled, and which were being actively suppressed.

Built with **Next.js (App Router) + TypeScript** and **Leaflet**. The map runs entirely client-side; the dataset is a plain static JSON file anyone can fork and edit.

---

## Project philosophy

This is meant to be a free, open thing that anyone — anywhere, now or decades from now — can open, read, fork, and re-host. Its portability and legibility are the *point*:

- **Client-side map**: no backend, no database, no auth, no tracking. The page renders a Leaflet map in the browser and reads one JSON file.
- **Single source of truth**: adding a data point means editing only `public/data/atlas.json`. No code changes required.
- **Ships in 11 languages**: the UI, schema labels, and guided tour are translated into English, Spanish, French, German, Portuguese, Italian, Chinese, Japanese, **Arabic (full RTL)**, Hindi, and Russian. The scholarly per-point readings stay in their original English by design.

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
  globals.css         — all styling (the original custom CSS, not Tailwind)
components/
  ValuesAtlas.tsx     — the entire interactive experience: Leaflet map, lenses,
                        drawer, timeline, threads, filters, and the guided tour,
                        run imperatively inside a single client-side effect
lib/
  schema.ts           — VALUES, EPOCHS, DRIVERS, STATUS, EVIDENCE_COLORS, THREADS
                        config + inline SVG glyphs, and the AtlasPoint type
  i18n.ts             — all 11 language packs + RTL handling
  tour.ts             — first-run guided tour
public/
  data/atlas.json         — the full dataset as pure JSON (edit this to add data)
  data/atlas.schema.json  — JSON Schema (draft-07) for validating data points
  favicon.svg
  robots.txt
```

> **Why imperative Leaflet inside an effect?** Leaflet needs `window`, so the map
> is loaded client-only via `next/dynamic({ ssr: false })`. The original vanilla-JS
> render/lens/drawer/timeline logic is preserved faithfully (divIcon markers,
> popups, animated halos) rather than rewritten to react-leaflet, which keeps the
> behavior identical.

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

## Deploying

The app is a static/client-rendered Next.js app with no environment variables, database, or server secrets. It deploys to Vercel (or any Node host) out of the box:

```bash
vercel          # preview deployment
vercel --prod   # production
```
