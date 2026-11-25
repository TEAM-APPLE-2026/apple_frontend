import type { NextConfig } from "next";

// GitHub Pages 배포용 정적 내보내기 (npm run build → out/)
// basePath: 배포 때 NEXT_PUBLIC_BASE_PATH=/apple_frontend, 로컬은 비워 둔다
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
};

export default nextConfig;
