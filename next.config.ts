import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/naranusa",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
