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
        protocol: "http",
        hostname: "15.236.142.141",
        pathname: "/oskar-bucket/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/oskar-bucket/**",
      },
      // IMPORTANT: Pour les images du backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true,
  },

  // ================================================
  // CONFIGURATION SIMPLIFIÉE DES REWRITES
  // ================================================
  async rewrites() {
    console.log("🔄 Configuration des rewrites chargée");

    return [
      // Règle GÉNÉRIQUE pour TOUT rediriger vers le backend
      // Cette règle capture TOUTES les requêtes commençant par /api/
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/api/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: ".*application/json.*",
          },
        ],
      },

      // Règle ALTERNATIVE pour les routes directes
      // Capturer les routes commençant par /admin/, /auth/, etc.
      {
        source: "/:path*",
        destination: "http://localhost:3005/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: ".*application/json.*",
          },
        ],
      },
    ];
  },

  // Ajouter pour voir les rewrites en action
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Désactiver strict mode
  reactStrictMode: false,

  // Variables d'environnement
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:3005",
    NEXT_PUBLIC_USE_PROXY: "false", // On utilise les rewrites
  },

  // Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Désactiver le trailing slash
  trailingSlash: false,
};

export default nextConfig;
