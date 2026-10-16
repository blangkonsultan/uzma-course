"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";
import {
  closePayrollPeriod,
  createPayrollPeriod,
  markPayrollPeriodPaid,
  addPayrollAdjustment,
  getPayrollPeriodForAdmin,
  type AddPayrollAdjustmentInput,
  type PayrollPeriodRow,
  type PayrollAdjustmentRow,
  type AdminPayrollPeriodDetail,
} from "@/lib/payroll";

export async function createPeriodAction(
  periodMonth: string
): Promise<{ data?: PayrollPeriodRow; error?: string }> {
  const { user } = await requireAdminAction();

  if (!/^\d{4}-\d{2}-01$/.test(periodMonth)) {
    return { error: "Format bulan periode harus berupa tanggal awal bulan (YYYY-MM-01)." };
  }

  try {
    const data = await createPayrollPeriod(user.id, periodMonth);
    revalidatePath("/admin/payroll");
    revalidatePath("/guru/honor");
    return { data };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal membuat periode payroll.",
    };
  }
}

export async function closePeriodAction(
  periodId: string
): Promise<{ data?: AdminPayrollPeriodDetail; error?: string }> {
  const { user } = await requireAdminAction();

  if (!periodId || typeof periodId !== "string") {
    return { error: "ID periode tidak valid." };
  }

  try {
    await closePayrollPeriod(user.id, periodId);
    revalidatePath("/admin/payroll");
    revalidatePath("/guru/honor");
    const data = await getPayrollPeriodForAdmin(periodId);
    return { data: data || undefined };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menutup periode payroll.",
    };
  }
}

export async function markPeriodPaidAction(
  periodId: string
): Promise<{ data?: AdminPayrollPeriodDetail; error?: string }> {
  const { user } = await requireAdminAction();

  if (!periodId || typeof periodId !== "string") {
    return { error: "ID periode tidak valid." };
  }

  try {
    await markPayrollPeriodPaid(user.id, periodId);
    revalidatePath("/admin/payroll");
    revalidatePath("/guru/honor");
    const data = await getPayrollPeriodForAdmin(periodId);
    return { data: data || undefined };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menandai periode payroll dibayar.",
    };
  }
}

export async function addAdjustmentAction(
  input: AddPayrollAdjustmentInput
): Promise<{ data?: PayrollAdjustmentRow; error?: string }> {
  const { user } = await requireAdminAction();

  if (
    !input.period_id ||
    !input.teacher_id ||
    !input.amount ||
    Number(input.amount) === 0 ||
    !input.reason ||
    input.reason.trim().length === 0
  ) {
    return { error: "Nominal dan alasan adjustment wajib diisi." };
  }

  try {
    const data = await addPayrollAdjustment(user.id, {
      ...input,
      amount: Number(input.amount),
      reason: input.reason.trim(),
    });
    revalidatePath("/admin/payroll");
    revalidatePath("/guru/honor");
    return { data };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menambahkan adjustment payroll.",
    };
  }
}
