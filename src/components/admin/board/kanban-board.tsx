"use client";

import { useState, useMemo } from "react";
import { formatTimeString } from "@/lib/utils";
import { Search, Users, GraduationCap, Trash2, Loader2, Filter, ChevronDown, X, Plus } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ClassTimeModal } from "./class-time-modal";
import { AddClassModal } from "./add-class-modal";
import { AddStudentModal } from "./add-student-modal";
import { 
  createScheduleClass, 
  createSchedulePlacement,
  removeScheduleClass,
  removeSchedulePlacement
} from "@/app/admin/draft/board-actions";
import { KanbanBoardProps } from "./kanban-board-props";


export interface ScheduleClass {
  id: string;
  shift_id: string;
  day_of_week: number;
  teacher_id: string;
  variant_id: string;
  start_time: string;
  end_time: string;
  schedule_placements: Array<{ id: string; student_id: string }>;
}


export function KanbanBoard({ draft, shifts, teachers, variants, students, initialClasses }: KanbanBoardProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  // Local state for optimistic UI updates
  const [classes, setClasses] = useState<ScheduleClass[]>((initialClasses as ScheduleClass[]) || []);
  const [classModal, setClassModal] = useState<{
    isOpen: boolean;
    shiftId: string;
  }>({ isOpen: false, shiftId: "" });
  const [studentModal, setStudentModal] = useState<{
    isOpen: boolean;
    classId: string;
    variantId: string;
  }>({ isOpen: false, classId: "", variantId: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeModal, setTimeModal] = useState<{
    isOpen: boolean;
    draft_id: string;
    shift_id: string;
    teacher_id: string;
    variant_id: string;
    defaultStartTime: string;
    durationMinutes: number;
  }>({
    isOpen: false,
    draft_id: "",
    shift_id: "",
    teacher_id: "",
    variant_id: "",
    defaultStartTime: "09:00",
    durationMinutes: 30,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  // Extract unique active programs list from variants
  const availablePrograms = useMemo(() => {
    const map = new Map<string, { id: string; name: string; initials?: string }>();
    variants.forEach((v) => {
      if (v.program_id) {
        if (!map.has(v.program_id)) {
          const progName = v.programs?.name || v.name || v.program_id;
          map.set(v.program_id, {
            id: v.program_id,
            name: progName,
            initials: v.programs?.initials,
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [variants]);

  // Generate Teacher-Variant combinations for the sidebar
  const teacherCombos = useMemo(() => {
    const combos: Array<{ id: string; teacher: KanbanBoardProps["teachers"][number]; variant: KanbanBoardProps["variants"][number]; label: string }> = [];
    
    const totalShiftMinutes = shifts.reduce((total, shift) => {
      const [sh, sm] = shift.start_time.split(":").map(Number);
      const [eh, em] = shift.end_time.split(":").map(Number);
      return total + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);

    teachers.forEach((t) => {
      const totalScheduledMinutes = classes
        .filter(c => c.day_of_week === activeDay && c.teacher_id === t.id)
        .reduce((total, c) => {
          if (!c.start_time || !c.end_time) return total;
          const [sh, sm] = c.start_time.split(":").map(Number);
          const [eh, em] = c.end_time.split(":").map(Number);
          return total + ((eh * 60 + em) - (sh * 60 + sm));
        }, 0);

      const teacherProgramIds = t.profile_programs.map((pp) => pp.program_id);
      const teacherVariants = variants.filter((v) => v.program_id && teacherProgramIds.includes(v.program_id));
      
      teacherVariants.forEach((v) => {
        if (totalScheduledMinutes + (v.duration || 30) <= totalShiftMinutes) {
          combos.push({
            id: `tv-${t.id}-${v.id}`,
            teacher: t,
            variant: v,
            label: `${t.full_name} (${v.name})`
          });
        }
      });
    });
    return combos;
  }, [teachers, variants, classes, activeDay, shifts]);

  const filteredCombos = useMemo(() => {
    return teacherCombos.filter((c) => {
      if (selectedProgram !== "all" && c.variant.program_id !== selectedProgram) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTeacher = c.teacher.full_name.toLowerCase().includes(q);
        const matchVariant = c.variant.name.toLowerCase().includes(q);
        const matchProgram = (c.variant.programs?.name || "").toLowerCase().includes(q);
        return matchTeacher || matchVariant || matchProgram;
      }
      return true;
    });
  }, [teacherCombos, selectedProgram, search]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedProgram !== "all") {
        const hasProgram = s.student_programs.some(
          (sp) => sp.program_id === selectedProgram
        );
        if (!hasProgram) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.full_name.toLowerCase().includes(q);
        const matchVariant = s.student_programs.some((sp) => {
          const variant = variants.find((v) => v.id === sp.variant_id);
          return (
            variant?.name.toLowerCase().includes(q) ||
            (variant?.programs?.name || "").toLowerCase().includes(q)
          );
        });
        return matchName || matchVariant;
      }
      return true;
    });
  }, [students, selectedProgram, search, variants]);

  const unplacedFilteredStudents = useMemo(() => {
    return filteredStudents.filter((s) => {
      const isPlacedToday = classes.some(
        (c) =>
          c.day_of_week === activeDay &&
          c.schedule_placements?.some((p) => p.student_id === s.id)
      );
      return !isPlacedToday;
    });
  }, [filteredStudents, classes, activeDay]);
  const handleAddStudent = async (studentId: string) => {
    const { classId, variantId } = studentModal;
    if (!classId) return;
    
    // Find student to double check variant match
    const studentData = students.find(s => s.id === studentId);
    if (!studentData) return;
    
    const studentProgramVariantIds = studentData.student_programs.map(sp => sp.variant_id);
    if (!studentProgramVariantIds.includes(variantId)) {
      showToast("Murid ini tidak terdaftar di varian tersebut!", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const newPlacement = await createSchedulePlacement({
        class_id: classId,
        student_id: studentId,
      });

      // Optimistic update
      setClasses(classes.map(c => {
        if (c.id === classId) {
          return { ...c, schedule_placements: [...(c.schedule_placements || []), newPlacement] };
        }
        return c;
      }));
      showToast("Murid berhasil ditambahkan", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memasukkan murid ke kelas", "error");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveTimeModal = async (startTime: string, endTime: string) => {
    try {
      const newClass = await createScheduleClass({
        draft_id: timeModal.draft_id,
        shift_id: timeModal.shift_id,
        day_of_week: activeDay,
        teacher_id: timeModal.teacher_id,
        variant_id: timeModal.variant_id,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
      }) as unknown as ScheduleClass;
      
      setClasses([...classes, { ...newClass, schedule_placements: [] }]);
      showToast("Wadah kelas berhasil dibuat", "success");
    } catch (err) {
      throw err;
    }
  };
  const deleteClass = (classId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Wadah Kelas",
      description: "Apakah Anda yakin ingin menghapus wadah kelas ini? Semua murid di dalamnya akan dikeluarkan dari kelas.",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await removeScheduleClass(classId);
          setClasses(classes.filter(c => c.id !== classId));
          showToast("Wadah kelas berhasil dihapus", "success");
        } catch {
          showToast("Gagal menghapus", "error");
        }
        setIsProcessing(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deletePlacement = (classId: string, placementId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Keluarkan Murid",
      description: "Apakah Anda yakin ingin mengeluarkan murid ini dari kelas?",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await removeSchedulePlacement(placementId);
          setClasses(classes.map(c => {
            if (c.id === classId) {
              return { ...c, schedule_placements: c.schedule_placements.filter((p) => p.id !== placementId) };
            }
            return c;
          }));
          showToast("Murid berhasil dikeluarkan", "success");
        } catch {
          showToast("Gagal menghapus murid dari kelas", "error");
        }
        setIsProcessing(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };
  return (
    <>
      <AddClassModal
        isOpen={classModal.isOpen}
        onClose={() => setClassModal({ isOpen: false, shiftId: "" })}
        shiftId={classModal.shiftId}
        activeDay={activeDay}
        shifts={shifts}
        teachers={teachers}
        variants={variants}
        existingClasses={classes}
        onNext={(teacherId, variantId, defaultStartTime, duration) => {
          setClassModal({ isOpen: false, shiftId: "" });
          setTimeModal({
            isOpen: true,
            draft_id: draft.id,
            shift_id: classModal.shiftId,
            teacher_id: teacherId,
            variant_id: variantId,
            defaultStartTime,
            durationMinutes: duration,
          });
        }}
      />
      <AddStudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, classId: "", variantId: "" })}
        classId={studentModal.classId}
        variantId={studentModal.variantId}
        activeDay={activeDay}
        students={students}
        existingClasses={classes}
        onSave={handleAddStudent}
      />
      <ClassTimeModal
        key={timeModal.isOpen ? timeModal.shift_id + timeModal.teacher_id : "closed"}
        isOpen={timeModal.isOpen}
        onClose={() => setTimeModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveTimeModal}
        defaultStartTime={timeModal.defaultStartTime}
        durationMinutes={timeModal.durationMinutes}
      />
      <div className="flex flex-col h-full bg-slate-50 border rounded-lg overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Day Selector Header */}
        <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {[1,2,3,4,5,6,7].map((dayId) => {
             const dayName = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][dayId-1];
             return (
              <button
                key={dayId}
                type="button"
                onClick={() => setActiveDay(dayId)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeDay === dayId ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dayName}
              </button>
             )
          })}
        </div>

        {/* Main Board Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
          
          {/* Kanban Columns (Shifts) */}
          <div className="flex-none md:flex-1 flex overflow-x-auto p-4 gap-4 min-h-[450px] md:min-h-0">
            {shifts.map((shift) => {
              const classesInThisShift = classes.filter(c => c.shift_id === shift.id && c.day_of_week === activeDay);
              
              return (
                <div 
                  key={shift.id} 
                  className="flex-none w-[85vw] sm:w-[340px] bg-slate-100/50 rounded-xl border flex flex-col"
                >
                  <div className="p-3 border-b bg-white rounded-t-xl shrink-0 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{shift.name}</h3>
                      <p className="text-xs text-slate-500">{formatTimeString(shift.start_time)} - {formatTimeString(shift.end_time)}</p>
                    </div>
                    <button 
                      onClick={() => setClassModal({ isOpen: true, shiftId: shift.id })}
                      className="flex items-center justify-center p-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                      title="Tambah Kelas"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto space-y-4 min-h-[150px]">
                    {classesInThisShift.length === 0 && (
                      <div className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-400">
                        Belum ada kelas
                      </div>
                    )}
                    
                    {classesInThisShift.map((cls) => {
                      const teacher = teachers.find((t) => t.id === cls.teacher_id);
                      const variant = variants.find((v) => v.id === cls.variant_id);
                      const capacity = variant?.system || 1;
                      const currentCount = cls.schedule_placements?.length || 0;
                      const isFull = currentCount >= capacity;

                      const searchLower = search.trim().toLowerCase();
                      const teacherMatch = teacher?.full_name.toLowerCase().includes(searchLower) || false;
                      const variantMatch = variant?.name.toLowerCase().includes(searchLower) || false;
                      
                      let classMatchesSearch = searchLower ? (teacherMatch || variantMatch) : true;
                      
                      const placementsWithData = (cls.schedule_placements || []).map(placement => {
                        const student = students.find((s) => s.id === placement.student_id);
                        const studentMatch = searchLower ? (student?.full_name.toLowerCase().includes(searchLower) || false) : true;
                        if (studentMatch && searchLower) classMatchesSearch = true;
                        return { placement, student, studentMatch };
                      });

                      return (
                        <div 
                          key={cls.id} 
                          className={`border rounded-lg shadow-sm bg-white overflow-hidden transition-all duration-300 ${isFull ? 'border-red-200' : 'border-slate-200'} ${searchLower && !classMatchesSearch ? 'opacity-30 grayscale' : ''}`}
                        >
                            <div className={`px-3 py-2 border-b flex flex-wrap gap-2 justify-between items-start ${isFull ? 'bg-red-50' : 'bg-slate-50'}`}>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800 break-words leading-tight">{teacher?.full_name}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="text-xs font-medium text-primary-600">{variant?.name}</span>
                                  {cls.start_time && cls.end_time && (
                                    <>
                                      <span className="text-slate-300 hidden sm:inline">•</span>
                                      <span className="text-[11px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                        {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                <span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${isFull ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-700'}`}>
                                  {currentCount} / {capacity}
                                </span>
                                <button type="button" aria-label="Hapus kelas" onClick={() => deleteClass(cls.id)} className="text-slate-400 hover:text-red-500 p-1 -mr-1">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          
                          <div className="p-2 min-h-[60px] space-y-1">
                            {placementsWithData.map(({ placement, student, studentMatch }) => {
                              return (
                                <div key={placement.id} className={`text-sm bg-blue-50 border border-blue-100 rounded px-2 py-1.5 flex justify-between items-center group transition-all duration-300 ${searchLower && !studentMatch ? 'opacity-40' : ''}`}>
                                  <span className={searchLower && studentMatch && !teacherMatch && !variantMatch ? "font-bold text-blue-700" : ""}>{student?.full_name || "Murid ?"}</span>
                                  <button type="button" aria-label="Keluarkan murid" onClick={() => deletePlacement(cls.id, placement.id)} className="text-blue-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                            {!isFull && (
                              <button
                                type="button"
                                onClick={() => setStudentModal({ isOpen: true, classId: cls.id, variantId: cls.variant_id })}
                                className="w-full text-xs text-center text-primary-600 hover:text-primary-700 py-2 border border-dashed border-primary-200 hover:border-primary-300 hover:bg-primary-50 rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Tambah Murid
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar (Draggable Items) */}
          <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l bg-white flex flex-col shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] md:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 flex-none h-auto md:max-h-none overflow-visible md:overflow-hidden">
            <div className="sticky top-0 z-20 md:static bg-white shrink-0 shadow-sm md:shadow-none">
              <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab("teachers")}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "teachers"
                    ? "text-primary-700 border-b-2 border-primary-600 bg-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Wadah Guru</span>
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {filteredCombos.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "students"
                    ? "text-primary-700 border-b-2 border-primary-600 bg-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Murid</span>
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {unplacedFilteredStudents.length}
                </span>
              </button>
            </div>
            
              {/* Search & Program Filter Controls */}
              <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={activeTab === "teachers" ? "Cari nama guru atau varian" : "Cari nama murid"}
                  className="w-full pl-8 pr-8 py-2 text-base sm:text-xs border border-slate-200 rounded-xl bg-white shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                    aria-label="Hapus teks pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {availablePrograms.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    aria-label="Filter berdasarkan program belajar"
                    className="w-full appearance-none pl-8 pr-8 py-2 text-base sm:text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
                  >
                    <option value="all">Semua Program Belajar ({availablePrograms.length})</option>
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        Program: {prog.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>
            </div>
            <div className="flex-1 overflow-y-visible md:overflow-y-auto p-3 space-y-2">
              {activeTab === "teachers" ? (
                filteredCombos.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Tidak ada guru ditemukan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedProgram !== "all" || search
                        ? "Coba ubah kata kunci atau ganti filter program"
                        : "Belum ada guru yang terdaftar di cabang ini"}
                    </p>
                    {(selectedProgram !== "all" || search) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSelectedProgram("all");
                        }}
                        className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Reset Filter & Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  filteredCombos.map((combo) => (
                    <div 
                      key={combo.id} 
                      className="p-3 border border-slate-200/90 rounded-xl bg-white shadow-2xs flex items-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-sm font-bold text-slate-800 truncate">{combo.teacher.full_name}</p>
                          {combo.variant.programs?.name && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded border border-primary-200/60 shrink-0">
                              {combo.variant.programs.initials || combo.variant.programs.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
                          <span>{combo.variant.name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 text-[11px]">{combo.variant.duration} mnt</span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                unplacedFilteredStudents.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Tidak ada murid ditemukan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedProgram !== "all" || search
                        ? "Coba ubah kata kunci atau ganti filter program"
                        : "Semua murid sudah ditempatkan hari ini atau belum ada murid"}
                    </p>
                    {(selectedProgram !== "all" || search) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSelectedProgram("all");
                        }}
                        className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Reset Filter & Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  unplacedFilteredStudents.map((s) => (
                    <div 
                      key={s.id} 
                      className="p-3 border border-blue-100 rounded-xl bg-blue-50/50 shadow-2xs flex items-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{s.full_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.student_programs.map((sp, idx) => {
                            const variant = variants.find((v) => v.id === sp.variant_id);
                            const isMatchedProgram = selectedProgram !== "all" && sp.program_id === selectedProgram;
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                                  isMatchedProgram
                                    ? "bg-primary-100 text-primary-800 font-bold border border-primary-200"
                                    : "bg-white text-slate-600 border border-slate-200/80"
                                }`}
                              >
                                {variant?.name || "Program"}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          description={confirmDialog.description}
          isLoading={isProcessing}
          onConfirm={() => {
            confirmDialog.onConfirm();
          }}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    </>
  );
}
