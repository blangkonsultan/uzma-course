"use client";

import { useState, useTransition } from "react";
import {
  InputField,
  SelectField,
} from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { VideosContent, VideoItem } from "@/types/landing";

const SOURCE_OPTIONS = [
  { value: "youtube", label: "YouTube (Embed)" },
  { value: "tiktok", label: "TikTok (Embed)" },
];

interface VideosFormProps {
  initialData: VideosContent;
}

export function VideosForm({ initialData }: VideosFormProps) {
  const [data, setData] = useState<VideosContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("videos", formData);
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
          Judul Section Video Promo
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
        <SortableItemList<VideoItem>
          title="Daftar Video Promo & Kegiatan"
          description="Bila daftar video kosong, section video otomatis tersembunyi dari pengunjung"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            id: `video-${Date.now()}`,
            title: "Video Kegiatan Baru",
            source: "youtube",
            embedUrl: "https://www.youtube.com/embed/...",
          })}
          itemLabel={(item) => `${item.title} (${item.source})`}
          addButtonText="Tambah Video Baru"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    id={`vid-title-${index}`}
                    label="Judul Video"
                    value={item.title}
                    onChange={(e) =>
                      updateItem({ ...item, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <SelectField
                    id={`vid-source-${index}`}
                    label="Platform Video"
                    options={SOURCE_OPTIONS}
                    value={item.source}
                    onChange={(e) =>
                      updateItem({
                        ...item,
                        source: e.target.value as "youtube" | "tiktok",
                      })
                    }
                    required
                  />
                </div>
              </div>

              <InputField
                id={`vid-url-${index}`}
                label="Embed URL Iframe"
                value={item.embedUrl}
                onChange={(e) =>
                  updateItem({ ...item, embedUrl: e.target.value })
                }
                hint="Contoh: https://www.youtube.com/embed/XXXXX"
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
