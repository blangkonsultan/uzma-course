import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBoardData } from "@/lib/board";
import { KanbanBoard } from "@/components/admin/board/kanban-board";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Papan Jadwal | Admin Uzma Course",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let data;
  try {
    const { id } = await params;
    data = await getBoardData(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      <PageHeader
        title={`Papan Jadwal: ${data.draft.name}`}
        description={`Cabang: ${data.draft.branch_id.toUpperCase()} | Status: ${data.draft.status}`}
        action={
          <Link 
            href="/admin/draft"
            className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs px-4 py-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
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
