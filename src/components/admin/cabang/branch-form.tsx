"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createBranch, updateBranch } from "@/app/admin/cabang/actions";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { showToast } from "@/components/admin/toast";
import type { Branch } from "@/types";

interface BranchFormProps {
  initialData?: Branch;
  isEdit?: boolean;
}

export function BranchForm({ initialData, isEdit = false }: BranchFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    sub_name: initialData?.sub_name || "",
    address: initialData?.address || "",
    map_embed_url: initialData?.map_embed_url || "",
    gmaps_url: initialData?.gmaps_url || "",
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!isEdit) {
      const trimmedId = formData.id.trim().toLowerCase();
      if (!trimmedId || trimmedId.length < 2 || !/^[a-z0-9-]+$/.test(trimmedId)) {
        errors.id =
          "ID cabang minimal 2 karakter dan hanya boleh berisi huruf kecil, angka, dan strip (contoh: balongbendo).";
      }
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Nama cabang minimal 2 karakter.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        if (!isEdit) {
          fd.append("id", formData.id.trim().toLowerCase());
        }
        fd.append("name", formData.name.trim());
        fd.append("sub_name", formData.sub_name.trim());
        fd.append("address", formData.address.trim());
        fd.append("map_embed_url", formData.map_embed_url.trim());
        fd.append("gmaps_url", formData.gmaps_url.trim());
        if (isEdit) {
          fd.append("is_active", String(formData.is_active));
        }

        const res = isEdit && initialData
          ? await updateBranch(initialData.id, fd)
          : await createBranch(fd);

        if (res?.fieldErrors) {
          setFieldErrors(res.fieldErrors);
          const firstError = Object.values(res.fieldErrors)[0];
          if (firstError) showToast(firstError, "error");
        } else if (res?.error) {
          showToast(res.error, "error");
        }
      } catch (err: unknown) {
        const isRedirect =
          (err instanceof Error && err.message === "NEXT_REDIRECT") ||
          (err !== null &&
            typeof err === "object" &&
            "digest" in err &&
            typeof err.digest === "string" &&
            err.digest.startsWith("NEXT_REDIRECT"));

        if (isRedirect) {
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

  const cancelHref = isEdit && initialData ? `/admin/cabang/${initialData.id}` : "/admin/cabang";

  return (
    <Card className="max-w-2xl border border-slate-200/80 shadow-xs">
      <CardBody className="p-4 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Identitas Cabang */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Identitas Cabang
            </h3>

            <InputField
              id="id"
              name="id"
              label="ID Unik Cabang"
              required={!isEdit}
              disabled={isEdit || isPending}
              placeholder="Contoh: balongbendo, krian, sidoarjo-kota"
              value={formData.id}
              onChange={(e) => updateField("id", e.target.value.toLowerCase())}
              error={fieldErrors.id}
              hint={
                isEdit
                  ? "ID cabang tidak dapat diubah setelah dibuat."
                  : "ID unik cabang (huruf kecil, angka, strip). Contoh: balongbendo"
              }
            />

            <InputField
              id="name"
              name="name"
              label="Nama Cabang"
              required
              disabled={isPending}
              placeholder="Contoh: Cabang Balongbendo"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={fieldErrors.name}
            />

            <InputField
              id="sub_name"
              name="sub_name"
              label="Sub-Nama / Unit Sentra"
              disabled={isPending}
              placeholder="Contoh: Ahe Sumokembangsri"
              value={formData.sub_name}
              onChange={(e) => updateField("sub_name", e.target.value)}
              error={fieldErrors.sub_name}
              hint="Nama unit, sentra, atau keterangan pelengkap cabang (opsional)."
            />

            <TextareaField
              id="address"
              name="address"
              label="Alamat Lengkap"
              rows={3}
              disabled={isPending}
              placeholder="Contoh: Perum Graha Sumokembangsri Blok B-03, Balongbendo, Sidoarjo"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              error={fieldErrors.address}
              hint="Alamat detail lokasi bimbingan belajar cabang ini."
            />
          </div>

          {/* Lokasi & Peta */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Lokasi & Peta
            </h3>

            <InputField
              id="map_embed_url"
              name="map_embed_url"
              label="URL Embed Google Maps"
              type="text"
              disabled={isPending}
              placeholder="https://www.google.com/maps?q=...&output=embed"
              value={formData.map_embed_url}
              onChange={(e) => updateField("map_embed_url", e.target.value)}
              error={fieldErrors.map_embed_url}
              hint="URL iframe embed dari Google Maps untuk ditampilkan pada peta interaktif."
            />

            <InputField
              id="gmaps_url"
              name="gmaps_url"
              label="Link Navigasi Google Maps"
              type="text"
              disabled={isPending}
              placeholder="https://maps.app.goo.gl/..."
              value={formData.gmaps_url}
              onChange={(e) => updateField("gmaps_url", e.target.value)}
              error={fieldErrors.gmaps_url}
              hint="Link Google Maps untuk navigasi langsung di HP atau browser."
            />
          </div>

          {/* Status (Edit Mode Only) */}
          {isEdit && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Status Operasional
              </h3>

              <SelectField
                id="is_active"
                name="is_active"
                label="Status Cabang"
                disabled={isPending}
                value={String(formData.is_active)}
                onChange={(e) => updateField("is_active", e.target.value === "true")}
                options={[
                  { value: "true", label: "Aktif" },
                  { value: "false", label: "Non-aktif" },
                ]}
                hint="Cabang non-aktif tidak akan muncul pada pilihan pendaftaran murid baru atau penempatan guru."
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              href={cancelHref}
              disabled={isPending}
              className="w-full sm:w-auto justify-center min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto justify-center min-h-[44px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Perbarui Cabang" : "Simpan Cabang"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
