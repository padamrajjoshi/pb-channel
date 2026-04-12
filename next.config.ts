import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev
      ? (process.env.BACKEND_LOCAL_API_URL || "http://127.0.0.1:8000")
      : (process.env.BACKEND_API_URL || "https://pb-api.pebiglobe.com");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/v1/:path*`,
      },
      {
        source: "/.well-known/:path*",
        destination: `${backendUrl}/.well-known/:path*`,
      },
    ];
  },
};

export default nextConfig;
