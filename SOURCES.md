# Data Sources & Attribution

The Values Atlas dataset (`public/data/`) is licensed **CC-BY-4.0** (see
[`public/data/LICENSE`](./public/data/LICENSE) and [`LICENSING.md`](./LICENSING.md)).
It incorporates facts and coded variables from the permissively-licensed
(CC-BY-4.0) external datasets below. Per the **Path A** policy, every ingested
reading and citation also records its `sourceDataset` + `license` so provenance
stays transparent and forkers can filter by reuse rights.

The deterministic field → schema mappings are documented in
[`scripts/ingest/MAPPING.md`](./scripts/ingest/MAPPING.md); the ingestion code
lives in [`scripts/ingest/`](./scripts/ingest/).

## Tier 1 sources (all CC-BY-4.0)

### 1. Database of Religious History — Standard Cross-Cultural Sample of Religion (DRH / SCCSR)

- **Coding the sacred:** Slingerland, E., Atkinson, Q. D., Ember, C. R., Sheehan,
  O., Muthukrishna, M., Bollinger, R., & Henrich, J. (2020). *The Database of
  Religious History: Coding the Sacred.* doi:[10.1558/jch.39061](https://doi.org/10.1558/jch.39061)
- **SCCSR data release:** Database of Religious History, *Standard Cross-Cultural
  Sample of Religion (SCCSR) data dump.* Zenodo.
  doi:[10.5281/zenodo.14967261](https://doi.org/10.5281/zenodo.14967261)
  (GitHub mirror: `religionhistory/SCCSR`).
- License: **CC-BY-4.0**. We use the Zenodo/GitHub data release, **not** the live
  DRH website (whose Terms of Use forbid scraping).

### 2. Reba / Reitsma / Seto — Historical Urban Population (3700 BC – AD 2000)

- Reba, M., Reitsma, F., & Seto, K. C. (2016). *Spatializing 6,000 years of global
  urbanization from 3700 BC to AD 2000.* Scientific Data.
  doi:[10.1038/sdata.2016.34](https://doi.org/10.1038/sdata.2016.34)
- Dataset: Reba, M., Reitsma, F., & Seto, K. C. (2018). *Historical Urban
  Population: 3700 BC – AD 2000 (Version 1.00).* NASA SEDAC / Harvard Dataverse.
  doi:[10.7910/DVN/LMCQGX](https://doi.org/10.7910/DVN/LMCQGX)
- License: **CC-BY-4.0**.

### 3. Maddison Project Database 2023 (GGDC)

- Bolt, J., & van Zanden, J. L. (2024). *Maddison-style estimates of the evolution
  of the world economy: A new 2023 update.* Journal of Economic Surveys.
  doi:[10.1111/joes.12618](https://doi.org/10.1111/joes.12618)
- Dataset: Maddison Project Database 2023, DataverseNL
  doi:[10.34894/INZBF2](https://doi.org/10.34894/INZBF2) (read via the OWID CSV mirror).
- License: **CC-BY-4.0**.

### 4. D-PLACE — Pulotu (Austronesian / Pacific religion)

- Watts, J., Sheehan, O., Greenhill, S. J., Gomes-Ng, S., Atkinson, Q. D.,
  Bulbulia, J., & Gray, R. D. (2015). *Broad supernatural punishment but not
  moralizing high gods precede the evolution of political complexity in
  Austronesia.* PLOS ONE.
  doi:[10.1371/journal.pone.0136783](https://doi.org/10.1371/journal.pone.0136783)
- Dataset: D-PLACE CLDF release `D-PLACE/dplace-dataset-pulotu`.
- License: **CC-BY-4.0**. Only the **Pulotu** subset of D-PLACE is permissively
  licensed; the EA / SCCS subsets are **NonCommercial** and are intentionally not
  used.

## How to cite the Values Atlas

> "Values Atlas" by Yousef / Values Atlas, licensed under CC-BY-4.0.
> Source: https://github.com/Yousifus/values-atlas
