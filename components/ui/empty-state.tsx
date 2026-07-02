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
    <Link href={actionHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
      {actionLabel}
    </Link>
  ) : null;

  return (
    <Card className={cn("flex flex-col items-center justify-center border-dashed px-6 text-center shadow-none", compact ? "min-h-52 py-8" : "min-h-72 py-12")}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">{icon ?? <Inbox className="size-5" />}</div>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action || linkedAction ? <div className="mt-5">{action ?? linkedAction}</div> : null}
    </Card>
  );
}
