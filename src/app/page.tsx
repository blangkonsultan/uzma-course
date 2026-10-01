import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProgramsSection } from "@/components/landing/programs-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { FacilitiesSection } from "@/components/landing/facilities-section";
import { TeamSection } from "@/components/landing/team-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { VideoSection } from "@/components/landing/video-section";
import { LocationsSection } from "@/components/landing/locations-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { FloatingWhatsApp } from "@/components/landing/floating-whatsapp";
import { getLandingContent } from "@/lib/landing-content";

export default async function Home() {
  const content = await getLandingContent();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    name: content.navbar.brandName || "Uzma Course",
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
      content.hero.description ||
      "Pusat bimbingan belajar calistung les baca AHE Sumokembangsri (Balongbendo) dan les baca AHE Junwangi (Krian), Sidoarjo. Menggunakan metode AHE ramah anak tanpa mengeja sejak 2022.",
    telephone: `+${content.footer.contactPhone.replace(/[^0-9]/g, "")}`,
    founder: {
      "@type": "Person",
      name: content.team.founderName,
      jobTitle: content.team.founderRole,
      ...(content.team.founderPhotoUrl
        ? {
            image: content.team.founderPhotoUrl.startsWith("http")
              ? content.team.founderPhotoUrl
              : `https://uzmacourse.com${content.team.founderPhotoUrl}`,
          }
        : {}),
    },
    sameAs: (Array.isArray(content.footer.socialLinks)
      ? content.footer.socialLinks.map((s) => s.url)
      : Object.values(content.footer.socialLinks || {})
    ).filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sidoarjo",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    department: content.locations.items.map((b) => ({
      "@type": "LocalBusiness",
      name: `Les Baca ${b.subName} — Uzma Course ${b.name}`,
      alternateName: b.subName,
      description: `Tempat les baca tulis ${b.subName}, bimbingan belajar calistung anak hebat di Sidoarjo.`,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.address,
        addressLocality:
          b.id === "balongbendo"
            ? "Balongbendo, Sidoarjo"
            : "Krian, Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      telephone: `+${content.footer.contactPhone.replace(/[^0-9]/g, "")}`,
      url: "https://uzmacourse.com/#lokasi",
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

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
      <Navbar data={content.navbar} />
      <HeroSection data={content.hero} />
      <ProgramsSection data={content.programs} />
      <WhyUsSection data={content.why_us} />
      <FacilitiesSection data={content.facilities} />
      <TeamSection data={content.team} />
      <GallerySection data={content.gallery} />
      <TestimonialsSection data={content.testimonials} />
      <VideoSection data={content.videos} />
      <LocationsSection data={content.locations} />
      <FAQSection data={content.faq} />
      <CTASection data={content.cta} />
      <Footer data={content.footer} locationsData={content.locations} />
      <FloatingWhatsApp data={content.floating_wa} />
    </main>
  );
}
