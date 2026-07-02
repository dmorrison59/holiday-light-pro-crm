import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-label="Loading dashboard">
      <div className="space-y-3"><div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" /><div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <Card key={index} className="h-28 animate-pulse bg-slate-100 shadow-none" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-80 animate-pulse bg-slate-100" />
        <Card className="h-80 animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}
