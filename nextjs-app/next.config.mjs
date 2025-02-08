/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/auth/:path*",
          destination: `${process.env.NEXT_PUBLIC_AUTH_API_URL}/:path*`,
        },
        {
          source: "/api/main/:path*",
          destination: `${process.env.NEXT_PUBLIC_MAIN_API_URL}/:path*`,
        }
      ];
    },
};

export default nextConfig;
