import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
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
