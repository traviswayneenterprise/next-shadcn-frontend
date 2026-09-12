// This CommonJS config file also uses a dynamic import() below; converting
// to full ESM would change how Next.js loads this config and isn't worth
// the risk here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

const labOrigin = process.env.NEXT_PUBLIC_LAB_ORIGIN;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {},
  async headers() {
    return [
      {
        // Restricts where this app may frame content from - the sandboxed
        // lab origin only. The iframe's own `sandbox` attribute (see
        // components/learn/lab-frame.tsx) is the primary isolation control;
        // this is defense in depth against embedding an unexpected origin.
        source: "/dashboard/learn/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-src 'self'${labOrigin ? ` ${labOrigin}` : ""}; frame-ancestors 'self'`,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

module.exports = withContentlayer(nextConfig);
