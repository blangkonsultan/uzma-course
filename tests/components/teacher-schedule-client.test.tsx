import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeacherScheduleClient } from "@/components/guru/teacher-schedule-client";
import type { TeacherClassItem } from "@/lib/teacher-schedule";
const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
const classDay = todayDay === 1 ? 2 : 1;

const classes: TeacherClassItem[] = [
  {
    id: "class-1",
    branch_name: "Cabang Sumokembangsri",
    day_of_week: classDay,
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
    const dayLabel = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][
      classDay
    ];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(dayLabel) }));

    const link = screen.getByRole("link", { name: "Isi Kartu Mengajar" });
    expect(link.getAttribute("href")).toMatch(
      /^\/guru\/mengajar\/class-1\?date=\d{4}-\d{2}-\d{2}$/
    );
  });
  it("uses the view label and saved date for a submitted teaching log", () => {
    const submittedClass: TeacherClassItem = {
      ...classes[0],
      teaching_log_date: "2026-10-14",
      teaching_log_status: "submitted",
    };

    render(<TeacherScheduleClient classes={[submittedClass]} />);
    const dayLabel = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][
      classDay
    ];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(dayLabel) }));

    const link = screen.getByRole("link", { name: "Lihat Kartu Mengajar" });
    expect(link.getAttribute("href")).toBe(
      "/guru/mengajar/class-1?date=2026-10-14"
    );
  });
});

describe("TeacherScheduleClient Overdue SPP indicators", () => {
  const overdueClass: TeacherClassItem = {
    ...classes[0],
    overdue_students_count: 1,
    students: [
      {
        id: "student-1",
        full_name: "Murid Satu",
        student_number: "01001",
        overdue_spp: {
          due_date: "2026-10-10",
          total_amount: 350000,
          invoice_count: 2,
        },
      },
      {
        id: "student-2",
        full_name: "Murid Dua",
        student_number: "01002",
        overdue_spp: null,
      },
    ],
  };

  it("renders a pill badge on the class header when students have overdue SPP", () => {
    render(<TeacherScheduleClient classes={[overdueClass]} />);
    const dayLabel = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][classDay];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(dayLabel) }));

    expect(screen.getByText("1 Jatuh Tempo")).toBeDefined();
  });

  it("renders detailed overdue info box under student row when expanded", () => {
    render(<TeacherScheduleClient classes={[overdueClass]} />);
    const dayLabel = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][classDay];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(dayLabel) }));

    // Open the student list accordion
    const toggleButton = screen.getByRole("button", { name: /Daftar Murid/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/2 tagihan jatuh tempo sejak/)).toBeDefined();
    expect(screen.getByText(/Rp 350\.000/)).toBeDefined();
  });

  it("does not render overdue badge or box when no students have overdue SPP", () => {
    render(<TeacherScheduleClient classes={classes} />);
    const dayLabel = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][classDay];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(dayLabel) }));

    expect(screen.queryByText(/Jatuh Tempo/)).toBeNull();
  });
});
