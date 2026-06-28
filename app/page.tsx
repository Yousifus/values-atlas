'use client';

import dynamic from 'next/dynamic';

// Leaflet needs `window`, so the whole interactive map is client-only.
const ValuesAtlas = dynamic(() => import('@/components/ValuesAtlas'), {
  ssr: false,
});

export default function Home() {
  return <ValuesAtlas />;
}
