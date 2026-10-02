"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/admin/form-field";
import { Card, CardBody } from "@/components/ui/card";
import { ScheduleDraft } from "@/lib/drafts";
import type { Branch } from "@/types";
import { SubmitButton } from "@/components/admin/submit-button";
import { createDraft, updateDraft } from "@/app/admin/draft/actions";


interface DraftFormProps {
  initialData?: ScheduleDraft;
  branches: Branch[];
}

export function DraftForm({ initialData, branches }: DraftFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isSubmitting = useRef(false);

  const isEdit = !!initialData;

  async function action(formData: FormData) {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(null);
    setFieldErrors({});

    const res = isEdit
      ? await updateDraft(initialData.id, formData)
      : await createDraft(formData);

    if (res?.error) setError(res.error);
    if (res?.fieldErrors) setFieldErrors(res.fieldErrors);

    isSubmitting.current = false;
  }

  return (
    <Card className="max-w-2xl">
      <CardBody className="p-4 sm:p-6">
        <form action={action} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <SelectField
              label="Cabang"
              name="branch_id"
              id="branch_id"
              required
              defaultValue={initialData?.branch_id || ""}
              error={fieldErrors.branch_id}
              disabled={isEdit}
              placeholder="Pilih Cabang"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />

            <InputField
              label="Nama Draf Jadwal"
              name="name"
              id="name"
              required
              placeholder="Contoh: Jadwal Reguler Q4, Jadwal Ramadhan"
              defaultValue={initialData?.name || ""}
              error={fieldErrors.name}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Tanggal Aktif (Opsional)"
                name="effective_date"
                id="effective_date"
                type="date"
                defaultValue={initialData?.effective_date || ""}
                error={fieldErrors.effective_date}
                hint="Kosongkan jika hanya draf sementara."
              />
              <SelectField
                label="Status"
                name="status"
                id="status"
                required
                defaultValue={initialData?.status || "draft"}
                error={fieldErrors.status}
                options={[
                  { value: "draft", label: "Draf (Persiapan)" },
                  { value: "active", label: "Aktif (Sedang Berjalan)" },
                  { value: "archived", label: "Arsip (Selesai/Lalu)" }
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <SubmitButton pendingText="Menyimpan..." className="w-full sm:w-auto">
              {isEdit ? "Simpan Perubahan" : "Buat Draf"}
            </SubmitButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
