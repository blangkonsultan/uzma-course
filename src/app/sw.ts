/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly, NetworkFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/~_offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: [
    // 1. Hard network-only boundary for sensitive routes (MUST be first)
    {
      matcher: ({ url }) => {
        const p = url.pathname;
        return (
          p.startsWith("/admin") ||
          p.startsWith("/api") ||
          p.startsWith("/logout") ||
          p.startsWith("/login")
        );
      },
      handler: new NetworkOnly(),
    },
    // 2. Public and Guru HTML pages cache
    {
      matcher: ({ request, url }) => {
        if (
          url.pathname.startsWith("/admin") ||
          url.pathname.startsWith("/api") ||
          url.pathname.startsWith("/login") ||
          url.pathname.startsWith("/logout")
        ) {
          return false;
        }
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "uzma-pages-v2",
        networkTimeoutSeconds: 3,
      }),
    },
    // 3. Public and Guru Next.js RSC data cache
    {
      matcher: ({ request, url }) => {
        if (
          url.pathname.startsWith("/admin") ||
          url.pathname.startsWith("/api") ||
          url.pathname.startsWith("/login") ||
          url.pathname.startsWith("/logout")
        ) {
          return false;
        }
        return (
          request.headers.get("rsc") === "1" ||
          request.headers.get("next-router-prefetch") === "1"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "uzma-rsc-v2",
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Purge legacy and response caches on worker activation, strictly preserving IndexedDB
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (
            key === "others" ||
            key.includes("rsc-prefetch") ||
            key.includes("uzma-pages-cache") ||
            key.includes("uzma-rsc-cache")
          ) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        })
      )
    )
  );
});
