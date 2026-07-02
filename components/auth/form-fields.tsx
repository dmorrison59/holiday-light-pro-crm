"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function FormMessage({ error }: { error?: string }) {
  if (!error) return null;
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>;
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? pendingLabel : label}</Button>;
}

export function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}{required ? <span className="text-red-600"> *</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-normal text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
    </label>
  );
}
