"use client";

import { useState, useMemo } from "react";
import { formatTimeString } from "@/lib/utils";
import { Search, Users, GraduationCap, GripVertical, Trash2, Loader2, Filter, ChevronDown, X } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ClassTimeModal } from "./class-time-modal";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  useDraggable, 
  useDroppable,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  createScheduleClass, 
  createSchedulePlacement,
  removeScheduleClass,
  removeSchedulePlacement
} from "@/app/admin/draft/board-actions";
import { KanbanBoardProps } from "./kanban-board-props";

interface DndWrapperProps {
  id: string;
  data: unknown;
  children: React.ReactNode;
  className?: string;
}

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

function DraggableItem({ id, data, children, className }: DndWrapperProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: data as Record<string, unknown> });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`${className} ${isDragging ? "opacity-50" : ""}`}>
      {children}
    </div>
  );
}

function DroppableColumn({ id, data, children, className }: DndWrapperProps) {
  const { isOver, setNodeRef } = useDroppable({ id, data: data as Record<string, unknown> });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? "ring-2 ring-primary-400 bg-primary-50/30" : ""}`}>
      {children}
    </div>
  );
}

function DroppableClass({ id, data, children, className, isFull }: DndWrapperProps & { isFull: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id, data: data as Record<string, unknown>, disabled: isFull });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver && !isFull ? "ring-2 ring-blue-400 bg-blue-50" : ""} ${isFull ? "opacity-90" : ""}`}>
      {children}
    </div>
  );
}

export function KanbanBoard({ draft, shifts, teachers, variants, students, initialClasses }: KanbanBoardProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  // Local state for optimistic UI updates
  const [classes, setClasses] = useState<ScheduleClass[]>((initialClasses as ScheduleClass[]) || []);
  const [activeDragItem, setActiveDragItem] = useState<Record<string, unknown> | null>(null);
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as Record<string, unknown>);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as Record<string, unknown> | undefined;
    const overData = over.data.current as Record<string, unknown> | undefined;

    // RULE 1: Dropping a Teacher-Variant onto a Shift Column (Creates Class Container)
    if (activeData?.type === "teacher-variant" && (overData?.type === "shift" || overData?.type === "class")) {
      let targetShiftId = overData.shiftId as string;
      if (overData.type === "class") {
        const targetClass = classes.find(c => c.id === overData.classId);
        if (targetClass) targetShiftId = targetClass.shift_id;
      }
      
      const shift = shifts.find(s => s.id === targetShiftId);
      const variant = variants.find(v => v.id === activeData.variantId);
      
      if (!shift || !variant) return;

      // Smart default start time:
      // Find teacher's classes in this shift today
      const teacherClassesInShift = classes.filter(
        c => c.shift_id === shift.id && c.day_of_week === activeDay && c.teacher_id === activeData.teacherId
      );
      
      let defaultStart = shift.start_time.slice(0, 5); // "09:00"
      if (teacherClassesInShift.length > 0) {
        // Find the latest end_time
        const latestEnd = teacherClassesInShift.reduce((latest, c) => {
          return c.end_time > latest ? c.end_time : latest;
        }, "00:00");
        if (latestEnd) defaultStart = latestEnd.slice(0, 5);
      }

      setTimeModal({
        isOpen: true,
        draft_id: draft.id,
        shift_id: targetShiftId,
        teacher_id: activeData.teacherId as string,
        variant_id: activeData.variantId as string,
        defaultStartTime: defaultStart,
        durationMinutes: variant.duration || 30,
      });
      return;
    }
    if (activeData?.type === "student" && overData?.type === "class") {
      // Check program match
      const studentData = activeData.student as KanbanBoardProps["students"][number];
      const studentProgramVariantIds = studentData.student_programs.map((sp) => sp.variant_id);
      
      if (!studentProgramVariantIds.includes(overData.variantId as string)) {
        showToast("Murid ini tidak terdaftar di varian tersebut!", "error");
        return;
      }

      setIsProcessing(true);
      try {
        const newPlacement = await createSchedulePlacement({
          class_id: overData.classId as string,
          student_id: activeData.studentId as string,
        });

        // Optimistic update
        setClasses(classes.map(c => {
          if (c.id === overData.classId) {
            return { ...c, schedule_placements: [...(c.schedule_placements || []), newPlacement] };
          }
          return c;
        }));
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Gagal memasukkan murid ke kelas", "error");
      }
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
    <DndContext id="kanban-dnd-context" sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
        <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden">
          
          {/* Kanban Columns (Shifts) */}
          <div className="flex-1 flex overflow-x-auto p-4 gap-4">
            {shifts.map((shift) => {
              const classesInThisShift = classes.filter(c => c.shift_id === shift.id && c.day_of_week === activeDay);
              
              return (
                <DroppableColumn 
                  key={shift.id} 
                  id={`shift-${shift.id}`} 
                  data={{ type: "shift", shiftId: shift.id }}
                  className="flex-none w-[85vw] sm:w-[340px] bg-slate-100/50 rounded-xl border flex flex-col"
                >
                  <div className="p-3 border-b bg-white rounded-t-xl shrink-0">
                    <h3 className="font-semibold text-slate-800">{shift.name}</h3>
                    <p className="text-xs text-slate-500">{formatTimeString(shift.start_time)} - {formatTimeString(shift.end_time)}</p>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto space-y-4 min-h-[150px]">
                    {classesInThisShift.length === 0 && (
                      <div className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-400">
                        Tarik Guru + Varian ke sini
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
                        <DroppableClass 
                          key={cls.id} 
                          id={`class-${cls.id}`} 
                          data={{ type: "class", classId: cls.id, variantId: cls.variant_id, variantName: variant?.name }}
                          isFull={isFull}
                          className={`border rounded-lg shadow-sm bg-white overflow-hidden transition-all duration-300 ${isFull ? 'border-red-200' : 'border-slate-200'} ${searchLower && !classMatchesSearch ? 'opacity-30 grayscale' : ''}`}
                        >
                          <div className={`px-3 py-2 border-b flex justify-between items-center ${isFull ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{teacher?.full_name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-medium text-primary-600">{variant?.name}</span>
                                {cls.start_time && cls.end_time && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-medium text-slate-500 bg-white px-1.5 rounded border border-slate-200">
                                      {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-700'}`}>
                                {currentCount} / {capacity}
                              </span>
                              <button type="button" aria-label="Hapus kelas" onClick={() => deleteClass(cls.id)} className="text-slate-400 hover:text-red-500">
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
                              <div className="text-xs text-center text-slate-400 py-2 border border-dashed rounded bg-slate-50/50">
                                Tarik Murid ke sini
                              </div>
                            )}
                          </div>
                        </DroppableClass>
                      );
                    })}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>

          {/* Sidebar (Draggable Items) */}
          <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 max-h-[50vh] md:max-h-none overflow-y-auto">
            <div className="flex border-b shrink-0 bg-slate-50/50">
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
            <div className="p-3 border-b bg-slate-50/60 space-y-2 shrink-0">
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

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                    <DraggableItem 
                      key={combo.id} 
                      id={combo.id} 
                      data={{ type: "teacher-variant", teacherId: combo.teacher.id, variantId: combo.variant.id }}
                      className="p-3 border border-slate-200/90 rounded-xl bg-white shadow-2xs hover:shadow-xs flex items-center gap-3 cursor-grab hover:border-primary-400 transition-all touch-none group"
                    >
                      <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-primary-500 shrink-0 transition-colors" />
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
                    </DraggableItem>
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
                    <DraggableItem 
                      key={s.id} 
                      id={`student-${s.id}`} 
                      data={{ type: "student", studentId: s.id, student: s }}
                      className="p-3 border border-blue-100 rounded-xl bg-blue-50/50 hover:bg-blue-50/80 shadow-2xs flex items-center gap-3 cursor-grab hover:border-blue-400 transition-all touch-none group"
                    >
                      <GripVertical className="w-4 h-4 text-blue-300 group-hover:text-blue-500 shrink-0 transition-colors" />
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
                    </DraggableItem>
                  ))
                )
              )}
            </div>
          </div>
        </div>
        {/* Drag Overlay for visual feedback */}
        <DragOverlay dropAnimation={null}>
          {activeDragItem ? (
            <div className="p-3 border-2 border-primary-500 rounded-lg bg-white shadow-xl opacity-90 flex items-center gap-3 w-64">
              <GripVertical className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-sm font-bold">
                  {activeDragItem.type === "teacher-variant" 
                    ? teachers.find((t) => t.id === activeDragItem.teacherId)?.full_name 
                    : students.find((s) => s.id === activeDragItem.studentId)?.full_name}
                </p>
                <p className="text-xs text-slate-500">Sedang dipindahkan...</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>

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
    </DndContext>
  );
}
