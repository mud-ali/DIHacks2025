import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "http://127.0.0.1:3141/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
