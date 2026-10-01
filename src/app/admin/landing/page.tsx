import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardBody } from "@/components/ui/card";
import {
  Megaphone,
  BookOpen,
  Award,
  Building2,
  Users,
  Image as ImageIcon,
  MessageSquareQuote,
  Play,
  MapPin,
  HelpCircle,
  MousePointerClick,
  PanelBottom,
  Navigation,
  MessageCircle,
  ExternalLink,
  Edit3,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Manajemen Landing Page | Uzma Course",
};

interface SectionMeta {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

const SECTIONS: SectionMeta[] = [
  {
    slug: "hero",
    label: "Hero Banner",
    description: "Judul utama, tagline, deskripsi pembuka, dan tombol CTA pendaftaran",
    icon: Megaphone,
    badge: "Beranda Utama",
  },
  {
    slug: "programs",
    label: "Program Belajar",
    description: "Daftar program les (AHE, ASE, BEE, Mapel, Hitung), usia, dan fasilitas modul",
    icon: BookOpen,
  },
  {
    slug: "why_us",
    label: "Keunggulan Kami",
    description: "Poin-poin keunggulan & nilai lebih bimbingan belajar Uzma Course",
    icon: Award,
  },
  {
    slug: "facilities",
    label: "Fasilitas",
    description: "Daftar fasilitas penunjang kenyamanan belajar (guru berlisensi, wifi, dll)",
    icon: Building2,
  },
  {
    slug: "team",
    label: "Tim & Pengelola",
    description: "Profil pendiri, foto tim pengajar, dan nilai pengajaran",
    icon: Users,
  },
  {
    slug: "gallery",
    label: "Galeri",
    description: "Foto-foto kegiatan, wisuda kelulusan, lisensi, dan dokumentasi belajar mengajar",
    icon: ImageIcon,
    badge: "Multi Foto",
  },
  {
    slug: "testimonials",
    label: "Testimoni",
    description: "Daftar testimoni dan ulasan kepuasan dari para orang tua murid",
    icon: MessageSquareQuote,
  },
  {
    slug: "videos",
    label: "Video Promo",
    description: "Daftar video YouTube atau TikTok suasana kegiatan belajar mengajar",
    icon: Play,
  },
  {
    slug: "locations",
    label: "Lokasi Cabang",
    description: "Alamat cabang Balongbendo & Krian, link navigasi, dan embed peta Google Maps",
    icon: MapPin,
  },
  {
    slug: "faq",
    label: "FAQ",
    description: "Daftar pertanyaan umum yang sering diajukan beserta jawabannya",
    icon: HelpCircle,
  },
  {
    slug: "cta",
    label: "Call to Action",
    description: "Banner ajakan konsultasi dan tombol WhatsApp di bagian bawah halaman",
    icon: MousePointerClick,
  },
  {
    slug: "footer",
    label: "Footer",
    description: "Tagline penutup, nomor kontak, link media sosial, dan tautan footer",
    icon: PanelBottom,
  },
  {
    slug: "navbar",
    label: "Navigasi",
    description: "Nama brand pada header atas, daftar link menu navigasi, dan teks tombol",
    icon: Navigation,
  },
  {
    slug: "floating_wa",
    label: "Tombol WhatsApp",
    description: "Pengaturan visibilitas tombol floating WhatsApp cepat di pojok kanan bawah",
    icon: MessageCircle,
  },
];

interface LandingPageProps {
  searchParams: Promise<{
    success?: string;
  }>;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
}

export default async function AdminLandingPage({ searchParams }: LandingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/admin");
  }

  const resolvedParams = await searchParams;

  const { data: rows } = await supabase
    .from("landing_content")
    .select("section, updated_at");

  const updatedMap: Record<string, string> = {};
  if (rows) {
    for (const r of rows) {
      updatedMap[r.section] = r.updated_at;
    }
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Landing Page"
        description="Kelola seluruh teks, daftar program, foto tim, testimoni, dan informasi halaman depan website."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Landing Page" },
        ]}
        action={
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors shadow-sm"
          >
            <span>Lihat Website</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        }
      />

      {resolvedParams.success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <p>
            {resolvedParams.success === "updated"
              ? "Perubahan konten landing page berhasil disimpan dan diterbitkan!"
              : resolvedParams.success}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const updatedAt = updatedMap[section.slug];

          return (
            <Card
              key={section.slug}
              className="hover:shadow-md hover:border-primary-200 transition-all duration-200 flex flex-col justify-between"
            >
              <CardBody className="p-4 sm:p-5 flex flex-col h-full justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    {section.badge && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {section.badge}
                      </span>
                    )}
                  </div>

                  <h2 className="font-bold text-slate-800 text-base font-heading">
                    {section.label}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {updatedAt ? formatDate(updatedAt) : "Default"}
                    </span>
                  </div>

                  <Link
                    href={`/admin/landing/${section.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors min-h-[36px] sm:min-h-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Edit Konten</span>
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
