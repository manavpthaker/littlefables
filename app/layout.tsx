import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterSW } from './register-sw';

export const metadata: Metadata = {
  title: {
    default: 'Little Fables',
    template: '%s · Little Fables',
  },
  description: 'A warm, interactive reading companion that grows understanding one story at a time.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Little Fables',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Little Fables' },
  formatDetection: { telephone: false },
  icons: { icon: '/icons/icon.svg', apple: '/icons/apple-touch-icon.png' },
  // Pinterest domain claim for littlefables.app (business account @littlefables)
  verification: {
    other: {
      'p:domain_verify': 'c72d5e830316ff781409a9a0e853e59f',
    },
  },
};

// PRD F2: userScalable stays enabled at the root. Only the /read (kid) subtree
// locks scaling — parent surfaces MUST allow zoom (WCAG 1.4.4).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#EDE3CE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="lf-skip-link" href="#app-content">Skip to content</a>
        <div id="app-content" tabIndex={-1}>{children}</div>
        <RegisterSW />
      </body>
    </html>
  );
}
