// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Forçando a chave exatamente onde o log do Next.js está pedindo
  // @ts-ignore - Necessário pois o schema do TS pode estar desatualizado frente ao Turbopack
  allowedDevOrigins: ['192.168.100.87', '172.28.128.1', 'localhost:3000'],
  
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.100.87', '172.28.128.1', 'localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
} as any; // Cast para any garante que o Next.js receba a chave no nível superior

export default nextConfig;
