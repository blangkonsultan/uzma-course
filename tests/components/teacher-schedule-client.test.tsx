import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeacherScheduleClient } from "@/components/guru/teacher-schedule-client";
import type { TeacherClassItem } from "@/lib/teacher-schedule";

const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay();

const classes: TeacherClassItem[] = [
  {
    id: "class-1",
    branch_name: "Cabang Sumokembangsri",
    day_of_week: todayDay,
    start_time: "09:00:00",
    end_time: "09:30:00",
    shift_name: "Pagi",
    program_name: "Les Baca AHE",
    variant_name: "Reguler",
    students: [
      { id: "student-1", full_name: "Murid Satu", student_number: "01001" },
    ],
  },
];

describe("TeacherScheduleClient Teaching Log entry", () => {
  it("renders an accessible Teaching Log link for each visible class", () => {
    render(<TeacherScheduleClient classes={classes} />);

    const link = screen.getByRole("link", { name: "Isi Kartu Mengajar" });
    expect(link.getAttribute("href")).toBe("/guru/mengajar/class-1");
  });
});
