import * as React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
};

export function EmptyState({ title, description, icon, action, actionLabel, actionHref, compact = false }: EmptyStateProps) {
  const linkedAction = actionLabel && actionHref ? (
    <Link href={actionHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0f4835] bg-[#14543d] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(13,63,46,0.18)] transition-all hover:-translate-y-px hover:bg-[#0d3f2e] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
      {actionLabel}
    </Link>
  ) : null;

  return (
    <Card className={cn("flex flex-col items-center justify-center border-dashed border-[#c9d3d1] bg-[#faf9f5] px-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]", compact ? "min-h-52 py-8" : "min-h-72 py-12")}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 shadow-[0_6px_16px_rgba(142,103,40,0.1)]">{icon ?? <Inbox className="size-5" />}</div>
      <h2 className="text-lg font-bold text-[#0b1f33]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action || linkedAction ? <div className="mt-5">{action ?? linkedAction}</div> : null}
    </Card>
  );
}
