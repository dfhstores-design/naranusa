import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pwa-edukasi-kelas4",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
