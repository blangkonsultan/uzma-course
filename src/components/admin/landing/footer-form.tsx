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
            return `${item.label || cfg.label} (${item.url || "Belum ada tautan"})`;
          }}
          addButtonText="Tambah Akun Media Sosial"
          renderItem={(item, index, updateItem) => {
            const config = getSocialPlatformConfig(item.platform);

            return (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                        <SocialIcon platform={item.platform} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Pratinjau: {config.label}
                      </span>
                    </div>
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
                      required
                    />
                  </div>

                  <InputField
                    id={`social-label-${index}`}
                    label="Nama / Label Tampilan (Opsional)"
                    value={item.label || ""}
                    onChange={(e) =>
                      updateItem({ ...item, label: e.target.value })
                    }
                    placeholder={config.label}
                    hint="Nama akun atau teks tooltip yang muncul saat hover"
                  />
                </div>

                <InputField
                  id={`social-url-${index}`}
                  label="Tautan Profil / URL"
                  value={item.url}
                  onChange={(e) =>
                    updateItem({ ...item, url: e.target.value })
                  }
                  placeholder={config.placeholder}
                  hint={config.hint}
                  required
                />
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
