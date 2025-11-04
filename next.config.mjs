import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    // Suppress Edge Runtime warnings for Supabase packages
    // These warnings are harmless since middleware only uses auth (not realtime/Node.js APIs)
    // Note: Next.js may still show warnings during build, but they don't affect runtime
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      { module: /node_modules\/@supabase\/supabase-js/ },
    ]
    
    return config
  },
}

export default nextConfig
