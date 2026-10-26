import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { ADMIN_GUIDE, ADMIN_GUIDE_INDEX } from "@/lib/guides/admin";
import { GuideReader } from "@/components/guides/guide-reader";

export const metadata: Metadata = {
  title: "Panduan Admin | Uzma Course",
  robots: { index: false, follow: false },
};

export default async function AdminGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ topik?: string | string[] }>;
}) {
  await requireAdminPage();
  const { topik } = await searchParams;
  return <GuideReader guide={ADMIN_GUIDE} index={ADMIN_GUIDE_INDEX} topic={topik} />;
}
