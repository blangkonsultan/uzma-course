import { requireAdminPage } from "@/lib/auth";
import { getStudentByIdForEdit } from "@/lib/students";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/murid/student-form";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Edit Data Murid | Uzma Course",
};

interface EditStudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStudentPage({
  params,
}: EditStudentPageProps) {
  const { id } = await params;
  await requireAdminPage();

  const [student, programs, branches] = await Promise.all([
    getStudentByIdForEdit(id),
    getPrograms(true),
    getBranches(true),
  ]);

  if (!student) {
    notFound();
  }

  const initialStudentPrograms = student.student_programs ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Data: ${student.full_name}`}
        description="Perbarui data pribadi, kontak orang tua, cabang, dan program bimbingan murid."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Murid", href: "/admin/murid" },
          { label: student.full_name, href: `/admin/murid/${student.id}` },
          { label: "Edit" },
        ]}
      />

      <StudentForm
        initialData={student}
        initialStudentPrograms={initialStudentPrograms}
        programs={programs}
        branches={branches}
        isEdit
      />
    </div>
  );
}
