import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { NotificationTestButton } from "@/components/guru/notification-test-button";

// Mock toast
vi.mock("@/components/admin/toast", () => ({
  showToast: vi.fn(),
}));

interface MockNotificationApi {
  permission: NotificationPermission;
  requestPermission: Mock<() => Promise<NotificationPermission>>;
}

describe("NotificationTestButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    const mockNotification: MockNotificationApi = {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    };

    Object.defineProperty(global, "Notification", {
      value: mockNotification,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "navigator", {
      value: {
        serviceWorker: {
          getRegistrations: vi.fn().mockResolvedValue([]),
          getRegistration: vi.fn().mockResolvedValue(null),
          ready: Promise.resolve({ showNotification: vi.fn() }),
          register: vi.fn().mockResolvedValue({ showNotification: vi.fn() }),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders with default inactive state and hides test panel", async () => {
    render(<NotificationTestButton />);

    expect(screen.getByText("Notifikasi Perangkat")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

    await waitFor(() => {
      expect(screen.getByText("Izin nonaktif")).toBeInTheDocument();
    });

    // Test panel should not be visible when inactive
    expect(screen.queryByText("Tes Pengiriman")).not.toBeInTheDocument();
  });

  it("shows active status and reveals test panel when permission is already granted", async () => {
    const notification = global.Notification as unknown as MockNotificationApi;
    notification.permission = "granted";
    localStorage.setItem("pwa_notif_enabled", "true");

    render(<NotificationTestButton />);

    await waitFor(() => {
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByText(/Izin aktif/i)).toBeInTheDocument();
      expect(screen.getByText("Tes Pengiriman")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Uji Coba/i })).toBeInTheDocument();
    });
  });

  it("toggles on, requests permission, and displays test panel", async () => {
    render(<NotificationTestButton />);

    const switchBtn = screen.getByRole("switch");
    fireEvent.click(switchBtn);

    const notification = global.Notification as unknown as MockNotificationApi;
    await waitFor(() => {
      expect(notification.requestPermission).toHaveBeenCalled();
      expect(screen.getByText(/Izin aktif/i)).toBeInTheDocument();
      expect(screen.getByText("Tes Pengiriman")).toBeInTheDocument();
    });
  });

  it("toggles off and hides test panel", async () => {
    const notification = global.Notification as unknown as MockNotificationApi;
    notification.permission = "granted";
    localStorage.setItem("pwa_notif_enabled", "true");

    render(<NotificationTestButton />);

    await waitFor(() => {
      expect(screen.getByText("Tes Pengiriman")).toBeInTheDocument();
    });

    const switchBtn = screen.getByRole("switch");
    fireEvent.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Izin nonaktif")).toBeInTheDocument();
      expect(screen.queryByText("Tes Pengiriman")).not.toBeInTheDocument();
    });
  });

  it("triggers test notification on button click", async () => {
    const notification = global.Notification as unknown as MockNotificationApi;
    notification.permission = "granted";
    localStorage.setItem("pwa_notif_enabled", "true");

    const mockShowNotification = vi.fn().mockResolvedValue(undefined);
    const activeRegistration = { showNotification: mockShowNotification };
    const swMock = {
      getRegistrations: vi.fn().mockResolvedValue([activeRegistration]),
      getRegistration: vi.fn().mockResolvedValue(activeRegistration),
      ready: Promise.resolve(activeRegistration),
      register: vi.fn().mockResolvedValue(activeRegistration),
    };

    Object.defineProperty(global, "navigator", {
      value: { serviceWorker: swMock },
      writable: true,
      configurable: true,
    });

    render(<NotificationTestButton />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Uji Coba/i })).toBeInTheDocument();
    });

    const testBtn = screen.getByRole("button", { name: /Uji Coba/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith("Uzma Course", expect.objectContaining({
        body: expect.stringContaining("Notifikasi PWA berfungsi"),
      }));
    });
  });
});
