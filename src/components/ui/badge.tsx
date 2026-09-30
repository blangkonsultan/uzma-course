import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-pink-50 text-accent",
  neutral: "bg-slate-100 text-slate-600",
} as const;

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: keyof typeof variants;
}

export function Badge({ variant = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-medium px-3 py-1 rounded-full",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
