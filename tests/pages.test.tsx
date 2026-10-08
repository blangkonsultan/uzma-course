import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { requireAdminPage } from "@/lib/auth";
import { getProgramById } from "@/lib/programs";
import { getBranchById, getBranchDetailData } from "@/lib/branches";
import { getStudentByIdForView } from "@/lib/students";
import DraftPage from "@/app/admin/draft/page";
import { getScheduleDrafts } from "@/lib/drafts";

vi.mock("@/lib/drafts", () => ({
  getScheduleDrafts: vi.fn().mockResolvedValue([]),
}));
const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});
const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: vi.fn().mockImplementation(() => {
        const mockQuery: Record<string, unknown> = {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          single: mockSingle,
          maybeSingle: mockSingle,
        };
        mockQuery.then = (resolve: (value: unknown) => void) =>
          resolve({
            data: [
              {
                id: "item-1",
                name: "Item Satu",
                full_name: "Item Satu",
                parent_name: "Orang Tua",
                parent_phone: "08123456789",
                birth_date: "2018-01-01",
                is_active: true,
                branch_id: "krian",
                role: "guru",
                student_programs: [{ program_id: "ahe" }],
                profile_programs: [{ program_id: "ahe" }],
              },
            ],
            count: 1,
            error: null,
          });
        return mockQuery;
      }),
    })
  ),
}));


vi.mock("@/lib/auth", () => ({
  requireAdminPage: vi.fn()
}));

vi.mock("@/lib/dashboard", () => ({
  getActiveGuruCount: vi.fn().mockResolvedValue(10),
  getActiveStudents: vi.fn().mockResolvedValue([]),
  getActiveBranches: vi.fn().mockResolvedValue(5),
  getActivePrograms: vi.fn().mockResolvedValue(3),
  getRecentStudents: vi.fn().mockResolvedValue([]),
  getRecentGurus: vi.fn().mockResolvedValue([])
}));

vi.mock("@/lib/branches", () => ({
  getPaginatedBranchesWithStats: vi.fn().mockResolvedValue({ branches: [{ id: "krian", name: "Cabang Krian" }], totalItems: 1, totalPages: 1 }),
  getBranchById: vi.fn(),
  getBranchDetailData: vi.fn().mockResolvedValue({ branch: { id: "krian", name: "Cabang Krian" }, guruCount: 0, studentCount: 0 }),
  getAllBranches: vi.fn().mockResolvedValue([{ id: "krian", name: "Cabang Krian" } as never]),
  getBranches: vi.fn().mockResolvedValue([{ id: "krian", name: "Cabang Krian" } as never])
}));

vi.mock("@/lib/programs", () => ({
  getPaginatedPrograms: vi.fn().mockResolvedValue({ data: [], count: 0 }),
  getProgramEnrollmentStats: vi.fn().mockResolvedValue([]),
  getProgramById: vi.fn(),
  getPrograms: vi.fn().mockResolvedValue([{ id: "ahe", name: "AHE" } as never])
}));

vi.mock("@/lib/students", () => ({
  getPaginatedStudents: vi.fn().mockResolvedValue({ students: [], count: 0 }),
  getStudentById: vi.fn().mockResolvedValue({ id: "murid-1", full_name: "Murid Satu" }),
  getStudentByIdForView: vi.fn(),
  getStudentByIdForEdit: vi.fn().mockResolvedValue({ id: "murid-1", full_name: "Murid Satu" })
}));

vi.mock("@/lib/gurus", () => ({
  getPaginatedGurus: vi.fn().mockResolvedValue({ data: [], count: 0 }),
  getGuruById: vi.fn().mockResolvedValue({ id: "guru-1", full_name: "Guru Satu" })
}));






// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));


// Mock libraries

vi.mock("@/components/admin/birthday-dashboard", () => ({
  BirthdayDashboard: () => <div data-testid="birthday-dashboard">Mocked Birthdays</div>,
}));


import LandingPage from "@/app/page";
import LoginPage from "@/app/login/page";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import AdminDashboardPage from "@/app/admin/page";
import CabangListPage from "@/app/admin/cabang/page";
import TambahCabangPage from "@/app/admin/cabang/tambah/page";
import DetailCabangPage from "@/app/admin/cabang/[id]/page";
import EditCabangPage from "@/app/admin/cabang/[id]/edit/page";
import GuruListPage from "@/app/admin/guru/page";
import TambahGuruPage from "@/app/admin/guru/tambah/page";
import EditGuruPage from "@/app/admin/guru/[id]/edit/page";
import MuridListPage from "@/app/admin/murid/page";
import TambahMuridPage from "@/app/admin/murid/tambah/page";
import DetailMuridPage from "@/app/admin/murid/[id]/page";
import EditMuridPage from "@/app/admin/murid/[id]/edit/page";
import ProgramListPage from "@/app/admin/program/page";
import TambahProgramPage from "@/app/admin/program/tambah/page";
import DetailProgramPage from "@/app/admin/program/[id]/page";
import EditProgramPage from "@/app/admin/program/[id]/edit/page";
import LandingCmsPage from "@/app/admin/landing/page";
import SectionEditorPage from "@/app/admin/landing/[section]/page";
import type { LandingSectionKey } from "@/types/landing";

describe("Application Pages (src/app/)", () => {
  const dummyAdminUser = { id: "admin-1", email: "admin@uzma.com" };
  const dummyAdminProfile = {
    id: "admin-1",
    role: "admin",
    name: "Admin",
    full_name: "Admin User",
    parent_name: "Orang Tua",
    parent_phone: "08123456789",
    birth_date: "2018-01-01",
    is_active: true,
    branch_id: "krian",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    student_programs: [{ program_id: "ahe" }],
    profile_programs: [{ program_id: "ahe" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: dummyAdminUser } });
    mockSingle.mockResolvedValue({ data: dummyAdminProfile });

    vi.mocked(requireAdminPage).mockResolvedValue({
      user: dummyAdminUser as unknown as NonNullable<Awaited<ReturnType<typeof requireAdminPage>>["user"]>,
      profile: dummyAdminProfile as unknown as NonNullable<Awaited<ReturnType<typeof requireAdminPage>>["profile"]>,
      supabase: {} as unknown as NonNullable<Awaited<ReturnType<typeof requireAdminPage>>["supabase"]>
    });

    vi.mocked(getBranchById).mockResolvedValue({
      id: "krian",
      name: "Cabang Krian",
      sub_name: "Sentra Ahe",
      address: "Jl. Raya Krian",
      is_active: true,
    } as never);
    vi.mocked(getProgramById).mockResolvedValue({
      id: "ahe",
      initials: "AHE",
      name: "Baca Tulis Anak Hebat",
      tagline: "Baca Tulis",
      is_active: true,
      features: ["Modul"],
    } as never);
    vi.mocked(getStudentByIdForView).mockResolvedValue({
      id: "murid-1",
      full_name: "Murid Satu",
      parent_phone: "08123456789",
    } as unknown as NonNullable<Awaited<ReturnType<typeof getStudentByIdForView>>>);
  });

  describe("Public Pages", () => {
    it("renders LandingPage", async () => {
      const pageJsx = await LandingPage();
      render(pageJsx);
      expect(screen.getAllByText("Uzma Course").length).toBeGreaterThan(0);
    });

    it("renders LoginPage", () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText("nama@email.com")).toBeDefined();
    });

    it("returns valid sitemap and robots config", () => {
      const site = sitemap();
      expect(site[0].url).toBe("https://uzmacourse.com");
      const rob = robots();
      expect(rob.sitemap).toBe("https://uzmacourse.com/sitemap.xml");
    });
  });

  describe("Admin Dashboard Page", () => {
    it("renders AdminDashboardPage for admin", async () => {
      const pageJsx = await AdminDashboardPage();
      render(pageJsx);
      expect(screen.getByText(/sistem manajemen operasional/i)).toBeDefined();
    });

    it("redirects unauthenticated user to login", async () => {
      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /login"));
      await expect(AdminDashboardPage()).rejects.toThrow("NEXT_REDIRECT: /login");
    });
  });

  describe("Cabang Pages", () => {
    it("renders CabangListPage with default and custom filters", async () => {
      const page1 = await CabangListPage({ searchParams: Promise.resolve({}) });
      render(page1);
      expect(screen.getAllByText("Data Cabang").length).toBeGreaterThan(0);

      const page2 = await CabangListPage({ searchParams: Promise.resolve({ q: "krian", status: "inactive" }) });
      render(page2);

      const page3 = await CabangListPage({ searchParams: Promise.resolve({ status: "active" }) });
      render(page3);
    });

    it("redirects non-admin from CabangListPage", async () => {
      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(CabangListPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT: /admin");
    });

    it("renders TambahCabangPage", async () => {
      const pageJsx = await TambahCabangPage();
      render(pageJsx);
      expect(screen.getByText("Tambah Cabang Baru")).toBeDefined();
    });

    it("renders DetailCabangPage and calls notFound if absent", async () => {
      const pageJsx = await DetailCabangPage({ params: Promise.resolve({ id: "krian" }) });
      render(pageJsx);
      expect(screen.getAllByText("Cabang Krian").length).toBeGreaterThan(0);
      vi.mocked(getBranchDetailData).mockResolvedValueOnce({ branch: null, guruCount: 0, studentCount: 0 } as unknown as { branch: null, guruCount: number, studentCount: number });
      await expect(DetailCabangPage({ params: Promise.resolve({ id: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("renders EditCabangPage and calls notFound if absent", async () => {
      const pageJsx = await EditCabangPage({ params: Promise.resolve({ id: "krian" }) });
      render(pageJsx);
      expect(screen.getByText(/Edit Cabang/i)).toBeDefined();

      vi.mocked(getBranchById).mockResolvedValueOnce(null);
      await expect(EditCabangPage({ params: Promise.resolve({ id: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });

  describe("Guru Pages", () => {
    it("renders GuruListPage with filters", async () => {
      const page1 = await GuruListPage({ searchParams: Promise.resolve({}) });
      render(page1);
      expect(screen.getAllByText("Data Guru").length).toBeGreaterThan(0);

      const page2 = await GuruListPage({ searchParams: Promise.resolve({ q: "siti", status: "active", branch: "krian" }) });
      render(page2);

      const page3 = await GuruListPage({ searchParams: Promise.resolve({ status: "inactive" }) });
      render(page3);
    });

    it("redirects non-admin from GuruListPage", async () => {
      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(GuruListPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT: /admin");
    });
    it("renders TambahGuruPage and checks non-admin redirect", async () => {
      const pageJsx = await TambahGuruPage();
      render(pageJsx);
      expect(screen.getByText("Tambah Guru Baru")).toBeDefined();

      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(TambahGuruPage()).rejects.toThrow("NEXT_REDIRECT: /admin");
    });

    it("renders EditGuruPage", async () => {
      const pageJsx = await EditGuruPage({ params: Promise.resolve({ id: "item-1" }) });
      render(pageJsx);
      expect(screen.getByText(/Edit Data:/i)).toBeDefined();
    });
  });

  describe("Murid Pages", () => {
    it("renders MuridListPage with filters", async () => {
      const page1 = await MuridListPage({ searchParams: Promise.resolve({}) });
      render(page1);
      expect(screen.getAllByText("Data Murid").length).toBeGreaterThan(0);

      const page2 = await MuridListPage({ searchParams: Promise.resolve({ q: "budi", status: "active", branch: "krian", program: "ahe" }) });
      render(page2);

      const page3 = await MuridListPage({ searchParams: Promise.resolve({ status: "inactive" }) });
      render(page3);
    });

    it("renders TambahMuridPage and checks non-admin redirect", async () => {
      const pageJsx = await TambahMuridPage();
      render(pageJsx);
      expect(screen.getByText("Tambah Murid Baru")).toBeDefined();

      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(TambahMuridPage()).rejects.toThrow("NEXT_REDIRECT: /admin");
    });

    it("renders DetailMuridPage", async () => {
      const pageJsx = await DetailMuridPage({ params: Promise.resolve({ id: "item-1" }) });
      render(pageJsx);
      expect(screen.getByText("Kembali ke Data Murid")).toBeDefined();
    });

    it("renders EditMuridPage", async () => {
      const pageJsx = await EditMuridPage({ params: Promise.resolve({ id: "item-1" }) });
      render(pageJsx);
      expect(screen.getByText(/Edit Data:/i)).toBeDefined();
    });
  });

  describe("Program Pages", () => {
    it("renders ProgramListPage", async () => {
      const page1 = await ProgramListPage();
      render(page1);
      expect(screen.getByText(/Master Program Belajar/i)).toBeDefined();
    });

    it("redirects non-admin from ProgramListPage", async () => {
      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(ProgramListPage()).rejects.toThrow("NEXT_REDIRECT: /admin");
    });

    it("renders TambahProgramPage and checks non-admin redirect", async () => {
      const pageJsx = await TambahProgramPage();
      render(pageJsx);
      expect(screen.getByText("Tambah Program Baru")).toBeDefined();

      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(TambahProgramPage()).rejects.toThrow("NEXT_REDIRECT: /admin");
    });
    it("renders DetailProgramPage and checks notFound", async () => {
      const pageJsx = await DetailProgramPage({ params: Promise.resolve({ id: "ahe" }) });
      render(pageJsx);
      expect(screen.getAllByText("Baca Tulis Anak Hebat").length).toBeGreaterThan(0);

      vi.mocked(getProgramById).mockResolvedValueOnce(null);
      await expect(DetailProgramPage({ params: Promise.resolve({ id: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("renders EditProgramPage and checks notFound", async () => {
      const pageJsx = await EditProgramPage({ params: Promise.resolve({ id: "ahe" }) });
      render(pageJsx);
      expect(screen.getByText(/Edit Program:/i)).toBeDefined();

      vi.mocked(getProgramById).mockResolvedValueOnce(null);
      await expect(EditProgramPage({ params: Promise.resolve({ id: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });

  describe("Landing CMS Page", () => {
    it("renders LandingCmsPage and checks non-admin redirect", async () => {
      const pageJsx = await LandingCmsPage({ searchParams: Promise.resolve({}) });
      render(pageJsx);
      expect(screen.getByText("Manajemen Landing Page")).toBeDefined();

      vi.mocked(requireAdminPage).mockRejectedValueOnce(new Error("NEXT_REDIRECT: /admin"));
      await expect(LandingCmsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT: /admin");
    });

    it("renders SectionEditorPage for each valid section", async () => {
      const sections: LandingSectionKey[] = [
        "hero",
        "programs",
        "why_us",
        "facilities",
        "team",
        "gallery",
        "testimonials",
        "videos",
        "locations",
        "faq",
        "cta",
        "footer",
        "navbar",
        "floating_wa",
      ];

      for (const section of sections) {
        const pageJsx = await SectionEditorPage({
          params: Promise.resolve({ section }),
        });
        render(pageJsx);
      }
    });

    it("redirects on invalid section", async () => {
      await expect(
        SectionEditorPage({ params: Promise.resolve({ section: "invalid" as unknown as LandingSectionKey }) })
      ).rejects.toThrow("NEXT_REDIRECT: /admin");
    });
  });

  describe("Draft Pages", () => {
    it("renders DraftPage and shows warning banner for pending activation", async () => {
      const today = new Date().toISOString().split("T")[0];
      vi.mocked(getScheduleDrafts).mockResolvedValueOnce([
        { id: "d-1", name: "Draf Peringatan", status: "draft", branch_id: "krian", effective_date: today, created_at: "", updated_at: "" }
      ]);
      
      const pageJsx = await DraftPage({ searchParams: Promise.resolve({}) });
      render(pageJsx);
      
      expect(screen.getByText("Peringatan Aktivasi Jadwal")).toBeDefined();
    });
  });
});
