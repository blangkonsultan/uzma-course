import { Metadata } from "next";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { getScheduleDrafts } from "@/lib/drafts";
import { getBranches } from "@/lib/branches";
import { formatDateString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Draf Jadwal | Admin Uzma Course",
};

export default async function DraftPage(props: {
  searchParams: Promise<{ q?: string; branch?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const drafts = await getScheduleDrafts();
  const branches = await getBranches();

  // Parse filters
  const q = searchParams.q?.toLowerCase() || "";
  const branchFilter = searchParams.branch || "";
  const statusFilter = searchParams.status || "";
  // Apply filters
  const filteredDrafts = drafts.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q)) return false;
    if (branchFilter && d.branch_id !== branchFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Cari nama draf..."
            defaultValue={q}
            className="w-full pl-9 pr-4 py-2 border rounded-md text-base sm:text-sm"
            form="search-form"
            aria-label="Cari nama draf"
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
            <option value="draft">Draf</option>
            <option value="active">Aktif</option>
            <option value="archived">Arsip</option>
          </select>
          <form id="search-form" method="GET" className="hidden" />
          <Button type="submit" variant="secondary" form="search-form">
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDrafts.map((draft) => {
          const branch = branches.find((b) => b.id === draft.branch_id);
          
          let statusLabel = "Draf";
          if (draft.status === "active") {
            statusLabel = "Aktif";
          } else if (draft.status === "archived") {
            statusLabel = "Arsip";
          }

          return (
            <MasterMobileCard
              key={draft.id}
              title={draft.name}
              avatar={{ initials: draft.name.substring(0, 2).toUpperCase(), color: draft.status === "active" ? "emerald" : "slate" }}
              subtitle={branch?.name || draft.branch_id}
              status={statusLabel}
              specs={{
                left: { label: "Cabang", value: branch?.name || draft.branch_id },
                right: { label: "Berlaku", value: draft.effective_date ? formatDateString(draft.effective_date) : "-" }
              }}
              actions={
                <div className="flex gap-2 w-full">
                  <Button href={`/admin/draft/${draft.id}/board`} size="sm" className="flex-1">
                    Atur Jadwal (Board)
                  </Button>
                  <Button href={`/admin/draft/${draft.id}/edit`} variant="outline" size="sm" className="w-1/3">
                    Edit
                  </Button>
                </div>
              }
            />
          );
        })}

        {filteredDrafts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Tidak ada draf jadwal yang sesuai filter.
          </div>
        )}
      </div>
    </div>
  );
}
