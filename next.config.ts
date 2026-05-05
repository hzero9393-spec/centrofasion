import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-959f64bd-a552-4ff3-92cf-6f3508a77e7d.space-z.ai',
  ],
};

export default nextConfig;
