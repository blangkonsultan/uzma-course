/**
 * Pure calculation and formatting helpers for 28-day billing cycles,
 * invoice penomoran, receipt numbers, and tuition fee discounts.
 */

export interface CycleDatesResult {
  period_start: string;
  period_end: string;
  due_date: string;
}

export interface TuitionDiscountResult {
  discount_amount: number;
  total_amount: number;
}

function formatDateToIsoString(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDateToUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
}

/**
 * Calculates rolling cycle boundaries for a given start date, cycle length (days),
 * and cycle sequence index (0-indexed).
 */
export function calculateCycleDates(
  startDateStr: string,
  cycleDays: number = 28,
  cycleIndex: number = 0
): CycleDatesResult {
  const baseDate = parseIsoDateToUtc(startDateStr);

  const startOffsetDays = cycleIndex * cycleDays;
  const startDate = new Date(baseDate.getTime() + startOffsetDays * 86400000);

  const endDate = new Date(startDate.getTime() + (cycleDays - 1) * 86400000);
  const dueDate = new Date(startDate.getTime() + 7 * 86400000);

  return {
    period_start: formatDateToIsoString(startDate),
    period_end: formatDateToIsoString(endDate),
    due_date: formatDateToIsoString(dueDate),
  };
}

function extractYearMonth(date: string | Date): { yy: string; mm: string } {
  let d: Date;
  if (typeof date === "string") {
    d = parseIsoDateToUtc(date);
  } else {
    d = date;
  }
  const year = String(d.getUTCFullYear());
  const yy = year.slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return { yy, mm };
}

/**
 * Formats a standard accounting invoice number as INV-YYMM-NNNN
 */
export function formatInvoiceNumber(
  date: string | Date,
  sequenceNumber: number
): string {
  const { yy, mm } = extractYearMonth(date);
  const seq = String(sequenceNumber).padStart(4, "0");
  return `INV-${yy}${mm}-${seq}`;
}

/**
 * Formats a standard official receipt number as RCT-YYMM-NNNN
 */
export function formatReceiptNumber(
  date: string | Date,
  sequenceNumber: number
): string {
  const { yy, mm } = extractYearMonth(date);
  const seq = String(sequenceNumber).padStart(4, "0");
  return `RCT-${yy}${mm}-${seq}`;
}

/**
 * Calculates discount and net total amount based on discount type and value.
 */
export function calculateTuitionDiscount(
  amount: number,
  discountType?: string | null,
  discountValue: number = 0
): TuitionDiscountResult {
  const safeAmount = Math.max(0, amount);
  let discount_amount = 0;

  if (discountType === "nominal" && discountValue > 0) {
    discount_amount = Math.min(safeAmount, Math.round(discountValue));
  } else if (discountType === "percentage" && discountValue > 0) {
    discount_amount = Math.min(
      safeAmount,
      Math.round((safeAmount * discountValue) / 100)
    );
  }

  const total_amount = Math.max(0, safeAmount - discount_amount);

  return {
    discount_amount,
    total_amount,
  };
}
