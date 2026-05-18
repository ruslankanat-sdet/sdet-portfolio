import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence workspace root detection warning when there are multiple lockfiles
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
