"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { InputField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { updateLandingSection } from "@/app/admin/landing/actions";
import type { FooterContent, FooterNavLink } from "@/types/landing";

interface FooterFormProps {
  initialData: FooterContent;
}

export function FooterForm({ initialData }: FooterFormProps) {
  const [data, setData] = useState<FooterContent>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("payload", JSON.stringify(data));

    startTransition(async () => {
      const res = await updateLandingSection("footer", formData);
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

      {/* Brand & Contacts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Informasi Footer & Kontak
        </h2>

        <InputField
          id="tagline"
          label="Tagline Footer"
          value={data.tagline}
          onChange={(e) => setData({ ...data, tagline: e.target.value })}
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="contactPhone"
            label="Nomor WhatsApp Format Internasional"
            value={data.contactPhone}
            onChange={(e) =>
              setData({ ...data, contactPhone: e.target.value })
            }
            hint="Contoh: 6285730332379 (tanpa tanda +)"
            required
          />
          <InputField
            id="contactWaDisplay"
            label="Nomor WhatsApp Tampilan (Display)"
            value={data.contactWaDisplay}
            onChange={(e) =>
              setData({ ...data, contactWaDisplay: e.target.value })
            }
            hint="Contoh: 085730332379"
            required
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
          Media Sosial Resmi
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            id="instagram"
            label="Tautan Instagram"
            value={data.socialLinks.instagram}
            onChange={(e) =>
              setData({
                ...data,
                socialLinks: {
                  ...data.socialLinks,
                  instagram: e.target.value,
                },
              })
            }
            hint="https://instagram.com/..."
            required
          />
          <InputField
            id="facebook"
            label="Tautan Facebook"
            value={data.socialLinks.facebook}
            onChange={(e) =>
              setData({
                ...data,
                socialLinks: {
                  ...data.socialLinks,
                  facebook: e.target.value,
                },
              })
            }
            hint="https://facebook.com/..."
            required
          />
        </div>
      </div>

      {/* Footer Nav Links */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <SortableItemList<FooterNavLink>
          title="Tautan Navigasi Footer"
          description="Daftar tautan menu di kolom footer bawah"
          items={data.navLinks}
          onItemsChange={(navLinks) => setData({ ...data, navLinks })}
          createEmptyItem={() => ({
            label: "Tautan Baru",
            href: "#",
          })}
          itemLabel={(item) => `${item.label} (${item.href})`}
          addButtonText="Tambah Tautan Footer"
          renderItem={(item, index, updateItem) => (
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                id={`footer-label-${index}`}
                label="Label Tautan"
                value={item.label}
                onChange={(e) =>
                  updateItem({ ...item, label: e.target.value })
                }
                required
              />
              <InputField
                id={`footer-href-${index}`}
                label="Tautan (Href / Anchor)"
                value={item.href}
                onChange={(e) =>
                  updateItem({ ...item, href: e.target.value })
                }
                hint="Contoh: #programs atau /admin"
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
