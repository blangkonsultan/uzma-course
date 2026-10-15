import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

describe("Phase 1 Migration Script", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261015100000_phase1_security_hardening.sql"
  );

  it("migration file exists", () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it("hardcodes role to 'guru' in handle_new_user and ignores user metadata role", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.handle_new_user()");
    expect(sql).toContain("'guru'");
    expect(sql).not.toContain("COALESCE(NEW.raw_user_meta_data->>'role'");
  });

  it("enables RLS and defines policies for program_variants", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.program_variants ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("REVOKE ALL ON public.program_variants FROM anon;");
    expect(sql).toContain("GRANT SELECT ON public.program_variants TO anon;");
    expect(sql).toContain('CREATE POLICY "Admins manage program variants"');
    expect(sql).toContain('CREATE POLICY "Public reads active program variants"');
  });

  it("enables RLS and defines policies for branch_shifts", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.branch_shifts ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("REVOKE ALL ON public.branch_shifts FROM anon;");
    expect(sql).toContain('CREATE POLICY "Admins manage branch shifts"');
    expect(sql).toContain('CREATE POLICY "Authenticated users read active branch shifts"');
  });
});
