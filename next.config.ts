// next.config.ts - CORRIGÉ AVEC PLUS DE REWRITES
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
        pathname: "/api/uploads/**",
      },
    ],
    unoptimized: true,
  },

  async rewrites() {
    console.log("🔄 Configuration des rewrites chargée");
    return [
      // Règle principale pour l'API
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*",
      },
      // Règles spécifiques pour les routes principales
      {
        source: "/annonces/:path*",
        destination: "http://localhost:3005/annonces/:path*",
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
        destination: "http://localhost:3005/categories/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/categories",
        destination: "http://localhost:3005/categories",
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

  env: {
    NEXT_PUBLIC_API_URL: "",
  },

  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  trailingSlash: false,
};

export default nextConfig;
