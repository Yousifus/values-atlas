// HTML escaping for data-sourced strings.
//
// The detail drawer and map popups are assembled as HTML strings (see
// components/atlas/drawerContent.ts and mapController.ts). Anything that comes
// from public/data/atlas.json (or from a fork's edits to it) is untrusted text
// and must pass through esc() before it is interpolated into those strings.
//
// Only data slots are escaped. The surrounding markup, the SVG glyphs and the
// colours come from the first-party config in lib/schema.ts and stay raw.

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
