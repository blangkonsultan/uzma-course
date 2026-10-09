"use client";

import { useState, useEffect } from "react";

function formatCurrentDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} • ${timePart} WIB`;
}

export function LiveClock() {
  const [timeText, setTimeText] = useState<string>(() => formatCurrentDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(formatCurrentDateTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="text-slate-500 text-sm font-medium tabular-nums">
      {timeText}
    </p>
  );
}
