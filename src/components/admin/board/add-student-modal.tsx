"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { KanbanBoardProps } from "./kanban-board-props";
import { ScheduleClass } from "./kanban-board";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  variantId: string;
  activeDay: number;
  students: KanbanBoardProps["students"];
  existingClasses: ScheduleClass[];
  onSave: (studentId: string) => Promise<void>;
}

export function AddStudentModal({
  isOpen,
  onClose,
  variantId,
  activeDay,
  students,
  existingClasses,
  onSave
}: AddStudentModalProps) {
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get eligible students for this variant who aren't placed elsewhere today
  const eligibleStudents = useMemo(() => {
    return students.filter(s => {
      // 1. Must be enrolled in this variant
      const enrolledVariantIds = s.student_programs.map(sp => sp.variant_id);
      if (!enrolledVariantIds.includes(variantId)) return false;

      // 2. Must not be placed today
      const isPlacedToday = existingClasses.some(
        c => c.day_of_week === activeDay && c.schedule_placements?.some(p => p.student_id === s.id)
      );
      
      return !isPlacedToday;
    });
  }, [students, variantId, activeDay, existingClasses]);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return eligibleStudents.filter(s => s.full_name.toLowerCase().includes(q));
  }, [eligibleStudents, search]);

  if (!isOpen) return null;

  const handleSelect = async (studentId: string) => {
    setIsSaving(true);
    try {
      await onSave(studentId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tambah Murid</h2>
            <p className="text-xs text-slate-500">Pilih murid untuk dimasukkan ke kelas</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama murid..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              {eligibleStudents.length === 0 
                ? "Tidak ada murid yang terdaftar di varian ini atau semua sudah mendapat jadwal hari ini."
                : "Murid tidak ditemukan."}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelect(student.id)}
                  disabled={isSaving}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 flex justify-between items-center group transition-colors disabled:opacity-50"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-blue-700">{student.full_name}</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
