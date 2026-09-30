"use client";

import { useState, useTransition } from "react";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { WhyUsContent, WhyUsItem } from "@/types/landing";

const ICON_OPTIONS = [
  { value: "Award", label: "Award (Medali Keunggulan)" },
  { value: "Users", label: "Users (Tim / Pengajar)" },
  { value: "UserCheck", label: "UserCheck (Kelas Personal)" },
  { value: "Clock", label: "Clock (Jadwal Fleksibel)" },
  { value: "Heart", label: "Heart (Penuh Kasih / Ramah Anak)" },
  { value: "Sparkles", label: "Sparkles (Bintang Berprestasi)" },
  { value: "ShieldCheck", label: "ShieldCheck (Terpercaya)" },
  { value: "Star", label: "Star (Bintang Pilihan)" },
];

interface WhyUsFormProps {
  initialData: WhyUsContent;
}

export function WhyUsForm({ initialData }: WhyUsFormProps) {
  const [data, setData] = useState<WhyUsContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("why_us", formData);
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

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Judul Section Keunggulan
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

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <SortableItemList<WhyUsItem>
          title="Daftar Poin Keunggulan"
          description="Daftar poin USP (Unique Selling Points) yang meyakinkan orang tua murid"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            icon: "Award",
            title: "Poin Keunggulan Baru",
            description: "Penjelasan keunggulan fasilitas atau metode belajar.",
          })}
          itemLabel={(item) => item.title}
          addButtonText="Tambah Poin Keunggulan"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    id={`why-title-${index}`}
                    label="Judul Poin"
                    value={item.title}
                    onChange={(e) =>
                      updateItem({ ...item, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <SelectField
                    id={`why-icon-${index}`}
                    label="Ikon"
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
                id={`why-desc-${index}`}
                label="Deskripsi Poin"
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

      <FormActions isPending={isPending} />
    </form>
  );
}
