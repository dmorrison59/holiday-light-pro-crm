import { Badge } from "@/components/ui/badge";

const statusVariants = {
  draft: "neutral",
  sent: "warning",
  new: "warning",
  contacted: "neutral",
  "site visit scheduled": "warning",
  measured: "neutral",
  "quote sent": "warning",
  approved: "success",
  scheduled: "warning",
  "materials ready": "neutral",
  installed: "success",
  "takedown scheduled": "warning",
  "takedown complete": "success",
  completed: "success",
  rescheduled: "warning",
  declined: "danger",
  expired: "danger",
  unpaid: "danger",
  "deposit paid": "success",
  "partially paid": "warning",
  overdue: "danger",
  needed: "warning",
  reserved: "neutral",
  loaded: "success",
  used: "success",
  returned: "neutral",
  missing: "danger",
  available: "success",
  "low stock": "warning",
  "not enough available": "danger",
  canceled: "danger",
  paid: "success",
  complete: "success",
  lost: "danger",
} as const;

type SupportedStatus = keyof typeof statusVariants;

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.trim().toLowerCase();
  const variant = statusVariants[normalizedStatus as SupportedStatus] ?? "neutral";
  const dotTone = {
    neutral: "bg-slate-500",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-red-600",
  }[variant];
  const label = normalizedStatus
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <Badge variant={variant}><span aria-hidden="true" className={`size-1.5 rounded-full ${dotTone}`} />{label || "Unknown"}</Badge>;
}
