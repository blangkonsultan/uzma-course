import { describe, it, expect } from "vitest";
import { getWIBDateBounds } from "@/lib/attendances";

describe("getWIBDateBounds", () => {
  it("correctly calculates WIB date and weekday for UTC early morning timestamps", () => {
    // 2026-10-14 23:30:00 UTC is 2026-10-15 06:30:00 WIB (Thursday)
    const utcEarlyMorning = new Date("2026-10-14T23:30:00.000Z");
    const bounds = getWIBDateBounds(utcEarlyMorning);

    expect(bounds.dateString).toBe("2026-10-15");
    expect(bounds.dayOfWeek).toBe(4); // Thursday (1=Mon .. 7=Sun)
    expect(bounds.startOfDay).toBe("2026-10-14T17:00:00.000Z"); // 00:00:00 WIB in UTC
    expect(bounds.endOfDay).toBe("2026-10-15T16:59:59.999Z"); // 23:59:59.999 WIB in UTC
  });

  it("maps Sunday to dayOfWeek 7 in WIB", () => {
    // 2026-10-18 03:00:00 UTC is Sunday 10:00:00 WIB
    const sundayWIB = new Date("2026-10-18T03:00:00.000Z");
    const bounds = getWIBDateBounds(sundayWIB);

    expect(bounds.dateString).toBe("2026-10-18");
    expect(bounds.dayOfWeek).toBe(7);
  });
});
