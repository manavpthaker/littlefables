import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Little Fables',
  description: 'A reading companion for young children.',
};

// PRD F2: userScalable stays enabled at the root. Only the /read (kid) subtree
// locks scaling — parent surfaces MUST allow zoom (WCAG 1.4.4).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f2e7d3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
