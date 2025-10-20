/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['recharts', 'cytoscape'],
  },
  // Enable if deploying to static hosting
  // output: 'export',
};

export default nextConfig;
