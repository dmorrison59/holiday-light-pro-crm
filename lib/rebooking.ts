import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Customer, Job, Property, Quote, ScheduleEvent } from "@/types/database";

export const rebookingStatuses = ["not_contacted", "draft", "sent", "approved", "declined", "scheduled"] as const;
export type RebookingStatus = (typeof rebookingStatuses)[number];

export const rebookingStatusLabels: Record<RebookingStatus, string> = {
  not_contacted: "Not contacted",
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  declined: "Declined",
  scheduled: "Scheduled",
};

const completedJobStatuses = new Set(["installed", "takedown_complete", "stored", "complete"]);

type CustomerSummary = Pick<Customer, "id" | "first_name" | "last_name">;
type PropertySummary = Pick<Property, "id" | "customer_id" | "property_name" | "address_line_1" | "address_line_2" | "city" | "state" | "zip">;
type SourceQuote = Pick<Quote, "id" | "organization_id" | "customer_id" | "property_id" | "quote_date" | "total">;
type RenewalQuote = Pick<Quote, "id" | "renewal_source_job_id" | "status">;
type RenewalJob = Pick<Job, "id" | "quote_id" | "status" | "install_date">;
type CompletionEvent = Pick<ScheduleEvent, "job_id" | "event_type" | "status">;

export interface RebookingRecord {
  sourceJobId: string;
  sourceJobNumber: string | null;
  customerId: string;
  customerName: string;
  propertyId: string;
  propertyLabel: string;
  priorSeason: number;
  previousTotal: string;
  status: RebookingStatus;
  renewalQuoteId: string | null;
}

export interface RebookingCenterData {
  season: number;
  records: RebookingRecord[];
  counts: Record<RebookingStatus, number>;
  total: number;
}

export function currentRenewalSeason() {
  return new Date().getUTCFullYear();
}

function yearFromDate(value: string | null | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-\d{2}-\d{2}/.exec(value);
  return match ? Number(match[1]) : null;
}

function renewalStatus(quote: RenewalQuote | undefined, job: RenewalJob | undefined, hasActiveInstallEvent: boolean): RebookingStatus {
  if (!quote) return "not_contacted";
  if (quote.status === "declined") return "declined";
  if (quote.status === "draft") return "draft";
  if (["sent", "viewed", "expired"].includes(quote.status)) return "sent";
  if (quote.status === "approved") {
    if (job && job.status !== "canceled" && (Boolean(job.install_date) || hasActiveInstallEvent)) return "scheduled";
    return "approved";
  }
  return "draft";
}

function emptyCounts(): Record<RebookingStatus, number> {
  return { not_contacted: 0, draft: 0, sent: 0, approved: 0, declined: 0, scheduled: 0 };
}

export async function getRebookingCenterData(
  organizationId: string,
  filters: { season?: number; search?: string; status?: string } = {},
): Promise<RebookingCenterData> {
  const season = filters.season ?? currentRenewalSeason();
  const supabase = await createSupabaseServerClient();
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", organizationId)
    .not("quote_id", "is", null)
    .order("install_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (jobsError) throw new Error("We could not load prior-season jobs.");

  const sourceJobs = (jobs ?? []).filter((job) => job.status !== "canceled" && job.quote_id);
  const sourceJobIds = sourceJobs.map((job) => job.id);
  const sourceQuoteIds = sourceJobs.flatMap((job) => job.quote_id ? [job.quote_id] : []);

  const [sourceQuotesResult, completionEventsResult, renewalQuotesResult] = await Promise.all([
    sourceQuoteIds.length
      ? supabase.from("quotes").select("id, organization_id, customer_id, property_id, quote_date, total").eq("organization_id", organizationId).in("id", sourceQuoteIds)
      : Promise.resolve({ data: [] as SourceQuote[], error: null }),
    sourceJobIds.length
      ? supabase.from("schedule_events").select("job_id, event_type, status").eq("organization_id", organizationId).in("job_id", sourceJobIds).in("event_type", ["install", "takedown"]).eq("status", "completed")
      : Promise.resolve({ data: [] as CompletionEvent[], error: null }),
    supabase.from("quotes").select("id, renewal_source_job_id, status").eq("organization_id", organizationId).eq("renewal_season", season).not("renewal_source_job_id", "is", null),
  ]);
  if (sourceQuotesResult.error || completionEventsResult.error || renewalQuotesResult.error) throw new Error("We could not load rebooking details.");

  const sourceQuotes = sourceQuotesResult.data ?? [];
  const sourceQuoteMap = new Map(sourceQuotes.map((quote) => [quote.id, quote]));
  const completedJobIds = new Set((completionEventsResult.data ?? []).flatMap((event) => event.job_id ? [event.job_id] : []));
  const renewalQuotes = (renewalQuotesResult.data ?? []).filter((quote): quote is RenewalQuote => Boolean(quote.renewal_source_job_id));
  const renewalBySourceJob = new Map(renewalQuotes.map((quote) => [quote.renewal_source_job_id as string, quote]));
  const renewalQuoteIds = renewalQuotes.map((quote) => quote.id);

  const customerIds = [...new Set(sourceQuotes.map((quote) => quote.customer_id))];
  const propertyIds = [...new Set(sourceQuotes.map((quote) => quote.property_id))];
  const [customersResult, propertiesResult, renewalJobsResult] = await Promise.all([
    customerIds.length
      ? supabase.from("customers").select("id, first_name, last_name").eq("organization_id", organizationId).in("id", customerIds)
      : Promise.resolve({ data: [] as CustomerSummary[], error: null }),
    propertyIds.length
      ? supabase.from("properties").select("id, customer_id, property_name, address_line_1, address_line_2, city, state, zip").eq("organization_id", organizationId).in("id", propertyIds)
      : Promise.resolve({ data: [] as PropertySummary[], error: null }),
    renewalQuoteIds.length
      ? supabase.from("jobs").select("id, quote_id, status, install_date").eq("organization_id", organizationId).in("quote_id", renewalQuoteIds)
      : Promise.resolve({ data: [] as RenewalJob[], error: null }),
  ]);
  if (customersResult.error || propertiesResult.error || renewalJobsResult.error) throw new Error("We could not load rebooking customers and properties.");

  const renewalJobs = renewalJobsResult.data ?? [];
  const renewalJobIds = renewalJobs.map((job) => job.id);
  const activeInstallEventsResult = renewalJobIds.length
    ? await supabase.from("schedule_events").select("job_id").eq("organization_id", organizationId).in("job_id", renewalJobIds).eq("event_type", "install").in("status", ["scheduled", "rescheduled"])
    : { data: [] as Array<Pick<ScheduleEvent, "job_id">>, error: null };
  if (activeInstallEventsResult.error) throw new Error("We could not load renewal scheduling details.");

  const customerMap = new Map((customersResult.data ?? []).map((customer) => [customer.id, customer]));
  const propertyMap = new Map((propertiesResult.data ?? []).map((property) => [property.id, property]));
  const renewalJobByQuote = new Map(renewalJobs.flatMap((job) => job.quote_id ? [[job.quote_id, job] as const] : []));
  const renewalJobIdsWithActiveInstall = new Set((activeInstallEventsResult.data ?? []).flatMap((event) => event.job_id ? [event.job_id] : []));

  const allRecords = sourceJobs.flatMap((job): RebookingRecord[] => {
    if (!job.quote_id) return [];
    const sourceQuote = sourceQuoteMap.get(job.quote_id);
    if (!sourceQuote || sourceQuote.customer_id !== job.customer_id || sourceQuote.property_id !== job.property_id) return [];
    const priorSeason = yearFromDate(job.install_date) ?? yearFromDate(sourceQuote.quote_date);
    if (priorSeason === null || priorSeason >= season) return [];
    if (!completedJobStatuses.has(job.status) && !completedJobIds.has(job.id)) return [];
    const customer = customerMap.get(job.customer_id);
    const property = propertyMap.get(job.property_id);
    if (!customer || !property || property.customer_id !== customer.id) return [];
    const renewalQuote = renewalBySourceJob.get(job.id);
    const relatedRenewalJob = renewalQuote ? renewalJobByQuote.get(renewalQuote.id) : undefined;
    const propertyLabel = property.property_name || [property.address_line_1, property.address_line_2, property.city, property.state, property.zip].filter(Boolean).join(", ");
    return [{
      sourceJobId: job.id,
      sourceJobNumber: job.job_number,
      customerId: customer.id,
      customerName: `${customer.first_name} ${customer.last_name}`.trim(),
      propertyId: property.id,
      propertyLabel,
      priorSeason,
      previousTotal: sourceQuote.total,
      status: renewalStatus(renewalQuote, relatedRenewalJob, Boolean(relatedRenewalJob && renewalJobIdsWithActiveInstall.has(relatedRenewalJob.id))),
      renewalQuoteId: renewalQuote?.id ?? null,
    }];
  });

  const counts = emptyCounts();
  for (const record of allRecords) counts[record.status] += 1;
  const search = filters.search?.trim().toLocaleLowerCase();
  const status = rebookingStatuses.includes(filters.status as RebookingStatus) ? filters.status as RebookingStatus : null;
  const records = allRecords.filter((record) => {
    if (status && record.status !== status) return false;
    if (!search) return true;
    return [record.customerName, record.propertyLabel, record.sourceJobNumber].filter(Boolean).join(" ").toLocaleLowerCase().includes(search);
  });

  return { season, records, counts, total: allRecords.length };
}
