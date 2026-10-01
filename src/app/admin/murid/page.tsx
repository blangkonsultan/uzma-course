import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { SearchFilterBar, type FilterConfig } from "@/components/admin/search-filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { StudentStatusButton } from "@/components/admin/murid/student-status-button";
import type { Student } from "@/types";
import { Plus, Eye, Edit2, Phone, MapPin, User } from "lucide-react";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Data Murid | Uzma Course",
};

interface MuridPageProps {
  searchParams: Promise<{
    search?: string;
    branch?: string;
    program?: string;
    status?: string;
    page?: string;
  }>;
}

type StudentRow = Student & {
  student_programs?: { program_id: string }[];
};
function getInitials(name: string): string {
  if (!name) return "MD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function MuridPage({ searchParams }: MuridPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current user profile and role
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  const isAdmin = currentProfile?.role === "admin";
  const guruBranch = currentProfile?.branch_id;

  const resolvedParams = await searchParams;
  const search = resolvedParams.search?.trim() || "";
  const program = resolvedParams.program || "all";
  const status = resolvedParams.status || "all";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 10;

  // Branch determination:
  // If guru has a designated branch, lock to that branch.
  // Otherwise, allow URL filter.
  const activeBranch = !isAdmin && guruBranch ? guruBranch : resolvedParams.branch || "all";

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

  // Build query with student_programs relation
  const query = supabase.from("students");

  let selectQuery = program !== "all"
    ? query.select("*, student_programs!inner(program_id)", { count: "exact" })
    : query.select("*, student_programs(program_id)", { count: "exact" });

  if (activeBranch !== "all") {
    selectQuery = selectQuery.eq("branch_id", activeBranch);
  }

  if (status === "active") {
    selectQuery = selectQuery.eq("is_active", true);
  } else if (status === "inactive") {
    selectQuery = selectQuery.eq("is_active", false);
  }

  if (program !== "all") {
    selectQuery = selectQuery.eq("student_programs.program_id", program);
  }

  if (search) {
    selectQuery = selectQuery.or(`full_name.ilike.%${search}%,parent_name.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: studentList, count } = await selectQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Configure filters based on role
  const filterConfigs: FilterConfig[] = [];

  if (isAdmin || !guruBranch) {
    filterConfigs.push({
      id: "branch",
      label: "Cabang",
      options: branches.map((b) => ({ value: b.id, label: b.name })),
    });
  }

  filterConfigs.push(
    {
      id: "program",
      label: "Program",
      options: programs.map((p) => ({
        value: p.id,
        label: `[${p.initials}] ${p.name}`,
      })),
    },
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Non-aktif" },
      ],
    }
  );

  const columns: Column<StudentRow>[] = [
    {
      header: "Nama Murid",
      cell: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
            {student.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/admin/murid/${student.id}`}
              className="font-semibold text-slate-900 hover:text-primary-600 transition-colors leading-tight block"
            >
              {student.full_name}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar: {new Date(student.created_at).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Orang Tua / Wali",
      cell: (student) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>{student.parent_name}</span>
          </p>
          {student.parent_phone && (
            <a
              href={`https://wa.me/${student.parent_phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 font-medium mt-0.5"
            >
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>{student.parent_phone}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Cabang",
      cell: (student) => {
        const branchName = branchMap[student.branch_id] ?? student.branch_id;
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{branchName}</span>
          </div>
        );
      },
    },
    {
      header: "Program",
      cell: (student) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {student.student_programs && student.student_programs.length > 0 ? (
            student.student_programs.map((sp) => {
              const prog = programMap[sp.program_id];
              return (
                <span
                  key={sp.program_id}
                  title={prog?.name ?? sp.program_id}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
                >
                  {prog?.initials ?? sp.program_id}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">-</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (student) => <StatusBadge isActive={student.is_active} />,
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (student) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/murid/${student.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Lihat Detail Murid"
            aria-label={`Detail ${student.full_name}`}
          >
            <Eye className="w-4 h-4" />
          </Link>

          {isAdmin && (
            <>
              <Link
                href={`/admin/murid/${student.id}/edit`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit Data Murid"
                aria-label={`Edit ${student.full_name}`}
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <StudentStatusButton
                studentId={student.id}
                studentName={student.full_name}
                isActive={student.is_active}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Murid"
        description={
          isAdmin
            ? "Kelola semua data murid terdaftar di seluruh cabang bimbingan belajar."
            : `Menampilkan daftar murid aktif dan terdaftar untuk cabang Anda.`
        }
        action={
          isAdmin ? (
            <Button href="/admin/murid/tambah" size="sm">
              <Plus className="w-4 h-4" />
              Tambah Murid
            </Button>
          ) : undefined
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama murid atau orang tua..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={studentList || []}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data murid yang sesuai dengan filter pencarian."
        mobileCard={(student) => {
          const branchName = student.branch_id
            ? branchMap[student.branch_id] ?? student.branch_id
            : "Belum ditentukan";
          const initials = getInitials(student.full_name);
          const cleanPhone = student.parent_phone?.replace(/[^0-9]/g, "");

          return (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              {/* Header: Avatar, Name, Parent Info, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/murid/${student.id}`}
                      className="font-semibold text-slate-900 hover:text-primary-600 transition-colors text-sm leading-tight block truncate"
                    >
                      {student.full_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      Ortu: {student.parent_name || "-"}
                    </p>
                  </div>
                </div>
                <StatusBadge isActive={student.is_active} />
              </div>

              {/* Pills / Badges Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{branchName}</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Daftar: <strong className="text-slate-700 font-medium">{new Date(student.created_at).toLocaleDateString("id-ID")}</strong>
                </span>
              </div>

              {/* Summary Specs Box (Two-column Key-Value summary box) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Program Belajar
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.student_programs && student.student_programs.length > 0 ? (
                      student.student_programs.map((sp) => {
                        const prog = programMap[sp.program_id];
                        return (
                          <span
                            key={sp.program_id}
                            title={prog?.name ?? sp.program_id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80"
                          >
                            {prog?.initials ?? sp.program_id}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic text-xs">-</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Kontak Orang Tua
                  </span>
                  {cleanPhone ? (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline block mt-1 truncate"
                    >
                      {student.parent_phone}
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-800 block mt-1 truncate">
                      {student.parent_name || "-"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/admin/murid/${student.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href={`/admin/murid/${student.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                    <StudentStatusButton
                      studentId={student.id}
                      studentName={student.full_name}
                      isActive={student.is_active}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shadow-2xs shrink-0 ${
                        student.is_active
                          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    />
                  </>
                )}
              </div>
            </div>
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
