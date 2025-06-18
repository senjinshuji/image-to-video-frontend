import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'api.klingai.com'],
  },
};

export default nextConfig;
