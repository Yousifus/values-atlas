// Canonical provenance metadata for the four verified Tier 1 CC-BY-4.0 sources.
// Every ingested reading/citation is stamped from here so attribution and
// reuse-rights (Path A) stay consistent and auditable across modules.

export const LICENSE = 'CC-BY-4.0';

export const SOURCES = {
  drh: {
    sourceDataset: 'DRH-SCCSR',
    license: LICENSE,
    citations: [
      {
        key: 'slingerland2020-drh',
        title: 'The Database of Religious History: Coding the Sacred',
        authors: ['Slingerland, E.', 'Atkinson, Q. D.', 'Ember, C. R.', 'Sheehan, O.', 'Muthukrishna, M.', 'Bollinger, R.', 'Henrich, J.'],
        year: 2020,
        venue: 'Journal of Cognitive Historiography',
        doi: '10.1558/jch.39061',
      },
      {
        key: 'sccsr-zenodo',
        title: 'Standard Cross-Cultural Sample of Religion (SCCSR) data dump',
        authors: ['Database of Religious History'],
        year: 2025,
        venue: 'Zenodo',
        doi: '10.5281/zenodo.14967261',
        url: 'https://zenodo.org/records/14967261',
      },
    ],
  },
  reba: {
    sourceDataset: 'Reba-2016-urbanization',
    license: LICENSE,
    citations: [
      {
        key: 'reba2016-urbanization',
        title: 'Spatializing 6,000 years of global urbanization from 3700 BC to AD 2000',
        authors: ['Reba, M.', 'Reitsma, F.', 'Seto, K. C.'],
        year: 2016,
        venue: 'Scientific Data',
        doi: '10.1038/sdata.2016.34',
      },
      {
        key: 'reba2018-sedac',
        title: 'Historical Urban Population: 3700 BC - AD 2000 (Version 1.00)',
        authors: ['Reba, M.', 'Reitsma, F.', 'Seto, K. C.'],
        year: 2018,
        venue: 'NASA SEDAC / Harvard Dataverse',
        doi: '10.7910/DVN/LMCQGX',
      },
    ],
  },
  maddison: {
    sourceDataset: 'Maddison-Project-2023',
    license: LICENSE,
    citations: [
      {
        key: 'bolt2024-maddison',
        title: 'Maddison-style estimates of the evolution of the world economy: A new 2023 update',
        authors: ['Bolt, J.', 'van Zanden, J. L.'],
        year: 2024,
        venue: 'Journal of Economic Surveys',
        doi: '10.1111/joes.12618',
      },
    ],
  },
  pulotu: {
    sourceDataset: 'D-PLACE-Pulotu',
    license: LICENSE,
    citations: [
      {
        key: 'watts2015-pulotu',
        title: 'Broad supernatural punishment but not moralizing high gods precede the evolution of political complexity in Austronesia',
        authors: ['Watts, J.', 'Sheehan, O.', 'Greenhill, S. J.', 'Gomes-Ng, S.', 'Atkinson, Q. D.', 'Bulbulia, J.', 'Gray, R. D.'],
        year: 2015,
        venue: 'PLOS ONE',
        doi: '10.1371/journal.pone.0136783',
      },
      {
        key: 'dplace-pulotu-cldf',
        title: 'D-PLACE dataset derived from Watts et al. 2015 "Pulotu" (CLDF release)',
        authors: ['Watts, J.', 'Sheehan, O.', 'Greenhill, S. J.', 'Forkel, R.', 'Gray, R. D.'],
        year: 2022,
        venue: 'D-PLACE / Zenodo',
        url: 'https://github.com/D-PLACE/dplace-dataset-pulotu',
      },
    ],
  },
};
