/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable Turbopack (use --turbo flag in dev script)
  // Turbopack provides faster builds and HMR
  
  // Output configuration - comment out if you want static export
  // output: 'standalone',
  
  // Environment variables - accessible via process.env
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
    REACT_APP_POLYGON_AMOY_RPC: process.env.REACT_APP_POLYGON_AMOY_RPC,
  },
  
  // Disable Next.js image optimization if not using Next/Image
  images: {
    unoptimized: true,
  },
  
  // Handle routes - since we're using React Router, we'll redirect everything to root
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
  
  // Note: Webpack config removed - Turbopack handles module resolution automatically
  // If you need Node.js polyfills, they're handled differently in Turbopack
};

export default nextConfig;

