/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate } from "serwist";

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
    {
      matcher: ({ request, url }) => {
        // Jangan cache halaman admin untuk alasan keamanan data
        if (url.pathname.startsWith("/admin")) return false;
        // Cache navigasi HTML
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "uzma-pages-cache",
        networkTimeoutSeconds: 3, // Cepat jatuh ke cache jika internet mati
      }),
    },
    {
      matcher: ({ request, url }) => {
        // Cache data API/RSC dari Next.js untuk navigasi soft-client
        if (url.pathname.startsWith("/admin")) return false;
        return (
          request.headers.get("rsc") === "1" ||
          request.headers.get("next-router-prefetch") === "1"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "uzma-rsc-cache",
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
