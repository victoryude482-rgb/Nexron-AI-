/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: [
    "@nexron/shared",
    "@nexron/ai-router",
    "@nexron/agent-runtime",
    "@nexron/memory",
    "@nexron/security",
    "@nexron/taskmaster",
    "@nexron/lead-intelligence"
  ]
};
export default nextConfig;
