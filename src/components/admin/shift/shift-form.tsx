"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/admin/form-field";
import { Card, CardBody } from "@/components/ui/card";
import { BranchShift } from "@/lib/shifts";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Branch } from "@/types";
import { createShift, updateShift } from "@/app/admin/shift/actions";


interface ShiftFormProps {
  initialData?: BranchShift;
  branches: Branch[];
}

export function ShiftForm({ initialData, branches }: ShiftFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [branchId, setBranchId] = useState(initialData?.branch_id || "");
  const [name, setName] = useState(initialData?.name || "");
  // If initialData has seconds (e.g. 08:30:30), preserve the raw value unless edited
  const initialStartTimeRaw = initialData?.start_time || "";
  const initialEndTimeRaw = initialData?.end_time || "";
  const [startTime, setStartTime] = useState(initialStartTimeRaw.slice(0, 5));
  const [endTime, setEndTime] = useState(initialEndTimeRaw.slice(0, 5));
  const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
  const [isEndTimeDirty, setIsEndTimeDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isSubmitting = useRef(false);

  async function action(formData: FormData) {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(null);
    setFieldErrors({});

    try {
      // If the time input was not modified and initialData had full precision (e.g. seconds), preserve it
      if (isEdit) {
        if (!isStartTimeDirty && initialStartTimeRaw) {
          formData.set("start_time", initialStartTimeRaw);
        }
        if (!isEndTimeDirty && initialEndTimeRaw) {
          formData.set("end_time", initialEndTimeRaw);
        }
      }

      const res = isEdit
        ? await updateShift(initialData.id, formData)
        : await createShift(formData);
      if (res?.error) setError(res.error);
      if (res?.fieldErrors) setFieldErrors(res.fieldErrors);
    } finally {
      isSubmitting.current = false;
    }
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
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              error={fieldErrors.branch_id}
              disabled={isEdit}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />

            <InputField
              label="Nama Shift (Sesi)"
              name="name"
              id="name"
              required
              placeholder="Contoh: Pagi, Sore"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Jam Mulai"
                name="start_time"
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setIsStartTimeDirty(true);
                }}
                error={fieldErrors.start_time}
              />
              <InputField
                label="Jam Selesai"
                name="end_time"
                id="end_time"
                type="time"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setIsEndTimeDirty(true);
                }}
                error={fieldErrors.end_time}
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
              {isEdit ? "Simpan Perubahan" : "Simpan Shift"}
            </SubmitButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
