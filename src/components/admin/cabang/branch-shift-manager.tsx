"use client";

import { useState, useTransition, useRef } from "react";
import { createBranchShift, updateBranchShift, deleteBranchShift } from "@/app/admin/cabang/actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Save, X } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import type { BranchShift } from "@/types";
function FieldWrapper({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

interface BranchShiftManagerProps {
  branchId: string;
  shifts: BranchShift[];
}

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

export function BranchShiftManager({ branchId, shifts }: BranchShiftManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getDayLabel = (dayNumber?: number) => {
    if (dayNumber === undefined || dayNumber === null) return "-";
    return DAYS.find(d => d.value === dayNumber)?.label || dayNumber.toString();
  };

  const handleAddShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("branch_id", branchId);

    startTransition(async () => {
      const result = await createBranchShift(formData);
      if (result && "error" in result && result.error) {
        showToast(result.error, "error");
      } else if (result && "fieldErrors" in result && result.fieldErrors) {
        const errorMsg = Object.values(result.fieldErrors).join(", ");
        showToast(errorMsg, "error");
      } else {
        showToast("Shift berhasil ditambahkan", "success");
        if (formRef.current) formRef.current.reset();
      }
    });
  };

  const handleUpdateShift = (e: React.FormEvent<HTMLFormElement>, shiftId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateBranchShift(shiftId, branchId, formData);
      if (result && "error" in result && result.error) {
        showToast(result.error, "error");
      } else if (result && "fieldErrors" in result && result.fieldErrors) {
        const errorMsg = Object.values(result.fieldErrors).join(", ");
        showToast(errorMsg, "error");
      } else {
        showToast("Shift berhasil diperbarui", "success");
        setEditingId(null);
      }
    });
  };

  const handleDelete = (shiftId: string) => {
    if (!confirm("Hapus shift ini?")) return;
    
    startTransition(async () => {
      const result = await deleteBranchShift(shiftId, branchId);
      if (result && "error" in result) {
        showToast(result.error, "error");
      } else {
        showToast("Shift berhasil dihapus", "success");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Jadwal Shift</h3>
          <p className="text-sm text-slate-500">Kelola jadwal shift untuk cabang ini.</p>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="rounded-md border border-slate-200">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Shift</th>
                  <th className="px-4 py-3">Hari</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    {editingId === shift.id ? (
                      <td colSpan={4} className="p-0">
                        <form
                          onSubmit={(e) => handleUpdateShift(e, shift.id)}
                          className="flex items-start gap-4 p-4 bg-slate-50/50"
                        >
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <FieldWrapper label="Nama Shift">
                                <input
                                  name="name"
                                  defaultValue={shift.name}
                                  required
                                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  placeholder="Contoh: Shift 1"
                                />
                              </FieldWrapper>
                              
                              <FieldWrapper label="Hari">
                                <select
                                  name="day_of_week"
                                  defaultValue={shift.day_of_week}
                                  required
                                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                  {DAYS.map(day => (
                                    <option key={day.value} value={day.value}>{day.label}</option>
                                  ))}
                                </select>
                              </FieldWrapper>

                              <FieldWrapper label="Waktu Mulai">
                                <input
                                  type="time"
                                  name="start_time"
                                  defaultValue={shift.start_time.substring(0, 5)}
                                  required
                                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </FieldWrapper>
                              
                              <FieldWrapper label="Waktu Selesai">
                                <input
                                  type="time"
                                  name="end_time"
                                  defaultValue={shift.end_time.substring(0, 5)}
                                  required
                                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </FieldWrapper>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 pt-6">
                            <Button 
                              type="submit" 
                              disabled={isPending}
                              size="sm"
                              className="w-full"
                            >
                              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditingId(null)}
                              disabled={isPending}
                              size="sm"
                              className="w-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-slate-900">{shift.name}</td>
                        <td className="px-4 py-3">{getDayLabel(shift.day_of_week)}</td>
                        <td className="px-4 py-3">
                          {shift.start_time?.substring(0, 5) || "-"} - {shift.end_time?.substring(0, 5) || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(shift.id)}
                              disabled={isPending}
                              className="h-8 text-xs px-2"
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(shift.id)}
                              disabled={isPending}
                              className="h-8 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm italic bg-slate-50/50">
                      Belum ada shift untuk cabang ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Tambah Shift Baru</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <form ref={formRef} onSubmit={handleAddShift} className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldWrapper label="Nama Shift">
                <input
                  name="name"
                  required
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Contoh: Shift 1"
                />
              </FieldWrapper>
              
              <FieldWrapper label="Hari">
                <select
                  name="day_of_week"
                  required
                  defaultValue={1}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {DAYS.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </FieldWrapper>

              <FieldWrapper label="Waktu Mulai">
                <input
                  type="time"
                  name="start_time"
                  required
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </FieldWrapper>
              
              <FieldWrapper label="Waktu Selesai">
                <input
                  type="time"
                  name="end_time"
                  required
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </FieldWrapper>
            </div>
            
            <div className="pt-6 shrink-0 w-full md:w-auto">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full md:w-auto"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Tambah Shift</>
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
