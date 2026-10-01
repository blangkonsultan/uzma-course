"use client";

import { useState, useTransition } from "react";
import { InputField, SelectField } from "@/components/admin/form-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { FormActions } from "@/components/admin/landing/form-actions";
import { updateLandingSection } from "@/app/admin/landing/actions";
import { normalizeSocialLinks } from "@/lib/landing-content";
import {
  SocialIcon,
  SOCIAL_PLATFORMS,
  getSocialPlatformConfig,
} from "@/components/ui/social-icon";
import type {
  FooterContent,
  FooterNavLink,
  SocialMediaItem,
  SocialPlatform,
} from "@/types/landing";

interface FooterFormProps {
  initialData: FooterContent;
}

export function FooterForm({ initialData }: FooterFormProps) {
  const [data, setData] = useState<FooterContent>(() => ({
    ...initialData,
    socialLinks: normalizeSocialLinks(initialData.socialLinks),
  }));
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
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

      {/* Dynamic Social Media Links */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <SortableItemList<SocialMediaItem>
          title="Media Sosial Resmi"
          description="Daftar tautan akun media sosial yang tampil pada footer website"
          items={data.socialLinks || []}
          onItemsChange={(socialLinks) => setData({ ...data, socialLinks })}
          createEmptyItem={() => ({
            platform: "instagram",
            label: "Instagram",
            url: "",
          })}
          itemLabel={(item) => {
            const cfg = getSocialPlatformConfig(item.platform);
            const hasCustomLabel = item.label && item.label !== cfg.label;
            const cleanUrl = item.url
              ? item.url.replace(/^https?:\/\/(www\.)?/, "").split("?")[0]
              : "Belum ada tautan";
            return `${cfg.label}${hasCustomLabel ? ` (${item.label})` : ""} — ${cleanUrl}`;
          }}
          addButtonText="Tambah Akun Media Sosial"
          renderItem={(item, index, updateItem) => {
            const config = getSocialPlatformConfig(item.platform);

            return (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 items-start">
                  <SelectField
                    id={`social-platform-${index}`}
                    label="Platform Media Sosial"
                    value={item.platform}
                    onChange={(e) => {
                      const newPlatform = e.target.value as SocialPlatform;
                      const newCfg = getSocialPlatformConfig(newPlatform);
                      updateItem({
                        ...item,
                        platform: newPlatform,
                        label:
                          !item.label || item.label === config.label
                            ? newCfg.label
                            : item.label,
                      });
                    }}
                    options={SOCIAL_PLATFORMS.map((p) => ({
                      value: p.id,
                      label: p.label,
                    }))}
                    hint="Pilih jenis platform media sosial"
                    required
                  />

                  <InputField
                    id={`social-label-${index}`}
                    label="Nama / Label Tampilan (Opsional)"
                    value={item.label || ""}
                    onChange={(e) =>
                      updateItem({ ...item, label: e.target.value })
                    }
                    placeholder={config.label}
                    hint="Teks tooltip yang muncul saat ikon disentuh/hover"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`social-url-${index}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Tautan Profil / URL
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className="flex rounded-xl shadow-xs overflow-hidden">
                    <span className="inline-flex items-center gap-2 px-3.5 border border-r-0 border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold shrink-0">
                      <SocialIcon platform={item.platform} className="w-4 h-4 text-slate-800" />
                      <span>{config.label}</span>
                    </span>
                    <input
                      id={`social-url-${index}`}
                      type="url"
                      value={item.url}
                      onChange={(e) =>
                        updateItem({ ...item, url: e.target.value })
                      }
                      placeholder={config.placeholder}
                      required
                      className="block w-full min-w-0 flex-1 border border-slate-200 px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500">{config.hint}</p>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Footer Nav Links */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
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
                label="Target URL / Anchor"
                value={item.href}
                onChange={(e) =>
                  updateItem({ ...item, href: e.target.value })
                }
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
