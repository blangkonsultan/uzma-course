"use client";

import { useState, useTransition } from "react";
import { InputField } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { CTAContent } from "@/types/landing";

interface CTAFormProps {
  initialData: CTAContent;
}

export function CTAForm({ initialData }: CTAFormProps) {
  const [data, setData] = useState<CTAContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("cta", formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Banner Call to Action
        </h2>

        <InputField
          id="title"
          label="Judul Ajakan (Heading)"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          required
        />

        <InputField
          id="subtitle"
          label="Sub-judul / Tagline Pendukung"
          value={data.subtitle}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          required
        />

        <InputField
          id="buttonText"
          label="Teks Tombol WhatsApp"
          value={data.buttonText}
          onChange={(e) => setData({ ...data, buttonText: e.target.value })}
          required
        />
      </div>

      <FormActions isPending={isPending} />
    </form>
  );
}
