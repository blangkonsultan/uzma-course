import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StudentForm } from "@/components/admin/murid/student-form";
import { STUDENT_PROGRAM_STATUS_OPTIONS } from "@/types";
import "@testing-library/jest-dom";

vi.mock("@/app/admin/murid/actions", () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

describe("Student Program Status Vocabulary", () => {
  it("exports canonical status options matching the database constraint", () => {
    const values = STUDENT_PROGRAM_STATUS_OPTIONS.map((o) => o.value);
    expect(values).toEqual(["active", "cuti", "lulus", "keluar"]);
  });

  it("renders canonical status options in StudentForm when programs are selected", () => {
    const mockBranches = [
      { id: "junwangi", name: "Cabang Junwangi", is_active: true } as never,
    ];
    const mockPrograms = [
      {
        id: "p1",
        name: "AHE",
        initials: "AHE",
        is_active: true,
        program_variants: [
          { id: "v1", name: "AHE Reguler", default_spp: 150000 },
        ],
      } as never,
    ];
    const initialData = {
      id: "student-1",
      full_name: "Ahmad",
      parent_name: "Bapak Ahmad",
      parent_phone: "081234567890",
      branch_id: "junwangi",
      student_programs: [
        { program_id: "p1", variant_id: "v1", status: "active" },
      ],
    } as never;

    render(
      <StudentForm
        branches={mockBranches}
        programs={mockPrograms}
        initialData={initialData}
        isEdit={true}
      />
    );

    const select = screen.getByLabelText(/Status Program/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.querySelectorAll("option"))
      .map((o) => o.value)
      .filter(Boolean);
    expect(options).toEqual(["active", "cuti", "lulus", "keluar"]);
  });
});
