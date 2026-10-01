"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createProgram, updateProgram } from "@/app/admin/program/actions";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/admin/form-field";
import { IconSelectField } from "@/components/admin/landing/icon-select-field";
import { LogoUploadField } from "@/components/admin/landing/logo-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import { formatClassRatio, formatDuration, formatFrequency } from "@/lib/utils";
import type { Program } from "@/types";

interface ProgramFormProps {
  initialData?: Program;
  isEdit?: boolean;
}

export function ProgramForm({ initialData, isEdit = false }: ProgramFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    initials: initialData?.initials || "",
    name: initialData?.name || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    age_range: initialData?.age_range || "",
    icon: initialData?.icon || "BookOpen",
    type: (initialData?.type || "original") as "franchise" | "original",
    logo_url: initialData?.logo_url || "",
    license_provider: initialData?.license_provider || "",
    license_url: initialData?.license_url || "",
    license_description: initialData?.license_description || "",
    system: initialData?.system ?? 2,
    duration: initialData?.duration ?? 30,
    frequency: initialData?.frequency ?? 3,
    features: initialData?.features || [""],
    sort_order: initialData?.sort_order ?? 0,
    is_active: initialData?.is_active ?? true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleFeatureChange(index: number, val: string) {
    const nextFeatures = [...formData.features];
    nextFeatures[index] = val;
    setFormData((prev) => ({ ...prev, features: nextFeatures }));
  }

  function addFeature() {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }

  function removeFeature(index: number) {
    if (formData.features.length <= 1) {
      setFormData((prev) => ({ ...prev, features: [""] }));
      return;
    }
    const nextFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: nextFeatures }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!isEdit && (!formData.initials.trim() || formData.initials.trim().length < 2)) {
      errors.initials = "Inisial program minimal 2 karakter (contoh: AHE, ASE).";
    }
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Nama program minimal 2 karakter.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      try {
        const data = new FormData();
        if (!isEdit) {
          data.append("initials", formData.initials.trim().toUpperCase());
        }
        data.append("name", formData.name.trim());
        data.append("tagline", formData.tagline.trim());
        data.append("description", formData.description.trim());
        data.append("age_range", formData.age_range.trim());
        data.append("icon", formData.icon);
        data.append("type", formData.type);
        data.append("logo_url", formData.logo_url.trim());
        data.append("license_provider", formData.license_provider.trim());
        data.append("license_url", formData.license_url.trim());
        data.append("license_description", formData.license_description.trim());
        data.append("system", formData.system.toString());
        data.append("duration", formData.duration.toString());
        data.append("frequency", formData.frequency.toString());
        data.append("sort_order", formData.sort_order.toString());
        formData.features
          .filter((f) => f.trim().length > 0)
          .forEach((f) => data.append("features", f.trim()));

        let res;
        if (isEdit && initialData) {
          data.append("is_active", formData.is_active ? "true" : "false");
          res = await updateProgram(initialData.id, data);
        } else {
          res = await createProgram(data);
        }

        if (res?.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        if (res?.error) {
          showToast(res.error, "error");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          throw err;
        }
        showToast(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses data.",
          "error"
        );
      }
    });
  }

  return (
    <Card className="max-w-3xl border border-slate-200/80 shadow-xs">
      <CardBody className="p-4 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Section 1: Identitas Pokok Program */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Identitas Master Program
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="initials"
                name="initials"
                label="Inisial Program"
                required
                placeholder="Contoh: AHE, ASE, BEE, MAPEL"
                value={formData.initials}
                onChange={(e) => updateField("initials", e.target.value.toUpperCase())}
                error={fieldErrors.initials}
                disabled={isPending || isEdit}
                hint={isEdit ? "Inisial unik tidak dapat diubah setelah dibuat." : "Inisial unik huruf kapital."}
              />

              <InputField
                id="name"
                name="name"
                label="Nama Lengkap Program"
                required
                placeholder="Contoh: Les Baca Tulis (AHE)"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                error={fieldErrors.name}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id="type"
                name="type"
                label="Kategori / Tipe Program"
                required
                options={[
                  { value: "franchise", label: "Program Franchise (Berlisensi)" },
                  { value: "original", label: "Program Original Uzma Course" },
                ]}
                value={formData.type}
                onChange={(e) =>
                  updateField("type", e.target.value as "franchise" | "original")
                }
                disabled={isPending}
              />

              <InputField
                id="sort_order"
                name="sort_order"
                type="number"
                label="Urutan Tampil (Sort Order)"
                value={formData.sort_order}
                onChange={(e) =>
                  updateField("sort_order", parseInt(e.target.value, 10) || 0)
                }
                disabled={isPending}
                hint="0 untuk urutan pertama, 1 kedua, dst."
              />
            </div>

            <InputField
              id="tagline"
              name="tagline"
              label="Tagline Singkat"
              placeholder="Contoh: Belajar Baca & Tulis Cepat dan Menyenangkan"
              value={formData.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              disabled={isPending}
            />

            <TextareaField
              id="description"
              name="description"
              label="Deskripsi Program"
              placeholder="Jelaskan metode, keunggulan, dan pendekatan belajar program ini..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Section 2: Visual & Ikon */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Visual & Ikon Card
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IconSelectField
                id="icon"
                label="Pilih Ikon Lucide"
                value={formData.icon}
                onChange={(val) => updateField("icon", val)}
              />

              <InputField
                id="age_range"
                name="age_range"
                label="Target Usia Murid"
                placeholder="Contoh: Mulai 3,5 tahun / Siswa SD"
                value={formData.age_range}
                onChange={(e) => updateField("age_range", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Section 3: Informasi Lisensi & Logo Franchise (Conditional) */}
          {formData.type === "franchise" && (
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-primary-50/40 border border-primary-100">
              <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wider border-b border-primary-200/60 pb-2">
                Atribusi Franchise & Lisensi
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Logo Resmi Franchise
                </label>
                <LogoUploadField
                  programId={formData.initials.toLowerCase() || "prog"}
                  value={formData.logo_url || undefined}
                  onChange={(url) => updateField("logo_url", url || "")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="license_provider"
                  name="license_provider"
                  label="Nama Lembaga Pemegang Lisensi"
                  placeholder="Contoh: Ahe Indonesia"
                  value={formData.license_provider}
                  onChange={(e) => updateField("license_provider", e.target.value)}
                  disabled={isPending}
                />

                <InputField
                  id="license_url"
                  name="license_url"
                  label="URL Website / Official Franchisor (Opsional)"
                  placeholder="https://..."
                  value={formData.license_url}
                  onChange={(e) => updateField("license_url", e.target.value)}
                  disabled={isPending}
                />
              </div>

              <InputField
                id="license_description"
                name="license_description"
                label="Keterangan Lisensi (Opsional)"
                placeholder="Contoh: Unit Resmi Berlisensi Sidoarjo"
                value={formData.license_description}
                onChange={(e) => updateField("license_description", e.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          {/* Section 4: Sistem & Operasional Belajar */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Sistem Belajar & Jadwal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <InputField
                  id="system"
                  name="system"
                  label="Rasio Kelas (Maks. Murid)"
                  type="number"
                  placeholder="2"
                  min={1}
                  value={formData.system.toString()}
                  onChange={(e) => updateField("system", parseInt(e.target.value) || 0)}
                  error={fieldErrors.system}
                  hint={`Pratinjau: ${formatClassRatio(formData.system)}`}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <InputField
                  id="duration"
                  name="duration"
                  label="Durasi per Sesi (menit)"
                  type="number"
                  placeholder="30"
                  min={1}
                  value={formData.duration.toString()}
                  onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
                  error={fieldErrors.duration}
                  hint={`Pratinjau: ${formatDuration(formData.duration)}`}
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <InputField
                  id="frequency"
                  name="frequency"
                  label="Frekuensi Belajar (/ Minggu)"
                  type="number"
                  placeholder="3"
                  min={1}
                  value={formData.frequency.toString()}
                  onChange={(e) => updateField("frequency", parseInt(e.target.value) || 0)}
                  error={fieldErrors.frequency}
                  hint={`Pratinjau: ${formatFrequency(formData.frequency)}`}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Fitur & Fasilitas Program */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fasilitas & Fitur Unggulan
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                disabled={isPending}
                className="h-9 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fasilitas</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      placeholder={`Fasilitas ${idx + 1}, contoh: Buku Modul Eksklusif`}
                      disabled={isPending}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    disabled={isPending}
                    className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 transition-colors shrink-0 flex items-center justify-center"
                    title="Hapus fasilitas ini"
                    aria-label={`Hapus fasilitas ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Status Aktif (Edit Mode Only) */}
          {isEdit && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Status Program
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => updateField("is_active", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Program Aktif (Dapat dipilih pada pendaftaran murid & profil guru)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              href={isEdit && initialData ? `/admin/program/${initialData.id}` : "/admin/program"}
              disabled={isPending}
              className="w-full sm:w-auto justify-center h-11 sm:h-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto justify-center h-11 sm:h-10"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Perbarui Program" : "Simpan Program"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
