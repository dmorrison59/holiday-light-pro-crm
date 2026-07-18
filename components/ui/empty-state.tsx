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
    <Link href={actionHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#14543d] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#0d3f2e] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
      {actionLabel}
    </Link>
  ) : null;

  return (
    <Card className={cn("flex flex-col items-center justify-center border-dashed border-slate-300 bg-gradient-to-b from-[#fffefb] to-slate-50/70 px-6 text-center shadow-none", compact ? "min-h-52 py-8" : "min-h-72 py-12")}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 ring-1 ring-amber-200">{icon ?? <Inbox className="size-5" />}</div>
      <h2 className="text-lg font-bold text-[#0b1f33]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action || linkedAction ? <div className="mt-5">{action ?? linkedAction}</div> : null}
    </Card>
  );
}
