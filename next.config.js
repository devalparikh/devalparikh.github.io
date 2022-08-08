const withPWA = require("next-pwa");
const isProd = process.env.NODE_ENV === "production";

module.exports = withPWA({
  assetPrefix: isProd ? "https://devalparikh.github.io/" : "",
  env: {},
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  },
  // images: {
  //   domains: ["devalparikh.me"],
  // },
  experimental: {
    publicDirectory: true,
  },
});
