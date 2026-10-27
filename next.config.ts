import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./agents/**/*', './brain/**/*'],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
