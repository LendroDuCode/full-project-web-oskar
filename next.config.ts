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
        hostname: "15.236.142.141", // Utilisez l'IP de votre serveur
        port: "3005",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost", // Pour le développement local
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
      // Règle principale pour l'API
      {
        source: "/api/:path*",
        destination: "http://15.236.142.141:3005/:path*",
      },
      // Règle alternative pour compatibilité
      {
        source: "/:path*",
        destination: "http://15.236.142.141:3005/:path*",
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
    NEXT_PUBLIC_API_URL: "http://15.236.142.141", // URL directe vers l'API
    NEXT_PUBLIC_USE_PROXY: "true", // Activer les rewrites
  },

  // Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Désactiver le trailing slash
  trailingSlash: false,
};

export default nextConfig;
