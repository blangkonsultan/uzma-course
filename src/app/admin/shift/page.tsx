import { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { getBranchShifts } from "@/lib/shifts";
import { getBranches } from "@/lib/branches";
import { formatTimeString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data Shift | Admin Uzma Course",
};

export default async function ShiftPage(props: {
  searchParams: Promise<{ q?: string; branch?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const shifts = await getBranchShifts();
  const branches = await getBranches();

  // Parse filters
  const q = searchParams.q?.toLowerCase() || "";
  const branchFilter = searchParams.branch || "";
  const statusFilter = searchParams.status || "";
  // Apply filters
  const filteredShifts = shifts.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q)) return false;
    if (branchFilter && s.branch_id !== branchFilter) return false;
    if (statusFilter === "active" && !s.is_active) return false;
    if (statusFilter === "inactive" && s.is_active) return false;
    return true;
  });

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Cari nama shift..."
            defaultValue={q}
            className="w-full pl-9 pr-4 py-2 border rounded-md text-base sm:text-sm"
            form="search-form"
            aria-label="Cari nama shift"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            name="branch"
            defaultValue={branchFilter}
            className="flex-1 min-w-0 border rounded-md px-3 py-2 text-base sm:text-sm bg-white"
            form="search-form"
            aria-label="Filter cabang"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={statusFilter}
            className="flex-1 min-w-0 border rounded-md px-3 py-2 text-base sm:text-sm bg-white"
            form="search-form"
            aria-label="Filter status"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <form id="search-form" method="GET" className="hidden" />
          <Button type="submit" variant="secondary" form="search-form">
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredShifts.map((shift) => {
          const branch = branches.find((b) => b.id === shift.branch_id);
          return (
            <MasterMobileCard
              key={shift.id}
              title={shift.name}
              subtitle={branch?.name || shift.branch_id}
              avatar={{ initials: shift.name.substring(0, 2).toUpperCase(), color: "blue" }}
              status={shift.is_active ? "Aktif" : "Nonaktif"}
              specs={{
                left: { label: "Cabang", value: branch?.name || shift.branch_id },
                right: { label: "Jam", value: `${formatTimeString(shift.start_time)} - ${formatTimeString(shift.end_time)}` }
              }}
              actions={
                <Button href={`/admin/shift/${shift.id}/edit`} variant="outline" size="sm" className="w-full">
                  Edit
                </Button>
              }
            />
          );
        })}

        {filteredShifts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Tidak ada data shift yang sesuai filter.
          </div>
        )}
      </div>
    </div>
  );
}
