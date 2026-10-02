import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DraftForm } from "@/components/admin/draft/draft-form";
import { getBranches } from "@/lib/branches";
import { getScheduleDraftById } from "@/lib/drafts";

export const metadata: Metadata = {
  title: "Edit Draf Jadwal | Admin Uzma Course",
};

export default async function EditDraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [draft, branches] = await Promise.all([
    getScheduleDraftById(id),
    getBranches(),
  ]);

  if (!draft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Draf Jadwal"
        description="Perbarui informasi dan versi draf penjadwalan"
      />
      <DraftForm initialData={draft} branches={branches} />
    </div>
  );
}
