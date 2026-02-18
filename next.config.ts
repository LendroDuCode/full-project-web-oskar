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

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/:path*`,
      },
      // Proxy pour les fichiers statiques
      {
        source: "/api/files/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/files/:path*`,
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
