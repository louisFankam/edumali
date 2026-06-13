const TerserPlugin = require("terser-webpack-plugin")

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["better-sqlite3"],
  webpack: (config) => {
    config.stats = "errors-warnings"
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: {},
          mangle: true,
        },
      }),
    ]
    return config
  },
  images: { unoptimized: true },
}

module.exports = nextConfig
