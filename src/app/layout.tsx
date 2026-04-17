import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AetherForge Phase 0',
  description: 'Procedural Infinite Vibe World',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
