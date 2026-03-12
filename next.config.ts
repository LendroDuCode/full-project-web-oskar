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
    unoptimized: true,
  },

   typescript: {
    ignoreBuildErrors: false,
  },

    async rewrites() {
    // En production, utiliser l'URL spécifique du backend
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://oskar-api.mysonec.pro'  // ← URL FIXE du backend
      : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005");

    console.log('🔧 Rewrites - Backend URL:', backendUrl);

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
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
