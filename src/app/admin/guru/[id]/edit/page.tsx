import { requireAdminPage } from "@/lib/auth";
import { getGuruById } from "@/lib/gurus";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { GuruForm } from "@/components/admin/guru/guru-form";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Edit Data Guru | Uzma Course",
};

interface EditGuruPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGuruPage({ params }: EditGuruPageProps) {
  const { id } = await params;
  await requireAdminPage();

  const [guru, programs, branches] = await Promise.all([
    getGuruById(id),
    getPrograms(true),
    getBranches(true),
  ]);

  if (!guru) {
    notFound();
  }

  const initialProgramIds =
    guru.profile_programs?.map((pp) => pp.program_id) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Data: ${guru.full_name}`}
        description="Perbarui informasi pengajar, kontak, cabang, dan status aktif akun."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Guru", href: "/admin/guru" },
          { label: `Edit ${guru.full_name}` },
        ]}
      />

      <GuruForm
        initialData={guru}
        initialProgramIds={initialProgramIds}
        programs={programs}
        branches={branches}
        isEdit
      />
    </div>
  );
}
