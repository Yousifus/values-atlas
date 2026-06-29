# Thin Spines — Coverage Map & Cited Candidate Points

**Status:** Proposal / sourcing plan. **This document and its companion
[`candidate-points.json`](./candidate-points.json) add NOTHING to the live
dataset.** They are a staging queue for later, human-reviewed ingestion.

- **Do not** edit `public/data/atlas.json` from this work — that file is owned
  by the Tier 1 ingestion effort on `feature/tier1-ingestion`.
- The app build is **untouched**; these are docs-only additions under
  `docs/sourcing/`.
- Every proposed `values[]`/`drivers[]` below is an **interpretive hypothesis**
  flagged *NEEDS REVIEW* — not a finding.
- Licensing follows **Path A** ([`LICENSING.md`](../../LICENSING.md)): cite books
  for non-copyrightable facts (cite-don't-copy), incorporate only CC-BY/CC0
  datasets (D-PLACE, Pulotu, DRH) into the core, and treat **Seshat
  (CC-BY-NC-SA) as cite-only**.

---

## TL;DR — ingest-first shortlist (top 10)

Ranked by **coverage impact × source quality/availability × license cleanliness**.
"Empty-cell" = the proposed `thread × epoch` cell currently has **zero** points.

| # | Candidate | Thread | Epoch | Fills empty cell? | Anchor citation (verified) |
|---|-----------|--------|-------|:-:|----------------------------|
| 1 | **Inca / Tawantinsuyu** | americas | early-mod | — (glaring omission) | D'Altroy 2014, ISBN 9781444331158 |
| 2 | **Caral / Norte Chico** | americas | bronze | ✅ | Haas et al. 2004, [doi:10.1038/nature03146](https://doi.org/10.1038/nature03146) |
| 3 | **Tiwanaku** | americas | medieval | ✅ | Kolata 1993, ISBN 9781557861832 |
| 4 | **Cahokia / Mississippian** | americas | medieval | ✅ | Pauketat 2009, ISBN 9780670020904 |
| 5 | **Yamnaya (Pontic-Caspian)** | steppe | bronze | ✅ (thinnest spine) | Anthony 2007, ISBN 9780691058870 |
| 6 | **Lapita complex** | none → *oceania* | iron | — (opens Oceania) | Kirch 2017, ISBN 9780520292819 + Pulotu (CC-BY) |
| 7 | **Hawaiian archaic states** | none → *oceania* | early-mod | — | Kirch 2010, ISBN 9780520267251 + Pulotu (CC-BY) |
| 8 | **Kush / Meroë** | africa | axial | ✅ | Welsby 1996, ISBN 9780714109862 |
| 9 | **Kerma (Nubia)** | africa | bronze | ✅ | Edwards 2004, ISBN 9780415369879 |
| 10 | **Monte Albán / Zapotec** | americas | axial | ✅ | Marcus & Flannery 1996, ISBN 9780500050781 |

**Strong runners-up:** Olmec (americas/iron, empty), Kuk Swamp early agriculture
(early-agr, independent origin, [doi:10.1126/science.1085255](https://doi.org/10.1126/science.1085255)),
Songhai & Ghana (africa), Great Zimbabwe + Swahili coast (africa/medieval),
Gökturks & Dzungar (steppe), Jōmon (complex foragers), Māori & Tonga (Oceania).

---

## 1. Coverage grid (thread × epoch)

Parsed from `public/data/atlas.json` (**67 points**). Counts are points per
cell. The schema's seven geographic spines are shown plus a **`none`** row —
a grab-bag of 12 points that don't map to any spine (see §1.1).

```
THREAD      hunter  early-agr  bronze  iron  axial  imperial  medieval  early-mod  industrial  modern  now │ TOT
arabia         0        1        2      1      1       0         1          0           1         1     1 │  9
china          0        1        1      0      1       1         0          1           0         0     1 │  6
india          0        0        1      1      1       0         0          1           0         1     0 │  5
europe         0        0        1      0      2       1         2          2           3         1     2 │ 14
steppe         0        0        0      1      0       1         1          0           0         0     0 │  3
africa         2        0        0      1      0       1         1          1           1         0     1 │  8
americas       2        1        0      0      0       1         0          1           2         2     1 │ 10
none (misc)    2        2        1      1      1       1         1          1           1         1     0 │ 12
────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────
TOTAL          6        5        6      4      5       6         5          7           8         6     6 │ 67
```

**Heat reading** (▓ rich ≥2 · ░ thin =1 · ·· EMPTY =0), geographic spines only:

```
THREAD      hunter early-agr bronze iron axial imper mediev e-mod indus mod  now
arabia        ··    ░        ▓     ░    ░    ··    ░     ··    ░    ░    ░
china         ··    ░        ░     ··   ░    ░     ··    ░     ··   ··   ░
india         ··    ··       ░     ░    ░    ··    ··    ░     ··   ░    ··
europe        ··    ··       ░     ··   ▓    ░     ▓     ▓     ▓    ░    ▓
steppe        ··    ··       ··    ░    ··   ░     ░     ··    ··   ··   ··
africa        ▓     ··       ··    ░    ··   ░     ░     ░     ░    ··   ░
americas      ▓     ░        ··    ··   ··   ░     ··    ░     ▓    ▓    ░
```

### 1.1 The `none` grab-bag = a hidden thread gap

12 points have `thread:"none"` because **the schema has no spine for them**:

- **Oceania / Austronesia** (3): `papua-hg`, `arnhem-hg` (hunter), `polynesia-med` (medieval)
- **Japan** (2): `tokugawa-em`, `meiji-japan`
- **Persia** (2): `persia-axial` (Achaemenid), `sasanian-persia`
- **Pharaonic Egypt** (1): `egypt-bronze`
- **Levant / early Near East** (3): `natufian-agr`, `catalhoyuk-agr`, `phoenicia`
- **Russia** (1): `soviet-russia`

> **Recommendation:** add an **`oceania`** thread to `THREADS` in
> `lib/schema.ts` before ingesting the Oceanic candidates below. (Persia/Japan/
> Egypt are arguably their own spines too, but Oceania is the most acute: it is
> a whole peopled third of the planet represented by 3 unthreaded points.)
> Until then, Oceanic candidates carry `thread:"none"` + a `threadNote`.

---

## 2. Gap analysis — where the atlas is thin

### Thinnest spines (by total points)
1. **Eurasian steppe — 3.** Only `scythians` (iron), `xiongnu` (imperial),
   `mongol-med` (medieval). **Empty:** bronze, axial, early-mod (+ all deep/late).
2. **Oceania/Austronesia — effectively 3** (buried in `none`). No Lapita, no
   Polynesian chiefdoms beyond one Society-Islands point, no Hawaiʻi/Aotearoa/Rapa Nui.
3. **South Asia — 5** and **China — 6** are also lean, but the brief targets the
   four under-covered macro-regions; these Old-World literate spines are lower priority.
4. **Sub-Saharan Africa — 8**, but spread thin: **empty** at early-agr, bronze,
   axial, modern; medieval holds only Mali despite Ghana, Songhai, Great Zimbabwe,
   Swahili, Kongo all being citeable.
5. **Americas — 10**, but **deep time is empty**: bronze, iron, axial, medieval
   all zero, and the **Inca are entirely missing**.

### Thinnest epochs (deep time)
- **iron (4 total)** and **axial (5)** are weak outside the Old World; **americas
  and china have zero iron**, **americas/steppe/africa have zero axial**.
- **bronze (6)** is empty for americas, africa, steppe.
- **early-agr (5)** is all Old-World + Andes; **no independent New-Guinea/Sahul
  origin**, despite Kuk Swamp being a textbook independent domestication centre.
- **hunter (6)** is reasonably stocked but **entirely mobile-egalitarian
  foragers** (San, Hadza, Inuit, Yanomami, Papua, Arnhem). No *complex/affluent
  sedentary forager* case (e.g. Jōmon).

### The emptiest cells we target (priority regions)

| Cell | Status | Proposed fill |
|------|--------|---------------|
| americas / bronze | EMPTY | Caral/Norte Chico |
| americas / iron | EMPTY | Olmec, Chavín |
| americas / axial | EMPTY | Monte Albán/Zapotec |
| americas / medieval | EMPTY | Tiwanaku, Wari, Cahokia, Chaco, Toltec |
| africa / bronze | EMPTY | Kerma |
| africa / axial | EMPTY | Kush/Meroë |
| steppe / bronze | EMPTY | Yamnaya |
| steppe / axial | EMPTY | Saka/Pazyryk |
| steppe / early-mod | EMPTY | Dzungar/Kazakh |
| early-agr (non-Old-World) | gap | Kuk Swamp (New Guinea) |
| Oceania (all epochs) | near-empty thread | Lapita, Tonga, Hawaiʻi, Māori, Rapa Nui |

---

## 3. Candidate points by region cluster

Full machine-readable detail (lat/lng, draft `values[]`/`drivers[]` hypotheses,
suggested `aspects[]`, every citation with DOI/ISBN/URL, `license` +
`sourceDataset`) lives in [`candidate-points.json`](./candidate-points.json).
**31 candidates.** Each draft value/driver is flagged *NEEDS REVIEW — interpretive*.

Per-point provenance shorthand below:
- **[FACTS]** = cited from a copyrighted monograph (Path A: facts + our own
  synthesis only; nothing copied).
- **[CC-BY]** = backed by a permissively-licensed dataset that may be
  incorporated with attribution (D-PLACE, Pulotu, DRH).
- **[CITE-ONLY]** = Seshat (CC-BY-NC-SA) — usable as a pointer/fact source, never
  copied into the CC-BY-4.0 core.

### 3.1 Andean / South America (thread `americas`)
- **Inca / Tawantinsuyu** @ early-mod — reciprocity (mit'a/ayni) + command
  economy + road/storehouse logistics. *[FACTS]* D'Altroy 2014 (ISBN 9781444331158).
  Tier 1: Seshat *[CITE-ONLY]*, Reba (Cusco), DRH.
- **Caral / Norte Chico** @ bronze — earliest American urbanism, monumentality
  apparently without war. *[FACTS]* Haas et al. 2004 (Nature, doi:10.1038/nature03146);
  Shady et al. 2001 (Science, doi:10.1126/science.1059519).
- **Chavín de Huántar** @ iron — pan-regional oracle/pilgrimage cult horizon.
  *[FACTS]* Burger 1992 (ISBN 9780500277010).
- **Tiwanaku** @ medieval — raised-field altiplano state, religious hinterland.
  *[FACTS]* Kolata 1993 (ISBN 9781557861832). Tier 1: Seshat *[CITE-ONLY]*, Reba.
- **Wari** @ medieval *(tail)* — militarised/administrative Middle Horizon foil
  to Tiwanaku. *[FACTS]* Schreiber 1992 (ISBN 9780915703272).

### 3.2 Mesoamerica (thread `americas`)
- **Olmec (San Lorenzo/La Venta)** @ iron — Mesoamerican "mother culture".
  *[FACTS]* Diehl 2004 (ISBN 9780500285039).
- **Monte Albán / Zapotec** @ axial — early New-World writing + conquest
  propaganda. *[FACTS]* Marcus & Flannery 1996 (ISBN 9780500050781).
- **Classic Maya (Tikal)** @ imperial — literate, astronomically sophisticated,
  prestige-war polities. *[FACTS]* Martin & Grube 2008 (ISBN 9780500287262);
  Sharer & Traxler 2006 (ISBN 9780804748179). Tier 1: DRH, Seshat *[CITE-ONLY]*.
- **Toltec (Tula)** @ medieval *(tail)* — militarised "classical" reference
  culture. *[FACTS]* Cobean et al. 2012 (ISBN 9786074626056).

### 3.3 North America (thread `americas`)
- **Cahokia / Mississippian** @ medieval — largest city N of Mexico; mounds,
  feasting, sacrifice. *[FACTS]* Pauketat 2009 (ISBN 9780670020904).
- **Ancestral Puebloan / Chaco** @ medieval — great-house + road monumentality
  in an arid land; *contested* hierarchy. *[FACTS]* Plog 2008 (ISBN 9780500287842).
- **Haudenosaunee (Iroquois Confederacy)** @ early-mod — consensus governance,
  clan-matron authority, Great Law of Peace. *[FACTS]* Richter 1992
  (ISBN 9780807843949); Fenton 1998 (ISBN 9780806130033). Tier 1: D-PLACE/SCCS *[CC-BY]*.

### 3.4 Sub-Saharan Africa (thread `africa`)
- **Kerma (Nubia)** @ bronze — sub-Saharan Africa's earliest urban state.
  *[FACTS]* Edwards 2004 (ISBN 9780415369879).
- **Kush / Meroë** @ axial — literate (Meroitic script), iron-working Nile state.
  *[FACTS]* Welsby 1996 (ISBN 9780714109862); Edwards 2004.
- **Ghana / Wagadu** @ medieval — earliest trans-Saharan gold-salt empire.
  *[FACTS]* Gomez 2018 (ISBN 9780691177427); Levtzion 1973 (ISBN 9780841904316).
- **Songhai** @ early-mod — largest West African empire, Timbuktu scholarship.
  *[FACTS]* Gomez 2018; Hunwick 2003 (ISBN 9789004128224). Tier 1: Seshat *[CITE-ONLY]*.
- **Great Zimbabwe** @ medieval — dry-stone state on the gold→Indian-Ocean
  circuit; corrects colonial-era denial. *[FACTS]* Pikirayi 2001 (ISBN 9780759100916).
- **Swahili coast (Kilwa)** @ medieval — cosmopolitan Islamic mercantile
  city-states. *[FACTS]* Horton & Middleton 2000 (ISBN 9780631189190).
- **Kingdom of Kongo** @ early-mod — African Christianity + Atlantic diplomacy
  under slave-trade pressure. *[FACTS]* Thornton 2020 (ISBN 9781107565937);
  Hilton 1985 (ISBN 9780198228356).
- **Christian Ethiopia (Lalibela)** @ medieval *(tail)* — rock-hewn church
  monumentality, sacral monarchy. *[FACTS]* Phillipson 2012 (ISBN 9781847010414).

### 3.5 Eurasian steppe (thread `steppe`)
- **Yamnaya (Pontic-Caspian)** @ bronze — wagon+horse pastoralism, kurgan elites,
  patron-client roots. *[FACTS]* Anthony 2007 (ISBN 9780691058870).
- **Saka / Pazyryk** @ axial — frozen-tomb evidence for dress/tattoo/feasting.
  *[FACTS]* Cunliffe 2019 (ISBN 9780198820123).
- **Gökturks (Orkhon)** @ medieval — first indigenous Turkic writing; literate
  steppe empire. *[FACTS]* Golden 1992 (ISBN 9783447032742); Sinor 1990 (ISBN 9780521243049).
- **Dzungar / Kazakh Khanate** @ early-mod — last independent steppe powers; the
  frontier "closes". *[FACTS]* Perdue 2005 (ISBN 9780674016842).

### 3.6 Oceania / Austronesia (thread `none` → recommend new `oceania`)
- **Lapita complex** @ iron — founding maritime-colonization horizon of the
  Pacific. *[FACTS]* Kirch 1997 (ISBN 9781577180364), Kirch 2017 (ISBN 9780520292819);
  *[CC-BY]* Pulotu (doi:10.1371/journal.pone.0136783).
- **Tuʻi Tonga** @ medieval — Polynesian maritime tribute "empire", langi tombs.
  *[FACTS]* Kirch 2017; *[CC-BY]* Pulotu.
- **Hawaiian archaic states** @ early-mod — divine kingship, kapu, heiau cult.
  *[FACTS]* Kirch 2010 (ISBN 9780520267251); *[CC-BY]* Pulotu, D-PLACE.
- **Māori (Aotearoa)** @ early-mod — mana/utu/tapu honor-kin complex.
  *[FACTS]* Anderson et al. 2014 (ISBN 9781927131419); *[CC-BY]* D-PLACE/SCCS, Pulotu.
- **Rapa Nui** @ medieval *(tail)* — moai monumentality; *heavily contested*
  "collapse". *[FACTS]* Hunt & Lipo 2011 (ISBN 9781439150313), Kirch 2017;
  *[CC-BY]* Pulotu.

### 3.7 Deep-time exemplars (thread `none`)
- **Jōmon affluent foragers (Sannai-Maruyama)** @ hunter — complex *sedentary*
  foragers (pottery, storage, ritual) without agriculture. *[FACTS]* Habu 2004
  (ISBN 9780521776707).
- **Kuk Swamp (New Guinea Highlands)** @ early-agr — independent domestication
  of taro/banana → big-man (achieved-status) path. *[FACTS]* Denham et al. 2003
  (Science, doi:10.1126/science.1085255). Tier 1: D-PLACE/SCCS *[CC-BY]*.

---

## 4. Prioritization method & tiers

**Score = coverage impact × source quality/availability × license cleanliness.**

- **Coverage impact** — highest when filling an *empty* cell in a priority region,
  opening a near-empty thread (Oceania), or closing a high-salience omission (Inca).
- **Source quality/availability** — verified DOI/ISBN, recent authoritative
  synthesis, and/or coverage by a Tier 1 dataset already being ingested.
- **License cleanliness** — *[CC-BY]* (D-PLACE/Pulotu/DRH) and *[FACTS]* (books,
  cite-don't-copy) are clean; *[CITE-ONLY]* Seshat is usable only as a pointer.

| Tier | Count | What |
|------|------:|------|
| **Ingest-first** | 10 | Empty-cell fills + Inca + Oceania openers, all with verified anchors (see TL;DR). |
| **Shortlist** | 17 | Strong, well-sourced; fill thin (not empty) cells or extend a cluster. |
| **Tail** | 4 | Valuable but redundant-adjacent (Wari, Toltec, Rapa Nui, Solomonic Ethiopia). |

**12 of 31 candidates fill a currently-EMPTY cell.**

---

## 5. Hand-off notes for ingestion

1. **Schema first:** add an `oceania` thread to `THREADS` (`lib/schema.ts`)
   before ingesting the 5 Oceanic candidates; otherwise keep `thread:"none"`.
2. **Reuse Tier 1 where flagged** (`tierOneSources` in the JSON): Reba
   urbanization for the urban points (Caral, Tiwanaku, Cahokia, Meroë, Great
   Zimbabwe, Kilwa, Gao, Cusco …); D-PLACE/Pulotu for the ethnographic/Austronesian
   points; DRH for religion aspects; Seshat as a *cite-only* cross-check.
3. **Treat all `draftValues`/`draftDrivers` as hypotheses** — re-derive intensities
   and roles against the cited sources; populate `confidence`, `contested`,
   `contestNote`, and `evidence` per the real `AtlasPoint` schema.
4. **Lean into contestation** for Chaco (hierarchy), Rapa Nui ("collapse"),
   Toltec (myth-vs-history), and Great Zimbabwe (colonial denial) — these are
   ideal `altReading`/`contestNote` material.
5. **Record provenance** (`sourceDataset` + `license`) on every reading/citation,
   and never copy Seshat coded tables into the CC-BY-4.0 core.
