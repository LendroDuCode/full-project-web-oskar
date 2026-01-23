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
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*",
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
        source: "/annonces",
        destination: "http://localhost:3005/annonces",
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
