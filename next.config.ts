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
  async redirects() {
    return [
      {
        source: '/nacionales-guatemala',
        destination: '/category/nacionales',
        permanent: true,
      },
      {
        source: '/deporte/futbol-nacional',
        destination: '/category/futbol-nacional',
        permanent: true,
      },
      {
        source: '/deporte/futbol-internacional',
        destination: '/category/futbol-internacional',
        permanent: true,
      },
      {
        source: '/deporte/deporte-nacional',
        destination: '/category/deporte-nacional',
        permanent: true,
      },
      {
        source: '/deporte/deporte-internacional-mundo',
        destination: '/category/deporte-internacional',
        permanent: true,
      },
      {
        source: '/mundo-internacionales',
        destination: '/category/internacionales',
        permanent: true,
      },
      {
        source: '/economia',
        destination: '/category/economia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
