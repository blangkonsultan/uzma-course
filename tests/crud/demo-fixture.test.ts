import { describe, expect, it } from "vitest";
import {
  ENROLLMENT_FIXTURES,
  FIXTURE_EXPECTATIONS,
  GURU_FIXTURES,
  STUDENT_FIXTURES,
  validateFixtureDefinition,
} from "@/../scripts/lib/demo-fixture.mjs";

describe("local demo fixture definition", () => {
  it("defines exactly seven gurus including one nullable minimum income", () => {
    expect(GURU_FIXTURES).toHaveLength(7);
    expect(GURU_FIXTURES.filter((guru) => guru.minimumIncome === null)).toHaveLength(1);
    expect(GURU_FIXTURES.filter((guru) => guru.isActive)).toHaveLength(5);
    expect(GURU_FIXTURES.filter((guru) => !guru.isActive)).toHaveLength(2);
  });

  it("defines 24 students across both preserved branches", () => {
    expect(STUDENT_FIXTURES).toHaveLength(24);
    expect(new Set(STUDENT_FIXTURES.map((student) => student.branchId))).toEqual(
      new Set(["sumokembangsri", "junwangi"])
    );
  });

  it("defines multi-program and three-program enrollment cases", () => {
    const programCounts = new Map<string, number>();
    for (const enrollment of ENROLLMENT_FIXTURES) {
      programCounts.set(
        enrollment.studentKey,
        (programCounts.get(enrollment.studentKey) || 0) + 1
      );
    }

    expect(
      [...programCounts.values()].filter((count) => count >= 2).length
    ).toBeGreaterThanOrEqual(8);
    expect(Math.max(...programCounts.values())).toBeGreaterThanOrEqual(3);
  });

  it("defines none, nominal, and percentage discount enrollment cases", () => {
    const counts = new Map<string, number>();
    for (const enrollment of ENROLLMENT_FIXTURES) {
      counts.set(
        enrollment.discountType,
        (counts.get(enrollment.discountType) || 0) + 1
      );
    }

    expect(counts.get("none")).toBeGreaterThanOrEqual(6);
    expect(counts.get("nominal")).toBeGreaterThanOrEqual(6);
    expect(counts.get("percentage")).toBeGreaterThanOrEqual(6);
  });

  it("validates the complete fixture before database access", () => {
    expect(() => validateFixtureDefinition()).not.toThrow();
    expect(FIXTURE_EXPECTATIONS.guruCount).toBe(7);
    expect(FIXTURE_EXPECTATIONS.studentCount).toBe(24);
    expect(FIXTURE_EXPECTATIONS.payrollPeriodCount).toBe(3);
  });
});
