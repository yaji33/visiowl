import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options",    value: "nosniff" },
        { key: "X-Frame-Options",           value: "DENY" },
        { key: "X-XSS-Protection",          value: "1; mode=block" },
        { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "@solana/web3.js"],
  },
};

export default config;
