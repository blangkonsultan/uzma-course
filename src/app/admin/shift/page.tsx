import { Metadata } from "next";
import { Plus, Edit2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ShiftStatusButton } from "@/components/admin/shift/shift-status-button";
import { getBranchShifts, BranchShift } from "@/lib/shifts";
import { getBranches } from "@/lib/branches";
import { formatTimeString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data Shift | Admin Uzma Course",
};

export default async function ShiftPage(props: {
  searchParams: Promise<{ search?: string; branch?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const shifts = await getBranchShifts();
  const branches = await getBranches();

  // Parse filters
  const search = searchParams.search?.trim() || "";
  const branchFilter = searchParams.branch || "all";
  const statusFilter = searchParams.status || "all";
  
  // Apply filters
  const filteredShifts = shifts.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (branchFilter !== "all" && s.branch_id !== branchFilter) return false;
    if (statusFilter === "active" && !s.is_active) return false;
    if (statusFilter === "inactive" && s.is_active) return false;
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
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Tidak Aktif" },
      ],
    },
  ];

  const columns: Column<BranchShift>[] = [
    {
      header: "Nama Shift",
      accessorKey: "name",
      cell: (s) => {
        const branch = branches.find((b) => b.id === s.branch_id);
        const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        const dayName = s.day_of_week >= 1 && s.day_of_week <= 7 ? dayNames[s.day_of_week - 1] : `Hari ${s.day_of_week}`;
        return (
          <div>
            <Link
              href={`/admin/shift/${s.id}/edit`}
              className="font-bold text-sm text-primary-700 hover:text-primary-800 transition-colors"
            >
              {s.name}
            </Link>
            <p className="text-xs text-slate-500 mt-0.5">
              {branch?.name || s.branch_id} • {dayName}
            </p>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (s) => (
        <StatusBadge isActive={s.is_active} activeText="Aktif" inactiveText="Tidak Aktif" />
      ),
    },
    {
      header: "Jam",
      hideOnMobile: true,
      cell: (s) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTimeString(s.start_time)} - {formatTimeString(s.end_time)}</span>
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (s) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/shift/${s.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit Shift"
            aria-label={`Edit shift ${s.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <ShiftStatusButton
            shiftId={s.id}
            shiftName={s.name}
            isActive={s.is_active}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Master Shift"
        description="Kelola slot waktu (shift) untuk penjadwalan per cabang"
        action={
          <Button href="/admin/shift/tambah" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Shift
          </Button>
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama shift..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={filteredShifts}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data shift yang sesuai dengan filter pencarian."
        mobileCard={(shift) => {
          const branch = branches.find((b) => b.id === shift.branch_id);
          const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
          const dayName = shift.day_of_week >= 1 && shift.day_of_week <= 7 ? dayNames[shift.day_of_week - 1] : `Hari ${shift.day_of_week}`;
          
          return (
            <MasterMobileCard
              avatar={{
                initials: shift.name.slice(0, 2).toUpperCase(),
                color: shift.is_active ? "amber" : "slate",
              }}
              title={shift.name}
              titleHref={`/admin/shift/${shift.id}/edit`}
              subtitle={`${branch?.name || shift.branch_id} • ${dayName}`}
              status={<StatusBadge isActive={shift.is_active} activeText="Aktif" inactiveText="Tidak Aktif" />}
              badges={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatTimeString(shift.start_time)} - {formatTimeString(shift.end_time)}</span>
                </span>
              }
              specs={{
                left: { label: "Mulai", value: formatTimeString(shift.start_time) },
                right: { label: "Selesai", value: formatTimeString(shift.end_time) },
              }}
              actions={
                <div className="flex items-center justify-end gap-2 w-full">
                  <Link
                    href={`/admin/shift/${shift.id}/edit`}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors min-h-[36px] min-w-[36px]"
                    aria-label={`Edit shift ${shift.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <ShiftStatusButton
                    shiftId={shift.id}
                    shiftName={shift.name}
                    isActive={shift.is_active}
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[36px] min-w-[36px]"
                  />
                </div>
              }
            />
          );
        }}
      />
    </div>
  );
}
