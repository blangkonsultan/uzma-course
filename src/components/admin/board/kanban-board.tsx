"use client";

import { useState, useMemo } from "react";
import { formatTimeString } from "@/lib/utils";
import { Search, Users, GraduationCap, GripVertical, Trash2, Loader2 } from "lucide-react";
import { showToast } from "@/components/admin/toast";
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
  
  // Local state for optimistic UI updates
  const [classes, setClasses] = useState<ScheduleClass[]>((initialClasses as ScheduleClass[]) || []);
  const [activeDragItem, setActiveDragItem] = useState<Record<string, unknown> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate Teacher-Variant combinations for the sidebar
  const teacherCombos = useMemo(() => {
    const combos: Array<{ id: string; teacher: KanbanBoardProps["teachers"][number]; variant: KanbanBoardProps["variants"][number]; label: string }> = [];
    teachers.forEach((t) => {
      // Find variants for programs the teacher is assigned to
      const teacherProgramIds = t.profile_programs.map((pp) => pp.program_id);
      const teacherVariants = variants.filter((v) => v.program_id && teacherProgramIds.includes(v.program_id));
      
      teacherVariants.forEach((v) => {
        combos.push({
          id: `tv-${t.id}-${v.id}`,
          teacher: t,
          variant: v,
          label: `${t.full_name} (${v.name})`
        });
      });
    });
    return combos;
  }, [teachers, variants]);

  const filteredCombos = teacherCombos.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  // DndKit Sensors
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
    if (activeData?.type === "teacher-variant" && overData?.type === "shift") {
      setIsProcessing(true);
      try {
        const newClass = await createScheduleClass({
          draft_id: draft.id,
          shift_id: overData.shiftId as string,
          day_of_week: activeDay,
          teacher_id: activeData.teacherId as string,
          variant_id: activeData.variantId as string,
        }) as unknown as ScheduleClass;
        
        // Optimistic update
        setClasses([...classes, { ...newClass, schedule_placements: [] }]);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Gagal membuat wadah kelas", "error");
      }
      setIsProcessing(false);
    }

    // RULE 2: Dropping a Student onto a Class Container (Creates Placement)
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

  const deleteClass = async (classId: string) => {
    if (!confirm("Hapus wadah kelas ini?")) return;
    setIsProcessing(true);
    try {
      await removeScheduleClass(classId);
      setClasses(classes.filter(c => c.id !== classId));
    } catch {
      showToast("Gagal menghapus", "error");
    }
    setIsProcessing(false);
  };

  const deletePlacement = async (classId: string, placementId: string) => {
    setIsProcessing(true);
    try {
      await removeSchedulePlacement(placementId);
      setClasses(classes.map(c => {
        if (c.id === classId) {
          return { ...c, schedule_placements: c.schedule_placements.filter((p) => p.id !== placementId) };
        }
        return c;
      }));
    } catch {
      showToast("Gagal menghapus murid dari kelas", "error");
    }
    setIsProcessing(false);
  };

  return (
    <DndContext id="kanban-dnd-context" sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

                      return (
                        <DroppableClass 
                          key={cls.id} 
                          id={`class-${cls.id}`} 
                          data={{ type: "class", classId: cls.id, variantId: cls.variant_id, variantName: variant?.name }}
                          isFull={isFull}
                          className={`border rounded-lg shadow-sm bg-white overflow-hidden transition-colors ${isFull ? 'border-red-200' : 'border-slate-200'}`}
                        >
                          <div className={`px-3 py-2 border-b flex justify-between items-center ${isFull ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{teacher?.full_name}</p>
                              <p className="text-xs font-medium text-primary-600">{variant?.name}</p>
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
                            {cls.schedule_placements?.map((placement) => {
                              const student = students.find((s) => s.id === placement.student_id);
                              return (
                                <div key={placement.id} className="text-sm bg-blue-50 border border-blue-100 rounded px-2 py-1.5 flex justify-between items-center group">
                                  <span>{student?.full_name || "Murid ?"}</span>
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
            <div className="flex border-b shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("teachers")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === "teachers" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Users className="w-4 h-4" /> Wadah Guru
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === "students" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Murid
              </button>
            </div>
            
            <div className="p-3 border-b relative shrink-0">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari guru atau murid"
                className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border rounded-lg bg-slate-50"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTab === "teachers" ? (
                filteredCombos.map((combo) => (
                  <DraggableItem 
                    key={combo.id} 
                    id={combo.id} 
                    data={{ type: "teacher-variant", teacherId: combo.teacher.id, variantId: combo.variant.id }}
                    className="p-3 border rounded-lg bg-white shadow-sm flex items-center gap-3 cursor-grab hover:border-primary-400 touch-none"
                  >
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{combo.teacher.full_name}</p>
                      <p className="text-xs font-medium text-primary-600">{combo.variant.name}</p>
                    </div>
                  </DraggableItem>
                ))
              ) : (
                filteredStudents.map((s) => {
                  const isPlacedToday = classes.some((c) => c.day_of_week === activeDay && c.schedule_placements?.some((p) => p.student_id === s.id));
                  if (isPlacedToday) return null;

                  return (
                    <DraggableItem 
                      key={s.id} 
                      id={`student-${s.id}`} 
                      data={{ type: "student", studentId: s.id, student: s }}
                      className="p-3 border border-blue-100 rounded-lg bg-blue-50/50 flex items-center gap-3 cursor-grab hover:border-blue-400 touch-none"
                    >
                      <GripVertical className="w-4 h-4 text-blue-300 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {s.student_programs.map((sp) => variants.find((v)=>v.id===sp.variant_id)?.name).join(", ")}
                        </p>
                      </div>
                    </DraggableItem>
                  )
                })
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

      </div>
    </DndContext>
  );
}
