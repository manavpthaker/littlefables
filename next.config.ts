import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PRD §4.5 — quality is mechanical. No ignoreBuildErrors, no ignoreDuringBuilds.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  typedRoutes: true,
  // Tree-shake the icon set so a mobile-first kid PWA isn't shipped the whole
  // lucide-react library.
  experimental: { optimizePackageImports: ['lucide-react'] },
  // Cover images (books.cover_bg) come from Supabase Storage. next/image
  // needs the host allowlisted before it will optimize / serve them.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fzcjwsxyaweqtvroycjm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // The landing "How your book is made" loops and the walkthrough film are
  // self-hosted mp4/png assets under /landing/motion — a fresh render replaces
  // the file in place, so cache them immutably at the CDN and rely on renames
  // (or a cache purge) when we actually need to invalidate.
  async headers() {
    return [
      {
        source: '/landing/motion/:file*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
