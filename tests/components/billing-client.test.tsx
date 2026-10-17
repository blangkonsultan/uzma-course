import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillingClient } from "@/components/admin/billing/billing-client";
import type { BillingSummary, StudentInvoiceItem } from "@/lib/billing";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/admin/spp/actions", () => ({
  generateCycleInvoicesAction: vi.fn(),
  recordPaymentAction: vi.fn(),
  cancelInvoiceAction: vi.fn(),
}));

const sampleInvoices: StudentInvoiceItem[] = [
  {
    id: "inv-1",
    invoice_number: "INV-2610-0001",
    student_id: "st-1",
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
    status: "unpaid",
    notes: null,
    created_by: null,
    created_at: "2026-10-05T00:00:00Z",
    updated_at: "2026-10-05T00:00:00Z",
    student: {
      id: "st-1",
      full_name: "Ahmad Murid",
      student_number: "01001",
      parent_name: "Bpk. Ahmad",
      parent_phone: "081234567890",
    },
    program: { id: "prog-1", name: "Ahe Baca" },
    variant: { id: "var-1", name: "Standar" },
    branch: { id: "branch-1", name: "Sumokembangsri" },
    payment: null,
  },
  {
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
    created_by: null,
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
      payment_method: "cash",
      payment_reference: null,
      notes: null,
    },
  },
];

const sampleSummary: BillingSummary = {
  invoices: sampleInvoices,
  kpis: {
    total_invoiced: 285000,
    total_paid: 150000,
    total_outstanding: 135000,
    unpaid_students_count: 1,
  },
};

const sampleBranches = [
  { id: "branch-1", name: "Sumokembangsri" },
  { id: "branch-2", name: "Junwangi" },
];

describe("BillingClient Component", () => {
  it("renders 4 KPI summary cards with correct amounts", () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    expect(screen.getAllByText("Total Tagihan").length).toBeGreaterThan(0);
    expect(screen.getByText("Rp 285.000")).toBeDefined();
    expect(screen.getByText("Kas Diterima")).toBeDefined();
    expect(screen.getAllByText("Rp 150.000").length).toBeGreaterThan(0);
    expect(screen.getByText("Piutang Tertunggak")).toBeDefined();
    expect(screen.getAllByText("Rp 135.000").length).toBeGreaterThan(0);
    expect(screen.getByText("1 Murid")).toBeDefined();
  });

  it("renders invoice rows and action buttons", () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    expect(screen.getByText("INV-2610-0001")).toBeDefined();
    expect(screen.getByText("Ahmad Murid")).toBeDefined();
    expect(screen.getByText("Catat Bayar")).toBeDefined();

    expect(screen.getByText("INV-2610-0002")).toBeDefined();
    expect(screen.getByText("Budi Santoso")).toBeDefined();
    expect(screen.getByText("Lihat Kwitansi")).toBeDefined();
  });

  it("opens payment modal when Catat Bayar is clicked", () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    fireEvent.click(screen.getByText("Catat Bayar"));
    expect(screen.getByText(/Catat Pembayaran SPP/i)).toBeDefined();
    expect(screen.getAllByText(/Ahmad Murid/i).length).toBeGreaterThan(1);
  });

  it("opens official receipt modal when Lihat Kwitansi is clicked", () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    fireEvent.click(screen.getByText("Lihat Kwitansi"));
    expect(screen.getByText(/Kwitansi Pembayaran Resmi/i)).toBeDefined();
    expect(screen.getByText("RCT-2610-0001")).toBeDefined();
  });
});
