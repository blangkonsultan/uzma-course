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

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/guru") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logout")
  );
}

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
    // 1. Hard network-only boundary for protected paths (MUST be first)
    // Prevents caching of personal teacher/admin HTML, RSC payloads, and private actions
    {
      matcher: ({ url }) => isProtectedPath(url.pathname),
      handler: new NetworkOnly(),
    },
    // 2. Public HTML pages cache
    {
      matcher: ({ request, url }) => {
        if (isProtectedPath(url.pathname)) {
          return false;
        }
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "uzma-public-pages-v3",
        networkTimeoutSeconds: 3,
      }),
    },
    // 3. Public Next.js RSC data cache
    {
      matcher: ({ request, url }) => {
        if (isProtectedPath(url.pathname)) {
          return false;
        }
        return (
          request.headers.get("rsc") === "1" ||
          request.headers.get("next-router-prefetch") === "1"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "uzma-public-rsc-v3",
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
            key === "uzma-pages-v2" ||
            key === "uzma-rsc-v2" ||
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
