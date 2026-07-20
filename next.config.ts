import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.assets.so",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "via.assets.so",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
