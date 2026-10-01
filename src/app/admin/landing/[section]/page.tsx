import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { getLandingSectionContent } from "@/lib/landing-content";
import type { LandingSectionKey } from "@/types/landing";

// Import all 13 section forms
import { HeroForm } from "@/components/admin/landing/hero-form";
import { ProgramsForm } from "@/components/admin/landing/programs-form";
import { WhyUsForm } from "@/components/admin/landing/why-us-form";
import { FacilitiesForm } from "@/components/admin/landing/facilities-form";
import { TeamForm } from "@/components/admin/landing/team-form";
import { GalleryForm } from "@/components/admin/landing/gallery-form";
import { TestimonialsForm } from "@/components/admin/landing/testimonials-form";
import { VideosForm } from "@/components/admin/landing/videos-form";
import { LocationsForm } from "@/components/admin/landing/locations-form";
import { FAQForm } from "@/components/admin/landing/faq-form";
import { CTAForm } from "@/components/admin/landing/cta-form";
import { FooterForm } from "@/components/admin/landing/footer-form";
import { NavbarForm } from "@/components/admin/landing/navbar-form";
import { FloatingWaForm } from "@/components/admin/landing/floating-wa-form";

const SECTION_LABELS: Record<LandingSectionKey, { label: string; desc: string }> = {
  hero: {
    label: "Hero Banner",
    desc: "Judul utama, tagline, deskripsi pembuka, dan tombol CTA pendaftaran",
  },
  programs: {
    label: "Program Belajar",
    desc: "Daftar program kursus, usia, durasi belajar, dan fasilitas modul",
  },
  why_us: {
    label: "Keunggulan Kami",
    desc: "Poin-poin keunggulan & nilai lebih bimbingan belajar Uzma Course",
  },
  facilities: {
    label: "Fasilitas",
    desc: "Daftar fasilitas penunjang kenyamanan belajar anak dan orang tua",
  },
  team: {
    label: "Tim & Pengelola",
    desc: "Profil pendiri, foto tim pengajar, dan komitmen",
  },
  gallery: {
    label: "Galeri",
    desc: "Foto-foto kegiatan, wisuda kelulusan, lisensi, dan dokumentasi belajar",
  },
  testimonials: {
    label: "Testimoni",
    desc: "Ulasan dan testimoni kepuasan dari para orang tua murid",
  },
  videos: {
    label: "Video Promo",
    desc: "Daftar video YouTube atau TikTok suasana kegiatan belajar",
  },
  locations: {
    label: "Lokasi Cabang",
    desc: "Alamat cabang Balongbendo & Krian, link peta, dan embed Google Maps",
  },
  faq: {
    label: "FAQ",
    desc: "Daftar pertanyaan yang sering diajukan beserta penjelasannya",
  },
  cta: {
    label: "Call to Action",
    desc: "Banner ajakan konsultasi dan tombol WhatsApp di bawah halaman",
  },
  footer: {
    label: "Footer",
    desc: "Tagline penutup, kontak WhatsApp resmi, media sosial, dan tautan",
  },
  navbar: {
    label: "Navigasi",
    desc: "Nama brand header atas, daftar tautan menu, dan teks tombol aksi",
  },
  floating_wa: {
    label: "Tombol WhatsApp",
    desc: "Pengaturan visibilitas tombol floating WhatsApp cepat",
  },
};

interface EditSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export async function generateMetadata({ params }: EditSectionPageProps) {
  const resolved = await params;
  const key = resolved.section as LandingSectionKey;
  const meta = SECTION_LABELS[key];
  return {
    title: meta
      ? `Edit ${meta.label} | Uzma Course`
      : "Edit Konten | Uzma Course",
  };
}

export default async function EditSectionPage({ params }: EditSectionPageProps) {
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
    redirect("/admin");
  }

  const resolved = await params;
  const sectionKey = resolved.section as LandingSectionKey;

  if (!SECTION_LABELS[sectionKey]) {
    redirect("/admin/landing");
  }

  const sectionMeta = SECTION_LABELS[sectionKey];
  const content = await getLandingSectionContent(sectionKey);

  return (
    <div>
      <PageHeader
        title={`Edit ${sectionMeta.label}`}
        description={sectionMeta.desc}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Landing Page", href: "/admin/landing" },
          { label: sectionMeta.label },
        ]}
      />

      <div className="mt-4">
        {sectionKey === "hero" && (
          <HeroForm initialData={content as never} />
        )}
        {sectionKey === "programs" && (
          <ProgramsForm initialData={content as never} />
        )}
        {sectionKey === "why_us" && (
          <WhyUsForm initialData={content as never} />
        )}
        {sectionKey === "facilities" && (
          <FacilitiesForm initialData={content as never} />
        )}
        {sectionKey === "team" && (
          <TeamForm initialData={content as never} />
        )}
        {sectionKey === "gallery" && (
          <GalleryForm initialData={content as never} />
        )}
        {sectionKey === "testimonials" && (
          <TestimonialsForm initialData={content as never} />
        )}
        {sectionKey === "videos" && (
          <VideosForm initialData={content as never} />
        )}
        {sectionKey === "locations" && (
          <LocationsForm initialData={content as never} />
        )}
        {sectionKey === "faq" && (
          <FAQForm initialData={content as never} />
        )}
        {sectionKey === "cta" && (
          <CTAForm initialData={content as never} />
        )}
        {sectionKey === "footer" && (
          <FooterForm initialData={content as never} />
        )}
        {sectionKey === "navbar" && (
          <NavbarForm initialData={content as never} />
        )}
        {sectionKey === "floating_wa" && (
          <FloatingWaForm initialData={content as never} />
        )}
      </div>
    </div>
  );
}
