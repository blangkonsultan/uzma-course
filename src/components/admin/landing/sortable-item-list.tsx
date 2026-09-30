"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";

export interface SortableItemListProps<T> {
  title: string;
  description?: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  createEmptyItem: () => T;
  renderItem: (
    item: T,
    index: number,
    updateItem: (updated: T) => void
  ) => React.ReactNode;
  itemLabel: (item: T, index: number) => string;
  addButtonText?: string;
}

export function SortableItemList<T>({
  title,
  description,
  items,
  onItemsChange,
  createEmptyItem,
  renderItem,
  itemLabel,
  addButtonText = "Tambah Item",
}: SortableItemListProps<T>) {
  // Track collapsed status for each item (by index)
  const [collapsedIndices, setCollapsedIndices] = useState<Record<number, boolean>>({});

  const toggleCollapse = (idx: number) => {
    setCollapsedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(idx - 1, 0, moved);
    onItemsChange(next);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(idx + 1, 0, moved);
    onItemsChange(next);
  };

  const handleDelete = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    onItemsChange(next);
  };

  const handleAdd = () => {
    const newItem = createEmptyItem();
    onItemsChange([...items, newItem]);
    // Ensure newly added item is expanded
    setCollapsedIndices((prev) => ({
      ...prev,
      [items.length]: false,
    }));
  };

  const updateItem = (index: number, updated: T) => {
    const next = [...items];
    next[index] = updated;
    onItemsChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-800 font-heading truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0 whitespace-nowrap">
          {items.length} item
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm">
          Belum ada item dalam daftar ini. Klik tombol di bawah untuk menambahkan.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isCollapsed = !!collapsedIndices[idx];
            const label = itemLabel(item, idx);

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Header bar */}
                <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50/80 border-b border-slate-100 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(idx)}
                    className="flex items-center gap-2 text-left font-medium text-slate-800 text-sm hover:text-primary-600 transition-colors min-w-0 flex-1 py-1"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isCollapsed ? "" : "rotate-90"
                      }`}
                    />
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold inline-flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate min-w-0 font-medium text-xs sm:text-sm">
                      {label || `Item #${idx + 1}`}
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      title="Pindah ke atas"
                      aria-label="Pindah ke atas"
                      className="p-1.5 sm:p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      title="Pindah ke bawah"
                      aria-label="Pindah ke bawah"
                      className="p-1.5 sm:p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      title="Hapus item"
                      aria-label="Hapus item"
                      className="p-1.5 sm:p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body form fields */}
                {!isCollapsed && (
                  <div className="p-3.5 sm:p-4 bg-white">
                    {renderItem(item, idx, (updated) =>
                      updateItem(idx, updated)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-3 px-4 rounded-xl border border-dashed border-primary-300 text-primary-700 hover:bg-primary-50/60 font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
      >
        <Plus className="w-4 h-4" />
        <span>{addButtonText}</span>
      </button>
    </div>
  );
}
