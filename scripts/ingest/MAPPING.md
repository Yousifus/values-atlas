# Tier 1 Ingestion — Mapping Discipline

This document records **every interpretive rule** the ingestion pipeline applies,
so a human reviewer can audit each coded-variable → atlas decision before this
work is merged to production.

> **NEEDS HUMAN REVIEW.** All value/driver mappings below are interpretive. The
> pipeline is deliberately conservative: uncertain mappings get lower
> `confidence` and `contested: true`, and links from a source record to an atlas
> point are explicit, hand-authored crosswalks (not fuzzy matches).

## Principles (Path A compliance)

- **Facts in, prose not invented.** We ingest coordinates, dates, and coded
  variables — never AI-written readings. Reading text is a factual restatement
  of the source's own coding.
- **Provenance is mandatory.** Every ingested reading and citation carries
  `sourceDataset` + `license: "CC-BY-4.0"` + a real citation (DOI/handle), via
  `lib.mjs` (`makeReading`, `upsertCitation`).
- **Additive only.** We never mutate or remove existing readings/values. Values
  are added only when the `valueId` is absent (`addValueIfAbsent`); drivers are
  unioned (`addDriver`); aspects/readings/bibliography are appended.
- **Idempotent.** Re-running strips a source's prior contributions (tagged
  readings/bibliography by `sourceDataset`; new points by id prefix) and
  recomputes deterministically. See `run.mjs --check`.
- **Run order.** The orchestrator adds new points (Pulotu) **first**, then runs
  the enrichment sources (Reba → DRH → Maddison) across the complete atlas, so
  Reba's geo/temporal backbone can also attach to nearby Pulotu points where a
  recorded urban centre falls in range. New Pulotu point ids (`pulotu-…`) are
  slugified to `[a-z0-9-]` to satisfy the schema id pattern.

## Shared deterministic rules (`lib.mjs`)

### Year → epoch (`yearToEpoch`)

Each atlas epoch has a representative anchor year (matching the UI's `EPOCHS`
"short" labels):

| epoch | anchor | epoch | anchor |
|-------|-------:|-------|-------:|
| hunter | −100000 | medieval | 1000 |
| early-agr | −10000 | early-mod | 1600 |
| bronze | −3000 | industrial | 1820 |
| iron | −1200 | modern | 1900 |
| axial | −500 | now | 2020 |
| imperial | 200 | | |

A calendar year is assigned to the epoch whose anchor is **nearest** (ties →
earlier epoch). This is a coarse, deterministic banding; it is a claim about
*when* a record applies, not a developmental-stage judgement.

### Geo matching (`haversineKm`, `nearestPoint`)

Great-circle distance. Source records are linked to an atlas point only within a
documented radius **and** the same epoch (see Reba).

---

## 1. Reba / Reitsma / Seto urbanization → ENRICH (`reba.mjs`)

`sourceDataset: "Reba-2016-urbanization"` · CC-BY-4.0 · doi:10.1038/sdata.2016.34,
doi:10.7910/DVN/LMCQGX

The CSV is wide (one row per city; columns `BC_2250…AD_1975` hold population
snapshots, plus `Latitude`, `Longitude`, `Certainty`). We flatten it to
`{lat, lng, city, reliability, year, pop}` observations.

For each existing atlas point we take all urban observations within
**300 km** whose snapshot year maps to the **same epoch**, keep the **largest**
settlement, and:

| condition | effect |
|-----------|--------|
| `pop ≥ 10,000` | union driver `institutional_scale` (standing urban administrative centre) |
| `pop ≥ 30,000` | union driver `trade_networks` (large city ⇒ trade integration) |
| always | append a `commerce` reading naming the city, population, and year |

**Reliability → confidence** (SEDAC `Certainty`, 1 best … 3 weakest):
`1 → 0.8`, `2 → 0.6`, `3 → 0.4`, else `0.5`. Applied to the added reading's
`confidence` (the point's own `confidence` is never overwritten).

Reviewer notes: the 300 km radius can attach a city to a neighbouring
civilization's centroid; spot-check coastal/dense regions.

---

## 2. DRH / SCCSR → ENRICH (`drh.mjs`)

`sourceDataset: "DRH-SCCSR"` · CC-BY-4.0 · doi:10.5281/zenodo.14967261;
cite Slingerland et al. (DRH) + SCCSR Zenodo.

We use the cleanly-structured `social_complexity.csv` (entry → political/social
complexity: chiefdom / state / empire / colony).

**Explicit crosswalk** (atlas point id → exact SCCSR "Entry Name") — each line
is a reviewable interpretive decision:

| atlas point | SCCSR entry | level |
|-------------|-------------|-------|
| `egypt-bronze` | Ancient Egypt | empire |
| `han-china` | Han Confucianism | empire |
| `shang-bronze` | Chinese State Religion (Shang and Western Zhou) | empire |
| `neo-assyria` | Neo-Assyrian Scholars | empire |
| `rome-empire` | Roman private religion | empire |
| `mongol-med` | Khalka Mongols | state |

**Social-complexity → corroborating values** (added only if absent; never
overwrites the hand-authored values):

| level | hierarchy | order | driver |
|-------|----------:|------:|--------|
| empire | 0.80 | 0.70 | `institutional_scale` |
| state | 0.70 | 0.65 | `institutional_scale` |
| chiefdom | 0.55 | 0.50 | `institutional_scale` |

A `governance` reading restates the coding (`confidence: 0.6`, `contested:
true`). `uncoded` / `colony` levels are skipped as too ambiguous.

**Scope note / documented next step:** the richer DRH religion-poll items the
brief lists — *moralizing punishing gods, formal legal code, human sacrifice,
women officiate, supernatural monitoring* — live in the DRH poll **answer
tables** (the Zenodo SQL dump / `drh_tables.zip`), not in
`social_complexity.csv`. Ingesting those (e.g. *"moralizing punishing gods =
yes" → +piety, +order*; *"human sacrifice = yes" → +aggression, contested*) is
the next reviewer-gated enrichment. The **Pulotu** module already demonstrates
the *supernatural-monitoring → piety* mapping from the same DRH research
programme (Watts et al.), so the pattern is proven end-to-end.

---

## 3. Maddison Project Database 2023 → ENRICH (`maddison.mjs`)

`sourceDataset: "Maddison-Project-2023"` · CC-BY-4.0 · cite Bolt & van Zanden
(2024) doi:10.1111/joes.12618; DataverseNL doi:10.34894/INZBF2. Read via the
OWID long-format CSV mirror (`Entity, Year, GDP per capita, Population, GDP`).

**Explicit crosswalk** (atlas point id → `{ Maddison entity, target year }`).
The nearest available year within ±40 yr is used.

| atlas point | entity | year | atlas point | entity | year |
|-------------|--------|-----:|-------------|--------|-----:|
| `abolition-brit` | United Kingdom | 1820 | `dutch-em` | Netherlands | 1700 |
| `victorian-britain` | United Kingdom | 1870 | `tokugawa-em` | Japan | 1700 |
| `meiji-japan` | Japan | 1900 | `qing-em` | China | 1700 |
| `industrial-usa` | United States | 1900 | `mughal-em` | India | 1600 |
| `usa-frontier-mod` | United States | 1900 | `china-now` | China | 2016 |
| `ottoman-tanzimat` | Turkey | 1870 | `scandinavia-now` | Sweden | 2016 |
| `socialist-movement` | Germany | 1880 | `southafrica-now` | South Africa | 2016 |
| `weimar-modern` | Germany | 1925 | `sv-now` | United States | 2016 |
| `soviet-russia` | Russia | 1950 | `un-now` | Switzerland | 2016 |
| `gandhi-india` | India | 1940 | | | |

**GDP-per-capita (int.$) → drivers** (deterministic bands):

| condition | driver |
|-----------|--------|
| `gdppc ≥ 2,000` | `trade_networks` |
| `gdppc ≥ 3,500` | `industrialization` |
| `gdppc ≥ 10,000` | `technological_surplus` |

A `commerce` reading records GDP-pc + population + year (`confidence: 0.7`).

Reviewer notes: modern nation-state borders are mapped onto historical
civilization points; e.g. `soviet-russia` → "Russia". Audit anachronistic
entity↔point pairings.

---

## 4. D-PLACE Pulotu → ADD new Oceania points (`pulotu.mjs`)

`sourceDataset: "D-PLACE-Pulotu"` · CC-BY-4.0 · cite Watts et al. (2015)
doi:10.1371/journal.pone.0136783 + D-PLACE CLDF release. **Only** the Pulotu
subset of D-PLACE is permissive; the EA / SCCS subsets are NonCommercial and are
**not** touched.

One new atlas point per Pulotu society with valid coordinates
(`id: pulotu-<societyID>`, `region: <society name>`, `thread: "none"`,
`evidence: "ethnographic"`, drivers `["maritime_expansion", "kinship_intensity"]`).

**Epoch** = `yearToEpoch(Traditional State Time Focus)` (Pulotu variable 1). This
reflects *when the tradition was ethnographically documented*, not a
developmental-stage claim. Missing time focus → fallback year 1900.

**Belief in god(s)** (var 2, focus 0–3) → `piety` base:
`0 → none`, `1 → 0.45`, `2 → 0.70`, `3 → 0.85`; **+0.10** if supernatural
punishment for impiety (var 7) present; **+0.05** if costly sacrifices (var 36)
present; capped at 0.95. *(This is the supernatural-monitoring → piety rule.)*

**Warfare** (vars 54 internal / 55 external, 1 frequent … 4 rare) → `aggression`
from the more frequent (minimum code): `1 → 0.8`, `2 → 0.6`, `3 → 0.4`,
`4 → 0.2`.

**Punishment for selfishness** (var 8) present → `solidarity` 0.6.

If no value is derived, the point defaults to `solidarity` 0.5 (kin-based
society). The highest-intensity value is `primary`; the rest `coupled`.

**Aspects:** a `values-synthesis` reading (factual summary, `contested: true`),
a `religion` reading (gods / nature gods / deified ancestors / supernatural
punishment / costly sacrifices), and — only when coded present — a `myth`
reading (culture heroes / supernatural forces of nature).

Reviewer notes: epoch-by-time-focus places most Pacific societies in
`early-mod`/`industrial`/`modern`; this is intentional and documented, but
verify it reads correctly on the map/timeline. Driver attribution
(`maritime_expansion`, `kinship_intensity`) is a blanket Austronesian
assumption — audit for inland Taiwanese Aboriginal societies.
