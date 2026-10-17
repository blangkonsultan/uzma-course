import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HonorPeriodSelect } from "@/components/guru/honor-period-select";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const samplePeriods = [
  { id: "p-1", period_month: "2026-10-01", status: "open" },
  { id: "p-2", period_month: "2026-09-01", status: "paid" },
];

describe("HonorPeriodSelect", () => {
  it("renders null if periods array is empty", () => {
    const { container } = render(
      <HonorPeriodSelect periods={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders options and navigates on change", () => {
    render(
      <HonorPeriodSelect
        periods={samplePeriods}
        currentPeriodId="p-2"
      />
    );

    const select = screen.getByLabelText("Pilih Periode Honor");
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: "p-1" } });
    expect(pushMock).toHaveBeenCalledWith("/guru/honor?period=p-1");

    fireEvent.change(select, { target: { value: "" } });
    expect(pushMock).toHaveBeenCalledWith("/guru/honor");
  });
});
