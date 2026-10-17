import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfficialReceiptModal } from "@/components/admin/billing/official-receipt-modal";
import type { StudentInvoiceItem } from "@/lib/billing";

const paidInvoice: StudentInvoiceItem = {
  id: "inv-2",
  invoice_number: "INV-2610-0002",
  student_id: "st-2",
  program_id: "prog-1",
  variant_id: "var-1",
  branch_id: "branch-1",
  period_start: "2026-10-05",
  period_end: "2026-11-01",
  due_date: "2026-10-12",
  cycle_number: 1,
  amount: 150000,
  discount_amount: 0,
  total_amount: 150000,
  status: "paid",
  notes: null,
  created_at: "2026-10-05T00:00:00Z",
  updated_at: "2026-10-08T00:00:00Z",
  student: {
    id: "st-2",
    full_name: "Budi Santoso",
    student_number: "01002",
    parent_name: "Ibu Siti",
    parent_phone: "089876543210",
  },
  program: { id: "prog-1", name: "Ahe Baca" },
  variant: { id: "var-1", name: "Standar" },
  branch: { id: "branch-1", name: "Sumokembangsri" },
  payment: {
    id: "pay-1",
    receipt_number: "RCT-2610-0001",
    amount_paid: 150000,
    payment_date: "2026-10-08",
    payment_method: "transfer_bca",
    payment_reference: "TRX-12345",
    notes: "Lunas via m-BCA",
  },
};

describe("OfficialReceiptModal Component", () => {
  it("renders receipt details including numbers, student, cycle, and paid badge", () => {
    const onClose = vi.fn();
    render(<OfficialReceiptModal invoice={paidInvoice} onClose={onClose} />);

    expect(screen.getByText("RCT-2610-0001")).toBeDefined();
    expect(screen.getByText(/INV-2610-0002/)).toBeDefined();
    expect(screen.getByText("Budi Santoso")).toBeDefined();
    expect(screen.getByText("01002")).toBeDefined();
    expect(screen.getAllByText("Rp 150.000").length).toBeGreaterThan(0);
    expect(screen.getByText("LUNAS")).toBeDefined();
  });

  it("calls window.print when Cetak button is clicked", () => {
    const printMock = vi.fn();
    window.print = printMock;
    const onClose = vi.fn();
    render(<OfficialReceiptModal invoice={paidInvoice} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Cetak Kwitansi/i }));
    expect(printMock).toHaveBeenCalled();
  });
});
