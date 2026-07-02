import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { crmDateKey, toDateTimeLocal } from "@/lib/format";
import { paymentTotal } from "@/lib/payment-options";

export interface DashboardScheduleEvent {
  id: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  time_window: string | null;
  status: string;
  href?: string;
}

export interface DashboardData {
  newLeads: number;
  siteVisitsScheduled: number;
  measuredVisits: number;
  activeCatalogItems: number;
  lowStockItems: number;
  materialsNeedingReservation: number;
  jobsMissingMaterials: number;
  activePackages: number;
  quotesPending: number;
  approvedJobs: number;
  installsThisWeek: number;
  takedownsUpcoming: number;
  unpaidBalances: number;
  revenueQuoted: number;
  todaysSchedule: DashboardScheduleEvent[];
  upcomingSchedule: DashboardScheduleEvent[];
  hasError: boolean;
}

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sumCurrency = (rows: Array<Record<string, unknown>> | null, field: string) =>
  (rows ?? []).reduce((total, row) => total + Number(row[field] ?? 0), 0);

export async function getDashboardData(organizationId: string): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayKey = dateKey(today);
  const tomorrowKey = dateKey(tomorrow);
  const weekEndKey = dateKey(weekEnd);

  const results = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "lead"),
    supabase.from("site_visits").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).gte("visit_date", `${todayKey}T00:00:00`),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["draft", "sent"]),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["approved", "scheduled", "materials_ready", "installed", "takedown_scheduled"]),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).gte("install_date", todayKey).lte("install_date", weekEndKey),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).gte("takedown_date", todayKey),
    supabase.from("quotes").select("id, total").eq("organization_id", organizationId).gt("total", 0),
    supabase.from("quotes").select("total").eq("organization_id", organizationId).in("status", ["draft", "sent", "viewed", "approved"]),
    supabase.from("schedule_events").select("id, event_type, event_date, start_time, time_window, status").eq("organization_id", organizationId).eq("event_date", todayKey).order("start_time", { ascending: true, nullsFirst: false }).limit(6),
    supabase.from("schedule_events").select("id, event_type, event_date, start_time, time_window, status").eq("organization_id", organizationId).gte("event_date", tomorrowKey).lte("event_date", weekEndKey).order("event_date", { ascending: true }).order("start_time", { ascending: true, nullsFirst: false }).limit(6),
    supabase.from("site_visits").select("id, visit_date").eq("organization_id", organizationId).gte("visit_date", `${todayKey}T00:00:00`).lt("visit_date", `${tomorrowKey}T00:00:00`).order("visit_date").limit(6),
    supabase.from("site_visits").select("id, visit_date").eq("organization_id", organizationId).gte("visit_date", `${tomorrowKey}T00:00:00`).lte("visit_date", `${weekEndKey}T23:59:59`).order("visit_date").limit(6),
    supabase.from("measurements").select("site_visit_id").eq("organization_id", organizationId),
    supabase.from("catalog_items").select("active, track_inventory, quantity_available, quantity_reserved, reorder_threshold").eq("organization_id", organizationId),
    supabase.from("packages").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true),
    supabase.from("jobs").select("id, quote_id, payment_status").eq("organization_id", organizationId).not("quote_id", "is", null),
    supabase.from("payments").select("job_id, amount, payment_type, status").eq("organization_id", organizationId),
  ]);

  const [newLeads, siteVisits, quotes, approvedJobs, installs, takedowns, unpaid, revenue, todaySchedule, upcomingSchedule, todayVisits, upcomingVisits, measuredVisitRows, catalogRows, activePackages, jobPayments, paymentRows] = results;
  const [neededMaterials, activeJobRows, materialJobRows] = await Promise.all([
    supabase.from("job_materials").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "Needed"),
    supabase.from("jobs").select("id").eq("organization_id", organizationId).not("status", "in", "(complete,canceled)"),
    supabase.from("job_materials").select("job_id").eq("organization_id", organizationId),
  ]);
  const visitActivity = (rows: typeof todayVisits.data): DashboardScheduleEvent[] => (rows ?? []).flatMap((visit) => visit.visit_date ? [{ id: visit.id, event_type: "Site Visit", event_date: crmDateKey(visit.visit_date), start_time: toDateTimeLocal(visit.visit_date).slice(11), time_window: null, status: "scheduled", href: `/site-visits/${visit.id}` }] : []);
  const mergeActivity = (events: DashboardScheduleEvent[], visits: DashboardScheduleEvent[]) => [...events.map((event) => ({ ...event, href: "/schedule" })), ...visits].sort((a, b) => `${a.event_date}${a.start_time ?? ""}`.localeCompare(`${b.event_date}${b.start_time ?? ""}`)).slice(0, 6);

  return {
    newLeads: newLeads.count ?? 0,
    siteVisitsScheduled: siteVisits.count ?? 0,
    measuredVisits: new Set((measuredVisitRows.data ?? []).map((measurement) => measurement.site_visit_id)).size,
    activeCatalogItems: (catalogRows.data ?? []).filter((item) => item.active).length,
    lowStockItems: (catalogRows.data ?? []).filter((item) => item.track_inventory && Number(item.quantity_available) - Number(item.quantity_reserved) <= Number(item.reorder_threshold)).length,
    materialsNeedingReservation: neededMaterials.count ?? 0,
    jobsMissingMaterials: (activeJobRows.data ?? []).filter((job) => !(materialJobRows.data ?? []).some((material) => material.job_id === job.id)).length,
    activePackages: activePackages.count ?? 0,
    quotesPending: quotes.count ?? 0,
    approvedJobs: approvedJobs.count ?? 0,
    installsThisWeek: installs.count ?? 0,
    takedownsUpcoming: takedowns.count ?? 0,
    unpaidBalances: (jobPayments.data ?? []).filter((job) => !["paid", "canceled"].includes(job.payment_status)).reduce((sum, job) => { const quote = (unpaid.data ?? []).find((item) => item.id === job.quote_id); const paid = paymentTotal((paymentRows.data ?? []).filter((payment) => payment.job_id === job.id)); return sum + Math.max(0, Number(quote?.total ?? 0) - paid); }, 0),
    revenueQuoted: sumCurrency(revenue.data, "total"),
    todaysSchedule: mergeActivity(todaySchedule.data ?? [], visitActivity(todayVisits.data)),
    upcomingSchedule: mergeActivity(upcomingSchedule.data ?? [], visitActivity(upcomingVisits.data)),
    hasError: [...results, neededMaterials, activeJobRows, materialJobRows].some((result) => Boolean(result.error)),
  };
}
