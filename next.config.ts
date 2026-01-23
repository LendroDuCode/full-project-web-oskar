// next.config.ts - CORRIGÉ
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
        protocol: "https", // ← CHANGÉ EN HTTPS
        hostname: "oskar.mysonec.pro", // ← VOTRE DOMAINE EN HTTPS
        pathname: "/api/uploads/**",
      },
    ],
    unoptimized: true,
  },

  async rewrites() {
    console.log("🔄 Configuration des rewrites chargée");

    return [
      // Règle principale - utiliser localhost pour communication interne
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*", // ← localhost
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: "", // ← LAISSER VIDE pour utiliser les rewrites
    NEXT_PUBLIC_USE_PROXY: "true",
  },

  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  trailingSlash: false,
};

export default nextConfig;
