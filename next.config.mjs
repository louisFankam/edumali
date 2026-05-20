/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["better-sqlite3"],
  webpack: (config) => {
    config.stats = "errors-warnings"
    return config
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
