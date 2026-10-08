"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { ScheduleClass } from "./kanban-board";
import { KanbanBoardProps } from "./kanban-board-props";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  activeDay: number;
  shifts: KanbanBoardProps["shifts"];
  teachers: KanbanBoardProps["teachers"];
  variants: KanbanBoardProps["variants"];
  existingClasses: ScheduleClass[];
  onNext: (teacherId: string, variantId: string, defaultStartTime: string, duration: number) => void;
}

export function AddClassModal({
  isOpen,
  onClose,
  shiftId,
  activeDay,
  shifts,
  teachers,
  variants,
  existingClasses,
  onNext
}: AddClassModalProps) {
  const [search, setSearch] = useState("");
  
  const shift = shifts.find(s => s.id === shiftId);

  // Generate teacher-variant combos
  const combos = useMemo(() => {
    const list: Array<{ id: string; teacherId: string; variantId: string; teacherName: string; variantName: string; duration: number }> = [];
    
    teachers.forEach((t) => {
      const teacherProgramIds = t.profile_programs.map(pp => pp.program_id);
      const teacherVariants = variants.filter(v => v.program_id && teacherProgramIds.includes(v.program_id));
      
      teacherVariants.forEach(v => {
        list.push({
          id: `${t.id}-${v.id}`,
          teacherId: t.id,
          variantId: v.id,
          teacherName: t.full_name,
          variantName: v.name,
          duration: v.duration || 30
        });
      });
    });
    return list;
  }, [teachers, variants]);

  const filteredCombos = useMemo(() => {
    const q = search.toLowerCase();
    return combos.filter(c => 
      c.teacherName.toLowerCase().includes(q) || 
      c.variantName.toLowerCase().includes(q)
    );
  }, [combos, search]);

  if (!isOpen || !shift) return null;

  const handleSelect = (combo: typeof combos[0]) => {
    // Determine default start time based on existing classes for this teacher in this shift
    const teacherClasses = existingClasses.filter(
      c => c.shift_id === shift.id && c.day_of_week === activeDay && c.teacher_id === combo.teacherId
    );
    let defaultStart = shift.start_time.slice(0, 5);
    if (teacherClasses.length > 0) {
      const latestEnd = teacherClasses.reduce((latest, c) => c.end_time > latest ? c.end_time : latest, "00:00");
      if (latestEnd) defaultStart = latestEnd.slice(0, 5);
    }
    
    onNext(combo.teacherId, combo.variantId, defaultStart, combo.duration);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tambah Kelas</h2>
            <p className="text-xs text-slate-500">Shift: {shift.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama guru atau varian program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredCombos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Tidak ada guru ditemukan</div>
          ) : (
            <div className="space-y-1">
              {filteredCombos.map(combo => (
                <button
                  key={combo.id}
                  onClick={() => handleSelect(combo)}
                  className="w-full text-left p-3 rounded-lg hover:bg-primary-50 border border-transparent hover:border-primary-100 flex justify-between items-center group transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-primary-700">{combo.teacherName}</div>
                    <div className="text-xs text-slate-500 group-hover:text-primary-600/80">{combo.variantName} • {combo.duration} menit</div>
                  </div>
                  <div className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
