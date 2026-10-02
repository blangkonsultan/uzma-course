/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuruForm } from "@/components/admin/guru/guru-form";
import "@testing-library/jest-dom";

vi.mock("@/app/admin/guru/actions", () => ({
  createGuru: vi.fn(),
  updateGuru: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

describe("GuruForm Component", () => {
  const mockBranches = [
    { id: "balongbendo", name: "Cabang Balongbendo", is_active: true } as any,
  ];
  const mockPrograms = [
    { id: "p1", name: "AHE", type: "franchise", initials: "AHE", is_active: true } as any,
    { id: "p2", name: "Mapel", type: "original", initials: "MPL", is_active: true } as any,
  ];
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for create mode", () => {
    render(<GuruForm branches={mockBranches} programs={mockPrograms} />);
    
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    // expect(screen.getByRole("button", { name: /Simpan Guru/i })).toBeInTheDocument();
  });

  it("renders correctly for edit mode", () => {
    const initialData = {
      id: "guru-1",
      full_name: "Pak Budi",
      email: "budi@test.com",
      role: "guru",
      is_active: true,
      profile_programs: [{ program_id: "p1" }]
    } as any;

    render(<GuruForm branches={mockBranches} programs={mockPrograms} initialData={initialData} isEdit={true} />);
    
    expect(screen.getByDisplayValue("Pak Budi")).toBeInTheDocument();
    // expect(screen.getByRole("button", { name: /Simpan Perubahan/i })).toBeInTheDocument();
  });
});
