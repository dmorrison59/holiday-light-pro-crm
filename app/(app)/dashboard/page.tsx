import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BookPlus,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarMinus,
  ClipboardPlus,
  FileCheck2,
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
import { SeasonalLightString } from "@/components/ui/seasonal-accents";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDashboardData, type DashboardScheduleEvent } from "@/lib/dashboard";
import { requireOrganization } from "@/lib/auth/current";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const metricTones = {
  navy: {
    accent: "bg-[#17324d]",
    icon: "border-slate-200 bg-slate-100 text-[#17324d]",
  },
  evergreen: {
    accent: "bg-[#14543d]",
    icon: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  gold: {
    accent: "bg-[#b88a3b]",
    icon: "border-amber-200 bg-amber-50 text-amber-900",
  },
  danger: {
    accent: "bg-red-700",
    icon: "border-red-200 bg-red-50 text-red-800",
  },
} as const;

type MetricTone = keyof typeof metricTones;

type Metric = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: MetricTone;
  href: string;
};

function SectionHeading({ id, title, description, accent = false }: { id: string; title: string; description: string; accent?: boolean }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span aria-hidden="true" className={`mt-1 h-8 w-1 rounded-full ${accent ? "bg-[#b88a3b]" : "bg-[#315b78]"}`} />
      <div>
        <h2 id={id} className="text-lg font-extrabold tracking-tight text-[#0b1f33]">{title}</h2>
        <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function scheduleAccent(eventType: string) {
  const normalizedType = eventType.trim().toLowerCase();
  if (normalizedType.includes("install")) return { border: "border-[#39705b]", bulb: "bg-[#39705b] text-[#39705b]" };
  if (normalizedType.includes("takedown")) return { border: "border-[#527b98]", bulb: "bg-[#527b98] text-[#527b98]" };
  if (normalizedType.includes("rebook") || normalizedType.includes("reschedul")) return { border: "border-[#b58b46]", bulb: "bg-[#b58b46] text-[#b58b46]" };
  return { border: "border-slate-400", bulb: "bg-slate-400 text-slate-400" };
}

function MetricCard({ metric, prominent = false }: { metric: Metric; prominent?: boolean }) {
  const Icon = metric.icon;
  const tone = metricTones[metric.tone];

  return (
    <Link href={metric.href} aria-label={`View ${metric.label}: ${metric.value}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
      <Card className="relative h-full overflow-hidden shadow-[0_1px_2px_rgba(11,31,51,0.04),0_10px_26px_rgba(11,31,51,0.045)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#c3cecb] group-hover:shadow-[var(--shadow-raised)]">
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-0.5 ${tone.accent}`} />
        <CardContent className={`flex items-start justify-between gap-4 ${prominent ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-slate-600 transition-colors group-hover:text-[#17324d]">{metric.label}</p>
            <p className={`mt-2 font-extrabold tracking-[-0.03em] text-[#0b1f33] ${prominent ? "text-3xl" : "text-2xl"}`}>{metric.value}</p>
          </div>
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-200 group-hover:scale-105 ${tone.icon}`}><Icon aria-hidden="true" className="size-5" /></span>
        </CardContent>
      </Card>
    </Link>
  );
}

function ScheduleList({ events }: { events: DashboardScheduleEvent[] }) {
  return (
    <div className="space-y-2">
      {events.map((event) => {
        const accent = scheduleAccent(event.event_type);
        return (
        <div key={event.id} className="flex flex-col gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-[#dce3e8] hover:bg-[#f7f9fa] sm:flex-row sm:items-center sm:justify-between">
          <div className={`min-w-0 border-l-2 pl-3 ${accent.border}`}>
            <p className="flex items-center gap-2 font-semibold capitalize text-slate-950"><span aria-hidden="true" className={`size-1.5 shrink-0 rounded-b-full shadow-[0_0_4px_currentColor] ${accent.bulb}`} />{event.href ? <Link href={event.href} className="rounded-sm hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">{event.event_type.replaceAll("_", " ")}</Link> : event.event_type.replaceAll("_", " ")}</p>
            <p className="mt-1 text-sm text-slate-500">{event.event_date} · {event.time_window || event.start_time?.slice(0, 5) || "Time to be set"}</p>
          </div>
          <StatusBadge status={event.status} />
        </div>
        );
      })}
    </div>
  );
}

export default async function DashboardPage() {
  const { profile, organization } = await requireOrganization();
  const data = await getDashboardData(organization.id);
  const firstName = profile.first_name?.trim();

  const primaryMetrics: Metric[] = [
    { label: "Revenue Quoted", value: currency.format(data.revenueQuoted), icon: FilePlus2, tone: "navy", href: "/quotes" },
    { label: "Quotes Pending", value: data.quotesPending, icon: FileText, tone: "gold", href: "/quotes?status=pending" },
    { label: "Approved Quotes Ready to Convert", value: data.approvedQuotesReadyToConvert, icon: FileCheck2, tone: "evergreen", href: "/quotes?status=approved" },
    { label: "Installs This Week", value: data.installsThisWeek, icon: Sparkles, tone: "evergreen", href: "/schedule?view=week" },
  ];

  const operationalMetrics: Metric[] = [
    { label: "New Leads", value: data.newLeads, icon: ListPlus, tone: "navy", href: "/customers?status=lead" },
    { label: "Site Visits Scheduled", value: data.siteVisitsScheduled, icon: Route, tone: "gold", href: "/site-visits" },
    { label: "Measured Visits", value: data.measuredVisits, icon: Ruler, tone: "evergreen", href: "/site-visits" },
    { label: "Approved Jobs", value: data.approvedJobs, icon: CalendarCheck, tone: "evergreen", href: "/jobs" },
    { label: "Takedowns Upcoming", value: data.takedownsUpcoming, icon: CalendarMinus, tone: "gold", href: "/schedule?view=upcoming" },
    { label: "Active Catalog Items", value: data.activeCatalogItems, icon: BookOpen, tone: "navy", href: "/catalog?active=active" },
    { label: "Active Packages", value: data.activePackages, icon: Gift, tone: "evergreen", href: "/packages?active=active" },
  ];

  const attentionMetrics: Metric[] = [
    { label: "Low Stock Items", value: data.lowStockItems, icon: TriangleAlert, tone: data.lowStockItems > 0 ? "danger" : "evergreen", href: "/catalog?low=yes" },
    { label: "Materials to Reserve", value: data.materialsNeedingReservation, icon: ClipboardPlus, tone: data.materialsNeedingReservation > 0 ? "gold" : "evergreen", href: "/jobs" },
    { label: "Jobs Missing Materials", value: data.jobsMissingMaterials, icon: TriangleAlert, tone: data.jobsMissingMaterials > 0 ? "danger" : "evergreen", href: "/jobs" },
    { label: "Unpaid Balances", value: currency.format(data.unpaidBalances), icon: Banknote, tone: data.unpaidBalances > 0 ? "danger" : "evergreen", href: "/jobs" },
  ];
  const hasAttention = data.lowStockItems > 0 || data.materialsNeedingReservation > 0 || data.jobsMissingMaterials > 0 || data.unpaidBalances > 0;

  const quickActions = [
    { label: "Add Lead", href: "/leads", icon: ListPlus },
    { label: "Add Customer", href: "/customers", icon: UserPlus },
    { label: "Start Site Visit", href: "/schedule", icon: ClipboardPlus },
    { label: "Create Quote", href: "/quotes", icon: FilePlus2 },
    { label: "View Schedule", href: "/schedule", icon: CalendarDays },
    { label: "Add Catalog Item", href: "/catalog", icon: BookPlus },
  ];

  return (
    <div className="space-y-9">
      <div className="space-y-2">
        <PageHeader title={firstName ? `Welcome back, ${firstName}` : "Welcome back"} description={`Managing jobs for: ${organization.name}`} />
        <SeasonalLightString />
      </div>

      {data.hasError ? <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 shadow-sm">Some dashboard activity could not be loaded. Your company information is still available.</div> : null}

      <section aria-labelledby="business-overview-title">
        <SectionHeading id="business-overview-title" title="Business Overview" description="A focused view of quoting, approvals, and this week’s field work." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} prominent />)}
        </div>
      </section>

      <section aria-labelledby="quick-actions-title">
        <div className="rounded-2xl border border-[#d4dfe7] bg-[#edf2f6] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:p-5">
          <div className="mb-4"><h2 id="quick-actions-title" className="text-base font-extrabold text-[#0b1f33]">Quick Actions</h2><p className="mt-1 text-sm text-slate-600">Jump into the most common tasks.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="group flex min-h-12 items-center gap-3 rounded-xl border border-[#d2dce4] bg-[#fffefb] px-4 text-sm font-semibold text-slate-800 shadow-[0_2px_6px_rgba(11,31,51,0.045)] transition-all hover:-translate-y-px hover:border-amber-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800 transition-colors group-hover:bg-amber-100"><Icon aria-hidden="true" className="size-4" /></span>{label}
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="operations-title">
        <SectionHeading id="operations-title" title="Operations Snapshot" description="The current volume moving through your customer and field workflow." accent />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {operationalMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.82fr)]">
        <section aria-labelledby="today-title">
          <Card className="h-full overflow-hidden">
            <CardHeader className="border-t-2 border-t-[#315b78]"><h2 id="today-title" className="text-lg font-extrabold tracking-tight text-[#0b1f33]">Today’s Schedule</h2><p className="mt-1 text-sm text-slate-500">Visits and field work happening today.</p></CardHeader>
            <CardContent>{data.todaysSchedule.length ? <ScheduleList events={data.todaysSchedule} /> : <EmptyState compact title="Your day is clear" description="No visits, installs, or takedowns scheduled for today." />}</CardContent>
          </Card>
        </section>
        <section aria-labelledby="upcoming-title">
          <Card className="h-full overflow-hidden">
            <CardHeader className="border-t-2 border-t-[#b88a3b]"><h2 id="upcoming-title" className="text-lg font-extrabold tracking-tight text-[#0b1f33]">Upcoming This Week</h2><p className="mt-1 text-sm text-slate-500">The next seven days at a glance.</p></CardHeader>
            <CardContent>{data.upcomingSchedule.length ? <ScheduleList events={data.upcomingSchedule} /> : <EmptyState compact title="No upcoming field work" description="Scheduled visits, installs, and takedowns will appear here." actionLabel="View Schedule" actionHref="/schedule" />}</CardContent>
          </Card>
        </section>
        <section aria-labelledby="attention-title">
          <Card className={`h-full overflow-hidden ${hasAttention ? "border-[#ded7c8]" : "border-[#d8e3de]"}`}>
            <CardHeader className={`border-t-2 bg-[#f8fafb] ${hasAttention ? "border-t-red-700" : "border-t-[#39705b]"}`}><h2 id="attention-title" className="text-lg font-extrabold tracking-tight text-[#0b1f33]">Needs Attention</h2><p className="mt-1 text-sm text-slate-500">Items worth checking before the next job.</p></CardHeader>
            <CardContent className="space-y-2 p-3">
              {attentionMetrics.map((metric) => {
                const Icon = metric.icon;
                const tone = metricTones[metric.tone];
                return (
                  <Link key={metric.label} href={metric.href} className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-[#e1ddd3] hover:bg-[#faf8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
                    <span className="flex min-w-0 items-center gap-3"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${tone.icon}`}><Icon aria-hidden="true" className="size-4" /></span><span className="text-sm font-semibold leading-5 text-slate-700 group-hover:text-[#0b1f33]">{metric.label}</span></span>
                    <span className="shrink-0 text-base font-extrabold text-[#0b1f33]">{metric.value}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
