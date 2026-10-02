import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary-50 text-primary-600",
  "primary-strong": "bg-primary-100 text-primary-700",
  accent: "bg-pink-100 text-accent",
} as const;

const sizes = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-12 h-12 rounded-xl",
} as const;

export interface IconBoxProps extends ComponentProps<"div"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function IconBox({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: IconBoxProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
