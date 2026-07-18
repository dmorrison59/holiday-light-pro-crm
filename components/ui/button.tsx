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
        "inline-flex items-center justify-center rounded-xl font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-[#14543d] text-white hover:-translate-y-px hover:bg-[#0d3f2e] hover:shadow-md": variant === "primary",
          "border border-slate-300 bg-white text-[#17324d] hover:border-amber-400 hover:bg-amber-50": variant === "secondary",
          "text-slate-600 shadow-none hover:bg-slate-100 hover:text-[#0b1f33]": variant === "ghost",
          "bg-red-700 text-white hover:bg-red-800 hover:shadow-md": variant === "danger",
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
