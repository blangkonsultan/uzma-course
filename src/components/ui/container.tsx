import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("max-w-6xl mx-auto px-4", className)} {...props} />;
}
