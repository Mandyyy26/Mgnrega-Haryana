import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  swcMinify: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
