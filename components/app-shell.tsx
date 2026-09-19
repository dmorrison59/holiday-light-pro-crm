"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  FileText,
  Gift,
  LayoutDashboard,
  ListPlus,
  MapPinned,
  LogOut,
  Menu,
  RefreshCcw,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { MiniWreath } from "@/components/ui/seasonal-accents";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: ListPlus },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Site Visits", href: "/site-visits", icon: MapPinned },
  { name: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { name: "Rebooking", href: "/rebooking", icon: RefreshCcw },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Schedule", href: "/schedule", icon: CalendarDays },
  { name: "Catalog", href: "/catalog", icon: BookOpen },
  { name: "Packages", href: "/packages", icon: Gift },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Account", href: "/account", icon: CircleUserRound },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#153044]">
      <span className="flex size-10 items-center justify-center rounded-xl border border-amber-200/70 bg-[#cda65f] text-[#0b1f33] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_22px_rgba(6,20,32,0.3)]"><Zap className="size-5" fill="currentColor" /></span>
      <span><span className="block text-sm font-extrabold leading-tight tracking-[-0.01em] text-white">Holiday Light Pro</span><span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">Contractor CRM</span></span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="space-y-1.5">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", active ? "bg-white/[0.09] text-white shadow-[inset_3px_0_0_#cda65f,0_8px_18px_rgba(3,15,25,0.16)] ring-1 ring-white/10" : "text-slate-300 hover:bg-white/[0.065] hover:text-white")}>
            <span className={cn("flex size-7 items-center justify-center rounded-lg transition-colors", active ? "bg-[#1b4058] text-amber-200" : "text-slate-400 group-hover:text-amber-200")}><item.icon aria-hidden="true" className="size-[17px] shrink-0" /></span>{item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountSummary({ organizationName, userEmail }: { organizationName: string; userEmail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_26px_rgba(2,12,20,0.14)]">
      <div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/75">Signed in</p><MiniWreath className="size-5 opacity-80" /></div>
      <p className="truncate text-xs font-bold text-white">{organizationName}</p>
      <p className="mt-1 truncate text-xs text-slate-400">{userEmail}</p>
      <form action={logoutAction} className="mt-3">
        <button type="submit" className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-400/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          <LogOut className="size-3.5" />Log Out
        </button>
      </form>
    </div>
  );
}

export function AppShell({ children, organizationName, userEmail }: { children: React.ReactNode; organizationName: string; userEmail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#29465b] bg-[#102b3f] p-4 shadow-[8px_0_32px_rgba(11,31,51,0.12)] lg:flex">
        <div className="px-2 py-2"><Brand /></div>
        <div className="mt-8 flex-1"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p><NavLinks /></div>
        <AccountSummary organizationName={organizationName} userEmail={userEmail} />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#29465b] bg-[#102b3f]/95 px-4 shadow-lg backdrop-blur lg:hidden">
        <Brand />
        <button type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-xl border border-white/15 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><Menu className="size-5" /></button>
      </header>

      {open ? <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 right-0 z-50 flex w-[min(86vw,320px)] flex-col border-l border-[#29465b] bg-[#102b3f] p-4 shadow-2xl transition-transform duration-200 lg:hidden", open ? "translate-x-0" : "pointer-events-none translate-x-full")} aria-hidden={!open}>
        <div className="flex items-center justify-between px-2 py-2"><Brand /><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><X className="size-5" /></button></div>
        <div className="mt-8 flex-1"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p><NavLinks onNavigate={() => setOpen(false)} /></div>
        <AccountSummary organizationName={organizationName} userEmail={userEmail} />
      </aside>

      <main className="app-workspace lg:pl-64"><div className="app-content mx-auto w-full max-w-7xl p-4 sm:p-6 lg:px-7 lg:py-8 xl:px-8 xl:py-10">{children}</div></main>
    </div>
  );
}
