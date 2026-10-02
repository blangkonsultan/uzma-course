import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProgramStatusButton } from "@/components/admin/program/program-status-button";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { getPrograms } from "@/lib/programs";
import type { Program } from "@/types";
import { Plus, Eye, Edit2, Award } from "lucide-react";
import { formatClassRatio, formatDuration, formatFrequencyShort } from "@/lib/utils";

export const metadata = {
  title: "Master Program Belajar | Uzma Course",
};

export default async function ProgramListPage() {
  await requireAdminPage();

  const programs = await getPrograms(true);

  const columns: Column<Program>[] = [
    {
      header: "#",
      className: "w-12 text-center",
      cell: (prog) => (
        <span className="text-xs font-mono font-bold text-slate-500">
          {prog.sort_order}
        </span>
      ),
    },
    {
      header: "Program",
      cell: (prog) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
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
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
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
          <p className="text-slate-500 text-[11px]">{formatDuration(prog.duration)} • {formatFrequencyShort(prog.program_variants?.[0]?.frequency ?? 3)}</p>
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
        mobileCard={(prog) => (
          <MasterMobileCard
            avatar={{ initials: prog.initials, color: "primary" }}
            title={prog.name}
            titleHref={`/admin/program/${prog.id}`}
            subtitle={prog.tagline}
            status={<StatusBadge isActive={prog.is_active} />}
            badges={
              <>
                {prog.type === "franchise" ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <Award className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Franchise ({prog.license_provider || "Berlisensi"})</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    Original Uzma
                  </span>
                )}
                <span className="text-slate-500 text-[11px]">
                  Target: <strong className="text-slate-700 font-medium">{prog.age_range || "-"}</strong>
                </span>
              </>
            }
            specs={{
              left: {
                label: "Rasio Kelas",
                value: formatClassRatio(prog.system),
              },
              right: {
                label: "Jadwal Sesi",
                value: `${formatDuration(prog.duration)} • ${formatFrequencyShort(prog.program_variants?.[0]?.frequency ?? 3)}`,
              },
            }}
            actions={
              <>
                <Link
                  href={`/admin/program/${prog.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </Link>
                <Link
                  href={`/admin/program/${prog.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
                <ProgramStatusButton
                  programId={prog.id}
                  programName={prog.name}
                  isActive={prog.is_active}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shadow-2xs shrink-0 ${
                    prog.is_active
                      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                />
              </>
            }
          />
        )}
      />
    </div>
  );
}
