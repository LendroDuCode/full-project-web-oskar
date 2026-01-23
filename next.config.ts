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
        pathname: "/api/files/**", // ← CORRIGÉ: /api/files/ au lieu de /api/uploads/
      },
      {
        protocol: "https",
        hostname: "oskar.mysonec.pro",
        pathname: "/files/**", // ← AJOUTÉ: pour les fichiers via rewrites
      },
      {
        protocol: "http",
        hostname: "15.236.142.141",
        port: "3005",
        pathname: "/api/files/**", // ← AJOUTÉ: pour le développement
      },
      {
        protocol: "https", // ← CHANGÉ EN HTTPS
        hostname: "15.236.142.141",
        port: "9000",
        pathname: "/oskar-bucket/**",
      },
      {
        protocol: "http", // ← POUR FALLBACK
        hostname: "15.236.142.141",
        port: "9000",
        pathname: "/oskar-bucket/**",
      },
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true, // ← AJOUTÉ pour éviter les problèmes avec AdBlockers
  },

  async rewrites() {
    console.log("🔄 Configuration des rewrites chargée");
    return [
      // 1. Règle principale pour l'API
      {
        source: "/api/:path*",
        destination: "http://15.236.142.141:3005/:path*",
      },

      // 2. Règle pour les fichiers uploadés
      {
        source: "/files/:path*",
        destination: "http://15.236.142.141:3005/api/files/:path*",
      },

      // 3. Routes API spécifiques (pour compatibilité)
      {
        source: "/annonces/:path*",
        destination: "http://15.236.142.141:3005/annonces/:path*",
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
        destination: "http://15.236.142.141:3005/categories/:path*",
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
        destination: "http://15.236.142.141:3005/categories",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/auth/:path*",
        destination: "http://15.236.142.141:3005/auth/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/dons/:path*",
        destination: "http://15.236.142.141:3005/dons/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/echanges/:path*",
        destination: "http://15.236.142.141:3005/echanges/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },
      {
        source: "/produits/:path*",
        destination: "http://15.236.142.141:3005/produits/:path*",
        has: [
          {
            type: "header",
            key: "accept",
            value: "application/json",
          },
        ],
      },

      // 4. Règle générale pour toutes les autres routes API (fallback)
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

  env: {
    NEXT_PUBLIC_API_URL: "",
    NEXT_PUBLIC_FILES_URL: "/files", // ← AJOUTÉ pour les URLs de fichiers
    NEXT_PUBLIC_MINIO_URL: "https://15.236.142.141:9000/oskar-bucket",
  },

  // Configuration pour les pages statiques manquantes
  async redirects() {
    return [
      {
        source: "/aide",
        destination: "/help", // Créez une page /help
        permanent: false,
      },
      {
        source: "/conditions",
        destination: "/terms", // Créez une page /terms
        permanent: false,
      },
      {
        source: "/securite",
        destination: "/security", // Créez une page /security
        permanent: false,
      },
      {
        source: "/confidentialite",
        destination: "/privacy", // Créez une page /privacy
        permanent: false,
      },
      {
        source: "/categories/services",
        destination: "/categories?type=services",
        permanent: false,
      },
      {
        source: "/categories/vetements",
        destination: "/categories?type=vetements",
        permanent: false,
      },
      {
        source: "/categories/electronique",
        destination: "/categories?type=electronique",
        permanent: false,
      },
      {
        source: "/categories/education",
        destination: "/categories?type=education",
        permanent: false,
      },
    ];
  },

  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  trailingSlash: false,

  // Pour éviter les erreurs de build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
