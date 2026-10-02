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
import type { Student, Program, Branch, StudentProgram } from "@/types";
import { formatClassRatio } from "@/lib/utils";

interface StudentFormProps {
  initialData?: Student;
  initialStudentPrograms?: StudentProgram[];
  programs: Program[];
  branches: Branch[];
  isEdit?: boolean;
}

type DiscountType = "none" | "nominal" | "percentage";

interface StudentProgramState {
  status?: string;
  program_id: string;
  variant_id: string;
  spp_amount: number;
  on_time_discount_type: DiscountType;
  on_time_discount_value: number;
  cycle_start_date: string;
}

export function StudentForm({
  initialData,
  initialStudentPrograms,
  programs,
  branches,
  isEdit = false,
}: StudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    student_number: (initialData as Record<string, unknown>)?.student_number as string || "",
    joined_date: (initialData as Record<string, unknown>)?.joined_date as string || new Date().toISOString().split("T")[0],
    full_name: initialData?.full_name || "",
    birth_date: initialData?.birth_date || "",
    address: initialData?.address || "",
    parent_name: initialData?.parent_name || "",
    parent_phone: initialData?.parent_phone || "",
    parent_email: initialData?.parent_email || "",
    branch_id: initialData?.branch_id || "",
    notes: initialData?.notes || "",
    is_active: initialData?.is_active ?? true,
  });

  const [studentPrograms, setStudentPrograms] = useState<StudentProgramState[]>(() => {
    if (initialStudentPrograms && initialStudentPrograms.length > 0) {
      return initialStudentPrograms.map(sp => ({
        program_id: sp.program_id,
        variant_id: sp.variant_id || "",
        spp_amount: sp.spp_amount ?? 0,
        on_time_discount_type: (sp.on_time_discount_type as "none" | "nominal" | "percentage") || "none",
        on_time_discount_value: sp.on_time_discount_value ?? 0,
        cycle_start_date: sp.cycle_start_date || new Date().toISOString().split('T')[0],
        status: (sp as Record<string, unknown>).status as string || "active",
      }));
    }
    return [];
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

  function handleProgramToggle(programId: string, checked: boolean) {
    if (checked) {
      const program = programs.find(p => p.id === programId);
      const defaultVariant = program?.program_variants?.[0];
      setStudentPrograms(prev => [
        ...prev,
        {
          program_id: programId,
          variant_id: defaultVariant?.id || "",
          spp_amount: defaultVariant?.default_spp || 0,
          on_time_discount_type: "none",
          on_time_discount_value: 0,
          cycle_start_date: new Date().toISOString().split('T')[0],
          status: "active",
        }
      ]);
    } else {
      setStudentPrograms(prev => prev.filter(p => p.program_id !== programId));
    }
    if (fieldErrors.programs) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.programs;
        return next;
      });
    }
  }

  function updateStudentProgram<K extends keyof StudentProgramState>(programId: string, field: K, value: StudentProgramState[K]) {
    setStudentPrograms(prev => prev.map(sp => {
      if (sp.program_id === programId) {
        const updated = { ...sp, [field]: value };
        // If variant changes, auto-update spp_amount if possible
        if (field === 'variant_id') {
          const program = programs.find(p => p.id === programId);
          const variant = program?.program_variants?.find(v => v.id === value);
          if (variant) {
            updated.spp_amount = variant.default_spp;
          }
        }
        return updated;
      }
      return sp;
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
    if (studentPrograms.length === 0) {
      errors.programs = "Pilih minimal 1 program bimbingan.";
    }
    
    // Validate individual program selections
    studentPrograms.forEach(sp => {
      if (!sp.variant_id) {
        errors[`variant_${sp.program_id}`] = "Varian program wajib dipilih.";
      }
      if (!sp.cycle_start_date) {
        errors[`date_${sp.program_id}`] = "Tanggal mulai wajib diisi.";
      }
    });

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
        data.append("notes", formData.notes.trim());
        
        data.append("student_programs_json", JSON.stringify(studentPrograms));

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

  const selectedProgramIds = studentPrograms.map(sp => sp.program_id);

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

              {fieldErrors.programs && (
                <p className="text-xs text-rose-500">{fieldErrors.programs}</p>
              )}

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
                      description: `${formatClassRatio(p.system)} · ${p.age_range}`,
                    }))}
                    values={selectedProgramIds.filter((id) => franchiseIdMap[id])}
                    onChange={(selected) => {
                      const currentFranchise = selectedProgramIds.filter(id => franchiseIdMap[id]);
                      const added = selected.filter(id => !currentFranchise.includes(id));
                      const removed = currentFranchise.filter(id => !selected.includes(id));
                      added.forEach(id => handleProgramToggle(id, true));
                      removed.forEach(id => handleProgramToggle(id, false));
                    }}
                  />
                </div>
              )}

              {originalPrograms.length > 0 && (
                <div className="space-y-2 mt-4">
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
                      description: `${formatClassRatio(p.system)} · ${p.age_range}`,
                    }))}
                    values={selectedProgramIds.filter((id) => !franchiseIdMap[id])}
                    onChange={(selected) => {
                      const currentOriginal = selectedProgramIds.filter(id => !franchiseIdMap[id]);
                      const added = selected.filter(id => !currentOriginal.includes(id));
                      const removed = currentOriginal.filter(id => !selected.includes(id));
                      added.forEach(id => handleProgramToggle(id, true));
                      removed.forEach(id => handleProgramToggle(id, false));
                    }}
                  />
                </div>
              )}
            </fieldset>

            {/* Selected Programs Details */}
            {studentPrograms.length > 0 && (
              <div className="space-y-6 mt-6 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-semibold text-slate-800">
                  Detail Tagihan SPP & Siklus
                </h4>
                {studentPrograms.map(sp => {
                  const program = programs.find(p => p.id === sp.program_id);
                  const variants = program?.program_variants || [];
                  const variantOptions = variants.map(v => ({
                    value: v.id,
                    label: v.name,
                  }));

                  return (
                    <div key={sp.program_id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                      <div className="font-medium text-slate-900 border-b border-slate-200 pb-2 mb-2">
                        {program?.name}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField
                          id={`variant_${sp.program_id}`}
                          name={`variant_${sp.program_id}`}
                          label="Varian Program"
                          required
                          options={variantOptions}
                          value={sp.variant_id}
                          onChange={(e) => updateStudentProgram(sp.program_id, "variant_id", e.target.value)}
                          error={fieldErrors[`variant_${sp.program_id}`]}
                          disabled={isPending}
                        />
                        <SelectField
                          id={`status_${sp.program_id}`}
                          name={`status_${sp.program_id}`}
                          label="Status Program"
                          required
                          options={[
                            { value: 'active', label: 'Sedang Aktif' },
                            { value: 'graduated', label: 'Lulus' },
                            { value: 'inactive', label: 'Berhenti / Tidak Aktif' }
                          ]}
                          value={sp.status || 'active'}
                          onChange={(e) => updateStudentProgram(sp.program_id, "status", e.target.value)}
                          disabled={isPending}
                        />
                        <InputField
                          id={`cycle_${sp.program_id}`}
                          name={`cycle_${sp.program_id}`}
                          label="Tanggal Mulai Siklus"
                          type="date"
                          required
                          value={sp.cycle_start_date}
                          onChange={(e) => updateStudentProgram(sp.program_id, "cycle_start_date", e.target.value)}
                          error={fieldErrors[`date_${sp.program_id}`]}
                          disabled={isPending}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField
                          id={`spp_${sp.program_id}`}
                          name={`spp_${sp.program_id}`}
                          label="Nominal SPP (Rp)"
                          type="number"
                          required
                          value={sp.spp_amount}
                          onChange={(e) => updateStudentProgram(sp.program_id, "spp_amount", parseInt(e.target.value) || 0)}
                          disabled={isPending}
                        />
                        
                        <SelectField
                          id={`disc_type_${sp.program_id}`}
                          name={`disc_type_${sp.program_id}`}
                          label="Tipe Diskon Tepat Waktu"
                          options={[
                            { value: "none", label: "Tidak Ada" },
                            { value: "nominal", label: "Nominal (Rp)" },
                            { value: "percentage", label: "Persentase (%)" },
                          ]}
                          value={sp.on_time_discount_type}
                          onChange={(e) => updateStudentProgram(sp.program_id, "on_time_discount_type", e.target.value as "none" | "nominal" | "percentage")}
                          disabled={isPending}
                        />

                        {sp.on_time_discount_type !== "none" && (
                          <InputField
                            id={`disc_val_${sp.program_id}`}
                            name={`disc_val_${sp.program_id}`}
                            label={`Nilai Diskon ${sp.on_time_discount_type === "percentage" ? "(%)" : "(Rp)"}`}
                            type="number"
                            required
                            value={sp.on_time_discount_value}
                            onChange={(e) => updateStudentProgram(sp.program_id, "on_time_discount_value", parseInt(e.target.value) || 0)}
                            disabled={isPending}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Catatan & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Lain-lain
            </h3>

            <TextareaField
              id="notes"
              name="notes"
              label="Catatan Khusus (Opsional)"
              placeholder="Contoh: Murid memiliki riwayat alergi tertentu, atau butuh perhatian khusus..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              disabled={isPending}
            />

            {isEdit && (
              <SelectField
                id="is_active"
                name="is_active"
                label="Status Murid"
                options={[
                  { value: "true", label: "Aktif" },
                  { value: "false", label: "Non-aktif" },
                ]}
                value={formData.is_active ? "true" : "false"}
                onChange={(e) => updateField("is_active", e.target.value === "true")}
                disabled={isPending}
                hint="Murid yang non-aktif tidak akan muncul di form absensi atau SPP."
              />
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              href="/admin/murid"
              disabled={isPending}
              className="w-full sm:w-auto justify-center min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto justify-center min-h-[44px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
