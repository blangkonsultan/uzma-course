import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SppExportModal } from "@/components/admin/billing/spp-export-modal";
import type { StudentInvoiceItem } from "@/lib/billing";

if (!window.print) {
  window.print = () => {};
}

const sampleInvoices: StudentInvoiceItem[] = [
  {
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
    status: "paid",
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
    program: { id: "prog-1", name: "Calistung Privat" },
    variant: { id: "var-1", name: "2x seminggu" },
    branch: { id: "branch-1", name: "Cabang Kranggan" },
    payment: {
      id: "pay-1",
      receipt_number: "RCT-2610-0001",
      amount_paid: 350000,
      payment_date: "2026-10-18",
      payment_method: "transfer_bca",
    },
  },
  {
    id: "inv-2",
    invoice_number: "INV-2610-0002",
    student_id: "stu-1",
    program_id: "prog-2",
    variant_id: "var-2",
    branch_id: "branch-1",
    period_start: "2026-10-01",
    period_end: "2026-10-28",
    due_date: "2026-10-08",
    cycle_number: 1,
    amount: 300000,
    discount_amount: 0,
    total_amount: 300000,
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
    program: { id: "prog-2", name: "Mengaji Iqro Intensif" },
    variant: { id: "var-2", name: "3x seminggu" },
    branch: { id: "branch-1", name: "Cabang Kranggan" },
    payment: null,
  },
];

describe("SppExportModal Component", () => {
  it("renders modal dialog with document header, filters, and grouped students", () => {
    const handleClose = vi.fn();
    render(
      <SppExportModal
        invoices={sampleInvoices}
        branchName="Cabang Kranggan"
        statusFilter="all"
        searchFilter="Faza"
        onClose={handleClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ahmad Faza")).toBeInTheDocument();
    expect(screen.getAllByText(/2 Program/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Calistung Privat/i)).toBeInTheDocument();
    expect(screen.getByText(/Mengaji Iqro Intensif/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Rp 650.000/i).length).toBeGreaterThanOrEqual(1);
  });

  it("triggers window.print when print button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(
      <SppExportModal
        invoices={sampleInvoices}
        branchName="Cabang Kranggan"
        onClose={vi.fn()}
      />
    );

    const printButton = screen.getByRole("button", {
      name: /Cetak \/ Simpan PDF/i,
    });
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <SppExportModal
        invoices={sampleInvoices}
        branchName="Cabang Kranggan"
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders empty state notice when invoices array is empty", () => {
    render(
      <SppExportModal
        invoices={[]}
        branchName="Semua Cabang"
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Tidak ada data tagihan SPP pada filter ini/i)
    ).toBeInTheDocument();
    const printButton = screen.getByRole("button", {
      name: /Cetak \/ Simpan PDF/i,
    });
    expect(printButton).toBeDisabled();
  });
});
