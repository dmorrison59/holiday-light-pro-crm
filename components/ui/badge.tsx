import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "warning" | "danger";
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", { "bg-slate-100 text-slate-700": variant === "neutral", "bg-emerald-100 text-emerald-800": variant === "success", "bg-amber-100 text-amber-800": variant === "warning", "bg-red-100 text-red-800": variant === "danger" }, className)} {...props} />;
}
