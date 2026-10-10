"use client";

import { useState, useRef, useEffect } from "react";
import type { TeacherClassItem } from "@/lib/teacher-schedule";
import { formatTimeString, formatBranchName } from "@/lib/utils";
import { Clock, Users, Calendar, BookOpen, ChevronDown, ChevronUp, MapPin } from "lucide-react";

const DAYS = [
  { id: 1, label: "Senin" },
  { id: 2, label: "Selasa" },
  { id: 3, label: "Rabu" },
  { id: 4, label: "Kamis" },
  { id: 5, label: "Jumat" },
  { id: 6, label: "Sabtu" },
  { id: 7, label: "Minggu" },
];

export function TeacherScheduleClient({
  classes,
}: {
  classes: TeacherClassItem[];
}) {
  const currentJsDay = new Date().getDay();
  const currentAppDay = currentJsDay === 0 ? 7 : currentJsDay;

  const [selectedDay, setSelectedDay] = useState<number>(currentAppDay);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (containerRef.current && activeBtnRef.current) {
      const container = containerRef.current;
      const active = activeBtnRef.current;
      // Scroll the container so the active button is perfectly centered
      const scrollLeft = active.offsetLeft - (container.offsetWidth / 2) + (active.offsetWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }
  }, [selectedDay]);

  const dayClasses = classes.filter((c) => c.day_of_week === selectedDay);

  const classCountByDay = classes.reduce((acc, c) => {
    acc[c.day_of_week] = (acc[c.day_of_week] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center space-x-2 text-primary-100 text-xs font-medium uppercase tracking-wider mb-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Sesi Aktif</span>
        </div>
        <h2 className="text-xl font-bold">Seluruh Cabang Tugas</h2>
        <p className="text-xs text-primary-100 mt-1">
          Total {classes.length} sesi kelas terdaftar minggu ini
        </p>
      </div>

      {/* Horizontal Day Selector Pills */}
      <div 
        ref={containerRef}
        className="flex space-x-3 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
      >
        {/* Spacer Kiri: Memberi ruang agar item pertama bisa ke tengah */}
        <div className="w-[calc(50%-44px)] shrink-0" aria-hidden="true" />
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = classCountByDay[day.id] || 0;
          const isToday = currentAppDay === day.id;

          return (
            <button
              key={day.id}
              ref={isSelected ? activeBtnRef : null}
              type="button"
              onClick={() => setSelectedDay(day.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] py-2.5 px-3 rounded-xl border transition-all text-xs shrink-0 snap-center ${
                isSelected
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-200"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="font-semibold">{day.label}</span>
              <div className="flex items-center gap-1 mt-1">
                {count > 0 ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white text-primary-600" : "bg-primary-50 text-primary-600"
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-primary-200" : "text-slate-400"
                    }`}
                  >
                    Libur
                  </span>
                )}
              </div>
              {isToday && (
                <span
                  className={`text-[9px] mt-0.5 font-bold ${
                    isSelected ? "text-amber-200" : "text-amber-600"
                  }`}
                >
                  Hari Ini
                </span>
              )}
            </button>
          );
        })}
        {/* Spacer Kanan: Memberi ruang agar item terakhir bisa ke tengah */}
        <div className="w-[calc(50%-44px)] shrink-0" aria-hidden="true" />
      </div>

      {/* Class List for Selected Day */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>
            {DAYS.find((d) => d.id === selectedDay)?.label} ({dayClasses.length} Sesi)
          </span>
        </div>

        {dayClasses.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs text-slate-300">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-slate-700">Tidak ada jadwal mengajar</p>
            <p className="text-xs text-slate-400 mt-1">
              Hari ini Anda tidak memiliki alokasi sesi mengajar di cabang manapun.
            </p>
          </div>
        ) : (
          dayClasses.map((cls) => {
            const isExpanded = expandedClassId === cls.id;
            const studentCount = cls.students.length;

            return (
              <div
                key={cls.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-primary-200 transition-colors"
              >
                <div className="p-4">
                  {/* Branch & Shift Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      <MapPin className="w-3 h-3 text-primary-600" />
                      <span>{formatBranchName(cls.branch_name)} • {cls.shift_name}</span>
                    </div>
                    <div className="flex items-center text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      <span>
                        {formatTimeString(cls.start_time)} - {formatTimeString(cls.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Program & Variant */}
                  <div className="flex items-start space-x-2.5 mt-2">
                    <div className="p-2 bg-primary-50 rounded-xl text-primary-600 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">
                        {cls.program_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Paket: <span className="text-slate-700 font-semibold">{cls.variant_name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Students Accordion Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedClassId(isExpanded ? null : cls.id)
                  }
                  className="w-full bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Daftar Murid ({studentCount})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Students Content */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                    {studentCount === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        Belum ada murid yang ditempatkan pada kelas ini.
                      </p>
                    ) : (
                      cls.students.map((st, idx) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {st.full_name}
                            </span>
                          </div>
                          {st.student_number && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {st.student_number}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
