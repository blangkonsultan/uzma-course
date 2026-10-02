/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShiftForm } from "@/components/admin/shift/shift-form";
import { createShift, updateShift } from "@/app/admin/shift/actions";

// Mock the server actions
vi.mock("@/app/admin/shift/actions", () => ({
  createShift: vi.fn(),
  updateShift: vi.fn(),
}));

// Mock Next.js router
const pushMock = vi.fn();
const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

describe("ShiftForm Component", () => {
  const mockBranches = [
    { id: "balongbendo", name: "Cabang Balongbendo", is_active: true } as any,
    { id: "krian", name: "Cabang Krian", is_active: true } as any,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for create mode", () => {
    render(<ShiftForm branches={mockBranches} />);
    
    expect(screen.getByLabelText(/Cabang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Shift/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jam Mulai/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jam Selesai/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Simpan Shift/i })).toBeInTheDocument();
  });

  it("renders correctly for edit mode", () => {
    const initialData = {
      id: "shift-1",
      branch_id: "krian",
      name: "Sore",
      start_time: "15:00:00",
      end_time: "19:30:00",
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    render(<ShiftForm branches={mockBranches} initialData={initialData} />);
    
    expect(screen.getByDisplayValue("Sore")).toBeInTheDocument();
    expect(screen.getByLabelText(/Jam Mulai/i)).toHaveValue("15:00");
    expect(screen.getByLabelText(/Jam Selesai/i)).toHaveValue("19:30");
    
    const branchSelect = screen.getByLabelText(/Cabang/i) as HTMLSelectElement;
    expect(branchSelect.value).toBe("krian");
    expect(branchSelect.disabled).toBe(true); // Should be disabled in edit mode
    
    expect(screen.getByRole("button", { name: /Simpan Perubahan/i })).toBeInTheDocument();
  });

  it("calls router.back on cancel", () => {
    render(<ShiftForm branches={mockBranches} />);
    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    expect(backMock).toHaveBeenCalled();
  });
});
