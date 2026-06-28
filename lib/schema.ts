// Config objects for Values Atlas. Each value/driver carries an SVG glyph
// (24×24 viewBox, stroke-based) rendered inside markers, sidebar pills, the
// lens legend, and the detail drawer.

export interface ValueDef {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface EpochDef {
  id: string;
  label: string;
  short: string;
  pct: number;
}

export interface DriverDef {
  label: string;
  color: string;
  bg: string;
  border: string;
  group: "eco" | "inst";
  icon: string;
}

export interface StatusDef {
  label: string;
  cls: string;
  desc: string;
}

export interface ThreadDef {
  id: string;
  label: string;
}

export const VALUES: ValueDef[] = [
  {id:'generosity',    label:'Generosity',    color:'#4c9caa', icon:'<path d="M3 9.5h18v3H3z"/><path d="M5.5 12.5V20h13v-7.5"/><path d="M12 9.5V20"/><path d="M12 9.5S10.3 4 8 5.2 9.4 9.5 12 9.5zM12 9.5s1.7-5.5 4-4.3S14.6 9.5 12 9.5z"/>'},
  {id:'hospitality',   label:'Hospitality',   color:'#d09a3a', icon:'<path d="M12 3c.6 3.2 3.2 4.7 3.2 8.2a3.2 3.2 0 11-6.4 0c0-1.3.5-2.2 1.3-3 .3 1.7 1 2.2 1 2.2C10.8 8.2 11.6 5.8 12 3z"/>'},
  {id:'solidarity',    label:'Solidarity',    color:'#2eb074', icon:'<circle cx="9" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/>'},
  {id:'aggression',    label:'Aggression',    color:'#cc4a4a', icon:'<path d="M12 2.5l3 6-3 1.8-3-1.8z"/><path d="M12 10.3V20"/><path d="M8.5 16.5h7"/>'},
  {id:'honor',         label:'Honor',         color:'#925cb8', icon:'<path d="M12 3l7 2.4v5c0 4.6-3.2 7.9-7 9.6-3.8-1.7-7-5-7-9.6v-5z"/><path d="M12 8l1.2 2.6 2.8.3-2.1 1.9.6 2.8L12 14.9 9.5 16.5l.6-2.8L8 11.9l2.8-.3z"/>'},
  {id:'piety',         label:'Piety',         color:'#4a94cc', icon:'<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M19.4 4.6l-1.9 1.9M6.5 17.5l-1.9 1.9"/>'},
  {id:'curiosity',     label:'Curiosity',     color:'#d48232', icon:'<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.6-5.6 2.1 2.1-5.6z"/>'},
  {id:'individualism', label:'Individualism', color:'#d05454', icon:'<circle cx="12" cy="7" r="3.2"/><path d="M5.8 20c0-3.7 2.8-6 6.2-6s6.2 2.3 6.2 6"/>'},
  {id:'collectivism',  label:'Collectivism',  color:'#229e8c', icon:'<circle cx="12" cy="8" r="2.7"/><path d="M7 16c0-2.6 2.1-4.3 5-4.3s5 1.7 5 4.3"/><circle cx="4.8" cy="10.5" r="2"/><circle cx="19.2" cy="10.5" r="2"/>'},
  {id:'egalitarianism',label:'Egalitarianism',color:'#95a5b5', icon:'<path d="M12 4v15"/><path d="M7 19h10"/><path d="M4 6.5h16"/><path d="M4 6.5l-2 5a3 3 0 006 0z"/><path d="M20 6.5l2 5a3 3 0 01-6 0z"/>'},
  {id:'order',         label:'Law & Order',   color:'#6a808c', icon:'<path d="M4 8.5h16"/><path d="M5.5 8.5L8 5h8l2.5 3.5"/><path d="M7.5 8.5v8M12 8.5v8M16.5 8.5v8"/><path d="M5 19.5h14"/>'},
  {id:'hierarchy',     label:'Hierarchy',     color:'#867c6c', icon:'<path d="M12 3l9 17H3z"/><path d="M8 13h8"/><path d="M9.8 8.5h4.4"/>'},
];

// Epochs are evenly spaced along the timeline by index (pct = i / (n-1)).
export const EPOCHS: EpochDef[] = ([
  {id:'hunter',     label:'Hunter-Gatherer',  short:'~100k BCE'},
  {id:'early-agr',  label:'Early Agriculture', short:'~10k BCE'},
  {id:'bronze',     label:'Bronze Age',        short:'~3000 BCE'},
  {id:'iron',       label:'Iron Age',          short:'~1200 BCE'},
  {id:'axial',      label:'Axial Age',         short:'~500 BCE'},
  {id:'imperial',   label:'Classical Empires', short:'~200 CE'},
  {id:'medieval',   label:'Medieval',          short:'~1000 CE'},
  {id:'early-mod',  label:'Early Modern',      short:'~1600 CE'},
  {id:'industrial', label:'Industrial Age',    short:'~1820 CE'},
  {id:'modern',     label:'Modern Era',        short:'~1900 CE'},
  {id:'now',        label:'Present',           short:'2020s'},
] as Omit<EpochDef, "pct">[]).map((e, i, arr) => ({ ...e, pct: i / (arr.length - 1) }));

// Each driver carries an SVG glyph shown inside markers under the Ecological /
// Institutional lenses, in the lens legend, and on drawer chips.
export const DRIVERS: Record<string, DriverDef> = {
  resource_scarcity:      {label:'Resource scarcity',      color:'#a06020', bg:'#221508', border:'#5a3010', group:'eco', icon:'<path d="M12 3c3 4 5 6.2 5 9.2a5 5 0 01-10 0c0-3 2-5.2 5-9.2z"/><path d="M5 20L19 4"/>'},
  pathogen_load:          {label:'Pathogen pressure',      color:'#3a9058', bg:'#0d1e10', border:'#1e5030', group:'eco', icon:'<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 7V4M12 20v-3M7 12H4M20 12h-3M8.5 8.5L6.4 6.4M17.6 17.6l-2.1-2.1M15.5 8.5l2.1-2.1M6.4 17.6l2.1-2.1"/>'},
  open_frontier:          {label:'Open frontier',          color:'#a08040', bg:'#201a08', border:'#5a4818', group:'eco', icon:'<path d="M6 21V3"/><path d="M6 4h11l-2.5 3.5L17 11H6"/>'},
  resource_competition:   {label:'Resource competition',   color:'#b03028', bg:'#200e0c', border:'#5c1e18', group:'eco', icon:'<path d="M5.5 5.5l9 9"/><path d="M18.5 5.5l-9 9"/><path d="M4 15l4 4M20 15l-4 4"/>'},
  metallurgy:             {label:'Metallurgy / iron',      color:'#9a8c50', bg:'#1a1808', border:'#4a4018', group:'eco', icon:'<path d="M14.5 3.5l6 6-3.2 3.2-6-6z"/><path d="M12.5 6.5L3.5 15.5l2.5 2.5 9-9"/><path d="M4 21h6"/>'},
  maritime_expansion:     {label:'Maritime expansion',     color:'#3a8aa0', bg:'#0a1820', border:'#1c4858', group:'eco', icon:'<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M8 11h8"/><path d="M5 13a7 7 0 0014 0"/>'},
  nomadic_mobility:       {label:'Nomadic mobility',       color:'#a0703a', bg:'#1e1408', border:'#543410', group:'eco', icon:'<path d="M3 20h18"/><path d="M12 4L4 20"/><path d="M12 4l8 16"/><path d="M12 4v16"/>'},
  weak_institutions:      {label:'Weak institutions',      color:'#9055a0', bg:'#1c0e22', border:'#4a2558', group:'inst', icon:'<path d="M4 9l8-5 8 5"/><path d="M5 9v11h14V9"/><path d="M12 4v6l-2.5 2 3 2-2.5 2v4"/>'},
  kinship_intensity:      {label:'Kinship intensity',      color:'#a03850', bg:'#1e0c12', border:'#581830', group:'inst', icon:'<circle cx="7" cy="8" r="2.5"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 19c0-2.6 1.9-4.2 4.5-4.2s4.5 1.6 4.5 4.2"/><path d="M12.5 19c0-2.6 1.9-4.2 4.5-4.2s4.5 1.6 4.5 4.2"/>'},
  hydraulic_coordination: {label:'Hydraulic coordination', color:'#2878a8', bg:'#0c1820', border:'#1a4860', group:'inst', icon:'<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'},
  institutional_scale:    {label:'Institutional scale',    color:'#5070a0', bg:'#10141e', border:'#283858', group:'inst', icon:'<path d="M3 9l9-5 9 5"/><path d="M4 9h16"/><path d="M6 9v8M10 9v8M14 9v8M18 9v8"/><path d="M3 20h18"/>'},
  trade_networks:         {label:'Trade networks',         color:'#88a028', bg:'#161808', border:'#424c10', group:'inst', icon:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="8" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6.6 7.4l4.4 9.6M17.4 9.4L13 17M7 6.2l10 1.4"/>'},
  literacy:               {label:'Literacy / writing',     color:'#6a8a55', bg:'#121a0e', border:'#324a24', group:'inst', icon:'<path d="M12 6c-2-1.4-5-1.9-8-1.4v13c3-.5 6 0 8 1.4 2-1.4 5-1.9 8-1.4v-13c-3-.5-6 0-8 1.4z"/><path d="M12 6v13"/>'},
  monumental_religion:    {label:'Monumental religion',    color:'#8a6ab0', bg:'#160e20', border:'#3c2858', group:'inst', icon:'<path d="M10 4h4v3h3v3h3v4H4v-4h3V7h3z"/><path d="M3 18h18"/><path d="M3 21h18"/>'},
  military_revolution:    {label:'Military revolution',    color:'#b05038', bg:'#1e0e08', border:'#562416', group:'inst', icon:'<circle cx="7" cy="16" r="2.5"/><path d="M8.7 14.3L18 7"/><path d="M16 5l4 1 .2 4-4-1z"/><path d="M4.5 18.5l-2 2"/>'},
  colonial_pressure:      {label:'Colonial pressure',      color:'#a84020', bg:'#1e1008', border:'#5a2210', group:'inst', icon:'<circle cx="12" cy="12" r="9"/><path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>'},
  industrialization:      {label:'Industrialization',      color:'#8a8a8a', bg:'#161616', border:'#3a3a3a', group:'inst', icon:'<path d="M3 21V11l5 3V11l5 3V8l5-3v13z"/><path d="M3 21h18"/><path d="M7 6V3h2v3"/>'},
  secularism_threat:      {label:'Secularism threat',      color:'#3870a0', bg:'#0c1420', border:'#1e3e60', group:'inst', icon:'<path d="M12 3l7 2.4v5c0 4.6-3.2 7.9-7 9.6-3.8-1.7-7-5-7-9.6v-5z"/><path d="M6 6l12 12"/>'},
  technological_surplus:  {label:'Tech surplus',           color:'#488888', bg:'#0c1818', border:'#1e4848', group:'inst', icon:'<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 00-4 10.4c.9.8 1 1.6 1 2.6h6c0-1 .1-1.8 1-2.6A6 6 0 0012 3z"/>'},
};

export const STATUS: Record<string, StatusDef> = {
  adaptive:    {label:'Adaptive',    cls:'status-adaptive',    desc:'Currently driven by a live ecological or institutional pressure.'},
  residual:    {label:'Residual',    cls:'status-residual',    desc:'The original driver is gone; the value persists as culture, etiquette, identity, or law.'},
  reactive:    {label:'Reactive',    cls:'status-reactive',    desc:'Emerged in opposition to another value or as a corrective to a dominant norm.'},
  reactivated: {label:'Reactivated', cls:'status-reactivated', desc:'Deliberately revived as an identity marker, often in response to an external threat.'},
};

export const EVIDENCE_COLORS: Record<string, string> = {
  ethnographic:  '#67c58e',
  textual:       '#7a8fda',
  archaeological:'#d09a3a',
  inferred:      '#c08040',
  speculative:   '#9070a0',
};

export const THREADS: ThreadDef[] = [
  {id:'all',     label:'All Regions'},
  {id:'arabia',  label:'Arabia / Islamic'},
  {id:'china',   label:'China'},
  {id:'india',   label:'South Asia'},
  {id:'europe',  label:'Europe / Atlantic'},
  {id:'steppe',  label:'Eurasian Steppe'},
  {id:'africa',  label:'Sub-Saharan Africa'},
  {id:'americas',label:'Americas'},
];

// A single civilization-at-epoch data point from public/data/atlas.json.
export interface AtlasValue {
  valueId: string;
  intensity: number;
  role: "primary" | "coupled" | "counter";
}

// ─────────────────────── ASPECTS (schemaVersion 2) ───────────────────────
// Phase 1 of the expansion: a generalized, additive layer on top of the flat
// per-point fields. An AtlasPoint can carry one or more `aspects`, each a
// thematic dimension (values synthesis, gender, religion, …) holding one or
// more `readings`. The existing flat fields stay in place for backward
// compatibility; the "values-synthesis" aspect is the single source of truth
// the drawer renders for the legacy note/altReading/cost/sources content.

export type AspectType =
  | "values-synthesis"
  | "gender"
  | "myth"
  | "religion"
  | "commerce"
  | "law"
  | "governance"
  | "daily-life"
  | "architecture"
  | "dress"
  | "script"
  | "art";

export interface AspectTypeDef {
  id: AspectType;
  label: string;
  icon?: string;
}

// English labels + 24×24 stroke glyphs matching the existing icon style.
// i18n headings live in lib/i18n.ts (aspects group) with graceful fallback.
export const ASPECT_TYPES: Record<AspectType, AspectTypeDef> = {
  'values-synthesis': { id: 'values-synthesis', label: 'Values Synthesis', icon: '<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/>' },
  'gender':           { id: 'gender',           label: 'Gender',           icon: '<circle cx="9" cy="9" r="4.5"/><path d="M12.2 12.2L20 20"/><path d="M15 20h5v-5"/>' },
  'myth':             { id: 'myth',             label: 'Myth & Cosmology',  icon: '<path d="M12 3a9 9 0 109 9 7 7 0 01-9-9z"/><path d="M15.5 6.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z"/>' },
  'religion':         { id: 'religion',         label: 'Religion',          icon: '<path d="M12 3l7 2.4v5c0 4.6-3.2 7.9-7 9.6-3.8-1.7-7-5-7-9.6v-5z"/><path d="M12 8v8M8.5 11.5h7"/>' },
  'commerce':         { id: 'commerce',         label: 'Commerce',          icon: '<circle cx="8" cy="9" r="4"/><circle cx="15" cy="14" r="4"/><path d="M8 7.2v3.6M6.4 9h3.2"/>' },
  'law':              { id: 'law',              label: 'Law',               icon: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-2 5a3 3 0 006 0z"/><path d="M19 7l2 5a3 3 0 01-6 0z"/><path d="M8 21h8"/>' },
  'governance':       { id: 'governance',       label: 'Governance',        icon: '<path d="M3 9l9-5 9 5"/><path d="M4 9h16"/><path d="M6 9v8M10 9v8M14 9v8M18 9v8"/><path d="M3 20h18"/>' },
  'daily-life':       { id: 'daily-life',       label: 'Daily Life',        icon: '<path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>' },
  'architecture':     { id: 'architecture',     label: 'Architecture',      icon: '<path d="M4 21V8l8-5 8 5v13"/><path d="M4 21h16"/><path d="M9 21v-6h6v6"/>' },
  'dress':            { id: 'dress',            label: 'Dress & Adornment', icon: '<path d="M9 3l3 2 3-2"/><path d="M9 3L4 7l3 3v10h10V10l3-3-5-4"/>' },
  'script':           { id: 'script',           label: 'Script & Writing',  icon: '<path d="M4 20l3-1L19 7l-2-2L5 17z"/><path d="M14.5 5.5l4 4"/><path d="M4 20l1-3"/>' },
  'art':              { id: 'art',              label: 'Art',               icon: '<path d="M12 3a9 9 0 000 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h1a4 4 0 004-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="9" r="1"/>' },
};

// One scholarly reading inside an aspect. `text` is required; everything else
// is optional metadata. `translations` is keyed by language code (empty for now).
export interface Reading {
  text: string;
  confidence?: number;
  contested?: boolean;
  contestNote?: string;
  sources?: string[];
  citationKeys?: string[];
  translations?: Record<string, string>;
  // Provenance (Path A): records where this reading is drawn from and under
  // what license, so forkers can see attribution and filter by reuse rights.
  license?: string;
  sourceDataset?: string;
}

export interface Aspect {
  type: AspectType;
  readings: Reading[];
}

export interface Media {
  url: string;
  type: "image" | "other";
  caption?: string;
  attribution?: string;
  license?: string;
}

// Structured bibliography entry; `citationKeys` on a Reading reference `key`.
export interface Citation {
  key: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  // Provenance (Path A): the originating dataset/source and its license, so
  // provenance stays transparent and reuse rights are explicit per citation.
  license?: string;
  sourceDataset?: string;
}

export interface AtlasPoint {
  id: string;
  region: string;
  thread: string;
  lat: number;
  lng: number;
  epoch: string;
  values: AtlasValue[];
  drivers: string[];
  status: string;
  evidence: string;
  confidence: number;
  contested: boolean;
  note: string;
  contestNote?: string;
  altReading?: string;
  cost?: string;
  successor?: string;
  artifact?: string;
  sources?: string[];
  // Additive, optional (schemaVersion 2+).
  schemaVersion?: number;
  aspects?: Aspect[];
  media?: Media[];
  bibliography?: Citation[];
}
