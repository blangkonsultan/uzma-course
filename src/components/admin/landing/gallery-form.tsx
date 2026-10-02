"use client";

import { useState, useTransition } from "react";
import { InputField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import { normalizeImageUrl } from "@/lib/utils";
import { ImageIcon, Plus, Trash2, Image as ImageLucide } from "lucide-react";
import type { GalleryContent, GalleryGroup, GalleryImage } from "@/types/landing";

interface GalleryFormProps {
  initialData: GalleryContent;
}

export function GalleryForm({ initialData }: GalleryFormProps) {
  const [data, setData] = useState<GalleryContent>({
    title: initialData?.title ?? "Galeri",
    subtitle:
      initialData?.subtitle ??
      "Dokumentasi kegiatan belajar, wisuda, dan lisensi di Uzma Course",
    groups: initialData?.groups ?? [
      { label: "Lisensi", images: [] },
      { label: "Wisuda", images: [] },
      { label: "Kegiatan Guru dan Murid", images: [] },
    ],
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("gallery", formData);
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

      {/* Section Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ImageLucide className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-800 font-heading">
            Judul Section Galeri
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="title"
            label="Judul Section"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Galeri"
            required
          />
          <InputField
            id="subtitle"
            label="Sub-judul Section"
            value={data.subtitle}
            onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            placeholder="Dokumentasi kegiatan belajar..."
            required
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <SortableItemList<GalleryGroup>
          title="Kategori & Grup Foto"
          description="Atur kategori galeri (misal Lisensi, Wisuda, Kegiatan Guru dan Murid) beserta koleksi foto di dalamnya."
          items={data.groups}
          onItemsChange={(groups) => setData({ ...data, groups })}
          createEmptyItem={() => ({
            label: "Kategori Baru",
            images: [],
          })}
          itemLabel={(group) =>
            `${group.label || "Kategori Tanpa Nama"} (${group.images.length} Foto)`
          }
          addButtonText="Tambah Kategori Galeri"
          renderItem={(group, groupIndex, updateGroup) => {
            const handleAddImage = () => {
              updateGroup({
                ...group,
                images: [...group.images, { url: "", alt: "" }],
              });
            };

            const handleUpdateImage = (
              imgIndex: number,
              updatedImg: GalleryImage
            ) => {
              const newImages = [...group.images];
              newImages[imgIndex] = updatedImg;
              updateGroup({ ...group, images: newImages });
            };

            const handleRemoveImage = (imgIndex: number) => {
              updateGroup({
                ...group,
                images: group.images.filter((_, i) => i !== imgIndex),
              });
            };

            return (
              <div className="space-y-4">
                <InputField
                  id={`group-label-${groupIndex}`}
                  label="Nama Kategori / Label Grup"
                  value={group.label}
                  onChange={(e) =>
                    updateGroup({ ...group, label: e.target.value })
                  }
                  placeholder="Contoh: Lisensi, Wisuda, Kegiatan Guru dan Murid"
                  required
                />

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Daftar Foto ({group.images.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Foto
                    </button>
                  </div>

                  {group.images.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500">
                        Belum ada foto dalam kategori ini.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        + Tambah foto pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.images.map((img, imgIndex) => {
                        const previewUrl = normalizeImageUrl(img.url);
                        return (
                          <div
                            key={imgIndex}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                          >
                            {/* Thumbnail preview */}
                            <div className="w-16 h-16 min-w-16 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={previewUrl}
                                  alt={img.alt || "Preview foto"}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                              )}
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  URL Gambar (Google Drive, Imgur, lokal, dll)
                                </label>
                                <input
                                  type="text"
                                  value={img.url}
                                  onChange={(e) =>
                                    handleUpdateImage(imgIndex, {
                                      ...img,
                                      url: e.target.value,
                                    })
                                  }
                                  onBlur={(e) =>
                                    handleUpdateImage(imgIndex, {
                                      ...img,
                                      url: normalizeImageUrl(e.target.value),
                                    })
                                  }
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white text-slate-800"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Teks Alt (Aksesibilitas / Keterangan)
                                </label>
                                <input
                                  type="text"
                                  value={img.alt}
                                  onChange={(e) =>
                                    handleUpdateImage(imgIndex, {
                                      ...img,
                                      alt: e.target.value,
                                    })
                                  }
                                  placeholder="Contoh: Wisuda kelulusan AHE 2024"
                                  className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white text-slate-800"
                                />
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgIndex)}
                              className="self-end sm:self-center w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-lg transition-colors"
                              title="Hapus foto ini"
                              aria-label="Hapus foto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Submit controls */}
      <FormActions isPending={isPending} />
    </form>
  );
}
