import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "warning" | "danger";
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]", { "border-slate-200 bg-slate-100/90 text-[#17324d]": variant === "neutral", "border-emerald-200 bg-emerald-50 text-emerald-900": variant === "success", "border-amber-200 bg-amber-50 text-amber-950": variant === "warning", "border-red-200 bg-red-50 text-red-900": variant === "danger" }, className)} {...props} />;
}
