import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.lared1061.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "laredaumenta.s3.us-east-2.amazonaws.com",
      },
    ],
    qualities: [50, 75, 80, 85, 90, 100],
  },
};

export default nextConfig;
