import { requireAdminPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProgramForm } from "@/components/admin/program/program-form";
import { getProgramById } from "@/lib/programs";

export const metadata = {
  title: "Edit Program Belajar | Uzma Course",
};

interface EditProgramPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const { id } = await params;
  await requireAdminPage();

  const program = await getProgramById(id);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Program: ${program.name}`}
        description="Perbarui informasi kurikulum, rasio kelas, atribusi lisensi, dan visual program."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Master Program", href: "/admin/program" },
          { label: program.name, href: `/admin/program/${program.id}` },
          { label: "Edit" },
        ]}
      />

      <ProgramForm initialData={program} isEdit />
    </div>
  );
}
