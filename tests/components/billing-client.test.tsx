import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BillingClient } from "@/components/admin/billing/billing-client";
import type { BillingSummary, StudentInvoiceItem } from "@/lib/billing";
import { recordPaymentAction } from "@/app/admin/spp/actions";

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
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("renders a named SPP search control with standard form metadata", () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const searchInput = screen.getByRole("textbox", { name: "Cari tagihan SPP" });
    expect(searchInput).toBeDefined();
    expect(searchInput.getAttribute("name")).toBe("q");
    expect(searchInput.getAttribute("inputmode")).toBe("search");
    expect(searchInput.getAttribute("autocomplete")).toBe("off");
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

  it("returns focus to the invoice payment action when the form is cancelled", async () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const opener = screen.getByRole("button", { name: "Catat Bayar" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Catat Pembayaran SPP" });
    const cancel = within(dialog).getByRole("button", { name: "Batal" });
    cancel.focus();
    fireEvent.click(cancel);

    await waitFor(() => expect(opener).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("blocks cancellation while a payment is pending and retains entries on rejection", async () => {
    const pending = Promise.withResolvers<{ success: boolean; error?: string }>();
    vi.mocked(recordPaymentAction).mockReturnValueOnce(pending.promise);
    render(<BillingClient initialSummary={sampleSummary} branches={sampleBranches} />);
    fireEvent.click(screen.getByRole("button", { name: "Catat Bayar" }));

    const dialog = screen.getByRole("dialog", { name: "Catat Pembayaran SPP" });
    const reference = within(dialog).getByLabelText(/Nomor Referensi Transfer/);
    fireEvent.change(reference, { target: { value: "DEMO-REFERENCE" } });
    const submit = within(dialog).getByRole("button", { name: /Simpan Pembayaran/ });
    fireEvent.submit(dialog.querySelector("form")!);

    try {
      await waitFor(() => expect(submit).toBeDisabled());
      const cancel = new Event("cancel", { cancelable: true });
      fireEvent(dialog, cancel);
      expect(cancel.defaultPrevented).toBe(true);
      expect(dialog).toBeVisible();
      expect(within(dialog).getByRole("button", { name: "Batal" })).toBeDisabled();
    } finally {
      await act(async () => {
        pending.resolve({ success: false, error: "Demo payment rejected" });
      });
    }

    await waitFor(() => expect(submit).toBeEnabled());
    expect(screen.getByRole("dialog", { name: "Catat Pembayaran SPP" })).toBeVisible();
    expect(reference).toHaveValue("DEMO-REFERENCE");
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


  it("renders updated server data when filter navigation changes the props", async () => {
    const { rerender } = render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const filteredSummary: BillingSummary = {
      invoices: [sampleInvoices[1]],
      kpis: {
        total_invoiced: 150000,
        total_paid: 150000,
        total_outstanding: 0,
        unpaid_students_count: 0,
      },
    };

    rerender(
      <BillingClient
        initialSummary={filteredSummary}
        branches={sampleBranches}
        currentBranch="branch-1"
        currentStatus="paid"
        currentSearch="Budi"
      />
    );

    expect(screen.getByText("INV-2610-0002")).toBeDefined();
    expect(screen.queryByText("INV-2610-0001")).toBeNull();
    expect(screen.getByText("0 Murid")).toBeDefined();
    await waitFor(() => {
      expect((screen.getByLabelText("Filter Cabang") as HTMLSelectElement).value).toBe("branch-1");
      expect((screen.getByLabelText("Filter Status Tagihan") as HTMLSelectElement).value).toBe("paid");
      expect(
        (screen.getByPlaceholderText("Cari murid, nomor induk, atau nomor invoice...") as HTMLInputElement).value
      ).toBe("Budi");
    });
  });
  it("keeps the search input mounted when server filter props settle", async () => {
    const { rerender } = render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );
    const searchInput = screen.getByPlaceholderText(
      "Cari murid, nomor induk, atau nomor invoice..."
    );
    searchInput.focus();

    rerender(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="branch-1"
        currentStatus="paid"
        currentSearch="Budi"
      />
    );

    const settledInput = screen.getByPlaceholderText(
      "Cari murid, nomor induk, atau nomor invoice..."
    );
    expect(settledInput).toBe(searchInput);
    expect(document.activeElement).toBe(searchInput);
    await waitFor(() => {
      expect((settledInput as HTMLInputElement).value).toBe("Budi");
    });
  });

  it("preserves earlier filter changes when composing filters before navigation settles", () => {
    pushMock.mockClear();

    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    fireEvent.change(screen.getByLabelText("Filter Cabang"), {
      target: { value: "branch-1" },
    });
    fireEvent.change(screen.getByLabelText("Filter Status Tagihan"), {
      target: { value: "paid" },
    });

    expect(pushMock).toHaveBeenLastCalledWith(
      "/admin/spp?branch=branch-1&status=paid"
    );
  });

  it("debounces search input to prevent rapid server navigations on typing", () => {
    vi.useFakeTimers();
    pushMock.mockClear();

    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const searchInput = screen.getByRole("textbox", { name: "Cari tagihan SPP" });

    fireEvent.change(searchInput, { target: { value: "A" } });
    fireEvent.change(searchInput, { target: { value: "Ah" } });
    fireEvent.change(searchInput, { target: { value: "Ahm" } });

    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/admin/spp?q=Ahm");

    vi.useRealTimers();
  });

  it("submits search immediately when Enter key is pressed", () => {
    vi.useFakeTimers();
    pushMock.mockClear();

    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const searchInput = screen.getByRole("textbox", { name: "Cari tagihan SPP" });
    fireEvent.change(searchInput, { target: { value: "Budi" } });
    expect(pushMock).not.toHaveBeenCalled();

    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/admin/spp?q=Budi");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(pushMock).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("renders export button and opens SppExportModal on click", async () => {
    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="branch-1"
        currentStatus="all"
        currentSearch=""
      />
    );

    const exportBtn = screen.getByRole("button", { name: /Export Rekap PDF/i });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).not.toBeDisabled();

    fireEvent.click(exportBtn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(
      within(modal).getByRole("heading", { name: /Pratinjau Export Rekap SPP/i })
    ).toBeInTheDocument();
    expect(within(modal).getAllByText(/Sumokembangsri/i).length).toBeGreaterThanOrEqual(1);
    expect(within(modal).getByText("Ahmad Murid")).toBeInTheDocument();
    expect(within(modal).getByText("Budi Santoso")).toBeInTheDocument();
    // Close modal
    const closeBtn = screen.getByLabelText("Tutup pratinjau export");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /Pratinjau Export Rekap SPP/i })
      ).not.toBeInTheDocument();
    });
  });

  it("disables the export button when there are no invoices", () => {
    const emptySummary: BillingSummary = {
      invoices: [],
      kpis: {
        total_invoiced: 0,
        total_paid: 0,
        total_outstanding: 0,
        unpaid_students_count: 0,
      },
    };

    render(
      <BillingClient
        initialSummary={emptySummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const exportBtn = screen.getByRole("button", { name: /Export Rekap PDF/i });
    expect(exportBtn).toBeDisabled();
  });


  it("earlier_ack_preserves_newer_draft_and_focus: props settling to earlier search does not overwrite newer draft", async () => {
    const { rerender } = render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch=""
      />
    );

    const searchInput = screen.getByLabelText("Cari tagihan SPP");
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);

    // User types X
    fireEvent.change(searchInput, { target: { value: "X" } });
    expect(searchInput).toHaveValue("X");

    // User continues typing to XY before server acknowledges X
    fireEvent.change(searchInput, { target: { value: "XY" } });
    expect(searchInput).toHaveValue("XY");

    // Now server acknowledges the earlier navigation for X
    rerender(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch="X"
      />
    );

    // The draft must remain XY and focus must remain on the search input
    expect(searchInput).toHaveValue("XY");
    expect(document.activeElement).toBe(searchInput);

    // Pressing enter now submits XY, not X
    fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(pushMock).toHaveBeenLastCalledWith("/admin/spp?q=XY");
  });

  it("back_and_forward_cancel_pending_search: popstate adopts restored URL and cancels pending timer", () => {
    vi.useFakeTimers();

    render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch="initial"
      />
    );

    const searchInput = screen.getByLabelText("Cari tagihan SPP");
    // Type an abandoned draft
    fireEvent.change(searchInput, { target: { value: "abandoned" } });
    expect(searchInput).toHaveValue("abandoned");

    // User hits Back (triggers popstate) before 300ms
    window.dispatchEvent(new PopStateEvent("popstate"));

    // Advance past debounce timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // No push should have been made for "abandoned"
    expect(pushMock).not.toHaveBeenCalledWith(expect.stringContaining("abandoned"));

    vi.useRealTimers();
  });

  it("a_b_a_edits_use_version_not_text_equality: returning to earlier query is recognized as a newer edit", () => {
    const { rerender } = render(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch="A"
      />
    );

    const searchInput = screen.getByLabelText("Cari tagihan SPP");
    // User types B then returns to A (A -> B -> A)
    fireEvent.change(searchInput, { target: { value: "AB" } });
    fireEvent.change(searchInput, { target: { value: "A" } });
    expect(searchInput).toHaveValue("A");

    // Server settles intermediate state AB
    rerender(
      <BillingClient
        initialSummary={sampleSummary}
        branches={sampleBranches}
        currentBranch="all"
        currentStatus="all"
        currentSearch="AB"
      />
    );

    // Input must preserve newer intent A, not get overwritten to AB
    expect(searchInput).toHaveValue("A");
  });
});
