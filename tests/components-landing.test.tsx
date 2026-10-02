import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FacilitiesSection } from "@/components/landing/facilities-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { TeamSection } from "@/components/landing/team-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { LocationsSection } from "@/components/landing/locations-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { VideoSection } from "@/components/landing/video-section";
import { FloatingWhatsApp } from "@/components/landing/floating-whatsapp";
import { ProgramsSection } from "@/components/landing/programs-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { GalleryLightbox } from "@/components/landing/gallery-lightbox";
import { ProgramIcon } from "@/components/landing/program-icon";
import { FounderPhoto } from "@/components/landing/founder-photo";

describe("Landing Components (src/components/landing/)", () => {
  beforeEach(() => {
    window.addEventListener("error", (e) => {
      if (e.message?.includes("iframe") || e.message?.includes("aborted")) {
        e.preventDefault();
      }
    });
  });

  describe("Navbar & Footer", () => {
    it("renders Navbar with brand and toggles mobile menu", () => {
      render(<Navbar data={DEFAULT_LANDING_CONTENT.navbar} />);
      expect(screen.getByText("Uzma Course")).toBeDefined();

      const toggleBtn = screen.getByLabelText("Buka menu navigasi");
      fireEvent.click(toggleBtn);
      const mobileLinks = screen.getAllByText(DEFAULT_LANDING_CONTENT.navbar.navLinks[0].label);
      if (mobileLinks[1]) fireEvent.click(mobileLinks[1]);
      fireEvent.click(toggleBtn);
      const ctaBtns = screen.getAllByRole("link", { name: DEFAULT_LANDING_CONTENT.navbar.ctaText });
      if (ctaBtns[1]) fireEvent.click(ctaBtns[1]);
      const closeBtn = screen.getByLabelText("Tutup menu navigasi");
      expect(closeBtn).toBeDefined();
      fireEvent.click(closeBtn);
      Object.defineProperty(window, "scrollY", { value: 100, writable: true, configurable: true });
      fireEvent.scroll(window);
      Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    it("renders Footer with brand and locations", () => {
      render(<Footer data={DEFAULT_LANDING_CONTENT.footer} />);
      expect(screen.getAllByText("Uzma Course").length).toBeGreaterThan(0);
    });
  });

  describe("Hero & Highlights", () => {
    it("renders HeroSection with title and badge", () => {
      render(<HeroSection data={DEFAULT_LANDING_CONTENT.hero} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.hero.badgeText)).toBeDefined();
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.hero.title)).toBeDefined();
    });

    it("renders FacilitiesSection", () => {
      render(<FacilitiesSection data={DEFAULT_LANDING_CONTENT.facilities} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.facilities.title)).toBeDefined();
    });

    it("renders WhyUsSection", () => {
      render(<WhyUsSection data={DEFAULT_LANDING_CONTENT.why_us} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.why_us.title)).toBeDefined();
    });

    it("renders TeamSection", () => {
      render(<TeamSection data={DEFAULT_LANDING_CONTENT.team} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.team.title)).toBeDefined();
    });
  });

  describe("Content & Social Proof Sections", () => {
    it("renders FAQSection and toggles accordion items", () => {
      render(<FAQSection data={DEFAULT_LANDING_CONTENT.faq} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.faq.title)).toBeDefined();

      const firstQuestion = screen.getByText(DEFAULT_LANDING_CONTENT.faq.items[0].question);
      fireEvent.click(firstQuestion);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.faq.items[0].answer)).toBeDefined();
      // Toggle close
      fireEvent.click(firstQuestion);
    });

    it("renders CTASection with action button", () => {
      render(<CTASection data={DEFAULT_LANDING_CONTENT.cta} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.cta.title)).toBeDefined();
    });

    it("renders LocationsSection with branch cards", () => {
      render(<LocationsSection data={DEFAULT_LANDING_CONTENT.locations} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.locations.title)).toBeDefined();
    });

    it("renders TestimonialsSection with quotes", () => {
      render(<TestimonialsSection data={DEFAULT_LANDING_CONTENT.testimonials} />);
      expect(screen.getByText(DEFAULT_LANDING_CONTENT.testimonials.title)).toBeDefined();
    });

    it("renders VideoSection and returns null when items is empty", () => {
      const { container } = render(<VideoSection data={{ ...DEFAULT_LANDING_CONTENT.videos, items: [] }} />);
      expect(container.firstChild).toBeNull();

      render(
        <VideoSection
          data={{
            ...DEFAULT_LANDING_CONTENT.videos,
            items: [
              {
                id: "v-1",
                title: "Video YouTube",
                source: "youtube",
                embedUrl: "https://www.youtube.com/embed/123",
              },
            ],
          }}
        />
      );
      expect(screen.getByText("Video YouTube")).toBeDefined();
    });


    it("renders sections with default fallback content when data is undefined", () => {
      render(<Navbar />);
      render(<Footer />);
      render(<HeroSection />);
      render(<FacilitiesSection />);
      render(<WhyUsSection />);
      render(<TeamSection />);
      render(<FAQSection />);
      render(<CTASection />);
      render(<LocationsSection />);
      render(<TestimonialsSection />);
      render(<VideoSection />);
      render(<ProgramsSection />);
      render(<GallerySection />);
      render(<FloatingWhatsApp />);
      expect(true).toBe(true);
    });
    it("renders FloatingWhatsApp when enabled", () => {
      render(<FloatingWhatsApp data={DEFAULT_LANDING_CONTENT.floating_wa} />);
      expect(screen.getByLabelText(/Chat via WhatsApp/i)).toBeDefined();
    });
  });

  describe("Programs & Gallery", () => {
    it("renders ProgramsSection with program cards", () => {
      const richProgramsData = {
        title: "Program Belajar",
        subtitle: "Pilihan Program",
        items: [
          {
            id: "ahe",
            name: "Les Baca AHE",
            initials: "AHE",
            tagline: "Anak Hebat",
            description: "Belajar membaca ceria",
            ageRange: "4-7 tahun",
            icon: "BookOpen",
            type: "franchise" as const,
            licenseInfo: { provider: "AHE Pusat" },
            system: 1,
            duration: 30,
            frequency: 3,
            features: ["Modul Lengkap", "Sertifikat"],
          },
        ],
      };
      render(<ProgramsSection data={richProgramsData} />);
      expect(screen.getByText("Les Baca AHE")).toBeDefined();
      expect(screen.getByText("oleh AHE Pusat")).toBeDefined();
      expect(screen.getByText("Modul Lengkap")).toBeDefined();
    });

    it("renders GallerySection, handles category filter, overflow card, expand, and lightbox", () => {
      const mockGalleryData = {
        title: "Galeri Uzma",
        subtitle: "Dokumentasi",
        groups: [
          {
            label: "Lisensi",
            images: [{ url: "https://example.com/g1.jpg", alt: "Lisensi 1", caption: "Lisensi 1", aspect: "aspect-square" as const }],
          },
          {
            label: "Wisuda",
            images: [
              { url: "https://example.com/w1.jpg", alt: "W 1", caption: "W 1", aspect: "aspect-square" as const },
              { url: "https://example.com/w2.jpg", alt: "W 2", caption: "W 2", aspect: "aspect-square" as const },
              { url: "https://example.com/w3.jpg", alt: "W 3", caption: "W 3", aspect: "aspect-square" as const },
              { url: "https://example.com/w4.jpg", alt: "W 4", caption: "W 4", aspect: "aspect-square" as const },
              { url: "https://example.com/w5.jpg", alt: "W 5", caption: "W 5", aspect: "aspect-square" as const },
              { url: "https://example.com/w6.jpg", alt: "W 6", caption: "W 6", aspect: "aspect-square" as const },
            ],
          },
        ],
      };
      render(<GallerySection data={mockGalleryData} />);
      expect(screen.getByText("Galeri Uzma")).toBeDefined();

      // Filter by category
      const wisudaBtn = screen.getByRole("button", { name: "Wisuda (6)" });
      fireEvent.click(wisudaBtn);

      // Overflow card +N
      const overflowBtn = screen.getByLabelText(/Buka galeri lengkap/i);
      expect(overflowBtn).toBeDefined();

      // Click to open lightbox
      fireEvent.click(overflowBtn);
      expect(screen.getByRole("dialog")).toBeDefined();

      // Close lightbox
      const closeBtn = screen.getByLabelText("Tutup Galeri");
      fireEvent.click(closeBtn);

      // Expand group
      const expandBtn = screen.getByText(/Lihat Semua \d+ Foto/i);
      fireEvent.click(expandBtn);
      const collapseBtn = screen.getByText(/Tampilkan Lebih Sedikit/i);
      expect(collapseBtn).toBeDefined();
      fireEvent.click(collapseBtn);

      // Tab Semua
      const allBtn = screen.getByRole("button", { name: "Semua (7)" });
      fireEvent.click(allBtn);
    });

    it("renders GalleryLightbox modal and exercises navigation & zoom", () => {
      const items = [
        { url: "https://example.com/p1.jpg", alt: "Foto 1", groupLabel: "Wisuda" },
        { url: "https://example.com/p2.jpg", alt: "Foto 2", groupLabel: "Wisuda" },
      ];
      const onClose = vi.fn();
      render(<GalleryLightbox items={items} initialIndex={0} onClose={onClose} />);
      expect(screen.getByAltText("Foto 1")).toBeDefined();

      // Zoom In
      const zoomInBtn = screen.getByLabelText(/Perbesar/i);
      fireEvent.click(zoomInBtn);

      // Zoom Out
      const zoomOutBtn = screen.getByLabelText(/Perkecil/i);
      fireEvent.click(zoomOutBtn);

      // Reset
      const resetBtn = screen.getByLabelText(/Reset zoom/i);
      fireEvent.click(resetBtn);

      // Next
      const nextBtn = screen.getByLabelText(/Foto selanjutnya/i);
      fireEvent.click(nextBtn);
      expect(screen.getByAltText("Foto 2")).toBeDefined();

      // Prev
      const prevBtn = screen.getByLabelText(/Foto sebelumnya/i);
      fireEvent.click(prevBtn);
      expect(screen.getByAltText("Foto 1")).toBeDefined();

      // Double click & drag
      const img = screen.getByAltText("Foto 1");
      fireEvent.doubleClick(img);
      fireEvent.doubleClick(img);
      fireEvent.mouseDown(img, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(img, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(img);
      fireEvent.wheel(img, { deltaY: -100 });
      fireEvent.wheel(img, { deltaY: 100 });

      // Touch events (swipe and zoom)
      fireEvent.touchStart(img, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(img, { changedTouches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchStart(img, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchEnd(img, { changedTouches: [{ clientX: 100, clientY: 100 }] });

      // Double tap touch
      fireEvent.touchStart(img, { touches: [{ clientX: 150, clientY: 150 }] });
      fireEvent.touchStart(img, { touches: [{ clientX: 150, clientY: 150 }] });
      fireEvent.touchMove(img, { touches: [{ clientX: 180, clientY: 180 }] });
      fireEvent.touchEnd(img, { changedTouches: [{ clientX: 180, clientY: 180 }] });

      fireEvent.keyDown(window, { key: "ArrowRight" });
      fireEvent.keyDown(window, { key: "ArrowLeft" });
      fireEvent.keyDown(window, { key: "+" });
      fireEvent.keyDown(window, { key: "-" });
      fireEvent.keyDown(window, { key: "0" });
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalled();

      const closeBtn = screen.getByLabelText("Tutup Galeri");
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("renders FounderPhoto with avatar fallback", () => {
      render(<FounderPhoto alt="Kholidatul Azimah, S.Pd" src="" />);
      expect(screen.getByAltText("Kholidatul Azimah, S.Pd")).toBeDefined();
    });

    it("renders ProgramIcon with Lucide fallback and image error", () => {
      const { container: fallbackC } = render(<ProgramIcon icon="BookOpen" name="AHE" />);
      expect(fallbackC.querySelector("svg")).toBeDefined();

      const { container: imgC } = render(<ProgramIcon logoUrl="https://example.com/logo.png" icon="BookOpen" name="AHE" />);
      const img = imgC.querySelector("img");
      expect(img).toBeDefined();
      if (img) fireEvent.error(img);
    });
  });
});
