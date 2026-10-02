import { Metadata } from "next";
import { notFound } from "next/navigation";
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
