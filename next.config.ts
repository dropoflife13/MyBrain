import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
  outputFileTracingIncludes: {
    '/**': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/**/*': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/brain': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
    '/api/chat': ['./agents/**/*', './brain/**/*', './public/**/*', './brain-embeddings.json'],
  },
  outputFileTracingExcludes: {
    '*': [
      '.next/**/*',
      './.next/**/*',
      '.next/lock',
      './.next/lock',
      '.git/**/*',
      './.git/**/*',
    ],
    '/**': [
      '.next/**/*',
      './.next/**/*',
      '.next/lock',
      './.next/lock',
      '.git/**/*',
      './.git/**/*',
    ],
    '/api/**/*': [
      '.next/**/*',
      './.next/**/*',
      '.next/lock',
      './.next/lock',
      '.git/**/*',
      './.git/**/*',
    ],
  },
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
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
