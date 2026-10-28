import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
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
    payment_method: "transfer_bca",
    payment_reference: "TRX-12345",
    notes: "Lunas via m-BCA",
  },
};

describe("OfficialReceiptModal Component", () => {
  it("shows the stored payment identity and settled amount", () => {
    const onClose = vi.fn();
    render(<OfficialReceiptModal invoice={paidInvoice} onClose={onClose} />);

    expect(screen.getByText("RCT-2610-0001")).toBeVisible();
    expect(screen.getByText(/INV-2610-0002/)).toBeVisible();
    expect(screen.getByText("Budi Santoso")).toBeVisible();
    expect(screen.getByText("01002")).toBeVisible();
    const totalRow = screen.getByRole("row", { name: /Total Pelunasan/i });
    expect(within(totalRow).getByText("Rp 150.000")).toBeVisible();
    expect(screen.getByText("LUNAS")).toBeVisible();
  });

  it("keeps the receipt visible when the billing page is hidden for printing", () => {
    const { unmount } = render(
      <div style={{ visibility: "hidden", height: 0, overflow: "hidden" }}>
        <OfficialReceiptModal invoice={paidInvoice} onClose={vi.fn()} />
      </div>
    );

    const receipt = screen.getByText("RCT-2610-0001");
    expect(receipt).toBeVisible();

    unmount();
    expect(receipt).not.toBeInTheDocument();
  });

  it("sets body attribute while open and cleans up on close", () => {
    const { unmount } = render(
      <OfficialReceiptModal invoice={paidInvoice} onClose={vi.fn()} />
    );

    expect(document.body).toHaveAttribute("data-receipt-modal-open");

    unmount();
    expect(document.body).not.toHaveAttribute("data-receipt-modal-open");
  });

  it("returns focus to the receipt action when the preview closes", () => {
    function ReceiptHarness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open receipt</button>
          {open && (
            <OfficialReceiptModal
              invoice={paidInvoice}
              onClose={() => setOpen(false)}
            />
          )}
        </>
      );
    }

    render(<ReceiptHarness />);
    const opener = screen.getByRole("button", { name: "Open receipt" });
    opener.focus();
    fireEvent.click(opener);

    expect(document.body).toHaveAttribute("data-receipt-modal-open");

    const close = screen.getByRole("button", { name: "Tutup kwitansi" });
    close.focus();
    fireEvent.click(close);

    expect(opener).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body).not.toHaveAttribute("data-receipt-modal-open");
  });
});
