"use client";

import { useState, useTransition } from "react";
import { InputField, TextareaField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { TestimonialsContent, TestimonialItem } from "@/types/landing";

interface TestimonialsFormProps {
  initialData: TestimonialsContent;
}

export function TestimonialsForm({ initialData }: TestimonialsFormProps) {
  const [data, setData] = useState<TestimonialsContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("testimonials", formData);
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
          Judul Section Testimoni
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
        <SortableItemList<TestimonialItem>
          title="Daftar Ulasan & Testimoni"
          description="Atur urutan kutipan orang tua murid yang tampil pada carousel halaman depan"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            parentName: "Nama Orang Tua",
            programLabel: "Orang Tua Murid AHE",
            quote: "Ulasan kepuasan belajar putra-putri di Uzma Course.",
          })}
          itemLabel={(item) => `${item.parentName} (${item.programLabel})`}
          addButtonText="Tambah Testimoni Baru"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <InputField
                  id={`testi-name-${index}`}
                  label="Nama Orang Tua Murid"
                  value={item.parentName}
                  onChange={(e) =>
                    updateItem({ ...item, parentName: e.target.value })
                  }
                  required
                />
                <InputField
                  id={`testi-prog-${index}`}
                  label="Label Program"
                  value={item.programLabel}
                  onChange={(e) =>
                    updateItem({ ...item, programLabel: e.target.value })
                  }
                  hint="Contoh: Orang Tua Murid AHE & BEE"
                  required
                />
              </div>

              <TextareaField
                id={`testi-quote-${index}`}
                label="Kutipan Testimoni (Quote)"
                value={item.quote}
                onChange={(e) =>
                  updateItem({ ...item, quote: e.target.value })
                }
                rows={3}
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
