import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          disableIframePageLoading: true,
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    globals: true,
    coverage: {
      provider: "istanbul",
      enabled: true,
      reporter: ["text", "json", "html"],
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/lib/supabase/**",
        "src/types/**",
        "src/proxy.ts",
        "src/app/**/actions.ts",
        "src/app/**/upload-logo.ts",
        "src/app/**/layout.tsx",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 65,
        functions: 70,
        branches: 65,
        statements: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
