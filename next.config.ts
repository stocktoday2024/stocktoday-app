import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone is only required for Docker containers; on Vercel and standard Next.js deployments, standard output is preferred.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
};

export default nextConfig;
