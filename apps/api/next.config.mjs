/** @type {import('next').NextConfig} */
const webOrigin = process.env.NEXRON_WEB_ORIGIN?.split(",")[0]?.trim() || "https://nexron-web-prod.onrender.com";
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() { return [{ source: "/api/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: webOrigin }, { key: "Access-Control-Allow-Methods", value: "GET,POST,DELETE,OPTIONS" }, { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }] }]; },
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
