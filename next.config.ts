import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PRD §4.5 — quality is mechanical. No ignoreBuildErrors, no ignoreDuringBuilds.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  typedRoutes: true,
};

export default nextConfig;
