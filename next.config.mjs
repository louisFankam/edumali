/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.stats = "errors-warnings"
    return config
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
