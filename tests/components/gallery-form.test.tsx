import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GalleryForm } from "@/components/admin/landing/gallery-form";
import type { GalleryContent } from "@/types/landing";

vi.mock("@/app/admin/landing/actions", () => ({
  updateLandingSection: vi.fn().mockResolvedValue({ success: true }),
}));

const galleryData: GalleryContent = {
  title: "Galeri",
  subtitle: "Dokumentasi kegiatan",
  groups: [
    {
      label: "Kegiatan",
      images: [{ url: "https://example.com/broken.jpg", alt: "Foto awal" }],
    },
  ],
};

const galleryDataWithTwoImages: GalleryContent = {
  title: "Galeri",
  subtitle: "Dokumentasi kegiatan",
  groups: [
    {
      label: "Kegiatan",
      images: [
        { url: "https://example.com/broken.jpg", alt: "Foto gagal" },
        { url: "https://example.com/valid.jpg", alt: "Foto valid" },
      ],
    },
  ],
};

const galleryDataWithTwoGroups: GalleryContent = {
  title: "Galeri",
  subtitle: "Dokumentasi kegiatan",
  groups: [
    {
      label: "Grup Gagal",
      images: [
        { url: "https://example.com/group-broken.jpg", alt: "Foto grup gagal" },
      ],
    },
    {
      label: "Grup Valid",
      images: [
        { url: "https://example.com/group-valid.jpg", alt: "Foto grup valid" },
      ],
    },
  ],
};

describe("GalleryForm image previews", () => {
  it("shows a placeholder after an image error", () => {
    const { container } = render(<GalleryForm initialData={galleryData} />);
    fireEvent.error(screen.getByAltText("Foto awal"));

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("div.w-16.h-16 svg.lucide-image")).not.toBeNull();
  });

  it("resets the broken preview state when the image URL changes", () => {
    const { container } = render(<GalleryForm initialData={galleryData} />);
    fireEvent.error(screen.getByAltText("Foto awal"));

    const urlInput = screen.getByDisplayValue("https://example.com/broken.jpg");
    fireEvent.change(urlInput, {
      target: { value: "https://example.com/recovered.jpg" },
    });

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/recovered.jpg"
    );
    expect(container.querySelector("div.w-16.h-16 svg.lucide-image")).toBeNull();
  });

  it("keeps the next image preview after deleting a failed image", () => {
    render(<GalleryForm initialData={galleryDataWithTwoImages} />);
    fireEvent.error(screen.getByAltText("Foto gagal"));
    fireEvent.click(screen.getAllByTitle("Hapus foto ini")[0]);

    expect(screen.getByAltText("Foto valid")).toBeDefined();
  });

  it("keeps valid previews attached when groups are reordered", () => {
    render(<GalleryForm initialData={galleryDataWithTwoGroups} />);
    fireEvent.error(screen.getByAltText("Foto grup gagal"));
    fireEvent.click(screen.getAllByTitle("Pindah ke bawah")[0]);

    expect(screen.getByAltText("Foto grup valid")).toBeDefined();
  });

  it("keeps valid previews after a failed group is deleted", () => {
    render(<GalleryForm initialData={galleryDataWithTwoGroups} />);
    fireEvent.error(screen.getByAltText("Foto grup gagal"));
    fireEvent.click(screen.getAllByTitle("Hapus item")[0]);

    expect(screen.getByAltText("Foto grup valid")).toBeDefined();
  });
});
