import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { GuruStatusButton } from "@/components/admin/guru/guru-status-button";
import type { Profile } from "@/types";
import { Plus, Edit2, Phone, MapPin } from "lucide-react";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Data Guru | Uzma Course",
};

interface GuruPageProps {
  searchParams: Promise<{
    search?: string;
    branch?: string;
    status?: string;
    page?: string;
  }>;
}

type ProfileWithPrograms = Profile & {
  profile_programs?: { program_id: string }[];
};

export default async function GuruPage({ searchParams }: GuruPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/admin");
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams.search?.trim() || "";
  const branch = resolvedParams.branch || "all";
  const status = resolvedParams.status || "all";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 10;

  const [programs, branches] = await Promise.all([
    getPrograms(true),
    getBranches(true),
  ]);

  const branchMap: Record<string, string> = Object.fromEntries(
    branches.map((b) => [b.id, b.name])
  );
  const programMap: Record<string, { initials: string; name: string }> = Object.fromEntries(
    programs.map((p) => [p.id, { initials: p.initials, name: p.name }])
  );

  // Build Supabase query with profile_programs relation
  let query = supabase
    .from("profiles")
    .select("*, profile_programs(program_id)", { count: "exact" })
    .eq("role", "guru");

  if (branch !== "all") {
    query = query.eq("branch_id", branch);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: guruList, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

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
        { value: "inactive", label: "Non-aktif" },
      ],
    },
  ];

  const columns: Column<ProfileWithPrograms>[] = [
    {
      header: "Nama Guru",
      cell: (guru) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm shrink-0">
            {guru.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">
              {guru.full_name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Bergabung {new Date(guru.created_at).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Kontak HP",
      cell: (guru) =>
        guru.phone ? (
          <a
            href={`https://wa.me/${guru.phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>{guru.phone}</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">-</span>
        ),
    },
    {
      header: "Cabang",
      cell: (guru) => {
        const branchName = guru.branch_id
          ? branchMap[guru.branch_id] ?? guru.branch_id
          : "Belum ditentukan";
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{branchName}</span>
          </div>
        );
      },
    },
    {
      header: "Program Diampu",
      cell: (guru) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {guru.profile_programs && guru.profile_programs.length > 0 ? (
            guru.profile_programs.map((pp) => {
              const prog = programMap[pp.program_id];
              return (
                <span
                  key={pp.program_id}
                  title={prog?.name ?? pp.program_id}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
                >
                  {prog?.initials ?? pp.program_id}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">Semua program</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (guru) => <StatusBadge isActive={guru.is_active} />,
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (guru) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/guru/${guru.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit Guru"
            aria-label={`Edit data ${guru.full_name}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <GuruStatusButton
            guruId={guru.id}
            guruName={guru.full_name}
            isActive={guru.is_active}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Guru"
        description="Kelola informasi pengajar, akun login, penempatan cabang, dan program bimbingan."
        action={
          <Button href="/admin/guru/tambah" size="sm">
            <Plus className="w-4 h-4" />
            Tambah Guru
          </Button>
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama guru..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={guruList || []}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data guru yang sesuai dengan filter pencarian."
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
