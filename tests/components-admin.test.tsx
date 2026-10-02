import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { MasterMobileCard } from "@/components/admin/master-mobile-card";
import { InputField, TextareaField, SelectField, CheckboxGroupField } from "@/components/admin/form-field";
import { Pagination } from "@/components/admin/pagination";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { Toast, showToast } from "@/components/admin/toast";
import { DataTable } from "@/components/admin/data-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginForm } from "@/components/admin/login-form";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/admin/cabang",
  useSearchParams: () => new URLSearchParams("search=test&status=active&page=2&success=Berhasil"),
}));

const mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

vi.mock("@/app/admin/actions", () => ({
  signOut: vi.fn().mockResolvedValue({}),
}));
describe("Admin Core Components (src/components/admin/)", () => {
  describe("StatusBadge", () => {
    it("renders active badge when isActive is true", () => {
      render(<StatusBadge isActive={true} />);
      expect(screen.getByText("Aktif")).toBeDefined();
    });

    it("renders inactive badge when isActive is false", () => {
      render(<StatusBadge isActive={false} />);
      expect(screen.getByText("Non-aktif")).toBeDefined();
    });
  });

  describe("PageHeader", () => {
    it("renders title, description, and action", () => {
      render(
        <PageHeader
          title="Data Guru"
          description="Daftar guru aktif"
          action={<button>Tambah</button>}
          breadcrumbs={[
            { label: "Dashboard", href: "/admin" },
            { label: "Guru" },
          ]}
        />
      );
      expect(screen.getByText("Data Guru")).toBeDefined();
      expect(screen.getByText("Daftar guru aktif")).toBeDefined();
      expect(screen.getByText("Tambah")).toBeDefined();
      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Guru")).toBeDefined();
    });
  });

  describe("ConfirmDialog", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <ConfirmDialog
          isOpen={false}
          title="Hapus"
          description="Yakin?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders and calls onConfirm and onCancel when open", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          title="Konfirmasi Hapus"
          description="Apakah Anda yakin?"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );
      expect(screen.getByText("Konfirmasi Hapus")).toBeDefined();
      fireEvent.click(screen.getByText("Konfirmasi"));
      expect(onConfirm).toHaveBeenCalled();
      fireEvent.click(screen.getByText("Batal"));
      expect(onCancel).toHaveBeenCalled();

      // Backdrop click
      const backdrop = screen.getByRole("dialog");
      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(2);

      // Escape keydown
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    it("renders primary variant with loading state and ignores escape/backdrop", () => {
      const onCancel = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          title="Konfirmasi Aktif"
          description="Aktifkan kembali?"
          variant="primary"
          confirmText="Ya, Aktifkan"
          isLoading={true}
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      );
      expect(screen.getByText("Memproses...")).toBeDefined();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onCancel).not.toHaveBeenCalled();

      const backdrop = screen.getByRole("dialog");
      fireEvent.click(backdrop);
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("MasterMobileCard", () => {
    it("renders 5-part anatomy correctly", () => {
      render(
        <MasterMobileCard
          avatar={{ initials: "AH", color: "purple" }}
          title="Cabang Balongbendo"
          titleHref="/admin/cabang/balongbendo"
          subtitle="Sentra Ahe"
          status={<StatusBadge isActive={true} />}
          badges={<span>Pill Badge</span>}
          specs={{
            left: { label: "Guru", value: 5 },
            right: { label: "Murid", value: 20 },
          }}
          actions={<button>Aksi</button>}
        />
      );
      expect(screen.getByText("Cabang Balongbendo")).toBeDefined();
      expect(screen.getByText("Sentra Ahe")).toBeDefined();
      expect(screen.getByText("Pill Badge")).toBeDefined();
      expect(screen.getByText("Guru")).toBeDefined();
      expect(screen.getByText("5")).toBeDefined();
      expect(screen.getByText("Murid")).toBeDefined();
      expect(screen.getByText("20")).toBeDefined();
      expect(screen.getByText("Aksi")).toBeDefined();
    });
  });

  describe("Form Fields (form-field.tsx)", () => {
    it("renders InputField with label and error", () => {
      render(
        <InputField
          id="name"
          name="name"
          label="Nama Lengkap"
          error="Nama wajib diisi"
        />
      );
      expect(screen.getByText("Nama Lengkap")).toBeDefined();
      expect(screen.getByText("Nama wajib diisi")).toBeDefined();
    });

    it("renders InputField with hint when no error", () => {
      render(
        <InputField
          id="phone"
          name="phone"
          label="Nomor Telepon"
          hint="Contoh: 08123456789"
        />
      );
      expect(screen.getByText("Contoh: 08123456789")).toBeDefined();
    });

    it("renders TextareaField", () => {
      render(
        <TextareaField
          id="address"
          name="address"
          label="Alamat"
          placeholder="Masukkan alamat"
        />
      );
      expect(screen.getByText("Alamat")).toBeDefined();
      expect(screen.getByPlaceholderText("Masukkan alamat")).toBeDefined();
    });

    it("renders SelectField with options", () => {
      render(
        <SelectField
          id="branch"
          name="branch"
          label="Pilih Cabang"
          options={[
            { value: "krian", label: "Cabang Krian" },
            { value: "balongbendo", label: "Cabang Balongbendo" },
          ]}
        />
      );
      expect(screen.getByText("Pilih Cabang")).toBeDefined();
      expect(screen.getByText("Cabang Krian")).toBeDefined();
      expect(screen.getByText("Cabang Balongbendo")).toBeDefined();
    });

    it("renders CheckboxGroupField", () => {
      const onChange = vi.fn();
      const { container } = render(
        <CheckboxGroupField
          id="program_ids"
          name="program_ids"
          label="Program Yang Diambil"
          options={[
            { value: "ahe", label: "Program AHE" },
            { value: "ase", label: "Program ASE" },
          ]}
          values={["ahe"]}
          onChange={onChange}
        />
      );
      expect(screen.getByText("Program Yang Diambil")).toBeDefined();
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(2);
      fireEvent.click(checkboxes[1]);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("returns null if totalPages <= 1", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} totalItems={5} pageSize={10} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders page info and navigation when multiple pages and exercises boundaries", () => {
      render(<Pagination currentPage={1} totalPages={10} totalItems={100} pageSize={10} />);
      expect(screen.getByText("100")).toBeDefined();

      render(<Pagination currentPage={5} totalPages={10} totalItems={100} pageSize={10} />);
      expect(screen.getAllByText("...").length).toBeGreaterThan(0);

      render(<Pagination currentPage={10} totalPages={10} totalItems={100} pageSize={10} />);
      expect(screen.getAllByLabelText("Halaman sebelumnya").length).toBeGreaterThan(0);
    });
  });

  describe("SearchFilterBar", () => {
    it("renders search input, filter selects, and handles actions", () => {
      const { container } = render(
        <SearchFilterBar
          searchPlaceholder="Cari data..."
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "Semua" },
                { value: "active", label: "Aktif" },
              ],
            },
          ]}
        />
      );
      const searchInput = screen.getByPlaceholderText("Cari data...");
      fireEvent.change(searchInput, { target: { value: "krian" } });
      const form = container.querySelector("form");
      if (form) fireEvent.submit(form);
      expect(mockPush).toHaveBeenCalled();

      // Reset button
      const resetBtn = screen.getByText("Reset Filter");
      fireEvent.click(resetBtn);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("Toast", () => {
    it("renders Toast and triggers showToast and dismiss", () => {
      render(<Toast />);
      act(() => {
        showToast("Operasi sukses", "success");
      });
      expect(screen.getByText("Operasi sukses")).toBeDefined();
      const closeBtn = screen.getByLabelText("Tutup notifikasi");
      fireEvent.click(closeBtn);

      act(() => {
        showToast("Operasi gagal", "error");
      });
      expect(screen.getByText("Operasi gagal")).toBeDefined();
    });
  });

  describe("DataTable", () => {
    interface Item {
      id: string;
      name: string;
      extra?: string | null;
    }
    const data: Item[] = [
      { id: "1", name: "Item Satu", extra: null },
      { id: "2", name: "Item Dua", extra: "Ada" },
    ];
    const columns = [
      { header: "ID", accessorKey: "id" as const },
      { header: "Nama", cell: (item: Item) => <span>{item.name}</span> },
      { header: "Extra", accessorKey: "extra" as const },
      { header: "Aksi" },
      { header: "Detail", hideOnMobile: true, cell: (item: Item) => <span>Detail {item.id}</span> },
    ];

    it("renders table with headers and data rows and custom mobileCard", () => {
      render(
        <DataTable
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          mobileCard={(item) => <div data-testid="mobile-card">{item.name}</div>}
        />
      );
      expect(screen.getAllByText("Item Satu").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Item Dua").length).toBeGreaterThan(0);
    });

    it("renders table with default mobile card list when mobileCard is not provided", () => {
      render(<DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />);
      expect(screen.getAllByText("Item Satu").length).toBeGreaterThan(0);
    });

    it("renders empty state message when data is empty", () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyStateMessage="Data tidak ditemukan"
        />
      );
      expect(screen.getByText("Data tidak ditemukan")).toBeDefined();
    });
  });

  describe("AdminShell", () => {
    it("renders sidebar with navigation categories, toggles mobile menu, and handles logout", async () => {
      render(
        <AdminShell
          profile={{
            id: "user-1",
            full_name: "Admin Uzma",
            phone: null,
            role: "admin", allowances: [],
    minimum_income: 0,    
      birth_date: null, bank_account_holder: null, bank_account_number: null, bank_name: null,
            branch_id: "krian",
            is_active: true,
            created_at: "",
            updated_at: "",
          }}
          branches={[{ id: "krian", name: "Cabang Krian", sub_name: "", address: "", latitude: 0, longitude: 0, geofence_radius_m: 100, map_embed_url: null, gmaps_url: null, is_active: true, created_at: "", updated_at: "" }]}
        >
          <div data-testid="admin-content">Admin Content</div>
        </AdminShell>
      );
      expect(screen.getByTestId("admin-content")).toBeDefined();
      expect(screen.getAllByText("Menu Utama").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Data Master").length).toBeGreaterThan(0);

      // Open mobile menu
      const openBtn = screen.getByLabelText("Buka navigasi");
      fireEvent.click(openBtn);

      // Click link inside
      const cabangLinks = screen.getAllByText("Data Cabang");
      fireEvent.click(cabangLinks[0]);

      // Close mobile menu
      const closeBtn = screen.getByLabelText("Tutup Menu");
      fireEvent.click(closeBtn);

      // Logout buttons
      const logoutBtns = screen.getAllByLabelText(/Keluar/i);
      if (logoutBtns[0]) {
        await act(async () => {
          fireEvent.click(logoutBtns[0]);
        });
      }
    });
  });

  describe("LoginForm", () => {
    it("renders login form with email and password inputs", () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText("nama@email.com")).toBeDefined();
      expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
      expect(screen.getByRole("button", { name: "Masuk ke Portal" })).toBeDefined();
    });

    it("handles successful login", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });
      const { container } = render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("nama@email.com"), { target: { value: "admin@uzma.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "password123" } });
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });

    it("handles invalid login credentials", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });
      const { container } = render(<LoginForm />);
      const form = container.querySelector("form");
      await act(async () => {
        if (form) fireEvent.submit(form);
      });
      expect(screen.getByText("Email atau kata sandi tidak sesuai.")).toBeDefined();
    });

    it("handles generic login error and exceptions", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: { message: "Akun diblokir" } });
      const { container: c1 } = render(<LoginForm />);
      await act(async () => {
        const form = c1.querySelector("form");
        if (form) fireEvent.submit(form);
      });
      expect(screen.getByText("Akun diblokir")).toBeDefined();

      mockSignInWithPassword.mockRejectedValueOnce(new Error("Koneksi gagal"));
      const { container: c2 } = render(<LoginForm />);
      await act(async () => {
        const form = c2.querySelector("form");
        if (form) fireEvent.submit(form);
      });
      expect(screen.getByText("Koneksi gagal")).toBeDefined();
    });
  });
});
