"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeatureError({ title, description, reset }: { title: string; description: string; reset: () => void }) {
  return <div className="flex min-h-[55vh] items-center justify-center"><div role="alert" className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle className="size-5" /></span><h1 className="mt-5 text-xl font-bold text-slate-950">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><Button className="mt-6" onClick={reset}>Try Again</Button></div></div>;
}
