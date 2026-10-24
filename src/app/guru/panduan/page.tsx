import type { Metadata } from "next";
import { requireGuruPage } from "@/lib/auth";
import { GURU_GUIDE, GURU_GUIDE_INDEX } from "@/lib/guides/guru";
import { GuideReader } from "@/components/guides/guide-reader";

export const metadata: Metadata = {
  title: "Panduan Guru | Uzma Course",
  robots: { index: false, follow: false },
};

export default async function GuruGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ topik?: string | string[] }>;
}) {
  await requireGuruPage();
  const { topik } = await searchParams;
  return (
    <div className="p-4 pb-8">
      <GuideReader guide={GURU_GUIDE} index={GURU_GUIDE_INDEX} topic={topik} />
    </div>
  );
}
