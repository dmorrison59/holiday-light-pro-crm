import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LinkButtonProps = LinkProps & {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function LinkButton({ children, className, variant = "primary", size = "md", ...props }: LinkButtonProps) {
  return (
    <Link className={cn("inline-flex items-center justify-center rounded-xl font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2", {
      "bg-emerald-800 text-white hover:bg-emerald-900": variant === "primary",
      "border border-slate-300 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50": variant === "secondary",
      "text-slate-600 hover:bg-slate-100 hover:text-slate-950": variant === "ghost",
      "bg-red-700 text-white hover:bg-red-800": variant === "danger",
      "h-9 px-3 text-sm": size === "sm",
      "h-11 px-4 text-sm": size === "md",
      "h-12 px-5 text-base": size === "lg",
    }, className)} {...props}>{children}</Link>
  );
}
