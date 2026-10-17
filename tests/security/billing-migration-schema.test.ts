import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20261017120000_create_student_billing.sql"
);
const databaseTypesPath = path.resolve(process.cwd(), "src/types/database.ts");

describe("Student Billing migration contract", () => {
  it("creates student_invoices and student_payments tables with constraints", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.student_invoices");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.student_payments");
    expect(sql).toContain("UNIQUE (student_id, program_id, period_start)");
    expect(sql).toContain("invoice_id UUID NOT NULL UNIQUE");
    expect(sql).toContain("status IN ('unpaid', 'paid', 'cancelled')");
  });

  it("enforces RLS and authorization policies", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("ALTER TABLE public.student_invoices ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("Admin manages student_invoices");
    expect(sql).toContain("Admin manages student_payments");
  });

  it("defines atomic RPCs for invoice generation and payment recording", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.generate_due_student_invoices");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.record_student_payment");
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain("INV-");
    expect(sql).toContain("RCT-");
  });

  it("exposes billing tables and RPCs in database types", () => {
    const types = readFileSync(databaseTypesPath, "utf8");

    expect(types).toContain('"student_invoices"');
    expect(types).toContain('"student_payments"');
    expect(types).toContain('"generate_due_student_invoices"');
    expect(types).toContain('"record_student_payment"');
  });
});
