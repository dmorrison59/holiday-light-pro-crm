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
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: ListPlus },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Site Visits", href: "/site-visits", icon: MapPinned },
  { name: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
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
      <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-[0_8px_24px_rgba(184,138,59,0.24)]"><Zap className="size-5" fill="currentColor" /></span>
      <span><span className="block text-sm font-extrabold leading-tight tracking-tight text-white">Holiday Light Pro</span><span className="block text-xs font-medium text-slate-400">Contractor CRM</span></span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="space-y-1">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", active ? "bg-[#16624f] text-white shadow-sm ring-1 ring-[#4b806f]" : "text-slate-300 hover:bg-white/8 hover:text-white")}>
            <item.icon aria-hidden="true" className="size-[18px] shrink-0" />{item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountSummary({ organizationName, userEmail }: { organizationName: string; userEmail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-inner">
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
    <div className="min-h-screen bg-[#f3f5f7]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#29465b] bg-[#153044] p-4 shadow-[8px_0_32px_rgba(21,48,68,0.08)] lg:flex">
        <div className="px-2 py-2"><Brand /></div>
        <div className="mt-8 flex-1"><NavLinks /></div>
        <AccountSummary organizationName={organizationName} userEmail={userEmail} />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#29465b] bg-[#153044]/95 px-4 shadow-lg backdrop-blur lg:hidden">
        <Brand />
        <button type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-xl border border-white/15 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><Menu className="size-5" /></button>
      </header>

      {open ? <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 right-0 z-50 flex w-[min(86vw,320px)] flex-col border-l border-[#29465b] bg-[#153044] p-4 shadow-2xl transition-transform duration-200 lg:hidden", open ? "translate-x-0" : "pointer-events-none translate-x-full")} aria-hidden={!open}>
        <div className="flex items-center justify-between px-2 py-2"><Brand /><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><X className="size-5" /></button></div>
        <div className="mt-8 flex-1"><NavLinks onNavigate={() => setOpen(false)} /></div>
        <AccountSummary organizationName={organizationName} userEmail={userEmail} />
      </aside>

      <main className="lg:pl-64"><div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:px-7 lg:py-8 xl:px-8 xl:py-10">{children}</div></main>
    </div>
  );
}
