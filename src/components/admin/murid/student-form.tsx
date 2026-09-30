"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { PROGRAMS, BRANCHES } from "@/lib/constants";
import { showToast } from "@/components/admin/toast";
import type { Student } from "@/types";

interface StudentFormProps {
  initialData?: Student;
  isEdit?: boolean;
}

export function StudentForm({ initialData, isEdit = false }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    birth_date: initialData?.birth_date || "",
    address: initialData?.address || "",
    parent_name: initialData?.parent_name || "",
    parent_phone: initialData?.parent_phone || "",
    parent_email: initialData?.parent_email || "",
    branch_id: initialData?.branch_id || "",
    programs: (initialData?.programs || []) as string[],
    notes: initialData?.notes || "",
    is_active: initialData?.is_active ?? true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const branchOptions = BRANCHES.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.subName})`,
  }));

  const programOptions = PROGRAMS.map((p) => ({
    value: p.id,
    label: `[${p.initials}] ${p.name}`,
    description: `${p.system} · ${p.ageRange}`,
  }));

  function updateField<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side pre-validation
    const errors: Record<string, string> = {};
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      errors.full_name = "Nama lengkap murid minimal 2 karakter.";
    }
    if (!formData.parent_name.trim() || formData.parent_name.trim().length < 2) {
      errors.parent_name = "Nama orang tua / wali minimal 2 karakter.";
    }
    if (!formData.parent_phone.trim() || formData.parent_phone.trim().length < 8) {
      errors.parent_phone = "Nomor WhatsApp orang tua minimal 8 digit.";
    }
    if (formData.branch_id !== "balongbendo" && formData.branch_id !== "krian") {
      errors.branch_id = "Cabang belajar wajib dipilih.";
    }
    if (formData.programs.length === 0) {
      errors.programs = "Pilih minimal 1 program bimbingan.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      try {
        const data = new FormData();
        data.append("full_name", formData.full_name.trim());
        data.append("birth_date", formData.birth_date);
        data.append("address", formData.address.trim());
        data.append("parent_name", formData.parent_name.trim());
        data.append("parent_phone", formData.parent_phone.trim());
        data.append("parent_email", formData.parent_email.trim());
        data.append("branch_id", formData.branch_id);
        formData.programs.forEach((prog) => data.append("programs", prog));
        data.append("notes", formData.notes.trim());

        let res;
        if (isEdit && initialData) {
          data.append("is_active", formData.is_active ? "true" : "false");
          res = await updateStudent(initialData.id, data);
        } else {
          res = await createStudent(data);
        }

        if (res?.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        if (res?.error) {
          showToast(res.error, "error");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        showToast(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses data.",
          "error"
        );
      }
    });
  }

  return (
    <Card className="max-w-3xl border border-slate-200/80 shadow-xs">
      <CardBody className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
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
                value={formData.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                error={fieldErrors.full_name}
                disabled={isPending}
              />

              <InputField
                id="birth_date"
                name="birth_date"
                type="date"
                label="Tanggal Lahir"
                value={formData.birth_date}
                onChange={(e) => updateField("birth_date", e.target.value)}
                disabled={isPending}
              />
            </div>

            <TextareaField
              id="address"
              name="address"
              label="Alamat Tempat Tinggal"
              placeholder="Contoh: Dusun Sumotuwo RT 02 RW 03, Balongbendo"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
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
                value={formData.parent_name}
                onChange={(e) => updateField("parent_name", e.target.value)}
                error={fieldErrors.parent_name}
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
                value={formData.parent_phone}
                onChange={(e) => updateField("parent_phone", e.target.value)}
                error={fieldErrors.parent_phone}
                disabled={isPending}
              />
            </div>

            <InputField
              id="parent_email"
              name="parent_email"
              type="email"
              label="Email Orang Tua (Opsional)"
              placeholder="ortu@email.com"
              value={formData.parent_email}
              onChange={(e) => updateField("parent_email", e.target.value)}
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
              value={formData.branch_id}
              onChange={(e) => updateField("branch_id", e.target.value)}
              error={fieldErrors.branch_id}
              placeholder="Pilih lokasi cabang..."
              disabled={isPending}
            />

            <CheckboxGroupField
              id="programs"
              name="programs"
              label="Program Bimbingan yang Diikuti"
              required
              options={programOptions}
              values={formData.programs}
              onChange={(vals) => updateField("programs", vals)}
              error={fieldErrors.programs}
              hint="Pilih satu atau lebih program yang diambil murid."
            />

            <TextareaField
              id="notes"
              name="notes"
              label="Catatan Perkembangan / Kebutuhan Khusus (Opsional)"
              placeholder="Contoh: Belum mengenal huruf vokal, pemalu di awal sesi, alergi makanan tertentu."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
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
                    checked={formData.is_active}
                    onChange={(e) =>
                      updateField("is_active", e.target.checked)
                    }
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
              href={
                isEdit && initialData
                  ? `/admin/murid/${initialData.id}`
                  : "/admin/murid"
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>

            <Button
              type="submit"
              size="md"
              disabled={isPending}
              className="font-medium cursor-pointer"
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
