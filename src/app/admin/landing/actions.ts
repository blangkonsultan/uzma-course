"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAction } from "@/lib/auth";
import { upsertLandingSection } from "@/lib/landing";


import type { LandingSectionKey } from "@/types/landing";
 

const VALID_SECTIONS: readonly LandingSectionKey[] = [
  "hero",
  "programs",
  "why_us",
  "facilities",
  "team",
  "gallery",
  "testimonials",
  "videos",
  "locations",
  "faq",
  "cta",
  "footer",
  "navbar",
  "floating_wa",
] as const;



export async function updateLandingSection(
  section: string,
  formData: FormData
): Promise<{ error?: string } | void> {
  const { user } = await requireAdminAction();

  if (!VALID_SECTIONS.includes(section as LandingSectionKey)) {
    return { error: `Bagian "${section}" tidak valid.` };
  }

  let content: unknown;

  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw === "string" && payloadRaw.trim().length > 0) {
    try {
      content = JSON.parse(payloadRaw);
    } catch {
      return { error: "Payload data tidak valid (gagal parsing JSON)." };
    }
  } else {
    // Fallback extraction for simple key-value forms
    const entries = Array.from(formData.entries());
    const obj: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      if (k.startsWith("$") || k === "section") continue;
      obj[k] = v;
    }
    content = obj;
  }

  if (!content || typeof content !== "object") {
    return { error: "Konten yang dikirimkan tidak valid." };
  }

  try {
    const { error: dbError } = await upsertLandingSection(section, content, user.id);
    
    if (dbError) {
      return { error: dbError };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: msg };
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
  revalidatePath(`/admin/landing/${section}`);
  redirect("/admin/landing?success=updated");
}

const ALLOWED_TIKTOK_HOSTS: Record<string, true> = {
  "tiktok.com": true,
  "www.tiktok.com": true,
  "vt.tiktok.com": true,
  "vm.tiktok.com": true,
  "m.tiktok.com": true,
};

export async function resolveTikTokShortlink(
  shortUrl: string
): Promise<{ videoId?: string; error?: string }> {
  await requireAdminAction();

  if (!shortUrl || typeof shortUrl !== "string") {
    return { error: "Tautan TikTok tidak boleh kosong." };
  }

  let parsed: URL;
  try {
    parsed = new URL(shortUrl.trim());
  } catch {
    return { error: "Format URL tidak valid." };
  }

  if (parsed.protocol !== "https:") {
    return { error: "Protokol tautan harus menggunakan HTTPS." };
  }

  if (ALLOWED_TIKTOK_HOSTS[parsed.hostname.toLowerCase()] !== true) {
    return {
      error:
        "Tautan harus berasal dari domain resmi TikTok (tiktok.com, vt.tiktok.com, vm.tiktok.com).",
    };
  }

  if (parsed.username || parsed.password) {
    return { error: "Tautan tidak boleh memuat kredensial pengguna." };
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    const finalParsed = new URL(res.url);
    if (
      finalParsed.protocol !== "https:" ||
      finalParsed.username ||
      finalParsed.password ||
      ALLOWED_TIKTOK_HOSTS[finalParsed.hostname.toLowerCase()] !== true
    ) {
      return { error: "Pengalihan tautan mengarah ke domain di luar TikTok." };
    }

    const match = finalParsed.pathname.match(/\/video\/(\d{15,22})(?:\/|$)/);
    if (match && match[1]) {
      return { videoId: match[1] };
    }

    return {
      error:
        "Tidak dapat mengekstrak ID video dari tautan tersebut. Pastikan video bersifat publik.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal menghubungkan ke server TikTok.";
    return { error: msg };
  }
}
