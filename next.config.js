const withPWA = require("next-pwa");
const isProd = process.env.NODE_ENV === "production";

module.exports = withPWA({
  assetPrefix: isProd ? "devalparikh.github.io/" : "",
  env: {
    NEXT_PUBLIC_RESUME_LINK: "1Y5ttDgKB_Q3NVjPe5lzKZxYOrP7nEX5v",
  },
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  },
  images: {
    domains: ["devalparikh.github.io"],
  },
  experimental: {
    publicDirectory: true,
  },
});
