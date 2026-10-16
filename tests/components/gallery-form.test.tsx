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

describe("GalleryForm image previews", () => {
  it("shows a placeholder after an image error", () => {
    const { container } = render(<GalleryForm initialData={galleryData} />);
    const image = screen.getByAltText("Foto awal");

    fireEvent.error(image);

    expect(container.querySelector("img")).toBeNull();
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
    expect(container.querySelector("img")?.getAttribute("style")).toBeNull();
  });
});
