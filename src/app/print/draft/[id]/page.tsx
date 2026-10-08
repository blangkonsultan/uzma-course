import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoardData } from "@/lib/board";
import { requireAdminPage } from "@/lib/auth";
import { formatTimeString, formatDateString } from "@/lib/utils";
import { PrintActionBar } from "@/components/admin/board/print-action-bar";

export const metadata: Metadata = {
  title: "Cetak Jadwal | Admin Uzma Course",
};

export default async function PrintBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  let data;
  let draftId = "";
  let printType = "guru";
  await requireAdminPage();
  try {
    const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
    draftId = resolvedParams.id;
    printType = resolvedSearchParams.type === "murid" ? "murid" : "guru";
    data = await getBoardData(draftId);
  } catch {
    notFound();
  }

  const { draft, shifts, teachers, variants, students, classes } = data;

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Group classes by Teacher
  const teacherSchedules = teachers.map(t => {
    const tClasses = classes.filter(c => c.teacher_id === t.id);
    return {
      teacher: t,
      classes: tClasses.map(c => {
        const shift = shifts.find(s => s.id === c.shift_id);
        const variant = variants.find(v => v.id === c.variant_id);
        const classStudents = (c.schedule_placements || []).map(p => {
          return students.find(s => s.id === p.student_id);
        }).filter(Boolean);

        return {
          ...c,
          shift,
          variant,
          students: classStudents
        };
      }).sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
    };
  }).filter(t => t.classes.length > 0);

  // Group classes by Student
  const studentSchedules = students.map(s => {
    const sClasses = classes.filter(c => 
      c.schedule_placements?.some(p => p.student_id === s.id)
    );
    return {
      student: s,
      classes: sClasses.map(c => {
        const shift = shifts.find(sh => sh.id === c.shift_id);
        const variant = variants.find(v => v.id === c.variant_id);
        const teacher = teachers.find(t => t.id === c.teacher_id);
        
        return {
          ...c,
          shift,
          variant,
          teacher
        };
      }).sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
    };
  }).filter(s => s.classes.length > 0);

  const formattedDate = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(new Date());

  return (
    <div className="bg-white min-h-screen font-sans text-black" id="print-area">
      <PrintActionBar backUrl={`/admin/draft/${draftId}/board`} />
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}} />

      {/* Auto Print Script */}
      <script dangerouslySetInnerHTML={{__html: `
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      `}} />

      <div className="max-w-4xl mx-auto p-8 pt-24 print:pt-8">
        
        {/* HEADER */}
        <div className="text-center border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">
            Jadwal {printType === "guru" ? "Mengajar (Guru)" : "Belajar (Murid)"} Uzma Course
          </h1>
          <h2 className="text-lg font-semibold uppercase text-slate-700">Cabang: {draft.branch_id}</h2>
        </div>

        <div className="flex justify-between items-end mb-8 text-sm">
          <div>
            <p><span className="font-semibold w-24 inline-block">Draft:</span> {draft.name}</p>
            <p><span className="font-semibold w-24 inline-block">Berlaku:</span> {draft.effective_date ? formatDateString(draft.effective_date) : "Belum ditentukan"}</p>
            <p><span className="font-semibold w-24 inline-block">Status:</span> {draft.status.toUpperCase()}</p>
          </div>
          <div className="text-right text-slate-600">
            <p>Dicetak pada: {formattedDate}</p>
          </div>
        </div>

        {/* SECTION 1: TEACHER SCHEDULES */}
        {printType === "guru" && (
          <div className="mb-12">
          <h3 className="text-xl font-bold bg-slate-100 py-2 px-4 border border-black mb-6 uppercase">
            Jadwal Mengajar (Per Guru)
          </h3>

          {teacherSchedules.map((ts) => (
            <div key={ts.teacher.id} className="mb-8 avoid-break">
              <h4 className="font-bold text-lg mb-3 pb-1 border-b border-slate-300">
                👨‍🏫 {ts.teacher.full_name}
              </h4>
              <table className="w-full text-sm border-collapse border border-slate-800">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-800 p-2 text-left w-24">Hari</th>
                    <th className="border border-slate-800 p-2 text-left w-36">Jam (Shift)</th>
                    <th className="border border-slate-800 p-2 text-left w-48">Program</th>
                    <th className="border border-slate-800 p-2 text-left">Daftar Murid</th>
                  </tr>
                </thead>
                <tbody>
                  {ts.classes.map((cls) => (
                    <tr key={cls.id}>
                      <td className="border border-slate-800 p-2 font-medium">
                        {days[cls.day_of_week - 1]}
                      </td>
                      <td className="border border-slate-800 p-2">
                        <div className="font-semibold">{formatTimeString(cls.start_time)} - {formatTimeString(cls.end_time)}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{cls.shift?.name}</div>
                      </td>
                      <td className="border border-slate-800 p-2 font-medium">
                        {cls.variant?.name}
                      </td>
                      <td className="border border-slate-800 p-2">
                        {cls.students.length > 0 ? (
                          <ul className="list-decimal list-inside space-y-0.5">
                            {cls.students.map(s => (
                              <li key={s?.id}>{s?.full_name}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada murid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          </div>
        )}

        {/* SECTION 2: STUDENT SCHEDULES */}
        {printType === "murid" && (
          <div className="mt-8">
          <h3 className="text-xl font-bold bg-slate-100 py-2 px-4 border border-black mb-6 uppercase">
            Jadwal Belajar (Per Murid)
          </h3>

          {studentSchedules.map((ss) => (
            <div key={ss.student.id} className="mb-8 avoid-break">
              <h4 className="font-bold text-lg mb-3 pb-1 border-b border-slate-300">
                🎓 {ss.student.full_name}
              </h4>
              <table className="w-full text-sm border-collapse border border-slate-800">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-800 p-2 text-left w-24">Hari</th>
                    <th className="border border-slate-800 p-2 text-left w-36">Jam (Shift)</th>
                    <th className="border border-slate-800 p-2 text-left w-48">Program</th>
                    <th className="border border-slate-800 p-2 text-left">Guru Pengajar</th>
                  </tr>
                </thead>
                <tbody>
                  {ss.classes.map((cls) => (
                    <tr key={cls.id}>
                      <td className="border border-slate-800 p-2 font-medium">
                        {days[cls.day_of_week - 1]}
                      </td>
                      <td className="border border-slate-800 p-2">
                        <div className="font-semibold">{formatTimeString(cls.start_time)} - {formatTimeString(cls.end_time)}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{cls.shift?.name}</div>
                      </td>
                      <td className="border border-slate-800 p-2 font-medium">
                        {cls.variant?.name}
                      </td>
                      <td className="border border-slate-800 p-2">
                        {cls.teacher?.full_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .avoid-break {
            page-break-inside: avoid;
          }
        `}} />
      </div>
    </div>
  );
}
