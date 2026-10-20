import { describe, expect, it } from "vitest";
import { groupInvoicesByStudent, type StudentInvoiceItem } from "@/lib/billing";

function makeMockInvoice(overrides: Partial<StudentInvoiceItem>): StudentInvoiceItem {
  return {
    id: "inv-1",
    invoice_number: "INV-2610-0001",
    student_id: "stu-1",
    program_id: "prog-1",
    variant_id: "var-1",
    branch_id: "branch-1",
    period_start: "2026-10-01",
    period_end: "2026-10-28",
    due_date: "2026-10-08",
    cycle_number: 1,
    amount: 350000,
    discount_amount: 0,
    total_amount: 350000,
    status: "unpaid",
    notes: null,
    created_by: null,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    student: {
      id: "stu-1",
      full_name: "Ahmad Faza",
      student_number: "2610.KR.001",
      parent_name: "Ibu Rahma",
      parent_phone: "081234567890",
    },
    program: {
      id: "prog-1",
      name: "Calistung Privat",
    },
    variant: {
      id: "var-1",
      name: "2x seminggu",
    },
    branch: {
      id: "branch-1",
      name: "Cabang Kranggan",
    },
    payment: null,
    ...overrides,
  };
}

describe("groupInvoicesByStudent", () => {
  it("returns empty result for empty invoices array", () => {
    const result = groupInvoicesByStudent([]);
    expect(result.total_students).toBe(0);
    expect(result.total_programs).toBe(0);
    expect(result.total_invoiced).toBe(0);
    expect(result.total_paid).toBe(0);
    expect(result.total_outstanding).toBe(0);
    expect(result.grouped_students).toEqual([]);
  });

  it("correctly groups multiple programs under the same student", () => {
    const inv1 = makeMockInvoice({
      id: "inv-1",
      student_id: "stu-1",
      total_amount: 350000,
      status: "paid",
      payment: {
        id: "pay-1",
        receipt_number: "RCT-2610-0001",
        amount_paid: 350000,
        payment_date: "2026-10-18",
        payment_method: "transfer_bca",
      },
    });

    const inv2 = makeMockInvoice({
      id: "inv-2",
      student_id: "stu-1",
      program_id: "prog-2",
      total_amount: 300000,
      status: "unpaid",
      program: {
        id: "prog-2",
        name: "Mengaji Iqro Intensif",
      },
      variant: {
        id: "var-2",
        name: "3x seminggu",
      },
      payment: null,
    });

    const result = groupInvoicesByStudent([inv1, inv2]);

    expect(result.total_students).toBe(1);
    expect(result.total_programs).toBe(2);
    expect(result.total_invoiced).toBe(650000);
    expect(result.total_paid).toBe(350000);
    expect(result.total_outstanding).toBe(300000);

    const student = result.grouped_students[0];
    expect(student.student_id).toBe("stu-1");
    expect(student.student_name).toBe("Ahmad Faza");
    expect(student.programs_count).toBe(2);
    expect(student.total_invoiced).toBe(650000);
    expect(student.total_paid).toBe(350000);
    expect(student.total_outstanding).toBe(300000);
    expect(student.status).toBe("partial"); // 1 paid, 1 unpaid
    expect(student.invoices).toHaveLength(2);
  });

  it("correctly calculates status 'paid' when all programs are paid", () => {
    const inv = makeMockInvoice({
      id: "inv-1",
      student_id: "stu-2",
      total_amount: 400000,
      status: "paid",
      payment: {
        id: "pay-2",
        receipt_number: "RCT-2610-0002",
        amount_paid: 400000,
        payment_date: "2026-10-19",
        payment_method: "cash",
      },
      student: {
        id: "stu-2",
        full_name: "Siti Aisyah",
        student_number: "2610.KR.002",
        parent_name: "Bpk. Hendra",
        parent_phone: "081398765432",
      },
    });

    const result = groupInvoicesByStudent([inv]);
    expect(result.total_students).toBe(1);
    expect(result.total_programs).toBe(1);
    expect(result.grouped_students[0].status).toBe("paid");
    expect(result.total_outstanding).toBe(0);
    expect(result.total_paid).toBe(400000);
  });

  it("correctly calculates status 'unpaid' when all programs are unpaid", () => {
    const inv = makeMockInvoice({
      id: "inv-1",
      student_id: "stu-3",
      total_amount: 250000,
      status: "unpaid",
      payment: null,
    });

    const result = groupInvoicesByStudent([inv]);
    expect(result.grouped_students[0].status).toBe("unpaid");
    expect(result.total_outstanding).toBe(250000);
    expect(result.total_paid).toBe(0);
  });
});
