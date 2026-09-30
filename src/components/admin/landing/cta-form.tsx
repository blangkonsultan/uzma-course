"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { InputField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
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

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
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

      <div className="flex items-center justify-between pt-4">
        <Link
          href="/admin/landing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </Link>

        <Button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
