import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("Seed Script Quarantine", () => {
  it("seed-variants.mjs is removed from the root directory", () => {
    const scriptPath = path.resolve(process.cwd(), "seed-variants.mjs");
    expect(existsSync(scriptPath)).toBe(false);
  });

  it("package.json does not reference seed-variants.mjs in any script", () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8")
    );
    const scripts = Object.values(pkg.scripts || {});
    for (const script of scripts) {
      expect(String(script)).not.toContain("seed-variants");
    }
  });
});
