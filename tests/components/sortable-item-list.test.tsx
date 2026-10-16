import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { SortableItemList } from "@/components/admin/landing/sortable-item-list";

interface TestItem {
  id: string;
  name: string;
}

const initialItems: TestItem[] = [
  { id: "a", name: "Item A" },
  { id: "b", name: "Item B" },
  { id: "c", name: "Item C" },
];

function ControlledSortableList() {
  const [items, setItems] = useState(initialItems);

  return (
    <SortableItemList
      title="Daftar Item"
      items={items}
      onItemsChange={setItems}
      createEmptyItem={() => ({ id: "new", name: "Item Baru" })}
      renderItem={(item) => <div data-testid={`body-${item.id}`}>{item.name}</div>}
      itemLabel={(item) => item.name}
    />
  );
}

describe("SortableItemList collapse state", () => {
  it("keeps a moved item's collapse state attached while moving up and down", () => {
    render(<ControlledSortableList />);

    expect(screen.getAllByTitle("Pindah ke atas")[0].hasAttribute("disabled")).toBe(
      true
    );
    expect(
      screen.getAllByTitle("Pindah ke bawah")[2].hasAttribute("disabled")
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Item B/ }));
    expect(screen.queryByTestId("body-b")).toBeNull();

    fireEvent.click(screen.getAllByTitle("Pindah ke atas")[1]);
    expect(screen.getByRole("button", { name: /Item B/ })).toBeDefined();
    expect(screen.queryByTestId("body-b")).toBeNull();
    expect(screen.getByTestId("body-a")).toBeDefined();

    fireEvent.click(screen.getAllByTitle("Pindah ke bawah")[0]);
    expect(screen.queryByTestId("body-b")).toBeNull();
    expect(screen.getByTestId("body-a")).toBeDefined();
  });

  it("shifts surviving collapse states after deleting a middle item", () => {
    render(<ControlledSortableList />);

    fireEvent.click(screen.getByRole("button", { name: /Item B/ }));
    expect(screen.queryByTestId("body-b")).toBeNull();

    fireEvent.click(screen.getAllByTitle("Hapus item")[1]);

    expect(screen.queryByRole("button", { name: /Item B/ })).toBeNull();
    expect(screen.getByTestId("body-a")).toBeDefined();
    expect(screen.getByTestId("body-c")).toBeDefined();
  });
});
