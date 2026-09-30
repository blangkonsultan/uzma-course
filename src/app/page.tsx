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

export default function Home() {
  return (
    <main>
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
