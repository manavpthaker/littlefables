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
};

export default nextConfig;
