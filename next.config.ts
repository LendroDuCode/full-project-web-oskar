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
        protocol: "https",
        hostname: "15.236.142.141",
        port: "9000",
        pathname: "/oskar-bucket/**",
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

  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  trailingSlash: false,
};

export default nextConfig;
