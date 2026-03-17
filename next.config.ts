import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/universities/:slug',
        destination: '/online-degrees/:slug',
        permanent: true,
      },
      // If a student tries to visit the old dashboard or login, keep them working
      // but current paths seem fine.
    ];
  },
};

export default nextConfig;
