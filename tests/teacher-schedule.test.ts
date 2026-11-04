import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { getTeacherActiveSchedule } from "@/lib/teacher-schedule";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
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

    const rpcMock = vi.fn().mockImplementation((fn: string) => {
      if (fn === "get_teacher_class_students") {
        return {
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      if (fn === "get_teacher_overdue_spp") {
        return {
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      throw new Error(`Unexpected RPC: ${fn}`);
    });

    (createClient as unknown as Mock).mockResolvedValue({
      from: vi.fn((table: string) =>
        table === "schedule_classes" ? scheduleQuery : teachingSessionQuery
      ),
      rpc: rpcMock,
    });

    const result = await getTeacherActiveSchedule("teacher-1");

    expect(result.classes[0]).toMatchObject({
      id: "class-1",
      teaching_log_date: "2026-10-15",
      teaching_log_status: "submitted",
    });
  });

  it("enriches students with overdue SPP details when invoices are unpaid and past due", async () => {
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
        resolve({ data: [], error: null }),
    };

    const rpcMock = vi.fn().mockImplementation((fn: string) => {
      if (fn === "get_teacher_class_students") {
        return {
          range: vi.fn().mockResolvedValue({
            data: [
              { class_id: "class-1", student_id: "student-1", full_name: "Murid Satu", student_number: "01001" },
              { class_id: "class-1", student_id: "student-2", full_name: "Murid Dua", student_number: "01002" },
            ],
            error: null,
          }),
        };
      }
      if (fn === "get_teacher_overdue_spp") {
        return {
          range: vi.fn().mockResolvedValue({
            data: [
              {
                class_id: "class-1",
                student_id: "student-1",
                program_id: "program-1",
                due_date: "2026-09-10",
                total_amount: 300000,
                invoice_count: 2,
              },
            ],
            error: null,
          }),
        };
      }
      throw new Error(`Unexpected RPC: ${fn}`);
    });

    (createClient as unknown as Mock).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") return scheduleQuery;
        if (table === "teaching_sessions") return teachingSessionQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
      rpc: rpcMock,
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

  it("handles invoice RPC errors gracefully without throwing", async () => {
    const scheduleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) =>
        resolve({ data: [rawClass], error: null }),
    };

    const rpcMock = vi.fn().mockImplementation((fn: string) => {
      if (fn === "get_teacher_class_students") {
        return {
          range: vi.fn().mockResolvedValue({
            data: [
              { class_id: "class-1", student_id: "student-1", full_name: "Murid Satu", student_number: "01001" },
            ],
            error: null,
          }),
        };
      }
      if (fn === "get_teacher_overdue_spp") {
        return {
          range: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "connection timeout" },
          }),
        };
      }
      throw new Error(`Unexpected RPC: ${fn}`);
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    (createClient as unknown as Mock).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") return scheduleQuery;
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          then: (r: (v: unknown) => unknown) => r({ data: [], error: null }),
        };
      }),
      rpc: rpcMock,
    });

    const result = await getTeacherActiveSchedule("teacher-1");
    expect(result.classes[0].overdue_students_count).toBe(0);
    expect(result.classes[0].students[0].overdue_spp).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Gagal membaca ringkasan SPP murid jatuh tempo"),
      "connection timeout"
    );
    warnSpy.mockRestore();
  });
});
