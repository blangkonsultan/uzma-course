"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { InputField } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import { Layers, ArrowRight } from "lucide-react";
import type { ProgramsContent } from "@/types/landing";

interface ProgramsFormProps {
  initialData: ProgramsContent;
}

export function ProgramsForm({ initialData }: ProgramsFormProps) {
  const [data, setData] = useState<ProgramsContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        title: data.title,
        subtitle: data.subtitle,
      })
    );

    startTransition(async () => {
      const res = await updateLandingSection("programs", formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Info Notice about Centralized Master Program */}
      <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-primary-900">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary-100 text-primary-700 shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-950">
              Pengelolaan Daftar Program Terpusat
            </h3>
            <p className="text-xs text-primary-800/90 mt-0.5 leading-relaxed">
              Daftar program belajar, kurikulum, atribusi lisensi franchise, dan logo sekarang dikelola langsung melalui database Master Program.
            </p>
          </div>
        </div>
        <Link
          href="/admin/program"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
        >
          <span>Master Program</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Section Header Details */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Judul Section Program Landing Page
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="title"
            label="Judul Section"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            required
          />
          <InputField
            id="subtitle"
            label="Sub-judul Section"
            value={data.subtitle}
            onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            required
          />
        </div>
      </div>

      <FormActions isPending={isPending} />
    </form>
  );
}
