"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createStudent, updateStudent } from "@/app/admin/murid/actions";
import {
  InputField,
  TextareaField,
  SelectField,
  CheckboxGroupField,
} from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { PROGRAMS, BRANCHES } from "@/lib/constants";
import type { Student } from "@/types";

interface StudentFormProps {
  initialData?: Student;
  isEdit?: boolean;
}

export function StudentForm({ initialData, isEdit = false }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const branchOptions = BRANCHES.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.subName})`,
  }));

  const programOptions = PROGRAMS.map((p) => ({
    value: p.id,
    label: p.name,
    description: `${p.system} · ${p.ageRange}`,
  }));

  async function handleSubmit(formData: FormData) {
    setFormError(null);

    startTransition(async () => {
      try {
        let res;
        if (isEdit && initialData) {
          res = await updateStudent(initialData.id, formData);
        } else {
          res = await createStudent(formData);
        }

        if (res?.error) {
          setFormError(res.error);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        setFormError(
          err instanceof Error ? err.message : "Terjadi kesalahan saat memproses data."
        );
      }
    });
  }

  return (
    <Card className="max-w-3xl border border-slate-200/80 shadow-xs">
      <CardBody className="p-6 sm:p-8">
        {formError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* Section 1: Data Diri Murid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Data Diri Murid
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="full_name"
                name="full_name"
                label="Nama Lengkap Murid"
                required
                placeholder="Contoh: Muhammad Rayhan"
                defaultValue={initialData?.full_name || ""}
                disabled={isPending}
              />

              <InputField
                id="birth_date"
                name="birth_date"
                type="date"
                label="Tanggal Lahir"
                defaultValue={initialData?.birth_date || ""}
                disabled={isPending}
              />
            </div>

            <TextareaField
              id="address"
              name="address"
              label="Alamat Tempat Tinggal"
              placeholder="Contoh: Dusun Sumotuwo RT 02 RW 03, Balongbendo"
              defaultValue={initialData?.address || ""}
              rows={2}
              disabled={isPending}
            />
          </div>

          {/* Section 2: Data Orang Tua / Wali */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Kontak Orang Tua / Wali
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="parent_name"
                name="parent_name"
                label="Nama Orang Tua / Wali"
                required
                placeholder="Contoh: Ibu Rina / Bpk. Bambang"
                defaultValue={initialData?.parent_name || ""}
                disabled={isPending}
              />

              <InputField
                id="parent_phone"
                name="parent_phone"
                type="tel"
                label="Nomor WhatsApp Orang Tua"
                required
                placeholder="Contoh: 081234567890"
                hint="Wajib aktif untuk konfirmasi jadwal dan buku penghubung."
                defaultValue={initialData?.parent_phone || ""}
                disabled={isPending}
              />
            </div>

            <InputField
              id="parent_email"
              name="parent_email"
              type="email"
              label="Email Orang Tua (Opsional)"
              placeholder="ortu@email.com"
              defaultValue={initialData?.parent_email || ""}
              disabled={isPending}
            />
          </div>

          {/* Section 3: Penempatan Cabang & Program */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Pendaftaran Program & Cabang
            </h3>

            <SelectField
              id="branch_id"
              name="branch_id"
              label="Cabang Belajar"
              required
              options={branchOptions}
              defaultValue={initialData?.branch_id || ""}
              placeholder="Pilih lokasi cabang..."
              disabled={isPending}
            />

            <CheckboxGroupField
              id="programs"
              name="programs"
              label="Program Bimbingan yang Diikuti"
              required
              options={programOptions}
              defaultValues={initialData?.programs || []}
              hint="Pilih satu atau lebih program yang diambil murid."
            />

            <TextareaField
              id="notes"
              name="notes"
              label="Catatan Perkembangan / Kebutuhan Khusus (Opsional)"
              placeholder="Contoh: Belum mengenal huruf vokal, pemalu di awal sesi, alergi makanan tertentu."
              defaultValue={initialData?.notes || ""}
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Section 4: Status (on edit) */}
          {isEdit && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Status Murid
              </h3>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={initialData?.is_active ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Murid Aktif (Mengikuti pembelajaran aktif)
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <Link
              href={isEdit && initialData ? `/admin/murid/${initialData.id}` : "/admin/murid"}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>

            <Button
              type="submit"
              size="md"
              disabled={isPending}
              className="font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Simpan Perubahan" : "Daftarkan Murid"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
