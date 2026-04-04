import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "thirdweb",
  ],
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node",
    "@noble/hashes",
    "viem",
  ],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pino-pretty": false,
        "@solana/kit": false,
        "@solana-program/token": false,
        "@solana-program/system": false,
        "@solana-program/compute-budget": false,
      };
    }
    return config;
  },
};

export default nextConfig;
