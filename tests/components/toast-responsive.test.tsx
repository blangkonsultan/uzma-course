import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toast, showToast } from "@/components/admin/toast";
import "@testing-library/jest-dom";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/guru/absen",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Toast Responsive Positioning", () => {
  it("renders with bottom-20 and horizontal mobile margins to avoid clipping and nav collision", async () => {
    render(<Toast />);
    showToast("Presensi berhasil!", "success");

    const toastElement = await screen.findByRole("status");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement.className).toContain("bottom-20");
    expect(toastElement.className).toContain("left-4");
    expect(toastElement.className).toContain("right-4");
  });
});
