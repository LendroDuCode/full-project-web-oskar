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
        hostname: "oskar.mysonec.pro", // ← VOTRE DOMAINE
        pathname: "/api/uploads/**", // ← CHEMIN RELATIF
      },
    ],
    unoptimized: true,
  },

  // ================================================
  // CONFIGURATION DES REWRITES POUR HTTPS
  // ================================================
  async rewrites() {
    console.log("🔄 Configuration des rewrites chargée");

    return [
      // Règle principale - utilisez localhost en interne
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*", // ← localhost pour communication interne
      },
      // Pour les uploads
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3005/uploads/:path*",
      },
    ];
  },

  // Variables d'environnement
  env: {
    NEXT_PUBLIC_API_URL: "", // ← LAISSER VIDE pour utiliser les rewrites
    NEXT_PUBLIC_USE_PROXY: "true",
  },

  // Désactiver strict mode
  reactStrictMode: false,

  // Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  trailingSlash: false,
};

export default nextConfig;
