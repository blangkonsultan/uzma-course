import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { 
  createScheduleClass, 
  createSchedulePlacement,
  removeScheduleClass,
  removeSchedulePlacement
} from "@/app/admin/draft/board-actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

describe("Board Actions (src/app/admin/draft/board-actions.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMock = () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: "inserted-id" }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    
    const mockProfileSingle = vi.fn().mockResolvedValue({ data: { role: "admin" } });
    const mockProfileEq = vi.fn().mockReturnValue({ single: mockProfileSingle });
    const mockProfileSelect = vi.fn().mockReturnValue({ eq: mockProfileEq });

    (createClient as unknown as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } })
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return { select: mockProfileSelect };
        }
        if (table === "branch_shifts") {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { start_time: "08:00", end_time: "12:00" }, error: null }) }) }) };
        }
        if (table === "schedule_classes") {
          return {
            insert: mockInsert,
            delete: mockDelete,
            select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ or: vi.fn().mockResolvedValue({ data: [], error: null }) }) }) }) }),
          };
        }
        return {
          insert: mockInsert,
          delete: mockDelete,
        };
      }),
    });
  };

  it("createScheduleClass succeeds", async () => {
    setupMock();
    const result = await createScheduleClass({
      draft_id: "d1",
      shift_id: "s1",
      day_of_week: 1,
      teacher_id: "t1",
      variant_id: "v1",
      start_time: "09:00",
      end_time: "10:00"
    });
    expect(result).toHaveProperty("id", "inserted-id");
  });

  it("createSchedulePlacement succeeds", async () => {
    setupMock();
    const result = await createSchedulePlacement({
      class_id: "c1",
      student_id: "st1",
    });
    expect(result).toHaveProperty("id", "inserted-id");
  });

  it("removeScheduleClass succeeds", async () => {
    setupMock();
    await removeScheduleClass("c1");
  });

  it("removeSchedulePlacement succeeds", async () => {
    setupMock();
    await removeSchedulePlacement("p1");
  });
});
