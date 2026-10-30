import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { getTeacherActiveSchedule } from "@/lib/teacher-schedule";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/attendances", () => ({
  getWIBDateBounds: vi.fn(() => ({ dateString: "2026-10-15" })),
}));

const rawClass = {
  id: "class-1",
  day_of_week: 4,
  start_time: "09:00:00",
  end_time: "09:30:00",
  shift_id: "shift-1",
  variant_id: "variant-1",
  schedule_drafts: { branches: { name: "Cabang" } },
  branch_shifts: { id: "shift-1", name: "Pagi" },
  program_variants: {
    id: "variant-1",
    name: "Reguler",
    programs: { id: "program-1", name: "AHE" },
  },
  schedule_placements: [],
};

describe("Teacher schedule teaching log status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enriches classes with the saved teaching log date and status", async () => {
    const scheduleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({ data: [rawClass], error: null }),
    };
    const teachingSessionQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({
          data: [
            {
              schedule_class_id: "class-1",
              session_date: "2026-10-15",
              status: "submitted",
            },
          ],
          error: null,
        }),
    };

    (createAdminClient as unknown as Mock).mockReturnValue({
      from: vi.fn((table: string) =>
        table === "schedule_classes" ? scheduleQuery : teachingSessionQuery
      ),
    });

    const result = await getTeacherActiveSchedule("teacher-1");

    expect(result.classes[0]).toMatchObject({
      id: "class-1",
      teaching_log_date: "2026-10-15",
      teaching_log_status: "submitted",
    });
  });

  it("enriches students with overdue SPP details when invoices are unpaid and past due", async () => {
    const rawClassWithStudents = {
      ...rawClass,
      schedule_placements: [
        {
          student_id: "student-1",
          students: { id: "student-1", full_name: "Murid Satu", student_number: "01001" },
        },
        {
          student_id: "student-2",
          students: { id: "student-2", full_name: "Murid Dua", student_number: "01002" },
        },
      ],
    };

    const scheduleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({ data: [rawClassWithStudents], error: null }),
    };

    const teachingSessionQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({ data: [], error: null }),
    };

    const invoiceQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({
          data: [
            { student_id: "student-1", due_date: "2026-10-10", total_amount: 150000 },
            { student_id: "student-1", due_date: "2026-09-10", total_amount: 150000 },
          ],
          error: null,
        }),
    };

    (createAdminClient as unknown as Mock).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") return scheduleQuery;
        if (table === "teaching_sessions") return teachingSessionQuery;
        if (table === "student_invoices") return invoiceQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    const result = await getTeacherActiveSchedule("teacher-1");
    const cls = result.classes[0];

    expect(cls.overdue_students_count).toBe(1);
    expect(cls.students[0].overdue_spp).toEqual({
      due_date: "2026-09-10",
      total_amount: 300000,
      invoice_count: 2,
    });
    expect(cls.students[1].overdue_spp).toBeNull();
  });
});
