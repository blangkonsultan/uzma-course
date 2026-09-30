import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn("text-center", className)}>
      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-slate-600 mt-3 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}
