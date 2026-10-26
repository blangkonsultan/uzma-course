import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { insertScheduleClass } from "@/lib/board";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const CURRENT = "00000000-0000-0000-0000-000000000001";
const ACTIVE = "00000000-0000-0000-0000-000000000002";
const ARCHIVED = "00000000-0000-0000-0000-000000000003";
const ALTERNATIVE = "00000000-0000-0000-0000-000000000004";
const TEACHER = "00000000-0000-0000-0000-000000000011";
const SHIFT = "00000000-0000-0000-0000-000000000021";
const VARIANT = "00000000-0000-0000-0000-000000000031";
const CREATED = "00000000-0000-0000-0000-000000000101";

interface ClassRow {
  id: string;
  draft_id: string;
  shift_id: string;
  teacher_id: string;
  variant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

function existingClass(id: string, draft: string, start = "09:30:00", end = "10:00:00"): ClassRow {
  return { id, draft_id: draft, shift_id: SHIFT, teacher_id: TEACHER, variant_id: VARIANT, day_of_week: 6, start_time: start, end_time: end };
}

function fixture(name: string, rows: ClassRow[] = [], failDraftRead = false) {
  const classes = rows.slice();
  const drafts = [
    { id: CURRENT, status: "draft" },
    { id: ACTIVE, status: "active" },
    { id: ARCHIVED, status: "archived" },
    { id: ALTERNATIVE, status: "draft" },
  ];
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const query = url.searchParams;
    if (url.pathname.endsWith("/branch_shifts")) return json({ start_time: "08:00:00", end_time: "17:00:00" });
    if (url.pathname.endsWith("/schedule_drafts")) {
      if (failDraftRead) return json({ code: "42501", message: "Draft scope is not readable" }, 403);
      return json(drafts.filter((draft) => !query.has("status") || query.get("status") === `eq.${draft.status}`).map(({ id }) => ({ id })));
    }
    if (!url.pathname.endsWith("/schedule_classes")) return json({ message: "Unexpected test resource" }, 404);
    if (init?.method === "POST") {
      const row = { ...JSON.parse(String(init.body)), id: CREATED } as ClassRow;
      classes.push(row);
      return json(row, 201);
    }
    // The real local API returned PGRST100 for this unsupported cross-resource OR.
    if (query.get("or")?.includes("schedule_drafts.")) return json({ code: "PGRST100", message: "failed to parse logic tree" }, 400);
    const ids = query.get("draft_id")?.match(/^in\.\((.*)\)$/)?.[1].split(",").map((id) => id.replaceAll('"', ""));
    const startBound = query.get("start_time");
    const endBound = query.get("end_time");
    const matches = classes.filter((row) => {
      if (ids && !ids.includes(row.draft_id)) return false;
      if (query.has("teacher_id") && query.get("teacher_id") !== `eq.${row.teacher_id}`) return false;
      if (query.has("day_of_week") && query.get("day_of_week") !== `eq.${row.day_of_week}`) return false;
      if (startBound?.startsWith("lt.") && !(row.start_time < startBound.slice(3))) return false;
      if (startBound?.startsWith("lte.") && !(row.start_time <= startBound.slice(4))) return false;
      if (endBound?.startsWith("gt.") && !(row.end_time > endBound.slice(3))) return false;
      if (endBound?.startsWith("gte.") && !(row.end_time >= endBound.slice(4))) return false;
      return true;
    });
    return json(matches.map(({ id }) => ({ id })));
  };
  const client = createSupabaseClient("http://127.0.0.1:54321", "<TEST_KEY>", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: `scheduling-query-${name}` },
    global: { fetch: transport },
  });
  vi.mocked(createClient).mockResolvedValue(client as never);
  return classes;
}

function requestClass() {
  return insertScheduleClass({ draft_id: CURRENT, shift_id: SHIFT, teacher_id: TEACHER, variant_id: VARIANT, day_of_week: 6, start_time: "09:30:00", end_time: "10:00:00" });
}

beforeEach(() => vi.clearAllMocks());

describe("schedule conflict scope through the real Supabase query client", () => {
  it("records a valid class without treating other inactive alternatives as conflicts", async () => {
    const rows = fixture("inactive", [existingClass("archived-class", ARCHIVED), existingClass("alternative-class", ALTERNATIVE)]);
    await requestClass();
    expect(rows.map((row) => row.id)).toEqual(["archived-class", "alternative-class", CREATED]);
    expect(rows[2]).toEqual({ id: CREATED, draft_id: CURRENT, shift_id: SHIFT, teacher_id: TEACHER, variant_id: VARIANT, day_of_week: 6, start_time: "09:30:00", end_time: "10:00:00" });
  });

  it.each([["current", CURRENT], ["active-other", ACTIVE]])("preserves an overlapping %s draft class without adding another", async (name, draft) => {
    const rows = fixture(name, [existingClass("existing-conflict", draft)]);
    await expect(requestClass()).rejects.toThrow();
    expect(rows.map((row) => row.id)).toEqual(["existing-conflict"]);
  });

  it("allows an adjacent session after another active class ends", async () => {
    const rows = fixture("adjacent", [existingClass("earlier-class", ACTIVE, "09:00:00", "09:30:00")]);
    await requestClass();
    expect(rows.map((row) => ({ id: row.id, start: row.start_time, end: row.end_time }))).toEqual([
      { id: "earlier-class", start: "09:00:00", end: "09:30:00" },
      { id: CREATED, start: "09:30:00", end: "10:00:00" },
    ]);
  });

  it("fails closed without writing when the draft scope cannot be read", async () => {
    const rows = fixture("scope-error", [], true);
    await expect(requestClass()).rejects.toThrow();
    expect(rows).toEqual([]);
  });
});
