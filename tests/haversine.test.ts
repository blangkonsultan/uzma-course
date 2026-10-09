import { describe, it, expect } from "vitest";
import { calculateDistanceMeters, formatDistance } from "@/lib/pwa/haversine";

describe("Haversine & Distance Formatter", () => {
  it("calculates distance between two coordinates correctly", () => {
    // Jakarta Monas to Bundaran HI (~2.3 km)
    const dist = calculateDistanceMeters(-6.1754, 106.8272, -6.1951, 106.8231);
    expect(dist).toBeGreaterThan(2000);
    expect(dist).toBeLessThan(2500);
  });

  it("formats distance below 1000m as meters", () => {
    expect(formatDistance(50)).toBe("50m");
    expect(formatDistance(450.4)).toBe("450m");
    expect(formatDistance(999)).toBe("999m");
  });

  it("formats distance 1000m and above as kilometers with 1 decimal comma", () => {
    expect(formatDistance(1000)).toBe("1,0 km");
    expect(formatDistance(1500)).toBe("1,5 km");
    expect(formatDistance(12340)).toBe("12,3 km");
  });
});
