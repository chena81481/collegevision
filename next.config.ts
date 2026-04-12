import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
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
