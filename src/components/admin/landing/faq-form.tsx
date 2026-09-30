"use client";

import { useState, useTransition } from "react";
import { InputField, TextareaField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { FAQContent, FAQItem } from "@/types/landing";

interface FAQFormProps {
  initialData: FAQContent;
}

export function FAQForm({ initialData }: FAQFormProps) {
  const [data, setData] = useState<FAQContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("faq", formData);
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
          Judul Section FAQ
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
        <SortableItemList<FAQItem>
          title="Daftar Pertanyaan & Jawaban"
          description="Atur urutan FAQ, tambah pertanyaan baru, atau perbarui jawaban"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            id: `faq-${Date.now()}`,
            question: "Pertanyaan Baru?",
            answer: "Penjelasan atau jawaban untuk pertanyaan di atas.",
          })}
          itemLabel={(item) => item.question}
          addButtonText="Tambah Pertanyaan FAQ"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <InputField
                    id={`faq-q-${index}`}
                    label="Pertanyaan"
                    value={item.question}
                    onChange={(e) =>
                      updateItem({ ...item, question: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <InputField
                    id={`faq-id-${index}`}
                    label="Slug ID (Unik)"
                    value={item.id}
                    onChange={(e) =>
                      updateItem({ ...item, id: e.target.value.toLowerCase().trim() })
                    }
                    hint="Huruf kecil"
                    required
                  />
                </div>
              </div>

              <TextareaField
                id={`faq-a-${index}`}
                label="Jawaban"
                value={item.answer}
                onChange={(e) =>
                  updateItem({ ...item, answer: e.target.value })
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
