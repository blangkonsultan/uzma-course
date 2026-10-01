"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { showToast } from "@/components/admin/toast";
import type { Student, Program, Branch } from "@/types";

interface StudentFormProps {
  initialData?: Student;
  initialProgramIds?: string[];
  programs: Program[];
  branches: Branch[];
  isEdit?: boolean;
}

export function StudentForm({
  initialData,
  initialProgramIds,
  programs,
  branches,
  isEdit = false,
}: StudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    birth_date: initialData?.birth_date || "",
    address: initialData?.address || "",
    parent_name: initialData?.parent_name || "",
    parent_phone: initialData?.parent_phone || "",
    parent_email: initialData?.parent_email || "",
    branch_id: initialData?.branch_id || "",
    programs: (initialProgramIds || []) as string[],
    notes: initialData?.notes || "",
    is_active: initialData?.is_active ?? true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.sub_name ? `${b.name} (${b.sub_name})` : b.name,
  }));

  const franchisePrograms = programs.filter((p) => p.type === "franchise");
  const originalPrograms = programs.filter((p) => p.type === "original");
  const franchiseIdMap: Record<string, true> = Object.fromEntries(
    franchisePrograms.map((p) => [p.id, true])
  );
  const originalIdMap: Record<string, true> = Object.fromEntries(
    originalPrograms.map((p) => [p.id, true])
  );

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
    if (!formData.branch_id) {
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
      <CardBody className="p-4 sm:p-8">
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

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-700">
                Program Bimbingan yang Diikuti <span className="text-rose-500">*</span>
              </legend>

              {franchisePrograms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Program Franchise
                  </p>
                  <CheckboxGroupField
                    id="programs-franchise"
                    name="programs"
                    label=""
                    options={franchisePrograms.map((p) => ({
                      value: p.id,
                      label: `[${p.initials}] ${p.name}`,
                      description: `${p.system} · ${p.age_range}`,
                    }))}
                    values={formData.programs.filter((id) => franchiseIdMap[id])}
                    onChange={(selected) =>
                      updateField("programs", [
                        ...formData.programs.filter((id) => !franchiseIdMap[id]),
                        ...selected,
                      ])
                    }
                  />
                </div>
              )}

              {originalPrograms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Program Original Uzma Course
                  </p>
                  <CheckboxGroupField
                    id="programs-original"
                    name="programs"
                    label=""
                    options={originalPrograms.map((p) => ({
                      value: p.id,
                      label: `[${p.initials}] ${p.name}`,
                      description: `${p.system} · ${p.age_range}`,
                    }))}
                    values={formData.programs.filter((id) => originalIdMap[id])}
                    onChange={(selected) =>
                      updateField("programs", [
                        ...formData.programs.filter((id) => !originalIdMap[id]),
                        ...selected,
                      ])
                    }
                  />
                </div>
              )}

              {fieldErrors.programs && (
                <p className="text-xs text-rose-500 font-medium mt-1">
                  {fieldErrors.programs}
                </p>
              )}
            </fieldset>

            <TextareaField
              id="notes"
              name="notes"
              label="Catatan Khusus (Opsional)"
              placeholder="Contoh: Belum mengenal huruf sama sekali, pemalu di awal pertemuan, dll."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Section 4: Status Aktif (Edit Mode Only) */}
          {isEdit && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Status Murid
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  disabled={isPending}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-slate-800 cursor-pointer"
                >
                  Murid Aktif Belajar
                </label>
              </div>
              <p className="text-xs text-slate-400">
                Nonaktifkan jika murid telah lulus, cuti, atau berhenti les.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              href={isEdit && initialData ? `/admin/murid/${initialData.id}` : "/admin/murid"}
              disabled={isPending}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Perbarui Data" : "Daftarkan Murid"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
