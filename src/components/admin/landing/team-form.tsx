"use client";

import { useState, useTransition } from "react";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/admin/form-field";
import { ImageUrlField } from "@/components/admin/landing/image-url-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { Users } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { TeamContent, TeamValueItem } from "@/types/landing";

const VALUE_ICONS = [
  { value: "Heart", label: "Heart (Tanpa Trauma / Ramah)" },
  { value: "Award", label: "Award (Berlisensi / Sejak 2022)" },
  { value: "Sparkles", label: "Sparkles (Bintang Ceria)" },
  { value: "Users", label: "Users (Pendampingan Personal)" },
  { value: "ShieldCheck", label: "ShieldCheck (Aman & Terpercaya)" },
  { value: "Star", label: "Star (Prestasi Belajar)" },
];

interface TeamFormProps {
  initialData: TeamContent;
}

export function TeamForm({ initialData }: TeamFormProps) {
  const [data, setData] = useState<TeamContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("team", formData);
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
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Judul Section Tim & Pengelola
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

      {/* Team Photo Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-primary-600" />
          <h2 className="text-base font-bold text-slate-800 font-heading">
            Kartu Foto & Tim Pengajar
          </h2>
        </div>

        <ImageUrlField
          idPrefix="team-photo"
          label="Foto Tim Pengajar"
          value={data.teamPhotoUrl}
          onChange={(url) => setData({ ...data, teamPhotoUrl: url })}
          altValue={data.teamPhotoAlt}
          onAltChange={(alt) => setData({ ...data, teamPhotoAlt: alt })}
          hint="Rasio 4:3 landscape, min 800×600px. Format JPG/PNG/WebP."
          previewAspect="aspect-[4/3]"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="teamBadge"
            label="Badge Teks Kartu"
            value={data.teamBadge}
            onChange={(e) => setData({ ...data, teamBadge: e.target.value })}
            hint="Contoh: Tenaga Pengajar Berlisensi"
            required
          />
          <InputField
            id="teamHeading"
            label="Judul Kartu Tim"
            value={data.teamHeading}
            onChange={(e) => setData({ ...data, teamHeading: e.target.value })}
            hint="Contoh: Tim Pendidik Ramah & Berpengalaman"
            required
          />
        </div>

        <TextareaField
          id="teamDescription"
          label="Deskripsi Tim Pengajar"
          value={data.teamDescription}
          onChange={(e) =>
            setData({ ...data, teamDescription: e.target.value })
          }
          rows={3}
          required
        />
      </div>

      {/* Founder Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Profil Pendiri / Pengelola
        </h2>

        <ImageUrlField
          idPrefix="founder-photo"
          label="Foto Pengelola"
          value={data.founderPhotoUrl || ""}
          onChange={(url) => setData({ ...data, founderPhotoUrl: url })}
          altValue={data.founderPhotoAlt || ""}
          onAltChange={(alt) => setData({ ...data, founderPhotoAlt: alt })}
          hint="Rasio 1:1 persegi atau portrait, min 400×400px. Format JPG/PNG/WebP. Kosongkan untuk menggunakan fallback foto kartun AI wanita berhijab."
          previewAspect="aspect-square"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="founderName"
            label="Nama Lengkap & Gelar"
            value={data.founderName}
            onChange={(e) => setData({ ...data, founderName: e.target.value })}
            required
          />
          <InputField
            id="founderRole"
            label="Peran / Jabatan"
            value={data.founderRole}
            onChange={(e) => setData({ ...data, founderRole: e.target.value })}
            hint="Contoh: Pengelola Ahe SumoWangi / Uzma Course"
            required
          />
        </div>

        <TextareaField
          id="founderQuote"
          label="Kutipan Komitmen / Bio"
          value={data.founderQuote}
          onChange={(e) => setData({ ...data, founderQuote: e.target.value })}
          rows={3}
          required
        />
      </div>

      {/* Values Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <SortableItemList<TeamValueItem>
          title="Nilai & Komitmen Pengajaran"
          description="Kartu nilai plus di samping profil pendiri (misal: Tanpa Trauma, Sejak 2022)"
          items={data.values}
          onItemsChange={(values) => setData({ ...data, values })}
          createEmptyItem={() => ({
            title: "Nilai Baru",
            description: "Deskripsi singkat nilai pengajaran.",
            icon: "Heart",
          })}
          itemLabel={(item) => item.title}
          addButtonText="Tambah Kartu Nilai"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-3 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <InputField
                    id={`val-title-${index}`}
                    label="Judul Nilai"
                    value={item.title}
                    onChange={(e) =>
                      updateItem({ ...item, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <SelectField
                    id={`val-icon-${index}`}
                    label="Ikon"
                    options={VALUE_ICONS}
                    value={item.icon}
                    onChange={(e) =>
                      updateItem({ ...item, icon: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <TextareaField
                id={`val-desc-${index}`}
                label="Deskripsi Singkat"
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

      {/* Gallery Collage */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Galeri Kegiatan & Wisuda
        </h2>

        <ImageUrlField
          idPrefix="gallery-photo"
          label="Foto Kolase Galeri"
          value={data.galleryImageUrl}
          onChange={(url) => setData({ ...data, galleryImageUrl: url })}
          altValue={data.galleryImageAlt}
          onAltChange={(alt) => setData({ ...data, galleryImageAlt: alt })}
          hint="Rasio 16:9 hingga 21:9 panorama, min 1200×675px. Format JPG/PNG/WebP."
          previewAspect="aspect-[21/9]"
        />

        <TextareaField
          id="galleryCaption"
          label="Keterangan Galeri (Caption Bawah)"
          value={data.galleryCaption}
          onChange={(e) =>
            setData({ ...data, galleryCaption: e.target.value })
          }
          rows={2}
          required
        />
      </div>

      {/* Submit controls */}
      <FormActions isPending={isPending} />
    </form>
  );
}
