import { Metadata } from "next";
import { Plus, Edit2, Calendar } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Draf Jadwal | Admin Uzma Course",
};

export default async function DraftPage(props: {
  searchParams: Promise<{ search?: string; branch?: string; status?: string }>;
}) {
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
        <div className="flex items-center justify-end gap-2">
          <Button href={`/admin/draft/${d.id}/board`} size="sm" variant="outline" className="min-h-[36px]">
            Atur Jadwal
          </Button>
          <Link
            href={`/admin/draft/${d.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-transparent min-h-[36px]"
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
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button href={`/admin/draft/${draft.id}/board`} size="sm" variant="outline" className="flex-1 min-h-[36px]">
                    Atur Jadwal (Board)
                  </Button>
                  <Link
                    href={`/admin/draft/${draft.id}/edit`}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors min-h-[36px] min-w-[36px]"
                    aria-label={`Edit draf ${draft.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                </div>
              }
            />
          );
        }}
      />
    </div>
  );
}
