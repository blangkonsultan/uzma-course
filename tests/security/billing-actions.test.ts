import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";
import {
  generateCycleInvoicesAction,
  recordPaymentAction,
  cancelInvoiceAction,
} from "@/app/admin/spp/actions";
import {
  triggerCycleInvoiceGeneration,
  recordPayment,
  cancelInvoice,
} from "@/lib/billing";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
  triggerCycleInvoiceGeneration: vi.fn(),
  recordPayment: vi.fn(),
  cancelInvoice: vi.fn(),
}));

describe("Billing admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propagates admin authorization failures", async () => {
    vi.mocked(requireAdminAction).mockRejectedValueOnce(
      new Error("Hanya admin yang memiliki izin untuk operasi ini.")
    );

    await expect(generateCycleInvoicesAction()).rejects.toThrow("Hanya admin");
    expect(triggerCycleInvoiceGeneration).not.toHaveBeenCalled();
  });

  it("rejects invalid payment inputs before calling DAL", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);

    const result = await recordPaymentAction({
      invoice_id: "",
      payment_method: "cash",
    });
    expect(result).toEqual({
      success: false,
      error: "ID tagihan dan metode pembayaran wajib diisi.",
    });
    expect(recordPayment).not.toHaveBeenCalled();
  });

  it("invokes DAL and revalidates path on successful payment recording", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);
    vi.mocked(recordPayment).mockResolvedValue({
      id: "pay-1",
      receipt_number: "RCT-2610-0001",
    } as never);

    const result = await recordPaymentAction({
      invoice_id: "inv-1",
      payment_method: "cash",
    });

    expect(recordPayment).toHaveBeenCalledWith({
      invoice_id: "inv-1",
      payment_method: "cash",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/spp");
    expect(result.data?.receipt_number).toBe("RCT-2610-0001");
  });

  it("invokes DAL and revalidates path on invoice generation", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);
    vi.mocked(triggerCycleInvoiceGeneration).mockResolvedValue([
      { id: "inv-1" },
    ] as never);

    const result = await generateCycleInvoicesAction("branch-1");

    expect(triggerCycleInvoiceGeneration).toHaveBeenCalledWith("branch-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/spp");
    expect(result.count).toBe(1);
  });

  it("invokes DAL and revalidates path on cancelInvoiceAction", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);
    vi.mocked(cancelInvoice).mockResolvedValue({
      id: "inv-1",
      status: "cancelled",
    } as never);

    const result = await cancelInvoiceAction("inv-1", "Murid cuti");

    expect(cancelInvoice).toHaveBeenCalledWith("inv-1", "Murid cuti");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/spp");
    expect(result.success).toBe(true);
  });
});
