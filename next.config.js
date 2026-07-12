/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["better-sqlite3", "xlsx"],
  webpack: (config) => {
    config.stats = "errors-warnings"
    if (config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin.constructor.name !== "TerserPlugin"
      )
    }
    return config
  },
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
