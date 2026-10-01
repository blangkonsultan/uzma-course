"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import {
  BookOpen,
  Sparkles,
  Globe,
  GraduationCap,
  Calculator,
  Palette,
  Music,
  Pencil,
  Brain,
  Puzzle,
  Star,
  Lightbulb,
  Award,
  Rocket,
  ChevronDown,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const LUCIDE_ICON_OPTIONS = [
  { value: "BookOpen", label: "Buku Terbuka" },
  { value: "Sparkles", label: "Bintang Ceria" },
  { value: "Globe", label: "Globe / Bahasa" },
  { value: "GraduationCap", label: "Topi Toga" },
  { value: "Calculator", label: "Kalkulator" },
  { value: "Palette", label: "Palet Warna" },
  { value: "Music", label: "Musik" },
  { value: "Pencil", label: "Pensil" },
  { value: "Brain", label: "Otak / Kognitif" },
  { value: "Puzzle", label: "Puzzle" },
  { value: "Star", label: "Bintang" },
  { value: "Lightbulb", label: "Lampu Ide" },
  { value: "Award", label: "Penghargaan" },
  { value: "Rocket", label: "Roket" },
] as const;

export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Sparkles,
  Globe,
  GraduationCap,
  Calculator,
  Palette,
  Music,
  Pencil,
  Brain,
  Puzzle,
  Star,
  Lightbulb,
  Award,
  Rocket,
};

export interface IconSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function IconSelectField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className,
}: IconSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = `${id}-listbox`;

  const selectedOption =
    LUCIDE_ICON_OPTIONS.find((opt) => opt.value === value) ||
    LUCIDE_ICON_OPTIONS[0];

  const SelectedIcon = LUCIDE_ICON_MAP[selectedOption.value] || BookOpen;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        const idx = LUCIDE_ICON_OPTIONS.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < LUCIDE_ICON_OPTIONS.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : LUCIDE_ICON_OPTIONS.length - 1
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < LUCIDE_ICON_OPTIONS.length) {
          onChange(LUCIDE_ICON_OPTIONS[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              const idx = LUCIDE_ICON_OPTIONS.findIndex(
                (opt) => opt.value === value
              );
              setHighlightedIndex(idx >= 0 ? idx : 0);
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-3.5 py-2.5 sm:py-2 rounded-xl border bg-white text-slate-900 text-base sm:text-sm shadow-xs transition-colors",
            "flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            <SelectedIcon className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
            <span className="truncate">{selectedOption.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            ref={listboxRef}
            tabIndex={-1}
            aria-label={label}
            className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1.5 focus:outline-none"
          >
            {LUCIDE_ICON_OPTIONS.map((opt, index) => {
              const IconComp = LUCIDE_ICON_MAP[opt.value] || BookOpen;
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={opt.value}
                  id={`${id}-option-${opt.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2 cursor-pointer text-sm transition-colors",
                    isHighlighted ? "bg-slate-50 text-slate-900" : "text-slate-700",
                    isSelected && "bg-primary-50 text-primary-700 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <IconComp
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isSelected ? "text-primary-600" : "text-slate-500"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
