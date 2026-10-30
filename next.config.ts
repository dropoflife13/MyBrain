import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
  outputFileTracingIncludes: {
    '/**': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/**/*': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/brain': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/chat': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
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
