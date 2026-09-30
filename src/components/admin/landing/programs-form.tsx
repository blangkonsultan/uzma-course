"use client";

import { useState, useTransition } from "react";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { Plus, X } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { ProgramsContent, ProgramItem } from "@/types/landing";

const ICON_OPTIONS = [
  { value: "BookOpen", label: "BookOpen (Buku Terbuka / AHE)" },
  { value: "Sparkles", label: "Sparkles (Bintang Ceria / ASE)" },
  { value: "Globe", label: "Globe (Bahasa Inggris / BEE)" },
  { value: "GraduationCap", label: "GraduationCap (Topi Toga / Mapel SD)" },
  { value: "Calculator", label: "Calculator (Kalkulator / Hitung)" },
];

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
    formData.append("payload", JSON.stringify(data));

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

      {/* Section Header Details */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Judul Section Program
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

      {/* Program Items List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <SortableItemList<ProgramItem>
          title="Daftar Program Kursus"
          description="Atur urutan, tambah, atau perbarui rincian program belajar"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            id: `program-${Date.now()}`,
            initials: "PROG",
            name: "Nama Program Baru",
            tagline: "Tagline Program",
            description: "Deskripsi singkat program bimbingan belajar.",
            ageRange: "Mulai 4 tahun",
            icon: "BookOpen",
            system: "1 guru max 2 murid",
            duration: "30 menit / sesi",
            frequency: "3x / minggu (12x / bulan)",
            features: ["Buku Modul", "Buku Penghubung"],
          })}
          itemLabel={(item) =>
            `${item.initials} - ${item.name} (${item.system})`
          }
          addButtonText="Tambah Program Baru"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <InputField
                  id={`prog-initials-${index}`}
                  label="Inisial Singkat"
                  value={item.initials}
                  onChange={(e) =>
                    updateItem({ ...item, initials: e.target.value.toUpperCase() })
                  }
                  hint="Contoh: AHE, BEE, MAPEL"
                  required
                />
                <InputField
                  id={`prog-id-${index}`}
                  label="Kode ID Program"
                  value={item.id}
                  onChange={(e) =>
                    updateItem({ ...item, id: e.target.value.toLowerCase().trim() })
                  }
                  hint="Huruf kecil unik (misal: ahe, bee)"
                  required
                />
                <SelectField
                  id={`prog-icon-${index}`}
                  label="Ikon Tampilan"
                  options={ICON_OPTIONS}
                  value={item.icon}
                  onChange={(e) =>
                    updateItem({ ...item, icon: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <InputField
                  id={`prog-name-${index}`}
                  label="Nama Lengkap Program"
                  value={item.name}
                  onChange={(e) =>
                    updateItem({ ...item, name: e.target.value })
                  }
                  required
                />
                <InputField
                  id={`prog-tagline-${index}`}
                  label="Tagline Program"
                  value={item.tagline}
                  onChange={(e) =>
                    updateItem({ ...item, tagline: e.target.value })
                  }
                  required
                />
              </div>

              <TextareaField
                id={`prog-desc-${index}`}
                label="Deskripsi Program"
                value={item.description}
                onChange={(e) =>
                  updateItem({ ...item, description: e.target.value })
                }
                rows={2}
                required
              />

              <div className="grid sm:grid-cols-4 gap-3">
                <InputField
                  id={`prog-age-${index}`}
                  label="Rentang Usia"
                  value={item.ageRange}
                  onChange={(e) =>
                    updateItem({ ...item, ageRange: e.target.value })
                  }
                  placeholder="Mulai 3,5 tahun"
                  required
                />
                <InputField
                  id={`prog-sys-${index}`}
                  label="Sistem / Rasio"
                  value={item.system}
                  onChange={(e) =>
                    updateItem({ ...item, system: e.target.value })
                  }
                  placeholder="1 guru max 2 murid"
                  required
                />
                <InputField
                  id={`prog-dur-${index}`}
                  label="Durasi"
                  value={item.duration}
                  onChange={(e) =>
                    updateItem({ ...item, duration: e.target.value })
                  }
                  placeholder="30 menit / sesi"
                  required
                />
                <InputField
                  id={`prog-freq-${index}`}
                  label="Frekuensi"
                  value={item.frequency}
                  onChange={(e) =>
                    updateItem({ ...item, frequency: e.target.value })
                  }
                  placeholder="3x / minggu"
                  required
                />
              </div>

              {/* Sub-list features */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Fasilitas / Fitur Unggulan Program:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {item.features.map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-700 shadow-2xs"
                    >
                      <span>✓ {feat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextFeat = item.features.filter((_, i) => i !== fIdx);
                          updateItem({ ...item, features: nextFeat });
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 min-w-0">
                  <input
                    type="text"
                    id={`prog-feat-input-${index}`}
                    placeholder="Tambah fasilitas program..."
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary-500 min-w-0 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !item.features.includes(val)) {
                          updateItem({
                            ...item,
                            features: [...item.features, val],
                          });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        `prog-feat-input-${index}`
                      ) as HTMLInputElement | null;
                      if (input) {
                        const val = input.value.trim();
                        if (val && !item.features.includes(val)) {
                          updateItem({
                            ...item,
                            features: [...item.features, val],
                          });
                          input.value = "";
                        }
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <FormActions isPending={isPending} />
    </form>
  );
}
