import { describe, it, expect } from "vitest";
import { sanitizeNextUrl } from "@/lib/security";

describe("sanitizeNextUrl", () => {
  it("returns default destination for null, undefined, or empty input", () => {
    expect(sanitizeNextUrl(null, "/admin")).toBe("/admin");
    expect(sanitizeNextUrl(undefined, "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("   ", "/admin")).toBe("/admin");
  });

  it("rejects absolute external URLs", () => {
    expect(sanitizeNextUrl("https://evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("http://evil.com/admin", "/admin")).toBe("/admin");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeNextUrl("//evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("//evil.com/path", "/admin")).toBe("/admin");
  });

  it("rejects executable or dangerous schemes", () => {
    expect(sanitizeNextUrl("javascript:alert(1)", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("data:text/html,<script>alert(1)</script>", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("vbscript:alert(1)", "/admin")).toBe("/admin");
  });

  it("rejects URLs containing colons, backslashes, or control characters", () => {
    expect(sanitizeNextUrl("/\\evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("/path:name", "/admin")).toBe("/admin");
  });

  it("rejects loopback to login or logout to avoid redirect cycles", () => {
    expect(sanitizeNextUrl("/login", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("/logout", "/admin")).toBe("/admin");
  });

  it("preserves valid internal relative paths", () => {
    expect(sanitizeNextUrl("/admin/murid", "/admin")).toBe("/admin/murid");
    expect(sanitizeNextUrl("/admin/guru/tambah", "/admin")).toBe("/admin/guru/tambah");
    expect(sanitizeNextUrl("/admin/draft/d1/board", "/admin")).toBe("/admin/draft/d1/board");
    expect(sanitizeNextUrl("/guru/absen", "/admin")).toBe("/guru/absen");
  });
});
