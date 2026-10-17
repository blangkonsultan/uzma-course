import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getBillingSummary,
  getInvoiceDetail,
  triggerCycleInvoiceGeneration,
  recordPayment,
} from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const sampleInvoice = {
  id: "inv-1",
  invoice_number: "INV-2610-0001",
  student_id: "student-1",
  program_id: "prog-1",
  variant_id: "var-1",
  branch_id: "branch-1",
  period_start: "2026-10-05",
  period_end: "2026-11-01",
  due_date: "2026-10-12",
  cycle_number: 1,
  amount: 150000,
  discount_amount: 15000,
  total_amount: 135000,
  status: "unpaid" as const,
  notes: null,
  created_at: "2026-10-05T00:00:00Z",
  updated_at: "2026-10-05T00:00:00Z",
  student: {
    id: "student-1",
    full_name: "Ahmad Murid",
    student_number: "01001",
    parent_name: "Bpk. Ahmad",
    parent_phone: "081234567890",
  },
  program: { id: "prog-1", name: "Ahe Baca" },
  variant: { id: "var-1", name: "Standar" },
  branch: { id: "branch-1", name: "Cabang Sumokembangsri" },
  payment: null,
};

const samplePaidInvoice = {
  ...sampleInvoice,
  id: "inv-2",
  invoice_number: "INV-2610-0002",
  status: "paid" as const,
  payment: {
    id: "pay-1",
    receipt_number: "RCT-2610-0001",
    amount_paid: 135000,
    payment_date: "2026-10-08",
    payment_method: "cash",
  },
};

describe("Billing DAL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates accurate billing summary KPIs from returned invoices", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [sampleInvoice, samplePaidInvoice],
          error: null,
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const summary = await getBillingSummary({});

    expect(summary.invoices.length).toBe(2);
    expect(summary.kpis.total_invoiced).toBe(270000);
    expect(summary.kpis.total_paid).toBe(135000);
    expect(summary.kpis.total_outstanding).toBe(135000);
    expect(summary.kpis.unpaid_students_count).toBe(1);
  });

  it("retrieves invoice detail with payment receipt and relations", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: samplePaidInvoice,
          error: null,
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const detail = await getInvoiceDetail("inv-2");

    expect(detail).not.toBeNull();
    expect(detail?.invoice_number).toBe("INV-2610-0002");
    expect(detail?.payment?.receipt_number).toBe("RCT-2610-0001");
  });

  it("invokes generate_due_student_invoices RPC", async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [sampleInvoice],
        error: null,
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const result = await triggerCycleInvoiceGeneration("branch-1");

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      "generate_due_student_invoices",
      { p_branch_id: "branch-1" }
    );
    expect(result.length).toBe(1);
  });

  it("invokes record_student_payment RPC", async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: samplePaidInvoice.payment,
        error: null,
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const result = await recordPayment({
      invoice_id: "inv-1",
      payment_method: "transfer_bca",
      payment_date: "2026-10-17",
      payment_reference: "TRX-9988",
      notes: "Transfer via m-BCA",
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith("record_student_payment", {
      p_invoice_id: "inv-1",
      p_payment_method: "transfer_bca",
      p_payment_date: "2026-10-17",
      p_payment_reference: "TRX-9988",
      p_notes: "Transfer via m-BCA",
    });
    expect(result.receipt_number).toBe("RCT-2610-0001");
  });
});
