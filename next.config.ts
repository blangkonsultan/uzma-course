import { randomUUID } from "node:crypto";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const offlineRevision = randomUUID();
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // Append the real fallback document without replacing automatic public assets.
  manifestTransforms: [
    (entries) => ({
      // Serwist uses size: 0 for routes not emitted as webpack assets.
      manifest: [...entries, { url: "/~_offline", revision: offlineRevision, size: 0 }],
      warnings: [],
    }),
  ],
});

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: [
    "it-50.tail4bf5a0.ts.net",
    "*.ts.net",
    "100.65.47.54",
    "100.65.47.54:3000",
  ],
};

export default withSerwist(nextConfig);
