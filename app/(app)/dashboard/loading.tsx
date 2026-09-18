import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-9" aria-label="Loading dashboard">
      <div className="space-y-3 border-b border-[#cfd8d6] pb-6"><div className="h-3 w-36 animate-pulse rounded bg-amber-200/80" /><div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" /><div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" /></div>
      <div className="space-y-4"><div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Card key={index} className="h-32 animate-pulse bg-[#f8f7f2] shadow-none" />)}
      </div></div>
      <Card className="h-32 animate-pulse bg-[#edf2f6] shadow-none" />
      <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => <Card key={index} className="h-28 animate-pulse bg-[#f8f7f2] shadow-none" />)}
      </div></div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.82fr)]">
        <Card className="h-80 animate-pulse bg-[#f8f7f2]" />
        <Card className="h-80 animate-pulse bg-[#f8f7f2]" />
        <Card className="h-80 animate-pulse bg-[#f8f7f2]" />
      </div>
    </div>
  );
}
