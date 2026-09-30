"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckboxField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save, MessageCircle } from "lucide-react";
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

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
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

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <CheckboxField
            id="isEnabled"
            label="Aktifkan Tombol Floating WhatsApp"
            description="Bila dicentang, tombol WhatsApp melayang akan tampil di setiap halaman pengunjung website."
            checked={data.isEnabled}
            onChange={(e) => setData({ isEnabled: e.target.checked })}
          />
        </div>
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
