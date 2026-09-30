"use client";

import { useState, useTransition } from "react";
import { CheckboxField } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/landing/form-actions";
import { MessageCircle } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { FloatingWaContent } from "@/types/landing";

interface FloatingWaFormProps {
  initialData: FloatingWaContent;
}

export function FloatingWaForm({ initialData }: FloatingWaFormProps) {
  const [data, setData] = useState<FloatingWaContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("floating_wa", formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 font-heading">
              Tombol WhatsApp Melayang (Floating)
            </h2>
            <p className="text-xs text-slate-500">
              Tombol hijau cepat di sudut kanan bawah halaman website
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
          <CheckboxField
            id="isEnabled"
            label="Aktifkan Tombol Floating WhatsApp"
            description="Bila dicentang, tombol WhatsApp melayang akan tampil di setiap halaman pengunjung website."
            checked={data.isEnabled}
            onChange={(e) => setData({ isEnabled: e.target.checked })}
          />
        </div>
      </div>

      <FormActions isPending={isPending} />
    </form>
  );
}
