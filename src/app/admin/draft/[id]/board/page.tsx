import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBoardData } from "@/lib/board";
import { KanbanBoard } from "@/components/admin/board/kanban-board";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPage } from "@/lib/auth";
import { formatDateString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Papan Jadwal | Admin Uzma Course",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let data;
  await requireAdminPage();
  try {
    const { id } = await params;
    data = await getBoardData(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)]">
      <PageHeader
        title={`Papan Jadwal: ${data.draft.name}`}
        description={`Cabang: ${data.draft.branch_id.toUpperCase()} | Tgl Berlaku: ${data.draft.effective_date ? formatDateString(data.draft.effective_date) : '-'} | Status: ${data.draft.status}`}
        action={
          <div className="flex flex-wrap items-center gap-2 w-full mt-2 sm:mt-0">
            <Link 
              href={`/print/draft/${data.draft.id}?type=guru`}
              target="_blank"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800 shadow-2xs px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer sm:w-4 sm:h-4"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/></svg>
              Cetak Guru
            </Link>
            <Link 
              href={`/print/draft/${data.draft.id}?type=murid`}
              target="_blank"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 shadow-2xs px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer sm:w-4 sm:h-4"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/></svg>
              Cetak Murid
            </Link>
            <Link 
              href="/admin/draft"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Kembali
            </Link>
          </div>
        }
      />
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          draft={data.draft}
          shifts={data.shifts}
          teachers={data.teachers}
          variants={data.variants}
          students={data.students}
          initialClasses={data.classes}
        />
      </div>
    </div>
  );
}
