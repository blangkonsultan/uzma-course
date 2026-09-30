import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProgramsSection } from "@/components/landing/programs-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { FacilitiesSection } from "@/components/landing/facilities-section";
import { TeamSection } from "@/components/landing/team-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { VideoSection } from "@/components/landing/video-section";
import { LocationsSection } from "@/components/landing/locations-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { FloatingWhatsApp } from "@/components/landing/floating-whatsapp";
import { FOUNDER, SOCIAL_LINKS } from "@/lib/constants";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: "Uzma Course",
  alternateName: [
    "Ahe Sumowangi",
    "AHE Sumokembangsri",
    "AHE Junwangi",
    "Les Baca AHE Sumokembangsri",
    "Les Baca AHE Junwangi",
    "Les Baca Tulis AHE Sumokembangsri",
    "Les Baca Tulis AHE Junwangi",
  ],
  url: "https://uzmacourse.com",
  logo: "https://uzmacourse.com/images/logo-ahe-sumowangi.png",
  image: "https://uzmacourse.com/images/logo-ahe-sumowangi.png",
  description:
    "Pusat bimbingan belajar calistung les baca AHE Sumokembangsri (Balongbendo) dan les baca AHE Junwangi (Krian), Sidoarjo. Menggunakan metode AHE ramah anak tanpa mengeja sejak 2022.",
  telephone: "+6285730332379",
  founder: {
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: FOUNDER.role,
  },
  sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.facebook],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sidoarjo",
    addressRegion: "Jawa Timur",
    addressCountry: "ID",
  },
  department: [
    {
      "@type": "LocalBusiness",
      name: "Les Baca AHE Sumokembangsri — Uzma Course Cabang Balongbendo",
      alternateName: "AHE Sumokembangsri",
      description:
        "Tempat les baca tulis AHE Sumokembangsri, bimbingan belajar calistung anak hebat di Balongbendo Sidoarjo.",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo",
        addressLocality: "Balongbendo, Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      telephone: "+6285730332379",
      url: "https://uzmacourse.com/#lokasi",
    },
    {
      "@type": "LocalBusiness",
      name: "Les Baca AHE Junwangi — Uzma Course Cabang Krian",
      alternateName: "AHE Junwangi",
      description:
        "Tempat les baca tulis AHE Junwangi, bimbingan belajar calistung anak hebat di Krian Sidoarjo.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo",
        addressLocality: "Krian, Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      telephone: "+6285730332379",
      url: "https://uzmacourse.com/#lokasi",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Di mana lokasi les baca AHE Sumokembangsri?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unit les baca AHE Sumokembangsri (Uzma Course) berlokasi di Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo.",
      },
    },
    {
      "@type": "Question",
      name: "Di mana lokasi les baca AHE Junwangi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unit les baca AHE Junwangi (Uzma Course) berlokasi di Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo.",
      },
    },
    {
      "@type": "Question",
      name: "Program bimbingan belajar apa saja yang tersedia di AHE Sumokembangsri dan AHE Junwangi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kami melayani Les Baca Tulis AHE (Anak Hebat mulai 3,5 tahun), Les Hitung Dasar, Brainy English Education (BEE), dan Les Privat Mata Pelajaran SD-SMP.",
      },
    },
  ],
};

export default function Home() {
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <ProgramsSection />
      <WhyUsSection />
      <FacilitiesSection />
      <TeamSection />
      <TestimonialsSection />
      <VideoSection />
      <LocationsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
