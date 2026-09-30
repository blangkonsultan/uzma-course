"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { InputField, TextareaField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { LocationsContent, BranchItem } from "@/types/landing";

interface LocationsFormProps {
  initialData: LocationsContent;
}

export function LocationsForm({ initialData }: LocationsFormProps) {
  const [data, setData] = useState<LocationsContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("locations", formData);
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
          Judul Section Lokasi
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
        <SortableItemList<BranchItem>
          title="Daftar Cabang / Unit Belajar"
          description="Alamat cabang, link peta Google Maps, dan URL embed iframe"
          items={data.items}
          onItemsChange={(items) => setData({ ...data, items })}
          createEmptyItem={() => ({
            id: `cabang-${Date.now()}`,
            name: "Cabang Baru",
            subName: "Ahe Unit Baru",
            address: "Alamat lengkap unit bimbingan...",
            mapUrl: "",
            gmapsUrl: "",
          })}
          itemLabel={(item) => `${item.name} (${item.subName})`}
          addButtonText="Tambah Cabang Baru"
          renderItem={(item, index, updateItem) => (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <InputField
                  id={`loc-name-${index}`}
                  label="Nama Cabang"
                  value={item.name}
                  onChange={(e) =>
                    updateItem({ ...item, name: e.target.value })
                  }
                  hint="Contoh: Cabang Balongbendo"
                  required
                />
                <InputField
                  id={`loc-sub-${index}`}
                  label="Sub-nama Unit"
                  value={item.subName}
                  onChange={(e) =>
                    updateItem({ ...item, subName: e.target.value })
                  }
                  hint="Contoh: Ahe Sumokembangsri"
                  required
                />
                <InputField
                  id={`loc-id-${index}`}
                  label="Kode ID Cabang"
                  value={item.id}
                  onChange={(e) =>
                    updateItem({ ...item, id: e.target.value.toLowerCase().trim() })
                  }
                  hint="balongbendo / krian / dll"
                  required
                />
              </div>

              <TextareaField
                id={`loc-addr-${index}`}
                label="Alamat Lengkap"
                value={item.address}
                onChange={(e) =>
                  updateItem({ ...item, address: e.target.value })
                }
                rows={2}
                required
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <InputField
                  id={`loc-map-${index}`}
                  label="Google Maps Embed URL (Iframe)"
                  value={item.mapUrl}
                  onChange={(e) =>
                    updateItem({ ...item, mapUrl: e.target.value })
                  }
                  hint="URL embed (https://www.google.com/maps?q=...&output=embed)"
                />
                <InputField
                  id={`loc-gmaps-${index}`}
                  label="Tautan Langsung Google Maps"
                  value={item.gmapsUrl}
                  onChange={(e) =>
                    updateItem({ ...item, gmapsUrl: e.target.value })
                  }
                  hint="Contoh: https://maps.app.goo.gl/..."
                />
              </div>
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
