"use client";

import { useState } from "react";
import { InputField, SelectField } from "@/components/admin/form-field";
import { resolveTikTokShortlink } from "@/app/admin/landing/actions";
import {
  extractVideoId,
  buildEmbedUrl,
  VIDEO_PREFIXES,
} from "@/lib/video-helpers";
import type { VideoItem } from "@/types/landing";
import { Sparkles, Loader2, AlertCircle, ExternalLink, Play } from "lucide-react";

const SOURCE_OPTIONS = [
  { value: "youtube", label: "YouTube (Embed 16:9 Landscape)" },
  { value: "tiktok", label: "TikTok (Player 9:16 Vertikal)" },
];

export interface VideoItemEditorProps {
  item: VideoItem;
  index: number;
  updateItem: (item: VideoItem) => void;
}

export function VideoItemEditor({
  item,
  index,
  updateItem,
}: VideoItemEditorProps) {
  const currentId = extractVideoId(item.embedUrl, item.source);
  const [rawInput, setRawInput] = useState(currentId);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const prefix = VIDEO_PREFIXES[item.source];

  const handleSourceChange = (newSource: "youtube" | "tiktok") => {
    const cleanId = extractVideoId(rawInput, newSource);
    const newEmbed = cleanId ? buildEmbedUrl(cleanId, newSource) : "";
    updateItem({
      ...item,
      source: newSource,
      embedUrl: newEmbed,
    });
  };

  const handleIdChange = (val: string) => {
    setResolveError(null);

    // If it's a TikTok shortlink (vt.tiktok.com), keep the raw URL so user can trigger extract
    if (val.includes("vt.tiktok.com")) {
      setRawInput(val);
      return;
    }

    // Auto extract ID if full link was pasted
    const cleanId = extractVideoId(val, item.source);
    setRawInput(cleanId);

    const newEmbed = cleanId ? buildEmbedUrl(cleanId, item.source) : "";
    updateItem({
      ...item,
      embedUrl: newEmbed,
    });
  };

  const handleResolveShortlink = async () => {
    if (!rawInput.trim()) return;
    setIsResolving(true);
    setResolveError(null);

    try {
      const res = await resolveTikTokShortlink(rawInput);
      if (res?.error) {
        setResolveError(res.error);
      } else if (res?.videoId) {
        const cleanId = res.videoId;
        setRawInput(cleanId);
        updateItem({
          ...item,
          source: "tiktok",
          embedUrl: buildEmbedUrl(cleanId, "tiktok"),
        });
      }
    } catch {
      setResolveError("Gagal menghubungkan ke server untuk mengekstrak shortlink.");
    } finally {
      setIsResolving(false);
    }
  };

  const isShortlink = rawInput.includes("vt.tiktok.com");
  const cleanId = extractVideoId(rawInput, item.source);
  const hasValidVideo = Boolean(cleanId && cleanId.length >= 5 && !isShortlink);

  return (
    <div className="space-y-4 pt-2">
      {/* Title & Platform Selector */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <InputField
            id={`vid-title-${index}`}
            label="Judul Video"
            value={item.title}
            onChange={(e) => updateItem({ ...item, title: e.target.value })}
            placeholder="Contoh: Keseruan Belajar Membaca Level 1 di Ahe SumoWangi"
            required
          />
        </div>
        <div>
          <SelectField
            id={`vid-source-${index}`}
            label="Platform Video"
            options={SOURCE_OPTIONS}
            value={item.source}
            onChange={(e) =>
              handleSourceChange(e.target.value as "youtube" | "tiktok")
            }
            required
          />
        </div>
      </div>

      {/* ID Input with Locked Prefix */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={`vid-id-${index}`}
            className="block text-sm font-semibold text-slate-800"
          >
            ID Video ({item.source === "tiktok" ? "TikTok" : "YouTube"})
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            URL dasar dipatenkan otomatis
          </span>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 bg-white transition-all">
          <span
            className="inline-flex items-center px-3 sm:px-3.5 bg-slate-100 border-r border-slate-300 text-xs sm:text-sm font-mono text-slate-600 select-none shrink-0 truncate max-w-[150px] sm:max-w-none"
            title={prefix}
          >
            {prefix}
          </span>
          <input
            id={`vid-id-${index}`}
            type="text"
            value={rawInput}
            onChange={(e) => handleIdChange(e.target.value)}
            placeholder={
              item.source === "tiktok"
                ? "Contoh: 7683120078589611285"
                : "Contoh: M7lc1UVf-VE"
            }
            className="w-full px-3 sm:px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none font-mono placeholder:text-slate-400 placeholder:font-sans"
            required
          />
        </div>

        {/* Shortlink helper alert and button */}
        {isShortlink && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Terdeteksi Shortlink TikTok (vt.tiktok.com)</p>
                <p className="text-amber-800 mt-0.5">
                  Link pendek perlu diekstrak ke ID video asli agar pemutar player dapat berjalan di website.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResolveShortlink}
              disabled={isResolving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isResolving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekstrak ID Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ekstrak ID Otomatis Sekarang</span>
                </>
              )}
            </button>
          </div>
        )}

        {resolveError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{resolveError}</span>
          </div>
        )}

        <p className="text-xs text-slate-500">
          {item.source === "tiktok"
            ? "Masukkan hanya ID numerik video TikTok (contoh: 7683120078589611285). Bila Anda paste URL lengkap, ID akan otomatis diekstrak."
            : "Masukkan hanya 11 karakter kode ID video YouTube (contoh: M7lc1UVf-VE). URL lengkap akan otomatis disanitasi."}
        </p>
      </div>

      {/* Live Iframe Preview */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Preview Player {item.source === "tiktok" ? "TikTok" : "YouTube"}
            </span>
          </div>
          {hasValidVideo && (
            <a
              href={item.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1"
            >
              <span>Buka Player</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {hasValidVideo ? (
          <div className="flex justify-center pt-1">
            <div
              className={`w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-black ${
                item.source === "tiktok"
                  ? "max-w-[280px] aspect-[9/16]"
                  : "max-w-[440px] aspect-video"
              }`}
            >
              <iframe
                src={item.embedUrl}
                title={`Preview ${item.title}`}
                loading="lazy"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 bg-white/60 text-slate-400 text-xs">
            Masukkan ID video di atas untuk melihat preview player langsung di sini.
          </div>
        )}
      </div>
    </div>
  );
}
