import { CalendarCheck2, RefreshCcw, Search } from "lucide-react";
import { CreateRenewalQuoteForm } from "@/components/rebooking/create-renewal-quote-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireOrganization } from "@/lib/auth/current";
import { getRebookingCenterData, rebookingStatusLabels, rebookingStatuses } from "@/lib/rebooking";

export const metadata = { title: "Rebooking" };

const money = (value: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));

export default async function RebookingPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { organization } = await requireOrganization();
  const filters = await searchParams;
  const data = await getRebookingCenterData(organization.id, { search: filters.q, status: filters.status });

  return <div className="space-y-7">
    <PageHeader title="Rebooking Center" description={`Review eligible prior-season work and prepare ${data.season} renewal quotes.`} />

    <section aria-label="Rebooking status counts" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {rebookingStatuses.map((status) => <Card key={status} className="shadow-none"><CardContent className="p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{rebookingStatusLabels[status]}</p><p className="mt-2 text-2xl font-extrabold text-slate-950">{data.counts[status]}</p></CardContent></Card>)}
    </section>

    {data.total ? <Card><CardContent><form method="get" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px_auto]"><label className="relative"><span className="sr-only">Search rebooking records</span><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" /><Input name="q" defaultValue={filters.q} className="pl-10" placeholder="Customer, property, or prior job" /></label><Select name="status" defaultValue={filters.status ?? ""}><option value="">All statuses</option>{rebookingStatuses.map((status) => <option key={status} value={status}>{rebookingStatusLabels[status]}</option>)}</Select><Button type="submit" variant="secondary">Filter</Button></form></CardContent></Card> : null}

    {!data.total ? <EmptyState icon={<RefreshCcw className="size-5" />} title="No prior-season jobs are ready for rebooking" description="Completed or stored jobs will appear here when they are eligible for the current season." /> : data.records.length ? <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[960px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Property</th><th className="px-4 py-3">Prior season</th><th className="px-4 py-3">Previous total</th><th className="px-4 py-3">Renewal</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{data.records.map((record) => <tr key={record.sourceJobId}><td className="px-4 py-4"><p className="font-bold text-slate-950">{record.customerName}</p><p className="mt-1 text-xs text-slate-500">{record.sourceJobNumber || "Prior job"}</p></td><td className="px-4 py-4 text-slate-600">{record.propertyLabel}</td><td className="px-4 py-4">{record.priorSeason}</td><td className="px-4 py-4 font-bold">{money(record.previousTotal)}</td><td className="px-4 py-4"><StatusBadge status={rebookingStatusLabels[record.status]} /></td><td className="px-4 py-4"><div className="flex justify-end">{record.status === "not_contacted" ? <CreateRenewalQuoteForm sourceJobId={record.sourceJobId} /> : record.status === "draft" && record.renewalQuoteId ? <LinkButton href={`/quotes/${record.renewalQuoteId}/edit`} size="sm">Continue Renewal Quote</LinkButton> : record.renewalQuoteId ? <LinkButton href={`/quotes/${record.renewalQuoteId}`} size="sm" variant="secondary">View Renewal Quote</LinkButton> : null}</div></td></tr>)}</tbody></table></div>
      <div className="divide-y divide-slate-100 lg:hidden">{data.records.map((record) => <article key={record.sourceJobId} className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{record.customerName}</p><p className="mt-1 text-sm text-slate-600">{record.propertyLabel}</p><p className="mt-1 text-xs text-slate-500">{record.sourceJobNumber || "Prior job"} · {record.priorSeason}</p></div><StatusBadge status={rebookingStatusLabels[record.status]} /></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Previous total</p><p className="mt-1 font-bold text-slate-950">{money(record.previousTotal)}</p></div><div>{record.status === "not_contacted" ? <CreateRenewalQuoteForm sourceJobId={record.sourceJobId} /> : record.status === "draft" && record.renewalQuoteId ? <LinkButton href={`/quotes/${record.renewalQuoteId}/edit`} size="sm">Continue Renewal Quote</LinkButton> : record.renewalQuoteId ? <LinkButton href={`/quotes/${record.renewalQuoteId}`} size="sm" variant="secondary">View Renewal Quote</LinkButton> : null}</div></article>)}</div>
    </Card> : <EmptyState compact icon={<CalendarCheck2 className="size-5" />} title="No matching rebooking records" description="Try changing the search or status filter." actionLabel="Clear Filters" actionHref="/rebooking" />}
  </div>;
}
