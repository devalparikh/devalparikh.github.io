import type { NextConfig } from "next";

/**
 * The site ships as a static export to GitHub Pages behind the devalparikh.me
 * apex domain, so assets are served from the site root and Next's image
 * optimizer is unavailable at runtime.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typedRoutes: true,
};

export default nextConfig;
