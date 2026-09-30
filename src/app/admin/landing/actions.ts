"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LandingSectionKey } from "@/types/landing";
import type { Json } from "@/types/database";

const VALID_SECTIONS: readonly LandingSectionKey[] = [
  "hero",
  "programs",
  "why_us",
  "facilities",
  "team",
  "testimonials",
  "videos",
  "locations",
  "faq",
  "cta",
  "footer",
  "navbar",
  "floating_wa",
] as const;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Hanya admin yang memiliki izin untuk operasi ini.");
  }

  return { user, supabase };
}

export async function updateLandingSection(
  section: string,
  formData: FormData
): Promise<{ error?: string } | void> {
  const { user, supabase } = await requireAdmin();

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
    const { error: dbError } = await supabase
      .from("landing_content")
      .upsert({
        section,
        content: content as Json,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      });

    if (dbError) {
      return { error: `Gagal menyimpan ke database: ${dbError.message}` };
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

export async function resolveTikTokShortlink(
  shortUrl: string
): Promise<{ videoId?: string; error?: string }> {
  await requireAdmin();

  if (!shortUrl || !shortUrl.includes("tiktok.com")) {
    return { error: "Link TikTok tidak valid." };
  }

  try {
    const res = await fetch(shortUrl.trim(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    const finalUrl = res.url;
    const match = finalUrl.match(/\/video\/(\d{15,22})/);
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
