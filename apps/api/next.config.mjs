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
  ],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"]
    };
    return config;
  }
};
export default nextConfig;
