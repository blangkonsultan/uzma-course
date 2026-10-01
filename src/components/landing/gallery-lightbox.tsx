"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils";

export interface LightboxImageItem {
  url: string;
  alt: string;
  groupLabel: string;
}

export interface GalleryLightboxProps {
  items: LightboxImageItem[];
  initialIndex: number;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // References for drag and touch tracking
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync for event listeners
  useEffect(() => {
    positionRef.current = position;
    scaleRef.current = scale;
  }, [position, scale]);

  const currentItem = items[currentIndex];

  // Reset zoom & pan when image changes
  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    resetTransform();
  }, [items.length, resetTransform]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    resetTransform();
  }, [items.length, resetTransform]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_SCALE, Number((prev + SCALE_STEP).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, Number((prev - SCALE_STEP).toFixed(1)));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleToggleZoom = useCallback(() => {
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2);
    }
  }, [scale, resetTransform]);

  // Clamp translation so image cannot be dragged completely off-screen
  const clampPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    const maxBoundX = (window.innerWidth * (currentScale - 1)) / 2 + 80;
    const maxBoundY = (window.innerHeight * (currentScale - 1)) / 2 + 80;
    return {
      x: Math.max(-maxBoundX, Math.min(maxBoundX, newX)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, newY)),
    };
  }, []);

  // Keyboard navigation & Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetTransform();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrev, goToNext, handleZoomIn, handleZoomOut, resetTransform]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Mouse wheel zoom on image container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setScale((prev) => Math.min(MAX_SCALE, Number((prev + 0.25).toFixed(2))));
      } else {
        setScale((prev) => {
          const next = Math.max(MIN_SCALE, Number((prev - 0.25).toFixed(2)));
          if (next === 1) {
            setPosition({ x: 0, y: 0 });
          }
          return next;
        });
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;
    setPosition(clampPosition(rawX, rawY, scale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag & swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      // Double-tap to zoom toggle detection
      if (now - lastTapRef.current < 300) {
        handleToggleZoom();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      };

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (scale > 1 && isDragging) {
        const rawX = touch.clientX - dragStartRef.current.x;
        const rawY = touch.clientY - dragStartRef.current.y;
        setPosition(clampPosition(rawX, rawY, scale));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale <= 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = touch.clientY - touchStartRef.current.y;
      const elapsedTime = Date.now() - touchStartRef.current.time;

      // Horizontal swipe threshold: > 50px within 400ms and mostly horizontal
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5 && elapsedTime < 400) {
        if (diffX > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    }
    setIsDragging(false);
  };

  if (!currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tampilan Foto Galeri"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-md text-white select-none animate-in fade-in duration-200"
    >
      {/* Top Bar: Title, Group Badge, & Global Controls */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/10 text-white border border-white/15">
            {currentItem.groupLabel}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-300 shrink-0">
            {currentIndex + 1} / {items.length}
          </span>
          {currentItem.alt && (
            <span className="hidden md:inline-block text-xs sm:text-sm text-slate-300 truncate max-w-sm lg:max-w-md border-l border-white/20 pl-3">
              {currentItem.alt}
            </span>
          )}
        </div>

        {/* Action Buttons: Zoom Controls & Close */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/15 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Perbesar Foto"
            title="Perbesar (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/15 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Perkecil Foto"
            title="Perkecil (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={resetTransform}
            disabled={scale === 1}
            className="px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-200 hover:text-white hover:bg-white/15 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1"
            aria-label="Reset Zoom"
            title="Kembalikan Ukuran Asli (0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{Math.round(scale * 100)}%</span>
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-rose-500/80 active:scale-95 transition-all cursor-pointer"
            aria-label="Tutup Galeri"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden px-2 sm:px-12"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // If clicking direct background and not zoomed, close
          if (e.target === e.currentTarget && scale === 1) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrow: Previous */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-2 sm:left-4 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs border border-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Foto Sebelumnya"
            title="Foto Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Scalable / Pannable Image Container */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleToggleZoom();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={normalizeImageUrl(currentItem.url)}
            alt={currentItem.alt || `${currentItem.groupLabel} - Foto ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            draggable={false}
            className="max-h-[75vh] sm:max-h-[82vh] max-w-[94vw] sm:max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl select-none pointer-events-auto"
          />
        </div>

        {/* Navigation Arrow: Next */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 sm:right-4 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs border border-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Foto Selanjutnya"
            title="Foto Selanjutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption and Interaction Tips */}
      <footer className="relative z-20 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl truncate">
          {currentItem.alt || `${currentItem.groupLabel} - Foto ${currentIndex + 1}`}
        </p>
        <p className="text-[11px] text-slate-400 hidden sm:block">
          Klik 2x / scroll untuk zoom &bull; Geser foto saat diperbesar &bull; Gunakan panah keyboard
        </p>
        <p className="text-[11px] text-slate-400 sm:hidden">
          Ketuk 2x untuk zoom &bull; Usap layar untuk ganti foto
        </p>
      </footer>
    </div>
  );
}
