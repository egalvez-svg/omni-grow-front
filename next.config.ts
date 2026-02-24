import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true, // Disabled to fix "callbackNode" Fiber errors
  reactStrictMode: false, // Disabled to prevent double-invocation issues with React 19 beta
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "172.29.144.1:3000", "192.168.100.36:3000", "192.168.100.37:3000"],
};

export default nextConfig;
