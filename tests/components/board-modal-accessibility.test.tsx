import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddClassModal } from "@/components/admin/board/add-class-modal";
import { AddStudentModal } from "@/components/admin/board/add-student-modal";
import { ClassTimeModal } from "@/components/admin/board/class-time-modal";
import "@testing-library/jest-dom";

describe("Board Modal Accessibility", () => {
  it("AddClassModal renders with role dialog and closes on Escape key", () => {
    const onClose = vi.fn();
    const mockShifts = [{ id: "s1", name: "Shift Pagi", start_time: "08:00:00", end_time: "12:00:00" }] as never;

    render(
      <AddClassModal
        isOpen={true}
        onClose={onClose}
        shiftId="s1"
        shifts={mockShifts}
        activeDay={1}
        teachers={[]}
        variants={[]}
        existingClasses={[]}
        onNext={vi.fn()}
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("AddStudentModal renders with role dialog and closes on Escape key", () => {
    const onClose = vi.fn();

    render(
      <AddStudentModal
        isOpen={true}
        onClose={onClose}
        classId="class-1"
        variantId="var-1"
        activeDay={1}
        students={[]}
        existingClasses={[]}
        onSave={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("ClassTimeModal renders with role dialog and closes on Escape key", () => {
    const onClose = vi.fn();

    render(
      <ClassTimeModal
        isOpen={true}
        onClose={onClose}
        defaultStartTime="08:00"
        durationMinutes={30}
        onSave={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
