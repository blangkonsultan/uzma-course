"use client";

import { useState, useTransition } from "react";
import { InputField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { NavbarContent, NavbarNavLink } from "@/types/landing";

interface NavbarFormProps {
  initialData: NavbarContent;
}

export function NavbarForm({ initialData }: NavbarFormProps) {
  const [data, setData] = useState<NavbarContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("navbar", formData);
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
          Pengaturan Header & Brand
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="brandName"
            label="Nama Brand (Header)"
            value={data.brandName}
            onChange={(e) => setData({ ...data, brandName: e.target.value })}
            required
          />
          <InputField
            id="ctaText"
            label="Teks Tombol Aksi Header"
            value={data.ctaText}
            onChange={(e) => setData({ ...data, ctaText: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <SortableItemList<NavbarNavLink>
          title="Tautan Navigasi (Menu Header)"
          description="Menu tautan cepat di bagian atas halaman website"
          items={data.navLinks}
          onItemsChange={(navLinks) => setData({ ...data, navLinks })}
          createEmptyItem={() => ({ label: "Menu Baru", href: "#" })}
          itemLabel={(item) => `${item.label} (${item.href})`}
          addButtonText="Tambah Menu Navigasi"
          renderItem={(item, index, updateItem) => (
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                id={`nav-label-${index}`}
                label="Label Menu"
                value={item.label}
                onChange={(e) => updateItem({ ...item, label: e.target.value })}
                required
              />
              <InputField
                id={`nav-href-${index}`}
                label="Tautan (Href Anchor / URL)"
                value={item.href}
                onChange={(e) => updateItem({ ...item, href: e.target.value })}
                hint="Contoh: #programs atau /login"
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
