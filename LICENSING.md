# Licensing & Provenance Policy ("Path A")

This document explains the licensing posture of the Values Atlas for
contributors and forkers. The guiding principle is simple:

> **The atlas core stays permissive and forkable — forever.**
> Anyone, human or AI agent, now or decades from now, must be able to re-host
> it freely. We never let a restrictive external source contaminate that core.

## Dual license at a glance

| Part | What it covers | License |
|------|----------------|---------|
| **Code** | The app, build tooling, scripts | **MIT** — see [`LICENSE`](./LICENSE) |
| **Data** | The dataset in `public/data/` | **CC-BY-4.0** — see [`public/data/LICENSE`](./public/data/LICENSE) |

- **Code → MIT.** Maximally permissive; use, modify, and redistribute freely.
- **Data → CC-BY-4.0.** Permissive with attribution required. Share and adapt,
  even commercially, as long as you credit the Values Atlas.

## The principle: facts aren't copyrightable; databases are

Individual facts ("this civilization at this epoch emphasized X") are **not**
copyrightable. What *is* protectable is the **database** — the curated
selection, structure, syntheses, and original expression we author around those
facts. CC-BY-4.0 governs that original expression and the database as a whole,
which is why attribution is required when reusing the dataset.

## Rule for external sources

The atlas **never bulk-embeds** restrictively-licensed datasets into its core.
Instead, every external source falls into one of two tracks:

### 1. Permissive sources → may be incorporated (with attribution)

Content under **CC-BY**, **CC0**, or **public domain** may be incorporated
directly into the CC-BY-4.0 core, with attribution recorded on the relevant
reading/citation (see "Provenance is mandatory" below).

### 2. Restricted sources → cite, don't redistribute

Content under **NonCommercial** (CC-BY-NC), **ShareAlike** (CC-BY-NC-SA /
CC-BY-SA), or otherwise redistribution-restricted licenses
(e.g. **WVS** and similar survey datasets) is **never** copied into the core.
It is used only as:

- **Cited, transformative summaries** — we read the source and write our own
  original synthesis, citing it. We do not reproduce its coded values, tables,
  or text. (Cite-don't-redistribute.)
- **Quarantined sidecar files** — if any genuinely-copied coded values are ever
  needed, they go into a **separately-licensed sidecar file**, e.g.
  `public/data/sidecars/<source>.json`, carrying its **own** license header that
  matches the source's terms. Sidecars are never folded into the CC-BY-4.0 core,
  so forkers can drop or keep them based on their own reuse rights.

This keeps the core clean: a forker can take `public/data/atlas.json` under
CC-BY-4.0 with confidence, and separately decide what to do with any sidecars.

## Provenance is mandatory

Every reading and every citation can record where it came from and under what
terms, via two optional-but-expected fields:

- `sourceDataset` — an identifier of the originating dataset/source.
- `license` — the SPDX identifier or human-readable license of that source.

These appear on both the `Reading` and `Citation` types in
[`lib/schema.ts`](./lib/schema.ts) and on the corresponding sub-schemas in
[`public/data/atlas.schema.json`](./public/data/atlas.schema.json). They are
**optional** (existing points predate them), but new readings drawn from any
external source **should** carry them so that:

- provenance is transparent, and
- forkers can **filter by what they may reuse** (e.g. keep only `CC0` / `CC-BY`
  readings for a commercial fork).

## TL;DR for contributors

1. Adding original analysis or a permissively-licensed fact? → goes in the core,
   record `sourceDataset` + `license` if it draws on an external source.
2. Drawing on a NonCommercial / ShareAlike / restricted source? → write your own
   transformative summary and cite it. Do **not** paste its coded values.
3. Must carry copied restricted data? → put it in a separately-licensed sidecar,
   never in the CC-BY-4.0 core.
4. When in doubt, keep the core permissive. Forkability is the whole point.
