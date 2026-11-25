"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Printer,
} from "lucide-react";
import { generateCycleInvoicesAction } from "@/app/admin/spp/actions";
import { PaymentModal } from "./payment-modal";
import { OfficialReceiptModal } from "./official-receipt-modal";
import { SppExportModal } from "./spp-export-modal";
import type { BillingSummary, StudentInvoiceItem } from "@/lib/billing";

interface BillingClientProps {
  initialSummary: BillingSummary;
  branches: { id: string; name: string }[];
  currentBranch?: string;
  currentStatus?: string;
  currentSearch?: string;
}

interface BillingFilters {
  branch: string;
  status: string;
  search: string;
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
  const searchParams = useSearchParams();
  const urlBranch = searchParams.get("branch") || "all";
  const urlStatus = searchParams.get("status") || "all";
  const urlSearch = searchParams.get("q") || "";
  const summary = initialSummary;
  const [filters, setFilters] = useState<BillingFilters>(() => ({
    branch: currentBranch,
    status: currentStatus,
    search: currentSearch,
  }));
  const { branch: branchFilter, status: statusFilter, search: searchFilter } = filters;
  const draftRef = useRef(filters);
  const editVersionRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const acknowledgedRef = useRef({ branch: urlBranch, status: urlStatus, search: urlSearch });
  const navigationsRef = useRef<Array<{ filters: BillingFilters; version: number }>>([]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URL(window.location.href).searchParams;
      const restored = {
        branch: params.get("branch") || "all",
        status: params.get("status") || "all",
        search: params.get("q") || "",
      };
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
      editVersionRef.current += 1;
      navigationsRef.current = [];
      acknowledgedRef.current = restored;
      draftRef.current = restored;
      setFilters(restored);
    };

    const handleLinkNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download")
        || (anchor.target && anchor.target !== "_self")
        || anchor.getAttribute("href")?.startsWith("#")) return;
      const destination = new URL(anchor.href);
      if (destination.origin !== window.location.origin) return;

      // An external link intent supersedes the draft before a slow RSC commit.
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
      editVersionRef.current += 1;
      navigationsRef.current = [];
      if (destination.pathname === "/admin/spp") {
        const next = {
          branch: destination.searchParams.get("branch") || "all",
          status: destination.searchParams.get("status") || "all",
          search: destination.searchParams.get("q") || "",
        };
        draftRef.current = next;
        setFilters(next);
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkNavigation, true);
    return () => {
      editVersionRef.current += 1;
      clearTimeout(debounceTimerRef.current);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkNavigation, true);
    };
  }, []);

  // The router URL owns committed filters. Late server props are only data,
  // not permission to overwrite a newer editable tuple or restored history.
  useEffect(() => {
    const committed = { branch: urlBranch, status: urlStatus, search: urlSearch };
    const previous = acknowledgedRef.current;
    if (previous.branch === urlBranch && previous.status === urlStatus && previous.search === urlSearch) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      acknowledgedRef.current = committed;
      const ownNavigation = navigationsRef.current.findLast(({ filters }) =>
        filters.branch === urlBranch && filters.status === urlStatus && filters.search === urlSearch
      );
      if (ownNavigation) {
        navigationsRef.current = navigationsRef.current.filter(
          (navigation) => navigation.version > ownNavigation.version
        );
        // The local draft already contains this intent, or a newer one.
        // In particular, do not cancel a newer draft's valid debounce.
        return;
      }

      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
      editVersionRef.current += 1;
      navigationsRef.current = [];
      draftRef.current = committed;
      setFilters(committed);
    });
    return () => { cancelled = true; };
  }, [urlBranch, urlStatus, urlSearch]);
  const [paymentInvoice, setPaymentInvoice] =
    useState<StudentInvoiceItem | null>(null);
  const [receiptInvoice, setReceiptInvoice] =
    useState<StudentInvoiceItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isGenerating, startGenerating] = useTransition();

  const updateDraft = (next: BillingFilters) => {
    editVersionRef.current += 1;
    draftRef.current = next;
    setFilters(next);
    return editVersionRef.current;
  };

  const navigateFilters = (next: BillingFilters) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = undefined;
    const submitted = { ...next, search: next.search.trim() };
    const committed = acknowledgedRef.current;
    if (submitted.branch === committed.branch && submitted.status === committed.status
      && submitted.search === committed.search) {
      // Returning to the committed URL supersedes pending requests even when
      // the router has no changed URL to acknowledge.
      navigationsRef.current = [];
    } else {
      navigationsRef.current.push({ filters: submitted, version: editVersionRef.current });
    }
    const params = new URLSearchParams();
    if (submitted.branch !== "all") params.set("branch", submitted.branch);
    if (submitted.status !== "all") params.set("status", submitted.status);
    if (submitted.search) params.set("q", submitted.search);
    const qs = params.toString();
    router.push(qs ? `/admin/spp?${qs}` : "/admin/spp");
  };

  const handleFilterChange = (branch: string, status: string, search: string) => {
    const next = { branch, status, search };
    updateDraft(next);
    navigateFilters(next);
  };

  const handleSearchChange = (value: string) => {
    const next = { ...draftRef.current, search: value };
    const version = updateDraft(next);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (version === editVersionRef.current) navigateFilters(next);
    }, 300);
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
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 whitespace-nowrap tabular-nums">
            Rp&nbsp;{kpis.total_invoiced.toLocaleString("id-ID")}
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
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 whitespace-nowrap tabular-nums">
            Rp&nbsp;{kpis.total_paid.toLocaleString("id-ID")}
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
          <p className="text-lg sm:text-xl font-extrabold text-amber-800 whitespace-nowrap tabular-nums">
            Rp&nbsp;{kpis.total_outstanding.toLocaleString("id-ID")}
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2 flex-1">
          {/* Branch Filter */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              aria-label="Filter Cabang"
              value={branchFilter}
              onChange={(e) => handleFilterChange(
                e.target.value, draftRef.current.status, draftRef.current.search
              )}
              className="w-full appearance-none pl-3 pr-8 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
            >
              <option value="all">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              aria-label="Filter Status Tagihan"
              value={statusFilter}
              onChange={(e) => handleFilterChange(
                draftRef.current.branch, e.target.value, draftRef.current.search
              )}
              className="w-full appearance-none pl-3 pr-8 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="unpaid">Belum Lunas</option>
              <option value="paid">Lunas</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              inputMode="search"
              autoComplete="off"
              placeholder="Cari murid, nomor induk, atau nomor invoice..."
              aria-label="Cari tagihan SPP"
              value={searchFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  navigateFilters(draftRef.current);
                }
              }}
              className="w-full pl-10 pr-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            disabled={summary.invoices.length === 0}
            className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Rekap PDF</span>
          </button>

          {/* Generate Cycle Invoices Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateInvoices}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
            <span>{isGenerating ? "Memeriksa..." : "+ Terbitkan Tagihan Siklus"}</span>
          </button>
        </div>
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
                      <td className="p-3.5 text-right font-bold text-slate-900 text-sm whitespace-nowrap tabular-nums">
                        Rp&nbsp;{inv.total_amount.toLocaleString("id-ID")}
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
                                  className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
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

      {/* SPP Export Modal */}
      {isExportModalOpen && (
        <SppExportModal
          invoices={summary.invoices}
          branchName={
            branchFilter === "all"
              ? "Semua Cabang"
              : branches.find((b) => b.id === branchFilter)?.name || "Cabang Terpilih"
          }
          statusFilter={statusFilter}
          searchFilter={searchFilter}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
