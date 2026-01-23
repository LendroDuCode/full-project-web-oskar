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
      {
        source: "/api/:path*",
        destination: "http://localhost:3005/:path*",
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
