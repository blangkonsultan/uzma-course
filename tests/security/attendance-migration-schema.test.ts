import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

describe("Phase 3 Attendance Migration Script", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql"
  );

  it("migration file exists", () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it("adds shift_id column referencing branch_shifts", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.teacher_attendances");
    expect(sql).toContain(
      "ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.branch_shifts(id)"
    );
  });

  it("creates composite index for session queries", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_teacher_attendances_session"
    );
  });
});
