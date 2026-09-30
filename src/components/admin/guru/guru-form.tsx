"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createGuru, updateGuru } from "@/app/admin/guru/actions";
import {
  InputField,
  SelectField,
  CheckboxGroupField,
} from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { PROGRAMS, BRANCHES } from "@/lib/constants";
import type { Profile } from "@/types";

interface GuruFormProps {
  initialData?: Profile;
  isEdit?: boolean;
}

export function GuruForm({ initialData, isEdit = false }: GuruFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const branchOptions = BRANCHES.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.subName})`,
  }));

  const programOptions = PROGRAMS.map((p) => ({
    value: p.id,
    label: p.name,
    description: `${p.system} · ${p.duration}`,
  }));

  async function handleSubmit(formData: FormData) {
    setFormError(null);

    startTransition(async () => {
      try {
        let res;
        if (isEdit && initialData) {
          res = await updateGuru(initialData.id, formData);
        } else {
          res = await createGuru(formData);
        }

        if (res?.error) {
          setFormError(res.error);
        }
      } catch (err: unknown) {
        // Next.js redirect throws a special error which shouldn't be caught as an exception
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
    <Card className="max-w-2xl border border-slate-200/80 shadow-xs">
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

        <form action={handleSubmit} className="space-y-6">
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
              defaultValue={initialData?.full_name || ""}
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
              defaultValue={initialData?.phone || ""}
              hint="Format nomor telepon aktif untuk koordinasi."
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
              defaultValue={initialData?.branch_id || ""}
              placeholder="Pilih cabang utama..."
              disabled={isPending}
            />

            <CheckboxGroupField
              id="programs"
              name="programs"
              label="Program Bimbingan yang Diampu"
              options={programOptions}
              defaultValues={initialData?.programs || []}
              hint="Pilih program kursus yang diajarkan oleh guru ini."
            />
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
                    value="true"
                    defaultChecked={initialData?.is_active ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Akun Aktif (Dapat login dan mengajar)
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <Link
              href="/admin/guru"
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
                  <span>{isEdit ? "Simpan Perubahan" : "Daftarkan Guru"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
