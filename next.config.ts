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
};

export default nextConfig;
