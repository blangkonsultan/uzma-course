/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentForm } from "@/components/admin/murid/student-form";
import "@testing-library/jest-dom";

vi.mock("@/app/admin/murid/actions", () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

describe("StudentForm Component", () => {
  const mockBranches = [
    { id: "balongbendo", name: "Cabang Balongbendo", is_active: true } as any,
  ];
  const mockPrograms = [
    { id: "p1", name: "AHE", type: "franchise", initials: "AHE", is_active: true } as any,
    { id: "p2", name: "Mapel", type: "original", initials: "MPL", is_active: true } as any,
  ];
  const mockVariants = [
    { id: "v1", program_id: "p1", name: "AHE Reguler" } as any,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for create mode", () => {
    render(<StudentForm branches={mockBranches} programs={mockPrograms} />);
    
    expect(screen.getByLabelText(/Nama Lengkap Murid/i)).toBeInTheDocument();
  });

  it("renders correctly for edit mode", () => {
    const initialData = {
      id: "student-1",
      full_name: "Andi",
      parent_name: "Bapak Andi",
      parent_phone: "08123456789",
      branch_id: "balongbendo",
      student_programs: [{ program_id: "p1", variant_id: "v1" }]
    } as any;

    render(<StudentForm branches={mockBranches} programs={mockPrograms} initialData={initialData} isEdit={true} />);
    
  });
});
