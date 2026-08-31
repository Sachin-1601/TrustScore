import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the preview/proxy origin to load Next.js dev assets (/_next/*)
  // without triggering the dev-server cross-origin 403 block.
  allowedDevOrigins: [
    "*.preview.emergentagent.com",
    "*.emergentagent.com",
    "290df638-9125-4947-a892-ab50a06ef2fd.preview.emergentagent.com",
  ],
};

export default nextConfig;
