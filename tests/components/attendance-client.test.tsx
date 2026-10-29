import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AttendanceClient } from "@/components/guru/attendance-client";
import type { Branch } from "@/types";
import type { BranchShift } from "@/lib/shifts";
import { getPendingAttendances, type PendingAttendance } from "@/lib/pwa/db";

vi.mock("@/lib/pwa/db", () => ({
  getPendingAttendances: vi.fn(),
  savePendingAttendance: vi.fn(),
  removePendingAttendances: vi.fn(),
}));

vi.mock("@/app/guru/absen/actions", () => ({
  syncOfflineAttendances: vi.fn(),
  processOnlineCheckIn: vi.fn(),
  processOnlineCheckOut: vi.fn(),
}));

vi.mock("@/components/admin/toast", () => ({
  showToast: vi.fn(),
}));

const mockBranch: Branch = {
  id: "branch-sumo",
  name: "Cabang Sumokembangsri",
  sub_name: "Sentra Utama",
  kecamatan: "Balongbendo",
  desa: "Sumokembangsri",
  code: "01",
  address: "Jl. Raya Sumokembangsri",
  latitude: -7.432,
  longitude: 112.505,
  geofence_radius_m: 100,
  map_embed_url: null,
  gmaps_url: null,
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};

const mockShifts: Record<string, BranchShift[]> = {
  "branch-sumo": [
    {
      id: "shift-1",
      branch_id: "branch-sumo",
      name: "Shift Pagi",
      start_time: "08:00:00",
      end_time: "11:00:00",
      is_active: true,
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
    },
  ],
};

describe("AttendanceClient Truthful Presentation", () => {
  const mockGetPending = vi.mocked(getPendingAttendances);
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("distinguishes server-confirmed check-in from locally queued check-in", async () => {
    // 1. Locally queued check-in in IndexedDB
    const pendingRecord: PendingAttendance = {
      id: "queue-uuid-1",
      teacher_id: "teacher-123",
      branch_id: "branch-sumo",
      type: "check_in",
      lat: -7.432,
      lng: 112.505,
      timestamp: "2026-10-29T08:00:00Z",
    };
    mockGetPending.mockResolvedValue([pendingRecord]);

    render(
      <AttendanceClient
        teacherId="teacher-123"
        assignedBranches={[mockBranch]}
        shiftsMap={mockShifts}
        initialAttendanceId={null}
        initialIsCheckedIn={false}
        initialIsCheckedOut={false}
      />
    );

    // Expect truthful copy: "Tersimpan di Perangkat" & "Tersimpan lokal; belum terkirim"
    // FAILS BEFORE: renders "Sudah Masuk" and "Kehadiran tercatat"
    await waitFor(() => {
      expect(screen.getByText("Tersimpan di Perangkat")).toBeInTheDocument();
      expect(screen.getByText("Tersimpan lokal; belum terkirim")).toBeInTheDocument();
      expect(screen.queryByText("Kehadiran tercatat")).not.toBeInTheDocument();
    });
  });

  it("displays server-confirmed labels when check-in is confirmed on server", async () => {
    mockGetPending.mockResolvedValue([]);

    render(
      <AttendanceClient
        teacherId="teacher-123"
        assignedBranches={[mockBranch]}
        shiftsMap={mockShifts}
        initialAttendanceId="confirmed-attendance-uuid"
        initialIsCheckedIn={true}
        initialIsCheckedOut={false}
      />
    );

    // Expect server-confirmed label: "Sudah Masuk" and "Terkonfirmasi server"
    await waitFor(() => {
      expect(screen.getByText("Sudah Masuk")).toBeInTheDocument();
      expect(screen.getByText("Terkonfirmasi server")).toBeInTheDocument();
    });
  });

  it("truthfully reports offline connectivity when no records are in queue", async () => {
    mockGetPending.mockResolvedValue([]);
    // Mock navigator.onLine as false
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

    render(
      <AttendanceClient
        teacherId="teacher-123"
        assignedBranches={[mockBranch]}
        shiftsMap={mockShifts}
        initialAttendanceId={null}
        initialIsCheckedIn={false}
        initialIsCheckedOut={false}
      />
    );

    // When offline and empty queue:
    // FAILS BEFORE: claims "Presensi tersimpan lokal (IndexedDB)" even though 0 records exist
    await waitFor(() => {
      expect(screen.getByText("Presensi akan tersimpan di perangkat (IndexedDB)")).toBeInTheDocument();
    });
  });
});
