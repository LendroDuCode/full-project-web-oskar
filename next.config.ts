// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/uxpilot-auth.appspot.com/**",
      },
      {
        protocol: "https",
        hostname: "oskar.mysonec.pro",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/api/files/**",
      },
      // ✅ AJOUTER ces patterns pour la production
      {
        protocol: "http",
        hostname: "15.236.142.141",
        port: "3005",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "15.236.142.141",
        port: "9000",
        pathname: "/oskar-bucket/**",
      },
    ],
    unoptimized: true, // Important pour éviter l'optimisation Next.js
  },

  async rewrites() {
    // En production, utiliser l'URL distante
    const apiUrl =
      process.env.NODE_ENV === "production"
        ? "http://15.236.142.141:3005"
        : "http://localhost:3005";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/categories",
        destination: `${apiUrl}/categories`,
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/categories/:path*",
        destination: `${apiUrl}/categories/:path*`,
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/annonces/:path*",
        destination: `${apiUrl}/annonces/:path*`,
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/annonces",
        destination: `${apiUrl}/annonces`,
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
    ];
  },

  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  trailingSlash: false,
};

export default nextConfig;
