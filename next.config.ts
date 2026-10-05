import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: false,
  // basePath: "/admin",
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "/admin/api/:path*", // Rewrites `/api/...` to `/admin/api/...`
  //     },
  //   ];
  // },
};

export default nextConfig;
