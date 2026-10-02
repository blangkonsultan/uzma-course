import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { BranchStatusButton } from "@/components/admin/cabang/branch-status-button";
import { BranchForm } from "@/components/admin/cabang/branch-form";
import { GuruStatusButton } from "@/components/admin/guru/guru-status-button";
import { GuruForm } from "@/components/admin/guru/guru-form";
import { StudentStatusButton } from "@/components/admin/murid/student-status-button";
import { StudentForm } from "@/components/admin/murid/student-form";
import { ProgramStatusButton } from "@/components/admin/program/program-status-button";
import { ProgramForm } from "@/components/admin/program/program-form";

// Mock server actions
vi.mock("@/app/admin/cabang/actions", () => ({
  toggleBranchActive: vi.fn().mockResolvedValue({ success: true }),
  createBranch: vi.fn().mockResolvedValue({}),
  updateBranch: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/app/admin/guru/actions", () => ({
  toggleGuruActive: vi.fn().mockResolvedValue({ success: true }),
  createGuru: vi.fn().mockResolvedValue({}),
  updateGuru: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/app/admin/murid/actions", () => ({
  toggleStudentActive: vi.fn().mockResolvedValue({ success: true }),
  createStudent: vi.fn().mockResolvedValue({}),
  updateStudent: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/app/admin/program/actions", () => ({
  toggleProgramActive: vi.fn().mockResolvedValue({ success: true }),
  createProgram: vi.fn().mockResolvedValue({}),
  updateProgram: vi.fn().mockResolvedValue({}),
}));
import { createBranch, toggleBranchActive } from "@/app/admin/cabang/actions";
import { createGuru, toggleGuruActive } from "@/app/admin/guru/actions";
import { createStudent, toggleStudentActive } from "@/app/admin/murid/actions";
import { toggleProgramActive } from "@/app/admin/program/actions";

describe("Master Components (src/components/admin/[entity]/)", () => {
  beforeEach(() => {
    window.alert = vi.fn();
  });

  const dummyProgram = {
    id: "ahe",
    name: "AHE",
    initials: "AHE",
    tagline: "Baca Tulis",
    description: "Belajar baca tulis",
    age_range: "4-7",
    icon: "BookOpen",
    type: "franchise" as const,
    logo_url: null,
    license_provider: "AHE Pusat",
    license_url: "https://ahe.com",
    license_description: "Lisensi",
    system: 1,
    duration: 30,
    frequency: 3,
    features: ["Modul"],
    is_active: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  };

  const dummyBranch = {
    id: "krian",
    name: "Cabang Krian",
    sub_name: "Sentra Ahe",
    address: "Jl. Raya Krian",
    latitude: 0,
    longitude: 0,
    geofence_radius_m: 100,
    map_embed_url: null,
    gmaps_url: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  };

  const dummyGuru = { allowance_transport: 0, allowance_presence: 0, allowance_creativity: 0, allowance_education: 0, bank_account_holder: null, bank_account_number: null, bank_name: null, morning_guarantee_threshold: 0,
      birth_date: null, 
    id: "g-1",
    full_name: "Ustadzah Siti",
    email: "siti@uzma.com",
    phone: "08123456789",
    branch_id: "krian",
    role: "guru" as const,
    is_active: true,
    created_at: "",
    updated_at: "",
  };

  const dummyStudent = {
    id: "s-1",
    full_name: "Ahmad Faiz",
    parent_name: "Bapak Joko",
    parent_phone: "08123456789",
    parent_email: "joko@email.com",
    branch_id: "krian",
    birth_date: "2018-05-15",
    gender: "male",
    school_origin: "TK Aisyiyah",
    address: "Krian Sidoarjo",
    notes: "Catatan",
    is_active: true,
    created_at: "",
    updated_at: "",
  };

  describe("Cabang Components", () => {
    it("renders BranchStatusButton and executes status toggle", async () => {
      render(
        <BranchStatusButton
          branchId="krian"
          branchName="Cabang Krian"
          isActive={true}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Nonaktifkan"));
      const confirmBtn = screen.getByText("Ya, Nonaktifkan");
      await act(async () => {
        fireEvent.click(confirmBtn);
      });
    });

    it("renders BranchStatusButton when inactive and handles cancel & exception", async () => {
      render(
        <BranchStatusButton
          branchId="krian"
          branchName="Cabang Krian"
          isActive={false}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Aktifkan"));
      fireEvent.click(screen.getByText("Batal"));

      (toggleBranchActive as unknown as Mock).mockRejectedValueOnce(new Error("Database error"));
      fireEvent.click(screen.getByText("Aktifkan"));
      await act(async () => {
        fireEvent.click(screen.getByText("Ya, Aktifkan"));
      });
      expect(window.alert).toHaveBeenCalled();
    });

    it("handles BranchStatusButton error response", async () => {
      (toggleBranchActive as unknown as Mock).mockResolvedValueOnce({ error: "Gagal toggle" });
      render(
        <BranchStatusButton
          branchId="krian"
          branchName="Cabang Krian"
          isActive={true}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Nonaktifkan"));
      const confirmBtn = screen.getByText("Ya, Nonaktifkan");
      await act(async () => {
        fireEvent.click(confirmBtn);
      });
    });

    it("renders BranchForm in create mode, validates inputs, and submits", async () => {
      const { container } = render(<BranchForm />);
      const form = container.querySelector("form");
      
      // Submit empty to trigger validation errors
      if (form) fireEvent.submit(form);
      expect(screen.getAllByText(/minimal 2 karakter/i).length).toBeGreaterThan(0);

      // Fill in valid data
      const idInput = screen.getByLabelText(/ID Unik Cabang/i);
      const nameInput = screen.getByLabelText(/Nama Cabang/i);
      const subNameInput = screen.getByLabelText(/Unit /i);
      const addressInput = screen.getByLabelText("Alamat Lengkap");
      const mapEmbedInput = screen.getByLabelText(/URL Embed Google Maps/i);
      const gmapsInput = screen.getByLabelText(/Link Navigasi Google Maps/i);

      fireEvent.change(idInput, { target: { value: "sidoarjo-kota" } });
      fireEvent.change(nameInput, { target: { value: "Cabang Sidoarjo Kota" } });
      fireEvent.change(subNameInput, { target: { value: "Sentra Kota" } });
      fireEvent.change(addressInput, { target: { value: "Jl. Pahlawan No. 10" } });
      fireEvent.change(mapEmbedInput, { target: { value: "https://maps.google.com/embed?pb=1" } });
      fireEvent.change(gmapsInput, { target: { value: "https://maps.app.goo.gl/xyz" } });
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders BranchForm and handles server action errors", async () => {
      (createBranch as unknown as Mock).mockResolvedValueOnce({
        fieldErrors: { name: "Nama sudah terpakai" },
      });

      const { container } = render(<BranchForm />);
      const idInput = screen.getByLabelText(/ID Unik Cabang/i);
      const nameInput = screen.getByLabelText(/Nama Cabang/i);
      fireEvent.change(idInput, { target: { value: "test-err" } });
      fireEvent.change(nameInput, { target: { value: "Test Error" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
      expect(screen.getByText("Nama sudah terpakai")).toBeDefined();
    });

    it("renders BranchForm in edit mode and updates data", async () => {
      const { container } = render(
        <BranchForm isEdit initialData={dummyBranch} />
      );
      const nameInput = screen.getByDisplayValue("Cabang Krian");
      fireEvent.change(nameInput, { target: { value: "Cabang Krian Baru" } });
      expect(screen.getByRole("link", { name: /Batal/i }).getAttribute("href")).toBe("/admin/cabang/krian");

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });
  });

  describe("Guru Components", () => {
    it("renders GuruStatusButton and executes status toggle", async () => {
      render(
        <GuruStatusButton
          guruId="g-1"
          guruName="Ustadzah Siti"
          isActive={true}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Nonaktifkan"));
      const confirmBtn = screen.getByText("Ya, Nonaktifkan");
      await act(async () => {
        fireEvent.click(confirmBtn);
      });
    });

    it("renders GuruStatusButton when inactive and handles cancel & exception", async () => {
      render(
        <GuruStatusButton
          guruId="g-1"
          guruName="Ustadzah Siti"
          isActive={false}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Aktifkan"));
      fireEvent.click(screen.getByText("Batal"));

      (toggleGuruActive as unknown as Mock).mockRejectedValueOnce(new Error("Database error"));
      fireEvent.click(screen.getByText("Aktifkan"));
      await act(async () => {
        fireEvent.click(screen.getByText("Ya, Aktifkan"));
      });
      expect(window.alert).toHaveBeenCalled();
    });

    it("renders GuruForm, validates inputs, and submits in create mode", async () => {
      const { container } = render(
        <GuruForm programs={[dummyProgram]} branches={[dummyBranch]} />
      );
      const form = container.querySelector("form");

      // Empty submit triggers validation
      if (form) fireEvent.submit(form);
      expect(screen.getByText(/Nama lengkap guru minimal 2 karakter/i)).toBeDefined();

      // Fill valid inputs
      const nameInput = screen.getByLabelText(/Nama Lengkap/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passInput = screen.getByLabelText(/Kata Sandi/i);
      const phoneInput = screen.getByLabelText(/Nomor WhatsApp/i);
      const branchSelect = screen.getByLabelText(/Cabang Penugasan/i);

      fireEvent.change(nameInput, { target: { value: "Guru Teladan" } });
      fireEvent.change(emailInput, { target: { value: "guru@uzma.com" } });
      fireEvent.change(passInput, { target: { value: "password123" } });
      fireEvent.change(phoneInput, { target: { value: "08123456789" } });
      fireEvent.change(branchSelect, { target: { value: "krian" } });

      // Fill valid inputs
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders GuruForm and handles action errors", async () => {
      (createGuru as unknown as Mock).mockResolvedValueOnce({
        error: "Server error occurred",
      });

      const { container } = render(
        <GuruForm programs={[dummyProgram]} branches={[dummyBranch]} />
      );
      const nameInput = screen.getByLabelText(/Nama Lengkap/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passInput = screen.getByLabelText(/Kata Sandi/i);

      fireEvent.change(nameInput, { target: { value: "Guru Test" } });
      fireEvent.change(emailInput, { target: { value: "test@uzma.com" } });
      fireEvent.change(passInput, { target: { value: "password123" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders GuruForm in edit mode", async () => {
      const { container } = render(
        <GuruForm
          isEdit 
          initialData={dummyGuru}
          initialProgramIds={["ahe"]}
          programs={[dummyProgram]} 
          branches={[dummyBranch]}
        />
      );
      expect(screen.getByDisplayValue("Ustadzah Siti")).toBeDefined();
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });
  });

  describe("Murid Components", () => {
    it("renders StudentStatusButton and executes status toggle", async () => {
      render(
        <StudentStatusButton
          studentId="s-1"
          studentName="Ahmad Faiz"
          isActive={false}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Aktifkan"));
      const confirmBtn = screen.getByText("Ya, Aktifkan");
      await act(async () => {
        fireEvent.click(confirmBtn);
      });
    });

    it("renders StudentStatusButton when active and handles cancel & error", async () => {
      render(
        <StudentStatusButton
          studentId="s-1"
          studentName="Ahmad Faiz"
          isActive={true}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Nonaktifkan"));
      fireEvent.click(screen.getByText("Batal"));

      (toggleStudentActive as unknown as Mock).mockResolvedValueOnce({ error: "Gagal menonaktifkan" });
      fireEvent.click(screen.getByText("Nonaktifkan"));
      await act(async () => {
        fireEvent.click(screen.getByText("Ya, Nonaktifkan"));
      });
    });

    it("renders StudentForm, validates inputs, and submits in create mode", async () => {
      const { container } = render(
        <StudentForm programs={[dummyProgram]} branches={[dummyBranch]} />
      );
      const form = container.querySelector("form");

      // Empty submit triggers validation
      if (form) fireEvent.submit(form);
      expect(screen.getByText(/Nama lengkap murid minimal 2 karakter/i)).toBeDefined();

      // Fill valid inputs
      const nameInput = screen.getByLabelText(/Nama Lengkap Murid/i);
      const parentInput = screen.getByLabelText(/Nama Orang Tua/i);
      const phoneInput = screen.getByLabelText(/Nomor WhatsApp/i);

      fireEvent.change(nameInput, { target: { value: "Murid Budi" } });
      fireEvent.change(parentInput, { target: { value: "Pak Joko" } });
      fireEvent.change(phoneInput, { target: { value: "08123456789" } });

      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders StudentForm and handles action errors", async () => {
      (createStudent as unknown as Mock).mockResolvedValueOnce({
        fieldErrors: { full_name: "Nama lengkap murid minimal 2 karakter." },
      });

      const { container } = render(
        <StudentForm programs={[dummyProgram]}
          initialStudentPrograms={[{ student_id: "murid-1", program_id: "ahe", variant_id: "var-1", spp_amount: 150000, on_time_discount_type: "none", on_time_discount_value: 0, cycle_start_date: "2026-10-02", cycle_days: 28, status: "active", enrolled_at: "2026-10-01", created_at: "2026-10-01" }]}
          branches={[dummyBranch]}
        />
      );
      const nameInput = screen.getByLabelText(/Nama Lengkap Murid/i);
      const parentInput = screen.getByLabelText(/Nama Orang Tua/i);
      const phoneInput = screen.getByLabelText(/Nomor WhatsApp/i);
      const branchSelect = screen.getByLabelText(/Cabang Belajar/i);

      fireEvent.change(nameInput, { target: { value: "A" } });
      fireEvent.change(parentInput, { target: { value: "Pak Joko" } });
      fireEvent.change(phoneInput, { target: { value: "08123456789" } });
      fireEvent.change(branchSelect, { target: { value: "krian" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
      expect(screen.getByText(/Nama lengkap murid minimal 2 karakter/i)).toBeDefined();
    });

    it("renders StudentForm in edit mode and submits with optional fields", async () => {
      const { container } = render(
        <StudentForm 
          isEdit initialData={dummyStudent}
          initialStudentPrograms={[{ student_id: "murid-1", program_id: "ahe", variant_id: "var-1", spp_amount: 150000, on_time_discount_type: "none", on_time_discount_value: 0, cycle_start_date: "2026-10-02", cycle_days: 28, status: "active", enrolled_at: "2026-10-01", created_at: "2026-10-01" }]}

          programs={[
            dummyProgram,
            { ...dummyProgram, id: "orig-1", initials: "MAPEL", name: "Mapel SD", type: "original" as const },
          ]}
          branches={[dummyBranch]}
        />
      );
      expect(screen.getByDisplayValue("Ahmad Faiz")).toBeDefined();

      // Fill optional fields
      const addressInput = screen.getByLabelText(/Alamat Tempat Tinggal/i);
      const notesInput = screen.getByLabelText(/Catatan Khusus/i);
      fireEvent.change(addressInput, { target: { value: "Jl. Raya Krian" } });
      fireEvent.change(notesInput, { target: { value: "Catatan Tambahan" } });

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });
  });

  describe("Program Components", () => {
    it("renders ProgramStatusButton and executes toggle", async () => {
      render(
        <ProgramStatusButton
          programId="ahe"
          programName="Program AHE"
          isActive={true}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Nonaktifkan"));
      const confirmBtn = screen.getByText("Ya, Nonaktifkan");
      await act(async () => {
        fireEvent.click(confirmBtn);
      });
    });

    it("renders ProgramStatusButton when inactive and handles cancel & exception", async () => {
      render(
        <ProgramStatusButton
          programId="ahe"
          programName="Program AHE"
          isActive={false}
          showLabel
        />
      );
      fireEvent.click(screen.getByText("Aktifkan"));
      fireEvent.click(screen.getByText("Batal"));

      (toggleProgramActive as unknown as Mock).mockRejectedValueOnce(new Error("Database error"));
      fireEvent.click(screen.getByText("Aktifkan"));
      await act(async () => {
        fireEvent.click(screen.getByText("Ya, Aktifkan"));
      });
      expect(window.alert).toHaveBeenCalled();
    });

    it("renders ProgramForm, validates inputs, and submits in create mode", async () => {
      const { container } = render(<ProgramForm />);
      const form = container.querySelector("form");

      // Empty submit triggers validation
      if (form) fireEvent.submit(form);
      expect(screen.getByText(/Inisial program minimal 2 karakter/i)).toBeDefined();

      // Fill valid inputs
      const initialsInput = screen.getByLabelText(/Inisial Program/i);
      const nameInput = screen.getByLabelText(/Nama Lengkap Program/i);
      const typeSelect = screen.getByLabelText(/Kategori \/ Tipe Program/i);
      fireEvent.change(typeSelect, { target: { value: "franchise" } });

      const taglineInput = screen.getByLabelText(/Tagline Singkat/i);
      const descInput = screen.getByLabelText(/Deskripsi Program/i);
      const ageInput = screen.getByLabelText(/Target Usia Murid/i);
      const providerInput = screen.getByLabelText(/Nama Lembaga Pemegang Lisensi/i);
      const licenseUrlInput = screen.getByLabelText(/URL Website \/ Official Franchisor/i);
      fireEvent.change(initialsInput, { target: { value: "CAL" } });
      fireEvent.change(nameInput, { target: { value: "Calistung Ceria" } });
      fireEvent.change(taglineInput, { target: { value: "Belajar Cepat" } });
      fireEvent.change(descInput, { target: { value: "Deskripsi Lengkap" } });
      fireEvent.change(ageInput, { target: { value: "3-6 tahun" } });
      fireEvent.change(providerInput, { target: { value: "Uzma Pusat" } });
      fireEvent.change(licenseUrlInput, { target: { value: "https://uzmacourse.com" } });
      const freqInput = screen.getByLabelText(/Frekuensi Belajar/i);
      fireEvent.change(freqInput, { target: { value: "3" } });

      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });

    it("renders ProgramForm in edit mode and exercises features list & active status", async () => {
      const { container } = render(
        <ProgramForm isEdit  initialData={dummyProgram} />
      );
      expect(screen.getAllByDisplayValue("AHE").length).toBeGreaterThan(0);
      const featInput = screen.getByDisplayValue("Modul");
      fireEvent.change(featInput, { target: { value: "Modul Baru" } });

      // Add feature
      const addFeatureBtn = screen.getByText("Tambah Fasilitas");
      fireEvent.click(addFeatureBtn);

      // Remove feature
      const removeFeatureBtns = screen.getAllByTitle("Hapus fasilitas ini");
      if (removeFeatureBtns[0]) {
        fireEvent.click(removeFeatureBtns[0]);
      }

      // Toggle active status
      const activeCheckbox = container.querySelector('input[name="is_active"]');
      if (activeCheckbox) {
        fireEvent.click(activeCheckbox);
      }

      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
    });
  });
});
