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
      // Nuevas redirecciones solicitadas
      {
        source: '/nacionales',
        destination: '/category/nacionales',
        permanent: true,
      },
      {
        source: '/internacionales',
        destination: '/category/internacionales',
        permanent: true,
      },
      {
        source: '/nacionales/page/:page',
        destination: '/category/nacionales',
        permanent: true,
      },
      {
        source: '/internacionales/page/:page',
        destination: '/category/internacionales',
        permanent: true,
      },
      {
        source: '/economia/page/:page',
        destination: '/category/economia',
        permanent: true,
      },
      {
        source: '/category/:slug/page/:page',
        destination: '/category/:slug',
        permanent: true,
      },
      {
        source: '/nacionales/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/internacionales/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/economia/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/futbol-nacional/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/futbol-internacional/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/deporte-nacional/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
      {
        source: '/deporte-internacional/:slug',
        destination: '/posts/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
