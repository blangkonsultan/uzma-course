import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { GuruForm } from "@/components/admin/guru/guru-form";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Tambah Guru Baru | Uzma Course",
};

export default async function TambahGuruPage() {
  await requireAdminPage();

  const [programs, branches] = await Promise.all([
    getPrograms(),
    getBranches(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Guru Baru"
        description="Daftarkan akun pengajar baru, tetapkan cabang dan program bimbingan."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Guru", href: "/admin/guru" },
          { label: "Tambah Guru" },
        ]}
      />

      <GuruForm programs={programs} branches={branches} />
    </div>
  );
}
