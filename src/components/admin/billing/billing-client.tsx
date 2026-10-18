"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  Receipt,
  Check,
} from "lucide-react";
import { generateCycleInvoicesAction } from "@/app/admin/spp/actions";
import { PaymentModal } from "./payment-modal";
import { OfficialReceiptModal } from "./official-receipt-modal";
import type { BillingSummary, StudentInvoiceItem } from "@/lib/billing";

interface BillingClientProps {
  initialSummary: BillingSummary;
  branches: { id: string; name: string }[];
  currentBranch?: string;
  currentStatus?: string;
  currentSearch?: string;
}

function formatDateDisplay(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function buildWaReminderUrl(invoice: StudentInvoiceItem): string | null {
  const phone = invoice.student?.parent_phone;
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone;

  const msg = `Halo Ayah/Bunda dari ${invoice.student?.full_name},

Kami dari Uzma Course ${invoice.branch?.name || ""} menginformasikan tagihan SPP untuk periode belajar ${formatDateDisplay(invoice.period_start)} s/d ${formatDateDisplay(invoice.period_end)} (Siklus #${invoice.cycle_number}):
- No. Tagihan: ${invoice.invoice_number}
- Program: ${invoice.program?.name} (${invoice.variant?.name})
- Total Biaya: Rp ${invoice.total_amount.toLocaleString("id-ID")}
- Jatuh Tempo: ${formatDateDisplay(invoice.due_date)}

Pembayaran dapat dilakukan secara tunai di cabang atau transfer ke rekening resmi Uzma Course.
Mohon konfirmasi setelah melakukan pembayaran. Terima kasih atas kepercayaannya mendampingi ananda belajar bersama kami.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
}

export function BillingClient({
  initialSummary,
  branches,
  currentBranch = "all",
  currentStatus = "all",
  currentSearch = "",
}: BillingClientProps) {
  const router = useRouter();
  const summary = initialSummary;
  const [branchFilter, setBranchFilter] = useState(currentBranch);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [searchFilter, setSearchFilter] = useState(currentSearch);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setBranchFilter(currentBranch);
      setStatusFilter(currentStatus);
      setSearchFilter(currentSearch);
    });
    return () => {
      cancelled = true;
    };
  }, [currentBranch, currentStatus, currentSearch]);

  const [paymentInvoice, setPaymentInvoice] =
    useState<StudentInvoiceItem | null>(null);
  const [receiptInvoice, setReceiptInvoice] =
    useState<StudentInvoiceItem | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isGenerating, startGenerating] = useTransition();

  const handleFilterChange = (
    nextBranch: string,
    nextStatus: string,
    nextSearch: string
  ) => {
    const params = new URLSearchParams();
    if (nextBranch !== "all") params.set("branch", nextBranch);
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextSearch.trim()) params.set("q", nextSearch.trim());

    const qs = params.toString();
    router.push(qs ? `/admin/spp?${qs}` : "/admin/spp");
  };

  const handleGenerateInvoices = () => {
    setFeedback(null);
    startGenerating(async () => {
      const branchId = branchFilter !== "all" ? branchFilter : undefined;
      const res = await generateCycleInvoicesAction(branchId);

      if (res.error) {
        setFeedback({ type: "error", message: res.error });
        return;
      }

      setFeedback({
        type: "success",
        message:
          res.count && res.count > 0
            ? `Berhasil menerbitkan ${res.count} tagihan siklus baru!`
            : "Seluruh murid aktif telah memiliki tagihan siklus berjalan.",
      });
      router.refresh();
    });
  };

  const kpis = summary.kpis;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Invoiced */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Tagihan
            </span>
            <span className="p-1.5 rounded-lg bg-primary-50 text-primary-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900">
            Rp {kpis.total_invoiced.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {summary.invoices.length} Faktur Tagihan
          </span>
        </div>

        {/* Kas Diterima */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Kas Diterima
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700">
            Rp {kpis.total_paid.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-500 block">
            Lunas Terbayar
          </span>
        </div>

        {/* Piutang Tertunggak */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Piutang Tertunggak
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-amber-800">
            Rp {kpis.total_outstanding.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-500 block">
            Belum Terbayar
          </span>
        </div>

        {/* Murid Belum Lunas */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Murid Belum Lunas
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900">
            {kpis.unpaid_students_count} Murid
          </p>
          <span className="text-[11px] text-slate-500 block">
            Perlu Ditagih
          </span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Branch Filter */}
          <div className="relative min-w-[140px]">
            <select
              aria-label="Filter Cabang"
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                handleFilterChange(e.target.value, statusFilter, searchFilter);
              }}
            >
              <option value="all">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[130px]">
            <select
              aria-label="Filter Status Tagihan"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange(branchFilter, e.target.value, searchFilter);
              }}
            >
              <option value="all">Semua Status</option>
              <option value="unpaid">Belum Lunas</option>
              <option value="paid">Lunas</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari murid, nomor induk, atau nomor invoice..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                handleFilterChange(branchFilter, statusFilter, e.target.value);
              }}
              className="w-full pl-8 pr-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Generate Cycle Invoices Button */}
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateInvoices}
          className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
          />
          <span>{isGenerating ? "Memeriksa..." : "+ Terbitkan Tagihan Siklus"}</span>
        </button>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {summary.invoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Filter className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">
              Tidak ada data tagihan SPP yang ditemukan
            </p>
            <p>
              Klik &quot;+ Terbitkan Tagihan Siklus&quot; di atas untuk memeriksa dan
              menerbitkan tagihan murid yang jatuh tempo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3.5">No. Tagihan</th>
                  <th className="p-3.5">Murid & Cabang</th>
                  <th className="p-3.5">Program & Siklus</th>
                  <th className="p-3.5">Jatuh Tempo</th>
                  <th className="p-3.5 text-right">Total Tagihan</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.invoices.map((inv) => {
                  const isPaid = inv.status === "paid";
                  const waUrl = buildWaReminderUrl(inv);

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Invoice Number */}
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                      </td>

                      {/* Student & Branch */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block text-sm">
                          {inv.student?.full_name}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          NIS: {inv.student?.student_number} ·{" "}
                          {inv.branch?.name}
                        </span>
                      </td>

                      {/* Program & 28-day Cycle */}
                      <td className="p-3.5">
                        <span className="font-semibold text-primary-700 block">
                          {inv.program?.name} ({inv.variant?.name})
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Siklus #{inv.cycle_number}: {formatDateDisplay(inv.period_start)} s/d{" "}
                          {formatDateDisplay(inv.period_end)}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5">
                        <span className="text-slate-700 font-medium block">
                          {formatDateDisplay(inv.due_date)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 text-right font-bold text-slate-900 text-sm">
                        Rp {inv.total_amount.toLocaleString("id-ID")}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Belum Bayar
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => setReceiptInvoice(inv)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-primary-600" />
                              <span>Lihat Kwitansi</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setPaymentInvoice(inv)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Catat Bayar</span>
                              </button>

                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors inline-flex items-center justify-center min-h-[36px] min-w-[36px]"
                                  title="Kirim Pengingat WhatsApp"
                                  aria-label="Kirim WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            setFeedback({
              type: "success",
              message: `Pembayaran ${paymentInvoice.invoice_number} berhasil dicatat & kwitansi resmi diterbitkan!`,
            });
            router.refresh();
          }}
        />
      )}

      {/* Official Receipt Modal */}
      {receiptInvoice && (
        <OfficialReceiptModal
          invoice={receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
}
