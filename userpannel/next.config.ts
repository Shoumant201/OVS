import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /pdf\.worker\.min\.js$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
