'use client';

import dynamic from 'next/dynamic';

const AetherForgeEntry = dynamic(() => import('@/components/AetherForgeEntry'), { ssr: false });

export default function Page() {
  return <AetherForgeEntry />;
}
