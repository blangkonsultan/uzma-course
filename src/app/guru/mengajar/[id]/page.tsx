import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireGuruPage } from "@/lib/auth";
import {
  getTeacherScheduleClassForLog,
  getTeacherTeachingSession,
  getTodayTeachingLogDate,
} from "@/lib/teaching-logs";
import { TeachingLogForm } from "@/components/guru/teaching-log-form";

export const metadata = {
  title: "Kartu Mengajar | Guru Uzma Course",
};

interface TeachingLogPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function TeachingLogPage({
  params,
  searchParams,
}: TeachingLogPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { profile } = await requireGuruPage();
  const classInfo = await getTeacherScheduleClassForLog(profile.id, id);

  if (!classInfo) notFound();

  const sessionDate = query.date || getTodayTeachingLogDate();
  const session = await getTeacherTeachingSession(profile.id, id, sessionDate);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Link
          href="/guru/jadwal"
          aria-label="Kembali ke Jadwal Mengajar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Jadwal Mengajar
          </p>
          <h1 className="truncate text-lg font-bold text-slate-800">Isi Kartu Mengajar</h1>
        </div>
      </div>

      <TeachingLogForm
        key={`${id}-${sessionDate}-${session?.id || "new"}`}
        classInfo={classInfo}
        sessionDate={sessionDate}
        session={session}
      />
    </div>
  );
}
