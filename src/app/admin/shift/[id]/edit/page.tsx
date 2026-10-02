import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ShiftForm } from "@/components/admin/shift/shift-form";
import { getBranches } from "@/lib/branches";
import { getBranchShiftById } from "@/lib/shifts";

export const metadata: Metadata = {
  title: "Edit Shift | Admin Uzma Course",
};

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [shift, branches] = await Promise.all([
    getBranchShiftById(id),
    getBranches(),
  ]);

  if (!shift) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Shift"
        description="Perbarui informasi slot waktu/sesi"
      />
      <ShiftForm initialData={shift} branches={branches} />
    </div>
  );
}
