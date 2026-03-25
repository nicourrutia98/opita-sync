import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const apiBaseUrl = process.env.OPITA_API_BASE_URL ?? 'http://127.0.0.1:4000';
const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(currentDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    root: repoRoot
  },
  outputFileTracingRoot: repoRoot,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`
      },
      {
        source: '/health',
        destination: `${apiBaseUrl}/health`
      }
    ];
  }
};

export default nextConfig;
