"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ClassTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startTime: string, endTime: string) => Promise<void>;
  defaultStartTime: string;
  durationMinutes: number;
}

export function ClassTimeModal({ isOpen, onClose, onSave, defaultStartTime, durationMinutes }: ClassTimeModalProps) {
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (!isOpen) return null;

  // Calculate end time string
  const calculateEndTime = (start: string, minutes: number) => {
    if (!start) return "";
    const [h, m] = start.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "";
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
  };

  const endTime = calculateEndTime(startTime, durationMinutes);

  const handleSave = async () => {
    if (!startTime) {
      setError("Jam mulai harus diisi");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(startTime, endTime);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Atur Waktu Kelas</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Tentukan jam mulai untuk sesi kelas ini. Jam selesai akan dihitung otomatis berdasarkan durasi program ({durationMinutes} menit).
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jam Selesai (Otomatis)
              </label>
              <input
                type="time"
                value={endTime}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 cursor-not-allowed text-base sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm">
              {error}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-600/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : "Simpan Sesi"}
          </button>
        </div>
      </div>
    </div>
  );
}
