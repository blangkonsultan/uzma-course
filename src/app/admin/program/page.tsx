import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ProgramStatusButton } from "@/components/admin/program/program-status-button";
import { getPrograms } from "@/lib/programs";
import type { Program } from "@/types";
import { Plus, Eye, Edit2, Award } from "lucide-react";
import { formatClassRatio, formatDuration, formatFrequencyShort } from "@/lib/utils";

export const metadata = {
  title: "Master Program Belajar | Uzma Course",
};

export default async function ProgramListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin");
  }

  const programs = await getPrograms(true);

  const columns: Column<Program>[] = [
    {
      header: "#",
      className: "w-12 text-center",
      cell: (prog) => (
        <span className="text-xs font-mono font-bold text-slate-400">
          {prog.sort_order}
        </span>
      ),
    },
    {
      header: "Program",
      cell: (prog) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
            {prog.initials}
          </div>
          <div>
            <Link
              href={`/admin/program/${prog.id}`}
              className="font-semibold text-slate-900 hover:text-primary-600 transition-colors leading-tight block"
            >
              {prog.name}
            </Link>
            {prog.tagline && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                {prog.tagline}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Kategori & Lisensi",
      cell: (prog) => (
        <div>
          {prog.type === "franchise" ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Franchise ({prog.license_provider || "Berlisensi"})</span>
            </div>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              Original Uzma
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Target Usia",
      cell: (prog) => (
        <span className="text-xs text-slate-600 font-medium">
          {prog.age_range || "-"}
        </span>
      ),
    },
    {
      header: "Sistem & Durasi",
      cell: (prog) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium text-slate-800">{formatClassRatio(prog.system)}</p>
          <p className="text-slate-400 text-[11px]">{formatDuration(prog.duration)} • {formatFrequencyShort(prog.frequency)}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (prog) => <StatusBadge isActive={prog.is_active} />,
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (prog) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/program/${prog.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Lihat Detail Program"
            aria-label={`Detail ${prog.name}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/program/${prog.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit Program"
            aria-label={`Edit ${prog.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <ProgramStatusButton
            programId={prog.id}
            programName={prog.name}
            isActive={prog.is_active}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Program Belajar"
        description="Kelola seluruh program bimbingan belajar, rasio kelas, atribusi lisensi franchise, dan konten landing page."
        action={
          <Button href="/admin/program/tambah" size="sm">
            <Plus className="w-4 h-4" />
            Tambah Program
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={programs}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Belum ada program belajar yang terdaftar."
      />
    </div>
  );
}
