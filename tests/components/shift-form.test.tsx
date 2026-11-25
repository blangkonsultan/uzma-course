/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShiftForm } from "@/components/admin/shift/shift-form";
import { updateShift } from "@/app/admin/shift/actions";

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

  it("rejected_shift_edit_keeps_name_and_time_inputs_for_retry", async () => {
    vi.mocked(updateShift).mockResolvedValue({
      error: "Ada kelas di luar rentang jam baru. Sesuaikan jadwal kelas terlebih dahulu, lalu simpan ulang.",
    });

    const initialData = {
      id: "shift-1",
      branch_id: "krian",
      name: "Pagi",
      start_time: "08:00:00",
      end_time: "08:30:00",
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    render(<ShiftForm branches={mockBranches} initialData={initialData} />);

    const nameInput = screen.getByLabelText(/Nama Shift/i);
    const startInput = screen.getByLabelText(/Jam Mulai/i);

    fireEvent.change(nameInput, { target: { value: "Pagi Revisi" } });
    fireEvent.change(startInput, { target: { value: "08:05" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Ada kelas di luar rentang jam baru/i)).toBeInTheDocument();
    expect(nameInput).toHaveValue("Pagi Revisi");
    expect(startInput).toHaveValue("08:05");
    await vi.waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });
  });

  it("corrected_shift_edit_can_be_resubmitted", async () => {
    vi.mocked(updateShift)
      .mockResolvedValueOnce({
        error: "Ada kelas di luar rentang jam baru.",
        fieldErrors: {
          start_time: "Ada kelas yang berada di luar rentang jam baru.",
          end_time: "Ada kelas yang berada di luar rentang jam baru.",
        },
      })
      .mockResolvedValueOnce(undefined);

    const initialData = {
      id: "shift-1",
      branch_id: "krian",
      name: "Pagi",
      start_time: "08:00:00",
      end_time: "08:30:00",
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    render(<ShiftForm branches={mockBranches} initialData={initialData} />);

    const startInput = screen.getByLabelText(/Jam Mulai/i);
    const endInput = screen.getByLabelText(/Jam Selesai/i);
    expect(startInput).toBeRequired();
    expect(endInput).toBeRequired();

    fireEvent.change(startInput, { target: { value: "08:05" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));

    expect(await screen.findByText(/Ada kelas di luar rentang jam baru/i)).toBeInTheDocument();

    fireEvent.change(startInput, { target: { value: "07:45" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));

    await vi.waitFor(() => {
      expect(updateShift).toHaveBeenCalledTimes(2);
    });

    const secondCallFormData = vi.mocked(updateShift).mock.calls[1][1] as FormData;
    expect(secondCallFormData.get("start_time")).toBe("07:45");
    expect(secondCallFormData.get("end_time")).toBe("08:30:00");
  });

  it("preserves_untouched_seconds_precision_on_rename_edit", async () => {
    vi.mocked(updateShift).mockResolvedValueOnce(undefined);

    const initialData = {
      id: "shift-1",
      branch_id: "krian",
      name: "Pagi",
      start_time: "08:00:30",
      end_time: "08:30:30",
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    render(<ShiftForm branches={mockBranches} initialData={initialData} />);

    const nameInput = screen.getByLabelText(/Nama Shift/i);
    fireEvent.change(nameInput, { target: { value: "Pagi Spesial" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan Perubahan/i }));

    await vi.waitFor(() => {
      expect(updateShift).toHaveBeenCalledTimes(1);
    });

    const submitted = vi.mocked(updateShift).mock.calls[0][1] as FormData;
    expect(submitted.get("name")).toBe("Pagi Spesial");
    expect(submitted.get("start_time")).toBe("08:00:30");
    expect(submitted.get("end_time")).toBe("08:30:30");
  });
});
