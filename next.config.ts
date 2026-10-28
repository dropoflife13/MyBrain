import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./agents/**/*', './brain/**/*', './public/**/*'],
    '/api/**/*': ['./agents/**/*', './brain/**/*', './public/**/*'],
    '/api/brain': ['./agents/**/*', './brain/**/*', './public/**/*'],
    '/api/chat': ['./agents/**/*', './brain/**/*', './public/**/*'],
  },
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
