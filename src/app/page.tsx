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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: "Uzma Course",
  alternateName: "Ahe Sumowangi",
  url: "https://uzmacourse.com",
  logo: "https://uzmacourse.com/images/logo-ahe-sumowangi.png",
  image: "https://uzmacourse.com/images/logo-ahe-sumowangi.png",
  description:
    "Lembaga bimbingan belajar calistung (AHE), bahasa Inggris (BEE), dan mata pelajaran SD–SMP di Sidoarjo. Metode ramah anak tanpa rasa takut atau trauma belajar.",
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
      name: "Uzma Course Cabang Balongbendo (Ahe Sumokembangsri)",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo",
        addressLocality: "Balongbendo, Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      telephone: "+6285730332379",
      url: "https://uzmacourse.com",
    },
    {
      "@type": "LocalBusiness",
      name: "Uzma Course Cabang Krian (Ahe Junwangi)",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo",
        addressLocality: "Krian, Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      telephone: "+6285730332379",
      url: "https://uzmacourse.com",
    },
  ],
};

export default function Home() {
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
