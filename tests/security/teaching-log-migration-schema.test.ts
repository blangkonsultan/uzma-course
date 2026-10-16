import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20261016120000_create_teaching_logs.sql"
);
const databaseTypesPath = path.resolve(process.cwd(), "src/types/database.ts");

describe("Teaching Log migration contract", () => {
  it("creates the parent and child teaching-log tables", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.teaching_sessions");
    expect(sql).toContain(
      "CREATE TABLE IF NOT EXISTS public.teaching_session_students"
    );
    expect(sql).toContain("UNIQUE (schedule_class_id, session_date)");
    expect(sql).toContain("UNIQUE (session_id, student_id)");
  });

  it("enforces status, snapshot, and audit invariants", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      "status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted'))"
    );
    expect(sql).toMatch(
      /teaching_sessions_date_status_check CHECK\s*\(\s*\(status = 'draft' AND submitted_at IS NULL\)/
    );
    expect(sql).toMatch(
      /attendance_status TEXT CHECK\s*\(\s*attendance_status IS NULL/
    );
    expect(sql).toContain(
      "teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0)"
    );
  });

  it("enables teacher-owned RLS and admin policies", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("ALTER TABLE public.teaching_sessions ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain(
      "ALTER TABLE public.teaching_session_students ENABLE ROW LEVEL SECURITY"
    );
    expect(sql).toContain("teacher_id = auth.uid()");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("status = 'draft'");
    expect(sql).toContain('DROP POLICY IF EXISTS "Guru reads active drafts"');
    expect(sql).toContain("profile_branches");
  });

  it("defines guarded transactional save and submit RPCs", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.save_teaching_session");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.submit_teaching_session");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain("submitted_at = now()");
  });

  it("exposes generated database table and RPC contracts", () => {
    const types = readFileSync(databaseTypesPath, "utf8");

    expect(types).toContain('"teaching_sessions"');
    expect(types).toContain('"teaching_session_students"');
    expect(types).toContain('"save_teaching_session"');
    expect(types).toContain('"submit_teaching_session"');
  });
});
