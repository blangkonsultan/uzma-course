"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { createGuru, updateGuru } from "@/app/admin/guru/actions";
import {
  InputField,
  SelectField,
  CheckboxGroupField,
} from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import type { Profile, Program, Branch } from "@/types";
import { formatDuration } from "@/lib/utils";

interface GuruFormProps {
  initialData?: Profile;
  initialProgramIds?: string[];
  programs: Program[];
  branches: Branch[];
  isEdit?: boolean;
}

export function GuruForm({
  initialData,
  initialProgramIds,
  programs,
  branches,
  isEdit = false,
}: GuruFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: "",
    password: "",
    phone: initialData?.phone || "",
    branch_id: initialData?.branch_id || "",
    programs: (initialProgramIds || []) as string[],
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
      errors.full_name = "Nama lengkap guru minimal 2 karakter.";
    }
    if (!isEdit) {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        errors.email = "Format email tidak valid.";
      }
      if (!formData.password || formData.password.length < 8) {
        errors.password = "Kata sandi minimal 8 karakter.";
      }
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
        data.append("phone", formData.phone.trim());
        data.append("branch_id", formData.branch_id);
        formData.programs.forEach((prog) => data.append("programs", prog));

        let res;
        if (isEdit && initialData) {
          data.append("is_active", formData.is_active ? "true" : "false");
          res = await updateGuru(initialData.id, data);
        } else {
          data.append("email", formData.email.trim());
          data.append("password", formData.password);
          res = await createGuru(data);
        }

        if (res?.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        if (res?.error) {
          showToast(res.error, "error");
        }
      } catch (err: unknown) {
        // Next.js redirect throws a special error which shouldn't be caught as an exception
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
    <Card className="max-w-2xl border border-slate-200/80 shadow-xs">
      <CardBody className="p-4 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Informasi Akun & Pribadi
            </h3>

            <InputField
              id="full_name"
              name="full_name"
              label="Nama Lengkap Guru"
              required
              placeholder="Contoh: Siti Rahmawati, S.Pd."
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              error={fieldErrors.full_name}
              disabled={isPending}
            />

            {!isEdit && (
              <>
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  label="Email Login"
                  required
                  placeholder="guru@uzmacourse.com"
                  hint="Digunakan oleh guru untuk masuk ke portal."
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  error={fieldErrors.email}
                  disabled={isPending}
                />

                <InputField
                  id="password"
                  name="password"
                  type="password"
                  label="Kata Sandi Awal"
                  required
                  placeholder="Minimal 8 karakter"
                  hint="Berikan kata sandi ini kepada guru bersangkutan."
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  error={fieldErrors.password}
                  disabled={isPending}
                />
              </>
            )}

            <InputField
              id="phone"
              name="phone"
              type="tel"
              label="Nomor WhatsApp / HP"
              placeholder="Contoh: 081234567890"
              hint="Format nomor telepon aktif untuk koordinasi."
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              error={fieldErrors.phone}
              disabled={isPending}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Penempatan Cabang & Program
            </h3>

            <SelectField
              id="branch_id"
              name="branch_id"
              label="Cabang Penugasan"
              options={branchOptions}
              value={formData.branch_id}
              onChange={(e) => updateField("branch_id", e.target.value)}
              error={fieldErrors.branch_id}
              placeholder="Pilih cabang utama..."
              disabled={isPending}
            />

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-700">
                Program Bimbingan yang Diampu
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
                      description: `${p.system} · ${formatDuration(p.duration)}`,
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
                      description: `${p.system} · ${formatDuration(p.duration)}`,
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
                <p className="text-xs text-rose-600 font-medium mt-1">
                  {fieldErrors.programs}
                </p>
              )}
            </fieldset>
          </div>

          {isEdit && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Status Akun
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
                    Akun Aktif (Dapat login dan mengajar)
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link
              href="/admin/guru"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 sm:border-transparent hover:bg-slate-100 transition-colors w-full sm:w-auto min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Link>

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
                  <span>{isEdit ? "Perbarui Guru" : "Simpan Guru"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
