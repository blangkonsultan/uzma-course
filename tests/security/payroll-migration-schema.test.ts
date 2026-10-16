import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20261016150000_create_payroll_guru.sql"
);
const databaseTypesPath = path.resolve(process.cwd(), "src/types/database.ts");

describe("Payroll Guru migration contract", () => {
  it("creates the four payroll ledger tables and uniqueness constraints", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.payroll_periods");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.payroll_session_lines");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.payroll_entries");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.payroll_adjustments");
    expect(sql).toContain("UNIQUE (period_month)");
    expect(sql).toContain("UNIQUE (teaching_session_student_id)");
    expect(sql).toContain("UNIQUE (period_id, teacher_id)");
  });

  it("enforces period, fee, and adjustment invariants", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      "status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid'))"
    );
    expect(sql).toContain("teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0)");
    expect(sql).toContain("payable_amount INTEGER NOT NULL CHECK (payable_amount >= 0)");
    expect(sql).toContain("amount INTEGER NOT NULL CHECK (amount <> 0)");
    expect(sql).toContain("length(trim(reason)) > 0");
    expect(sql).toContain("teaching_session_students");
    expect(sql).toContain("status = 'submitted'");
  });

  it("enables admin and teacher read-only RLS", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.payroll_session_lines ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("teacher_id = auth.uid()");
    expect(sql).toContain("Guru reads own payroll entries");
  });

  it("defines guarded close, paid, and adjustment RPCs", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.close_payroll_period");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.mark_payroll_period_paid");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.add_payroll_adjustment");
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain("closed_at = now()");
    expect(sql).toContain("paid_at = now()");
    expect(sql).toContain("public.is_admin()");
  });

  it("exposes payroll tables and RPC contracts in database types", () => {
    const types = readFileSync(databaseTypesPath, "utf8");

    expect(types).toContain('"payroll_periods"');
    expect(types).toContain('"payroll_session_lines"');
    expect(types).toContain('"payroll_entries"');
    expect(types).toContain('"payroll_adjustments"');
    expect(types).toContain('"close_payroll_period"');
    expect(types).toContain('"mark_payroll_period_paid"');
    expect(types).toContain('"add_payroll_adjustment"');
  });
});
