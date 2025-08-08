/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Отключаем для лучшего Hot Reload
  swcMinify: false, // Отключаем минификацию в dev режиме
  generateEtags: false, // Отключаем ETags
  poweredByHeader: false, // Убираем X-Powered-By
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Отключаем кэширование webpack
      config.cache = false;
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'X-Accel-Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
}

module.exports = nextConfig
