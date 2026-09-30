"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { FacilitiesContent, FacilityItem } from "@/types/landing";

const ICON_OPTIONS = [
  { value: "Award", label: "Award (Guru Berlisensi)" },
  { value: "Home", label: "Home (Tempat Belajar Nyaman)" },
  { value: "Trophy", label: "Trophy (Piala & Piagam)" },
  { value: "Armchair", label: "Armchair (Kursi Tunggu)" },
  { value: "Wifi", label: "Wifi (Free Wi-Fi & Air Mineral)" },
  { value: "Gamepad2", label: "Gamepad2 (Permainan Edukasi)" },
  { value: "BadgePercent", label: "BadgePercent (Diskon SPP Bulanan)" },
  { value: "Sparkles", label: "Sparkles (Trial Class Gratis)" },
  { value: "BookOpen", label: "BookOpen (Modul Buku Lengkap)" },
  { value: "CheckCircle2", label: "CheckCircle2 (Standar Mutu)" },
];

interface FacilitiesFormProps {
  initialData: FacilitiesContent;
}

export function FacilitiesForm({ initialData }: FacilitiesFormProps) {
  const [data, setData] = useState<FacilitiesContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("facilities", formData);
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

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Judul Section Fasilitas
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

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <SortableItemList<FacilityItem>
          title="Daftar Sarana & Fasilitas"
          description="Daftar fasilitas kenyamanan belajar anak dan orang tua di unit bimbingan"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            title: "Fasilitas Baru",
            description: "Deskripsi sarana penunjang kenyamanan belajar.",
            icon: "Sparkles",
          })}
          itemLabel={(item) => item.title}
          addButtonText="Tambah Fasilitas Baru"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    id={`fac-title-${index}`}
                    label="Nama Fasilitas"
                    value={item.title}
                    onChange={(e) =>
                      updateItem({ ...item, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <SelectField
                    id={`fac-icon-${index}`}
                    label="Ikon Fasilitas"
                    options={ICON_OPTIONS}
                    value={item.icon}
                    onChange={(e) =>
                      updateItem({ ...item, icon: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <TextareaField
                id={`fac-desc-${index}`}
                label="Deskripsi Fasilitas"
                value={item.description}
                onChange={(e) =>
                  updateItem({ ...item, description: e.target.value })
                }
                rows={2}
                required
              />
            </div>
          )}
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
