import { Metadata } from "next";
import { Plus, Edit2, Calendar, Printer, LayoutDashboard, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getScheduleDrafts, ScheduleDraft } from "@/lib/drafts";
import { getBranches } from "@/lib/branches";
import { formatDateString } from "@/lib/utils";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Draf Jadwal | Admin Uzma Course",
};

export default async function DraftPage(props: {
  searchParams: Promise<{ search?: string; branch?: string; status?: string }>;
}) {
  await requireAdminPage();
  const searchParams = await props.searchParams;
  const drafts = await getScheduleDrafts();
  const branches = await getBranches();

  // Parse filters
  const search = searchParams.search?.trim() || "";
  const branchFilter = searchParams.branch || "all";
  const statusFilter = searchParams.status || "all";
  
  // Apply filters
  const filteredDrafts = drafts.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (branchFilter !== "all" && d.branch_id !== branchFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  // Check for pending activations (Option 1: Visual Banner)
  const today = new Date().toISOString().split("T")[0];
  const pendingActivations = drafts.filter(
    (d) => d.status === "draft" && d.effective_date && d.effective_date <= today
  );

  const filterConfigs = [
    {
      id: "branch",
      label: "Cabang",
      options: branches.map((b) => ({ value: b.id, label: b.name })),
    },
    {
      id: "status",
      label: "Status",
      options: [
        { value: "draft", label: "Draf" },
        { value: "active", label: "Aktif" },
        { value: "archived", label: "Arsip" },
      ],
    },
  ];

  const columns: Column<ScheduleDraft>[] = [
    {
      header: "Nama Draf",
      accessorKey: "name",
      cell: (d) => {
        const branch = branches.find((b) => b.id === d.branch_id);
        return (
          <div>
            <Link
              href={`/admin/draft/${d.id}/board`}
              className="font-bold text-sm text-primary-700 hover:text-primary-800 transition-colors"
            >
              {d.name}
            </Link>
            <p className="text-xs text-slate-500 mt-0.5">
              Cabang: {branch?.name || d.branch_id}
            </p>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (d) => {
        let isActive = false;
        let activeText = "Draf";
        if (d.status === "active") {
          isActive = true;
          activeText = "Aktif";
        } else if (d.status === "archived") {
          activeText = "Arsip";
        }
        return <StatusBadge isActive={isActive} activeText={activeText} />;
      },
    },
    {
      header: "Tgl. Berlaku",
      hideOnMobile: true,
      cell: (d) => (
        <div className="text-sm text-slate-700">
          {d.effective_date ? formatDateString(d.effective_date) : <span className="text-slate-400 italic">-</span>}
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/draft/${d.id}/board`}
            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent min-h-[36px]"
            title="Buka Papan Jadwal"
            aria-label={`Buka papan jadwal untuk draf ${d.name}`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <Link
            href={`/print/draft/${d.id}?type=guru`}
            target="_blank"
            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors border border-transparent min-h-[36px]"
            title="Cetak Jadwal Guru"
            aria-label={`Cetak jadwal guru untuk draf ${d.name}`}
          >
            <Printer className="w-4 h-4" />
          </Link>
          <Link
            href={`/print/draft/${d.id}?type=murid`}
            target="_blank"
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors border border-transparent min-h-[36px]"
            title="Cetak Jadwal Murid"
            aria-label={`Cetak jadwal murid untuk draf ${d.name}`}
          >
            <Printer className="w-4 h-4" />
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <Link
            href={`/admin/draft/${d.id}/edit`}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent min-h-[36px]"
            title="Edit Draf"
            aria-label={`Edit draf ${d.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {pendingActivations.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start sm:items-center gap-3 shadow-sm">
          <div className="bg-rose-100 p-2 rounded-full text-rose-600 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-800">Peringatan Aktivasi Jadwal</h3>
            <p className="text-sm text-rose-700 mt-0.5">
              Terdapat <strong>{pendingActivations.length} draf jadwal</strong> yang tanggal berlakunya sudah tiba atau lewat, namun belum diaktifkan. Jadwal lama mungkin masih berjalan.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
            {pendingActivations.slice(0, 1).map(d => (
              <Button key={d.id} href={`/admin/draft/${d.id}/edit`} variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white border-none">
                Review & Aktifkan
              </Button>
            ))}
          </div>
        </div>
      )}
      <PageHeader
        title="Draf Penjadwalan Dinamis"
        description="Kelola versi jadwal (draf), tanggal aktif, dan susunan kelas"
        action={
          <Button href="/admin/draft/tambah" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Buat Draf Baru
          </Button>
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama draf..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={filteredDrafts}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data draf yang sesuai dengan filter pencarian."
        mobileCard={(draft) => {
          const branch = branches.find((b) => b.id === draft.branch_id);
          let isActive = false;
          let activeText = "Draf";
          if (draft.status === "active") {
            isActive = true;
            activeText = "Aktif";
          } else if (draft.status === "archived") {
            activeText = "Arsip";
          }
          
          return (
            <MasterMobileCard
              avatar={{
                initials: draft.name.slice(0, 2).toUpperCase(),
                color: isActive ? "emerald" : "slate",
              }}
              title={draft.name}
              titleHref={`/admin/draft/${draft.id}/board`}
              subtitle={`Cabang: ${branch?.name || draft.branch_id}`}
              status={<StatusBadge isActive={isActive} activeText={activeText} />}
              badges={
                draft.effective_date ? (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>Berlaku: {formatDateString(draft.effective_date)}</span>
                  </span>
                ) : undefined
              }
              specs={{
                left: { label: "Status", value: draft.status.toUpperCase() },
                right: { label: "Tgl Buat", value: formatDateString(draft.created_at) },
              }}
              actions={
                <div className="flex flex-col gap-2 w-full">
                  <Button href={`/admin/draft/${draft.id}/board`} size="sm" variant="primary" className="w-full min-h-[36px]">
                    Buka Papan Jadwal
                  </Button>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <Link
                      href={`/print/draft/${draft.id}?type=guru`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 flex-1 p-2 rounded-lg border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors min-h-[36px]"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs font-semibold">Guru</span>
                    </Link>
                    <Link
                      href={`/print/draft/${draft.id}?type=murid`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 flex-1 p-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors min-h-[36px]"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs font-semibold">Murid</span>
                    </Link>
                    <Link
                      href={`/admin/draft/${draft.id}/edit`}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors min-h-[36px] min-w-[36px]"
                      aria-label={`Edit draf ${draft.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              }
            />
          );
        }}
      />
    </div>
  );
}
