import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-emerald-800 text-white hover:bg-emerald-900": variant === "primary",
          "border border-slate-300 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50": variant === "secondary",
          "text-slate-600 hover:bg-slate-100 hover:text-slate-950": variant === "ghost",
          "bg-red-700 text-white hover:bg-red-800": variant === "danger",
          "h-9 px-3 text-sm": size === "sm",
          "h-11 px-4 text-sm": size === "md",
          "h-12 px-5 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
