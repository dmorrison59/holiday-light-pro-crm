import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-[#102033] shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500", className)} {...props} />
  ),
);
Input.displayName = "Input";
