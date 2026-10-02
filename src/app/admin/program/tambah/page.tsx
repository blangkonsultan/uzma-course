import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ProgramForm } from "@/components/admin/program/program-form";

export const metadata = {
  title: "Tambah Program Belajar | Uzma Course",
};

export default async function TambahProgramPage() {
  await requireAdminPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Program Baru"
        description="Daftarkan program bimbingan belajar baru ke dalam sistem master data."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Master Program", href: "/admin/program" },
          { label: "Tambah Program" },
        ]}
      />

      <ProgramForm />
    </div>
  );
}
