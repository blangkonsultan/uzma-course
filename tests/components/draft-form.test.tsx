/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DraftForm } from "@/components/admin/draft/draft-form";
import { createDraft, updateDraft } from "@/app/admin/draft/actions";

vi.mock("@/app/admin/draft/actions", () => ({
  createDraft: vi.fn(),
  updateDraft: vi.fn(),
}));

const pushMock = vi.fn();
const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

describe("DraftForm Component", () => {
  const mockBranches = [
    { id: "balongbendo", name: "Cabang Balongbendo", is_active: true } as any,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for create mode", () => {
    render(<DraftForm branches={mockBranches} />);
    
    expect(screen.getByLabelText(/Cabang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Draf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal Aktif/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buat Draf/i })).toBeInTheDocument();
  });

  it("renders correctly for edit mode", () => {
    const initialData = {
      id: "draft-1",
      branch_id: "balongbendo",
      name: "Jadwal Reguler",
      effective_date: "2026-10-15",
      status: "active" as const,
      created_at: "",
      updated_at: "",
    };

    render(<DraftForm branches={mockBranches} initialData={initialData} />);
    
    expect(screen.getByDisplayValue("Jadwal Reguler")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-10-15")).toBeInTheDocument();
    
    const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe("active");
    
    expect(screen.getByRole("button", { name: /Simpan Perubahan/i })).toBeInTheDocument();
  });

  it("calls router.back on cancel", () => {
    render(<DraftForm branches={mockBranches} />);
    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    expect(backMock).toHaveBeenCalled();
  });
});
