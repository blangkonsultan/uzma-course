import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { KanbanBoard } from "@/components/admin/board/kanban-board";

// Mock server actions to prevent real network calls
vi.mock("@/app/admin/draft/board-actions", () => ({
  createScheduleClass: vi.fn(),
  createSchedulePlacement: vi.fn(),
  removeScheduleClass: vi.fn(),
  removeSchedulePlacement: vi.fn(),
}));

// ResizeObserver mock required for dnd-kit
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("KanbanBoard Component", () => {
  const mockProps = {
    draft: { id: "d1", name: "Draf A", branch_id: "krian", status: "draft" },
    shifts: [
      { id: "s1", name: "Pagi", start_time: "09:00", end_time: "12:00" },
      { id: "s2", name: "Sore", start_time: "15:00", end_time: "18:00" }
    ],
    teachers: [
      { id: "t1", full_name: "Pak Budi", profile_programs: [{ program_id: "p1" }] }
    ],
    variants: [
      { id: "v1", name: "AHE Reg", system: 2, program_id: "p1", programs: null }
    ],
    students: [
      { id: "st1", full_name: "Andi", student_programs: [{ program_id: "p1", variant_id: "v1" }] },
      { id: "st2", full_name: "Budi", student_programs: [{ program_id: "p1", variant_id: "v1" }] }
    ],
    initialClasses: []
  };

  it("renders shifts correctly", () => {
    render(<KanbanBoard {...mockProps} />);
    expect(screen.getByText("Pagi")).toBeInTheDocument();
    expect(screen.getByText("Sore")).toBeInTheDocument();
  });

  it("renders teacher combos in sidebar", () => {
    render(<KanbanBoard {...mockProps} />);
    expect(screen.getByText("Pak Budi")).toBeInTheDocument();
    expect(screen.getByText("AHE Reg")).toBeInTheDocument();
  });

  it("switches to student tab and renders students", () => {
    render(<KanbanBoard {...mockProps} />);
    
    // Switch tab
    fireEvent.click(screen.getByText(/Murid/i));
    
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("filters sidebar items based on search", () => {
    render(<KanbanBoard {...mockProps} />);
    
    // Test teacher filter
    const searchInput = screen.getByPlaceholderText(/Cari\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "Budi" } });
    expect(screen.getByText("Pak Budi")).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: "Siti" } });
    expect(screen.queryByText("Pak Budi")).not.toBeInTheDocument();

    // Switch tab and test student filter
    fireEvent.click(screen.getByText(/Murid/i));
    fireEvent.change(searchInput, { target: { value: "Andi" } });
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.queryByText("Budi")).not.toBeInTheDocument();
  });
  it("filters sidebar items based on program dropdown", () => {
    const multiProgramProps = {
      ...mockProps,
      teachers: [
        { id: "t1", full_name: "Pak Budi", profile_programs: [{ program_id: "p1" }] },
        { id: "t2", full_name: "Bu Siti", profile_programs: [{ program_id: "p2" }] },
      ],
      variants: [
        { id: "v1", name: "AHE Reg", system: 2, program_id: "p1", programs: { id: "p1", name: "Les Baca AHE" } },
        { id: "v2", name: "ASE Reg", system: 2, program_id: "p2", programs: { id: "p2", name: "Les Hitung ASE" } },
      ],
      students: [
        { id: "st1", full_name: "Andi", student_programs: [{ program_id: "p1", variant_id: "v1" }] },
        { id: "st2", full_name: "Budi", student_programs: [{ program_id: "p2", variant_id: "v2" }] },
      ],
    };

    render(<KanbanBoard {...multiProgramProps} />);

    expect(screen.getByText("Pak Budi")).toBeInTheDocument();
    expect(screen.getByText("Bu Siti")).toBeInTheDocument();

    const programSelect = screen.getByLabelText(/Filter berdasarkan program belajar/i);
    fireEvent.change(programSelect, { target: { value: "p1" } });

    expect(screen.getByText("Pak Budi")).toBeInTheDocument();
    expect(screen.queryByText("Bu Siti")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Murid/i));

    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.queryByText("Budi")).not.toBeInTheDocument();

    fireEvent.change(programSelect, { target: { value: "p2" } });
    expect(screen.queryByText("Andi")).not.toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("switches active day", () => {
    render(<KanbanBoard {...mockProps} />);
    
    // Senin is default (day 1)
    const tuesdayBtn = screen.getByRole("button", { name: "Selasa" });
    fireEvent.click(tuesdayBtn);
    
    // UI doesn't visually display "Day 2 is active" in text outside the button class,
    // but clicking it shouldn't crash.
    expect(tuesdayBtn.className).toContain("bg-primary-600");
  });

  it("opens AddClassModal when Tambah Kelas is clicked", () => {
    render(<KanbanBoard {...mockProps} />);
    
    // Find all 'Tambah Kelas' buttons (one for each shift)
    const addClassButtons = screen.getAllByTitle("Tambah Kelas");
    expect(addClassButtons.length).toBe(2); // Pagi, Sore
    
    // Click the first one (Pagi)
    fireEvent.click(addClassButtons[0]);
    
    // Verify Modal opens by checking for its header
    expect(screen.getByText("Tambah Kelas")).toBeInTheDocument();
    expect(screen.getByText("Shift: Pagi")).toBeInTheDocument();
  });
  
  it("opens AddStudentModal when Tambah Murid is clicked on a class", () => {
    const propsWithClass = {
      ...mockProps,
      initialClasses: [
        {
          id: "c1",
          shift_id: "s1",
          day_of_week: 1,
          teacher_id: "t1",
          variant_id: "v1",
          start_time: "09:00:00",
          end_time: "10:30:00",
          schedule_placements: []
        }
      ]
    };
    
    render(<KanbanBoard {...propsWithClass} />);
    
    // Find 'Tambah Murid' button inside the rendered class
    const addStudentButton = screen.getByText(/Tambah Murid/i);
    expect(addStudentButton).toBeInTheDocument();
    
    // Click it
    fireEvent.click(addStudentButton);
    
    // Verify Student Modal opens
    expect(screen.getByText("Pilih murid untuk dimasukkan ke kelas")).toBeInTheDocument();
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });
});
