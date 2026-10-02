import { requireAdminPage } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { BranchForm } from "@/components/admin/cabang/branch-form";
import { getBranchById } from "@/lib/branches";

export const metadata = {
  title: "Edit Cabang | Uzma Course",
};

interface EditBranchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
  const { id } = await params;
  await requireAdminPage();
  const branch = await getBranchById(id);

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Cabang: ${branch.name}`}
        description="Perbarui informasi cabang, unit sentra, alamat, dan link peta Google Maps."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Cabang", href: "/admin/cabang" },
          { label: branch.name, href: `/admin/cabang/${branch.id}` },
          { label: "Edit" },
        ]}
      />

      <BranchForm initialData={branch} isEdit />
    </div>
  );
}
