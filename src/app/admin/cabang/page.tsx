import { getPaginatedBranchesWithStats, type BranchWithStats } from "@/lib/branches";
import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { BranchStatusButton } from "@/components/admin/cabang/branch-status-button";
import { Plus, Edit2, MapPin, ExternalLink, Eye } from "lucide-react";

export const metadata = {
  title: "Data Cabang | Uzma Course",
};

interface CabangPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CabangPage({ searchParams }: CabangPageProps) {
  await requireAdminPage();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search?.trim() || "";
  const status = resolvedParams.status || "all";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 10;

  // Data Access Layer (DAL) call - Clean and abstract
  const { branches, totalItems, totalPages } = await getPaginatedBranchesWithStats({
    search,
    status,
    page,
    pageSize,
  });

  const filterConfigs = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Non-aktif" },
      ],
    },
  ];

  const columns: Column<BranchWithStats>[] = [
    {
      header: "Cabang",
      cell: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm shrink-0">
            {b.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/admin/cabang/${b.id}`}
              className="font-semibold text-slate-900 hover:text-primary-600 transition-colors leading-tight"
            >
              {b.name}
            </Link>
            <p className="text-xs text-slate-500 mt-0.5">
              {b.desa && b.kecamatan
                ? `Desa ${b.desa} • Kec. ${b.kecamatan}`
                : b.sub_name || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Alamat",
      cell: (b) => (
        <p className="text-xs text-slate-600 line-clamp-2 max-w-xs" title={b.address}>
          {b.address || "-"}
        </p>
      ),
    },
    {
      header: "Guru & Murid",
      cell: (b) => (
        <span className="text-xs text-slate-700 font-medium">
          {b.guruCount} guru · {b.muridCount} murid
        </span>
      ),
    },
    {
      header: "Google Maps",
      cell: (b) =>
        b.gmaps_url ? (
          <a
            href={b.gmaps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium"
            title="Buka navigasi Google Maps"
          >
            <span>Peta</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic">-</span>
        ),
    },
    {
      header: "Status",
      cell: (b) => <StatusBadge isActive={b.is_active} />,
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/cabang/${b.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors hidden sm:flex"
            title="Lihat Detail Cabang"
            aria-label={`Detail data ${b.name}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/cabang/${b.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit Cabang"
            aria-label={`Edit data ${b.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <BranchStatusButton
            branchId={b.id}
            branchName={b.name}
            isActive={b.is_active}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Cabang"
        description="Kelola cabang dan lokasi bimbingan belajar Uzma Course."
        action={
          <Button href="/admin/cabang/tambah" size="sm">
            <Plus className="w-4 h-4" />
            Tambah Cabang
          </Button>
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama cabang..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={branches}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data cabang yang sesuai dengan filter pencarian."
        mobileCard={(b) => {
          const guruCount = b.guruCount;
          const muridCount = b.muridCount;

          return (
            <MasterMobileCard
              avatar={{
                initials: b.name.slice(0, 2).toUpperCase(),
                color: "amber",
              }}
              title={b.name}
              titleHref={`/admin/cabang/${b.id}`}
              subtitle={
                b.desa && b.kecamatan
                  ? `Desa ${b.desa} • Kec. ${b.kecamatan}`
                  : b.sub_name || "Cabang Uzma Course"
              }
              badges={
                b.address ? (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{b.address}</span>
                  </span>
                ) : undefined
              }
              specs={{
                left: { label: "Guru Aktif", value: `${guruCount} orang` },
                right: { label: "Murid Aktif", value: `${muridCount} orang` },
              }}
              actions={
                <div className="flex items-center justify-end gap-2 w-full">
                  {b.gmaps_url && (
                    <a
                      href={b.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-primary-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[36px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Peta</span>
                    </a>
                  )}
                  <Link
                    href={`/admin/cabang/${b.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[36px]"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </Link>
                  <BranchStatusButton
                    branchId={b.id}
                    branchName={b.name}
                    isActive={b.is_active}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[36px] min-w-[36px]"
                  />
                </div>
              }
            />
          );
        }}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
}
