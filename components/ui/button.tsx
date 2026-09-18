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
        "inline-flex items-center justify-center rounded-xl border border-transparent font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
        {
          "border-[#0f4835] bg-[#14543d] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_4px_12px_rgba(13,63,46,0.18)] hover:-translate-y-px hover:bg-[#0d3f2e] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_7px_18px_rgba(13,63,46,0.22)]": variant === "primary",
          "border-[#c9d3d1] bg-[#fffefb] text-[#17324d] shadow-[0_1px_2px_rgba(11,31,51,0.05)] hover:-translate-y-px hover:border-amber-500 hover:bg-[#fcf7ec] hover:shadow-md": variant === "secondary",
          "text-slate-600 shadow-none hover:bg-white/80 hover:text-[#0b1f33]": variant === "ghost",
          "border-red-800 bg-red-700 text-white shadow-[0_4px_12px_rgba(185,28,28,0.16)] hover:-translate-y-px hover:bg-red-800 hover:shadow-md": variant === "danger",
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
