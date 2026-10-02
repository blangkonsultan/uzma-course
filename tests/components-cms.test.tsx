import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";

// Mock landing actions
vi.mock("@/app/admin/landing/actions", () => ({
  updateLandingSection: vi.fn().mockResolvedValue({ success: true }),
  resolveTikTokShortlink: vi.fn().mockResolvedValue({ videoId: "7683120078589611285" }),
}));

vi.mock("@/app/admin/landing/upload-logo", () => ({
  uploadProgramLogo: vi.fn().mockResolvedValue({ url: "https://example.com/logo.png" }),
  deleteProgramLogo: vi.fn().mockResolvedValue({ success: true }),
}));

import { updateLandingSection } from "@/app/admin/landing/actions";
import { FormActions } from "@/components/admin/landing/form-actions";
import { ImageUrlField } from "@/components/admin/landing/image-url-field";
import { VideoGuideCard } from "@/components/admin/landing/video-guide-card";
import { IconSelectField } from "@/components/admin/landing/icon-select-field";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";
import { VideoItemEditor } from "@/components/admin/landing/video-item-editor";
import { LogoUploadField } from "@/components/admin/landing/logo-upload-field";
import { HeroForm } from "@/components/admin/landing/hero-form";
import { ProgramsForm } from "@/components/admin/landing/programs-form";
import { FacilitiesForm } from "@/components/admin/landing/facilities-form";
import { WhyUsForm } from "@/components/admin/landing/why-us-form";
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

describe("Landing CMS Editor Components (src/components/admin/landing/)", () => {
  describe("FormActions", () => {
    it("renders submit button and back link", () => {
      render(<FormActions isPending={false} submitLabel="Simpan Data" />);
      expect(screen.getByText("Simpan Data")).toBeDefined();
      expect(screen.getByText("Kembali ke Daftar")).toBeDefined();
    });

    it("renders loading state when isPending is true", () => {
      render(<FormActions isPending={true} />);
      expect(screen.getByText("Menyimpan...")).toBeDefined();
    });
  });

  describe("ImageUrlField", () => {
    it("renders image input with preview support, blur normalize, and aspect selection", () => {
      const onChange = vi.fn();
      const onAltChange = vi.fn();
      const { container } = render(
        <ImageUrlField
          label="Foto Sampul"
          value="https://drive.google.com/file/d/123/view"
          onChange={onChange}
          altValue="Alt Text"
          onAltChange={onAltChange}
          hint="Petunjuk foto"
          previewAspect="aspect-square"
        />
      );
      expect(screen.getByText("Foto Sampul")).toBeDefined();

      const urlInput = screen.getByDisplayValue("https://drive.google.com/file/d/123/view");
      fireEvent.change(urlInput, { target: { value: "https://example.com/new.png" } });
      expect(onChange).toHaveBeenCalledWith("https://example.com/new.png");
      fireEvent.blur(urlInput);

      const altInput = screen.getByDisplayValue("Alt Text");
      fireEvent.change(altInput, { target: { value: "Alt Baru" } });
      expect(onAltChange).toHaveBeenCalledWith("Alt Baru");
      // Badge aspect
      expect(screen.getByText("1:1 Persegi")).toBeDefined();

      // Trigger image error
      const img = container.querySelector("img");
      if (img) fireEvent.error(img);
      expect(screen.getByText(/Gambar tidak dapat dimuat/i)).toBeDefined();
    });
  });

  describe("VideoGuideCard", () => {
    it("renders video guide instructions and toggles", () => {
      render(<VideoGuideCard />);
      const btn = screen.getByRole("button");
      fireEvent.click(btn);
      expect(screen.getByText(/Panduan Cara Mengambil ID Video/i)).toBeDefined();
    });
  });

  describe("IconSelectField", () => {
    it("renders icon selector and handles selection", () => {
      const onChange = vi.fn();
      render(
        <IconSelectField
          id="icon-test"
          label="Pilih Ikon"
          value="BookOpen"
          onChange={onChange}
        />
      );
      expect(screen.getByText("Pilih Ikon")).toBeDefined();

      const triggerBtn = screen.getByRole("combobox");
      fireEvent.click(triggerBtn);
      const option = screen.getByText("Kalkulator");
      fireEvent.click(option);
      expect(onChange).toHaveBeenCalledWith("Calculator");

      // Keyboard navigation
      fireEvent.click(triggerBtn);
      fireEvent.keyDown(triggerBtn, { key: "ArrowDown" });
      fireEvent.keyDown(triggerBtn, { key: "ArrowUp" });
      fireEvent.keyDown(triggerBtn, { key: "Enter" });
      fireEvent.click(triggerBtn);
      fireEvent.keyDown(triggerBtn, { key: "Escape" });
      fireEvent.click(triggerBtn);
      fireEvent.mouseDown(document.body);
    });
  });

  describe("SortableItemList", () => {
    interface TestItem {
      id: string;
      name: string;
    }
    const items: TestItem[] = [
      { id: "1", name: "Item Satu" },
      { id: "2", name: "Item Dua" },
    ];

    it("handles add, move up, move down, collapse, and delete", () => {
      const onItemsChange = vi.fn();
      render(
        <SortableItemList
          title="Daftar Item"
          items={items}
          onItemsChange={onItemsChange}
          createEmptyItem={() => ({ id: "3", name: "Baru" })}
          renderItem={(item) => <div>{item.name}</div>}
          itemLabel={(item) => item.name}
        />
      );
      expect(screen.getByText("Daftar Item")).toBeDefined();

      // Collapse toggle
      const collapseButtons = screen.getAllByRole("button");
      if (collapseButtons[1]) {
        fireEvent.click(collapseButtons[1]);
      }

      // Add item
      const addBtn = screen.getByText("Tambah Item");
      fireEvent.click(addBtn);
      expect(onItemsChange).toHaveBeenCalled();

      // Move down first item
      const moveDownButtons = screen.getAllByTitle("Pindah ke bawah");
      if (moveDownButtons[0]) {
        fireEvent.click(moveDownButtons[0]);
        expect(onItemsChange).toHaveBeenCalled();
      }

      // Move up second item
      const moveUpButtons = screen.getAllByTitle("Pindah ke atas");
      if (moveUpButtons[1]) {
        fireEvent.click(moveUpButtons[1]);
        expect(onItemsChange).toHaveBeenCalled();
      }

      // Delete item
      const deleteButtons = screen.getAllByTitle("Hapus item");
      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0]);
        expect(onItemsChange).toHaveBeenCalled();
      }
    });
  });

  describe("VideoItemEditor", () => {
    it("renders video editor and updates fields", () => {
      const updateItem = vi.fn();
      const item = {
        id: "v-1",
        title: "Video 1",
        description: "Deskripsi",
        tag: "Kegiatan",
        source: "youtube" as const,
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      };
      render(<VideoItemEditor item={item} index={0} updateItem={updateItem} />);
      const titleInput = screen.getByDisplayValue("Video 1");
      fireEvent.change(titleInput, { target: { value: "Video Update" } });
      expect(updateItem).toHaveBeenCalled();
      const sourceSelect = screen.getByDisplayValue("YouTube (Embed 16:9 Landscape)");
      fireEvent.change(sourceSelect, { target: { value: "tiktok" } });
      expect(updateItem).toHaveBeenCalled();
    });

    it("handles TikTok shortlink input and resolve", async () => {
      const updateItem = vi.fn();
      const item = {
        id: "v-2",
        title: "Video 1",
        description: "Deskripsi",
        tag: "Kegiatan",
        source: "tiktok" as const,
        embedUrl: "https://www.tiktok.com/player/v1/7683120078589611285",
      };
      render(<VideoItemEditor item={item} index={0} updateItem={updateItem} />);
      const idInput = screen.getByDisplayValue("7683120078589611285");
      fireEvent.change(idInput, { target: { value: "https://vt.tiktok.com/ZS12345" } });
      const extractBtn = screen.getByRole("button", { name: /Ekstrak/i });
      await act(async () => {
        fireEvent.click(extractBtn);
      });
      expect(updateItem).toHaveBeenCalled();
    });
  });

  describe("LogoUploadField", () => {
    it("renders logo upload with file validations", async () => {
      const onChange = vi.fn();
      const { container } = render(<LogoUploadField programId="ahe" value="https://example.com/logo.png" onChange={onChange} />);
      expect(screen.getByText("Ganti Logo")).toBeDefined();

      // Click remove logo
      const removeBtn = screen.getByRole("button", { name: /Hapus/i });
      fireEvent.click(removeBtn);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      // Large file error
      const bigFile = new File([new Uint8Array(600 * 1024)], "big.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(screen.getByText("Ukuran file melebihi 512 KB.")).toBeDefined();

      // Invalid type error
      const badFile = new File(["test"], "doc.txt", { type: "text/plain" });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      expect(screen.getByText(/Format file tidak didukung/i)).toBeDefined();

      // Valid file upload
      const validFile = new File(["ok"], "logo.png", { type: "image/png" });
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      });
      expect(onChange).toHaveBeenCalledWith("https://example.com/logo.png");
    });
  });

  describe("14 Section CMS Forms", () => {
    it("renders HeroForm, modifies fields, and submits", async () => {
      const { container } = render(<HeroForm initialData={DEFAULT_LANDING_CONTENT.hero} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.title);
      fireEvent.change(titleInput, { target: { value: "Hero Baru" } });
      const badgeInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.badgeText);
      fireEvent.change(badgeInput, { target: { value: "Badge Baru" } });
      const subtitleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.subtitle);
      fireEvent.change(subtitleInput, { target: { value: "Subtitle Baru" } });
      const descInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.description);
      fireEvent.change(descInput, { target: { value: "Deskripsi Baru" } });
      const primaryCta = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.primaryCtaText);
      fireEvent.change(primaryCta, { target: { value: "Daftar Sekarang" } });
      const secCta = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.hero.secondaryCtaText);
      fireEvent.change(secCta, { target: { value: "Lihat Fasilitas" } });

      // Remove pill
      const removePillBtn = container.querySelector("button .w-3\\.5.h-3\\.5")?.parentElement;
      if (removePillBtn) fireEvent.click(removePillBtn);

      const input = screen.getByPlaceholderText(/Tambah item pill/i);
      fireEvent.change(input, { target: { value: "Pill Baru" } });
      fireEvent.keyDown(input, { key: "Enter" });
      const addBtn = screen.getByRole("button", { name: /Tambah/i });
      fireEvent.click(addBtn);
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders ProgramsForm and submits", async () => {
      const { container } = render(<ProgramsForm initialData={DEFAULT_LANDING_CONTENT.programs} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.programs.title);
      fireEvent.change(titleInput, { target: { value: "Programs Baru" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders FacilitiesForm and submits", async () => {
      const { container } = render(<FacilitiesForm initialData={DEFAULT_LANDING_CONTENT.facilities} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.facilities.title);
      fireEvent.change(titleInput, { target: { value: "Fasilitas Baru" } });
      const facTitle = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.facilities.items[0].title);
      fireEvent.change(facTitle, { target: { value: "Fasilitas Item Baru" } });
      const facDesc = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.facilities.items[0].description);
      fireEvent.change(facDesc, { target: { value: "Deskripsi Fasilitas Baru" } });
      fireEvent.click(screen.getByText("Tambah Fasilitas Baru"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders WhyUsForm and submits", async () => {
      const { container } = render(<WhyUsForm initialData={DEFAULT_LANDING_CONTENT.why_us} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.why_us.title);
      fireEvent.change(titleInput, { target: { value: "Keunggulan Baru" } });
      const whyTitle = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.why_us.items[0].title);
      fireEvent.change(whyTitle, { target: { value: "Keunggulan Item Baru" } });
      const whyDesc = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.why_us.items[0].description);
      fireEvent.change(whyDesc, { target: { value: "Deskripsi Keunggulan Baru" } });
      fireEvent.click(screen.getByText("Tambah Poin Keunggulan"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders TeamForm with values and submits", async () => {
      const richTeam = {
        ...DEFAULT_LANDING_CONTENT.team,
        values: [
          {
            title: "Tanpa Trauma",
            description: "Belajar menyenangkan",
            icon: "Heart",
          },
        ],
      };
      const { container } = render(<TeamForm initialData={richTeam} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.title);
      fireEvent.change(titleInput, { target: { value: "Tim Pengajar Baru" } });
      const badgeInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.teamBadge);
      fireEvent.change(badgeInput, { target: { value: "Badge Baru" } });
      const headingInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.teamHeading);
      fireEvent.change(headingInput, { target: { value: "Heading Baru" } });
      const teamDescInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.teamDescription);
      fireEvent.change(teamDescInput, { target: { value: "Deskripsi Tim Baru" } });
      const founderName = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.founderName);
      fireEvent.change(founderName, { target: { value: "Founder Baru" } });
      const founderRole = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.founderRole);
      fireEvent.change(founderRole, { target: { value: "Role Baru" } });
      const founderQuote = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.team.founderQuote);
      fireEvent.change(founderQuote, { target: { value: "Kutipan Baru" } });
      const valTitle = screen.getByDisplayValue("Tanpa Trauma");
      fireEvent.change(valTitle, { target: { value: "Tanpa Paksaan" } });
      const valDesc = screen.getByDisplayValue("Belajar menyenangkan");
      fireEvent.change(valDesc, { target: { value: "Deskripsi Nilai Baru" } });
      const valIconSelect = screen.getByDisplayValue("Heart (Tanpa Trauma / Ramah)");
      fireEvent.change(valIconSelect, { target: { value: "Award" } });
      fireEvent.click(screen.getByText("Tambah Kartu Nilai"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders GalleryForm with photos and submits", async () => {
      const richGallery = {
        ...DEFAULT_LANDING_CONTENT.gallery,
        groups: [
          {
            label: "Wisuda",
            images: [
              {
                url: "https://example.com/w1.jpg",
                alt: "Wisuda Foto",
                caption: "Foto 1",
                aspect: "aspect-square" as const,
              },
            ],
          },
        ],
      };
      const { container } = render(<GalleryForm initialData={richGallery} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.gallery.title);
      fireEvent.change(titleInput, { target: { value: "Galeri Baru" } });
      const subInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.gallery.subtitle);
      fireEvent.change(subInput, { target: { value: "Sub Baru" } });
      const altInput = screen.getByDisplayValue("Wisuda Foto");
      fireEvent.change(altInput, { target: { value: "Wisuda Foto Baru" } });
      const urlInput = screen.getByDisplayValue("https://example.com/w1.jpg");
      fireEvent.change(urlInput, { target: { value: "https://example.com/w2.jpg" } });
      fireEvent.blur(urlInput);
      fireEvent.click(screen.getByText("Tambah Foto"));
      const deleteBtns = screen.getAllByLabelText("Hapus foto");
      if (deleteBtns[0]) fireEvent.click(deleteBtns[0]);

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders TestimonialsForm and submits", async () => {
      const { container } = render(<TestimonialsForm initialData={DEFAULT_LANDING_CONTENT.testimonials} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.testimonials.title);
      fireEvent.change(titleInput, { target: { value: "Testimoni Baru" } });
      const parentInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.testimonials.items[0].parentName);
      fireEvent.change(parentInput, { target: { value: "Orang Tua Baru" } });
      const qInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.testimonials.items[0].quote);
      fireEvent.change(qInput, { target: { value: "Kutipan Baru" } });
      fireEvent.click(screen.getByText("Tambah Testimoni Baru"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders VideosForm and submits", async () => {
      const { container } = render(<VideosForm initialData={DEFAULT_LANDING_CONTENT.videos} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.videos.title);
      fireEvent.change(titleInput, { target: { value: "Video Baru" } });
      const vidTitle = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.videos.items[0].title);
      fireEvent.change(vidTitle, { target: { value: "Video TikTok Baru" } });
      fireEvent.click(screen.getByText("Tambah Video Baru"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders LocationsForm and submits", async () => {
      const { container } = render(<LocationsForm initialData={DEFAULT_LANDING_CONTENT.locations} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.title);
      fireEvent.change(titleInput, { target: { value: "Lokasi Baru" } });
      const branchNameInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.items[0].name);
      fireEvent.change(branchNameInput, { target: { value: "Cabang Baru" } });
      const subNameInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.items[0].subName);
      fireEvent.change(subNameInput, { target: { value: "Sub Baru" } });
      const addrInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.items[0].address);
      fireEvent.change(addrInput, { target: { value: "Alamat Lengkap Baru" } });
      const gmapsInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.items[0].gmapsUrl);
      fireEvent.change(gmapsInput, { target: { value: "https://maps.app.goo.gl/new" } });
      const mapInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.locations.items[0].mapUrl);
      fireEvent.change(mapInput, { target: { value: "https://maps.google.com/embed?q=sidoarjo" } });
      fireEvent.click(screen.getByText("Tambah Cabang Baru"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders FAQForm and submits", async () => {
      const { container } = render(<FAQForm initialData={DEFAULT_LANDING_CONTENT.faq} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.faq.title);
      fireEvent.change(titleInput, { target: { value: "FAQ Baru" } });
      const qInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.faq.items[0].question);
      fireEvent.change(qInput, { target: { value: "Pertanyaan Baru?" } });
      const aInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.faq.items[0].answer);
      fireEvent.change(aInput, { target: { value: "Jawaban Baru" } });
      fireEvent.click(screen.getByText("Tambah Pertanyaan FAQ"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders CTAForm and submits", async () => {
      const { container } = render(<CTAForm initialData={DEFAULT_LANDING_CONTENT.cta} />);
      const titleInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.cta.title);
      fireEvent.change(titleInput, { target: { value: "CTA Baru" } });
      const btnInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.cta.buttonText);
      fireEvent.change(btnInput, { target: { value: "Chat WhatsApp Sekarang" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders FooterForm and submits", async () => {
      const richFooter = {
        ...DEFAULT_LANDING_CONTENT.footer,
        socialLinks: [
          { platform: "instagram" as const, url: "https://instagram.com/uzma", label: "IG" },
        ],
      };
      const { container } = render(<FooterForm initialData={richFooter} />);
      const taglineInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.footer.tagline);
      fireEvent.change(taglineInput, { target: { value: "Tagline Baru" } });
      const phoneInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.footer.contactPhone);
      fireEvent.change(phoneInput, { target: { value: "62811111111" } });
      const waDisplayInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.footer.contactWaDisplay);
      fireEvent.change(waDisplayInput, { target: { value: "081111111" } });
      const socialUrlInput = screen.getByDisplayValue("https://instagram.com/uzma");
      fireEvent.change(socialUrlInput, { target: { value: "https://instagram.com/uzma-updated" } });
      const linkLabel = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.footer.navLinks[0].label);
      fireEvent.change(linkLabel, { target: { value: "Menu Baru" } });
      const hrefInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.footer.navLinks[0].href);
      fireEvent.change(hrefInput, { target: { value: "#programs-updated" } });
      const platSelect = screen.getByDisplayValue("Instagram");
      fireEvent.change(platSelect, { target: { value: "tiktok" } });
      fireEvent.click(screen.getByText("Tambah Tautan Footer"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders NavbarForm and submits", async () => {
      const { container } = render(<NavbarForm initialData={DEFAULT_LANDING_CONTENT.navbar} />);
      const brandInput = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.navbar.brandName);
      fireEvent.change(brandInput, { target: { value: "Brand Baru" } });
      const linkLabel = screen.getByDisplayValue(DEFAULT_LANDING_CONTENT.navbar.navLinks[0].label);
      fireEvent.change(linkLabel, { target: { value: "Program Kami" } });
      fireEvent.click(screen.getByText("Tambah Menu Navigasi"));
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders FloatingWaForm and submits", async () => {
      const { container } = render(<FloatingWaForm initialData={DEFAULT_LANDING_CONTENT.floating_wa} />);
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders error alert when updateLandingSection fails across forms", async () => {
      vi.mocked(updateLandingSection).mockResolvedValue({ error: "Gagal menyimpan perubahan" });
      const { container: c1 } = render(<CTAForm initialData={DEFAULT_LANDING_CONTENT.cta} />);
      await act(async () => {
        const form = c1.querySelector("form");
        if (form) fireEvent.submit(form);
      });
      expect(screen.getAllByText("Gagal menyimpan perubahan").length).toBeGreaterThan(0);

      const { container: c2 } = render(<HeroForm initialData={DEFAULT_LANDING_CONTENT.hero} />);
      await act(async () => {
        const form = c2.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c3 } = render(<WhyUsForm initialData={DEFAULT_LANDING_CONTENT.why_us} />);
      await act(async () => {
        const form = c3.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c4 } = render(<FacilitiesForm initialData={DEFAULT_LANDING_CONTENT.facilities} />);
      await act(async () => {
        const form = c4.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c5 } = render(<FAQForm initialData={DEFAULT_LANDING_CONTENT.faq} />);
      await act(async () => {
        const form = c5.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c6 } = render(<FloatingWaForm initialData={DEFAULT_LANDING_CONTENT.floating_wa} />);
      await act(async () => {
        const form = c6.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c7 } = render(<VideosForm initialData={DEFAULT_LANDING_CONTENT.videos} />);
      await act(async () => {
        const form = c7.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c8 } = render(<TestimonialsForm initialData={DEFAULT_LANDING_CONTENT.testimonials} />);
      await act(async () => {
        const form = c8.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c9 } = render(<LocationsForm initialData={DEFAULT_LANDING_CONTENT.locations} />);
      await act(async () => {
        const form = c9.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c10 } = render(<ProgramsForm initialData={DEFAULT_LANDING_CONTENT.programs} />);
      await act(async () => {
        const form = c10.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c11 } = render(<TeamForm initialData={DEFAULT_LANDING_CONTENT.team} />);
      await act(async () => {
        const form = c11.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c12 } = render(<GalleryForm initialData={DEFAULT_LANDING_CONTENT.gallery} />);
      await act(async () => {
        const form = c12.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c13 } = render(<FooterForm initialData={DEFAULT_LANDING_CONTENT.footer} />);
      await act(async () => {
        const form = c13.querySelector("form");
        if (form) fireEvent.submit(form);
      });

      const { container: c14 } = render(<NavbarForm initialData={DEFAULT_LANDING_CONTENT.navbar} />);
      await act(async () => {
        const form = c14.querySelector("form");
        if (form) fireEvent.submit(form);
      });
    });
  });
});
