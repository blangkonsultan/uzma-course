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
import { PROGRAMS, BRANCHES, getProgramInitials, getProgramName } from "@/lib/constants";

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

  // Build query
  let query = supabase
    .from("students")
    .select("*", { count: "exact" });

  if (activeBranch === "balongbendo" || activeBranch === "krian") {
    query = query.eq("branch_id", activeBranch);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (program !== "all") {
    query = query.contains("programs", [program]);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,parent_name.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: studentList, count } = await query
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
      options: BRANCHES.map((b) => ({ value: b.id, label: b.name })),
    });
  }

  filterConfigs.push(
    {
      id: "program",
      label: "Program",
      options: PROGRAMS.map((p) => ({
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

  const columns: Column<Student>[] = [
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
        const branchObj = BRANCHES.find((b) => b.id === student.branch_id);
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{branchObj ? branchObj.name : student.branch_id}</span>
          </div>
        );
      },
    },
    {
      header: "Program",
      cell: (student) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {student.programs && student.programs.length > 0 ? (
            student.programs.map((progId) => (
              <span
                key={progId}
                title={getProgramName(progId)}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
              >
                {getProgramInitials(progId)}
              </span>
            ))
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
            ? "Kelola data seluruh murid bimbingan belajar, kontak wali, cabang, dan status aktif."
            : `Daftar murid aktif dan kontak bimbingan untuk Cabang ${guruBranch ? (BRANCHES.find(b => b.id === guruBranch)?.name || guruBranch) : "Semua"}.`
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Murid" },
        ]}
        action={
          isAdmin ? (
            <Button href="/admin/murid/tambah" size="sm">
              <Plus className="w-4 h-4" />
              <span>Tambah Murid</span>
            </Button>
          ) : undefined
        }
      />

      <SearchFilterBar
        searchPlaceholder="Cari nama murid atau nama orang tua..."
        filters={filterConfigs}
      />

      <DataTable
        columns={columns}
        data={studentList ?? []}
        keyExtractor={(item) => item.id}
        emptyStateMessage="Tidak ada data murid yang cocok"
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
