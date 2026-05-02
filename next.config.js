/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker / Cloud Run
  reactStrictMode: false,
};

module.exports = nextConfig;
