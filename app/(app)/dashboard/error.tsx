"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div role="alert" className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle className="size-5" /></span>
        <h1 className="mt-5 text-xl font-bold text-slate-950">We could not load your company information.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Please try again. If the problem continues, check your connection and Supabase setup.</p>
        <Button className="mt-6" onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
