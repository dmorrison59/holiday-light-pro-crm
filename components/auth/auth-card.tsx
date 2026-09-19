import Link from "next/link";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ eyebrow, title, description, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1f33] px-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/login" className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
          <span className="flex size-11 items-center justify-center rounded-xl border border-amber-200/70 bg-[#cda65f] text-[#0b1f33] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_22px_rgba(3,15,25,0.28)]"><Zap className="size-5" fill="currentColor" /></span>
          <span><span className="block text-sm font-extrabold text-white">Holiday Light Pro</span><span className="block text-xs text-slate-400">Contractor CRM</span></span>
        </Link>

        <Card className="border-white/20 shadow-2xl shadow-slate-950/25">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#315b78]">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-7">{children}</div>
          </CardContent>
        </Card>

        {footer ? <div className="mt-5 text-center text-sm text-slate-400">{footer}</div> : null}
      </div>
    </main>
  );
}
