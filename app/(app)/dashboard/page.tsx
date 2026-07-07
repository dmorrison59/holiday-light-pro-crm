import Link from "next/link";
import {
  Banknote,
  BookPlus,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarMinus,
  ClipboardPlus,
  FilePlus2,
  FileText,
  Gift,
  ListPlus,
  Route,
  Ruler,
  Sparkles,
  UserPlus,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDashboardData, type DashboardScheduleEvent } from "@/lib/dashboard";
import { requireOrganization } from "@/lib/auth/current";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function ScheduleList({ events }: { events: DashboardScheduleEvent[] }) {
  return (
    <div className="divide-y divide-slate-100">
      {events.map((event) => (
        <div key={event.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-950">{event.href ? <Link href={event.href} className="hover:text-amber-800">{event.event_type.replaceAll("_", " ")}</Link> : event.event_type.replaceAll("_", " ")}</p>
            <p className="mt-1 text-sm text-slate-500">{event.event_date} · {event.time_window || event.start_time?.slice(0, 5) || "Time to be set"}</p>
          </div>
          <StatusBadge status={event.status} />
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const { profile, organization } = await requireOrganization();
  const data = await getDashboardData(organization.id);
  const firstName = profile.first_name?.trim();

  const kpis = [
    { label: "New Leads", value: data.newLeads, icon: ListPlus, tone: "bg-sky-50 text-sky-700", href: "/customers?status=lead" },
    { label: "Site Visits Scheduled", value: data.siteVisitsScheduled, icon: Route, tone: "bg-violet-50 text-violet-700", href: "/site-visits" },
    { label: "Measured Visits", value: data.measuredVisits, icon: Ruler, tone: "bg-cyan-50 text-cyan-700", href: "/site-visits" },
    { label: "Active Catalog Items", value: data.activeCatalogItems, icon: BookOpen, tone: "bg-indigo-50 text-indigo-700", href: "/catalog?active=active" },
    { label: "Low Stock Items", value: data.lowStockItems, icon: TriangleAlert, tone: "bg-red-50 text-red-700", href: "/catalog?low=yes" },
    { label: "Materials to Reserve", value: data.materialsNeedingReservation, icon: ClipboardPlus, tone: "bg-amber-50 text-amber-700", href: "/jobs" },
    { label: "Jobs Missing Materials", value: data.jobsMissingMaterials, icon: TriangleAlert, tone: "bg-orange-50 text-orange-700", href: "/jobs" },
    { label: "Active Packages", value: data.activePackages, icon: Gift, tone: "bg-fuchsia-50 text-fuchsia-700", href: "/packages?active=active" },
    { label: "Quotes Pending", value: data.quotesPending, icon: FileText, tone: "bg-amber-50 text-amber-700", href: "/quotes?status=pending" },
    { label: "Approved Jobs", value: data.approvedJobs, icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-700", href: "/jobs" },
    { label: "Installs This Week", value: data.installsThisWeek, icon: Sparkles, tone: "bg-cyan-50 text-cyan-700", href: "/schedule?view=week" },
    { label: "Takedowns Upcoming", value: data.takedownsUpcoming, icon: CalendarMinus, tone: "bg-orange-50 text-orange-700", href: "/schedule?view=upcoming" },
    { label: "Unpaid Balances", value: currency.format(data.unpaidBalances), icon: Banknote, tone: "bg-rose-50 text-rose-700", href: "/jobs" },
    { label: "Revenue Quoted", value: currency.format(data.revenueQuoted), icon: FilePlus2, tone: "bg-lime-50 text-lime-700", href: "/quotes" },
  ];

  const quickActions = [
    { label: "Add Lead", href: "/leads", icon: ListPlus },
    { label: "Add Customer", href: "/customers", icon: UserPlus },
    { label: "Start Site Visit", href: "/schedule", icon: ClipboardPlus },
    { label: "Create Quote", href: "/quotes", icon: FilePlus2 },
    { label: "View Schedule", href: "/schedule", icon: CalendarDays },
    { label: "Add Catalog Item", href: "/catalog", icon: BookPlus },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={firstName ? `Welcome back, ${firstName}` : "Welcome back"} description={`Managing jobs for: ${organization.name}`} />

      {data.hasError ? <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">Some dashboard activity could not be loaded. Your company information is still available.</div> : null}

      <section aria-labelledby="business-overview-title">
        <h2 id="business-overview-title" className="sr-only">Business overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, tone, href }) => (
            <Link key={label} href={href} aria-label={`View ${label}: ${value}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
              <Card className="h-full shadow-none transition-all group-hover:-translate-y-0.5 group-hover:border-amber-300 group-hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5">
                  <div><p className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p></div>
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${tone}`}><Icon aria-hidden="true" className="size-5" /></span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-center justify-between"><h2 id="quick-actions-title" className="text-lg font-bold text-slate-950">Quick Actions</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-amber-700" />{label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="today-title">
          <Card className="h-full">
            <CardHeader><h2 id="today-title" className="text-lg font-bold text-slate-950">Today’s Schedule</h2><p className="mt-1 text-sm text-slate-500">Visits and field work happening today.</p></CardHeader>
            <CardContent>{data.todaysSchedule.length ? <ScheduleList events={data.todaysSchedule} /> : <EmptyState compact title="Your day is clear" description="No visits, installs, or takedowns scheduled for today." />}</CardContent>
          </Card>
        </section>
        <section aria-labelledby="upcoming-title">
          <Card className="h-full">
            <CardHeader><h2 id="upcoming-title" className="text-lg font-bold text-slate-950">Upcoming This Week</h2><p className="mt-1 text-sm text-slate-500">The next seven days at a glance.</p></CardHeader>
            <CardContent>{data.upcomingSchedule.length ? <ScheduleList events={data.upcomingSchedule} /> : <EmptyState compact title="No upcoming field work" description="Scheduled visits, installs, and takedowns will appear here." actionLabel="View Schedule" actionHref="/schedule" />}</CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
