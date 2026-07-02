import type { ReactNode } from "react";

export function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <span className="mt-2 block">{children}</span>
      {hint ? <span className="mt-1.5 block text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}
