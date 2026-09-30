"use client";

import { useState, useTransition } from "react";
import { InputField, TextareaField } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/landing/form-actions";
import { Plus, X } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { HeroContent } from "@/types/landing";

interface HeroFormProps {
  initialData: HeroContent;
}

export function HeroForm({ initialData }: HeroFormProps) {
  const [data, setData] = useState<HeroContent>(initialData);
  const [newPill, setNewPill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddPill = () => {
    const trimmed = newPill.trim();
    if (!trimmed || data.featurePills.includes(trimmed)) return;
    setData({
      ...data,
      featurePills: [...data.featurePills, trimmed],
    });
    setNewPill("");
  };

  const handleRemovePill = (idx: number) => {
    setData({
      ...data,
      featurePills: data.featurePills.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("hero", formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Teks & Headline Hero
        </h2>
        <InputField
          id="badgeText"
          label="Teks Badge Tagline"
          value={data.badgeText}
          onChange={(e) => setData({ ...data, badgeText: e.target.value })}
          hint="Contoh: Reader now, Leader tomorrow!"
          required
        />

        <InputField
          id="title"
          label="Judul Utama (H1)"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          required
        />

        <InputField
          id="subtitle"
          label="Sub-judul (Unit & Lembaga)"
          value={data.subtitle}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          required
        />

        <TextareaField
          id="description"
          label="Deskripsi Pembuka"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={3}
          required
        />

        {/* Feature Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700">
            Pill Keunggulan Ringkas (Checklist Hero)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.featurePills.map((pill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-800 border border-primary-100"
              >
                <span>✓ {pill}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePill(idx)}
                  className="text-primary-500 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPill}
              onChange={(e) => setNewPill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPill();
                }
              }}
              placeholder="Tambah item pill..."
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-primary-500 min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={handleAddPill}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Tombol Aksi (Call to Action)
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="primaryCtaText"
            label="Teks Tombol Utama (WhatsApp)"
            value={data.primaryCtaText}
            onChange={(e) => setData({ ...data, primaryCtaText: e.target.value })}
            required
          />
          <InputField
            id="secondaryCtaText"
            label="Teks Tombol Sekunder"
            value={data.secondaryCtaText}
            onChange={(e) =>
              setData({ ...data, secondaryCtaText: e.target.value })
            }
            required
          />
        </div>

        <InputField
          id="secondaryCtaHref"
          label="Tautan Tombol Sekunder"
          value={data.secondaryCtaHref}
          onChange={(e) =>
            setData({ ...data, secondaryCtaHref: e.target.value })
          }
          hint="Contoh: #programs atau /admin"
          required
        />
      </div>

      <FormActions isPending={isPending} />
    </form>
  );
}
