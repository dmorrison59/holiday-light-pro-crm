import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Camera, Eye, FileText, MapPin, Pencil, Play, Ruler, Sparkles } from "lucide-react";
import { SiteVisitCard } from "@/components/site-visits/site-visit-card";
import { RelatedQuotes } from "@/components/quotes/related-quotes";
import { RelatedJobs } from "@/components/jobs/related-jobs";
import { FileSection } from "@/components/files/file-section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getProperty } from "@/lib/customers";
import { customerName, formatDate, formatVisitDate, propertyAddress } from "@/lib/format";
import { getSiteVisitsForProperty } from "@/lib/site-visits";
import { getMeasurementsForProperty } from "@/lib/measurements";
import { getQuotesForProperty } from "@/lib/quotes";
import { getJobsForProperty } from "@/lib/jobs";

function NotesCard({ title, value }: { title: string; value?: string | null }) {
  return <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value || "No notes added."}</dd></div>;
}

export default async function PropertyDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const notice = await searchParams;
  const [property, siteVisits, measurements, quotes, jobs] = await Promise.all([getProperty(organization.id, id), getSiteVisitsForProperty(organization.id, id), getMeasurementsForProperty(organization.id, id), getQuotesForProperty(organization.id, id), getJobsForProperty(organization.id, id)]);
  if (!property) notFound();
  const ownerName = customerName(property.customer.first_name, property.customer.last_name);

  return (
    <div className="space-y-7">
      <PageHeader title={property.property_name || property.address_line_1} description={propertyAddress(property)} actions={<div className="flex flex-wrap gap-2"><LinkButton href={`/customers/${property.customer.id}`} variant="secondary"><ArrowLeft className="mr-2 size-4" />Back to Customer</LinkButton><LinkButton href={`/properties/${id}/edit`}><Pencil className="mr-2 size-4" />Edit</LinkButton></div>} />
      {notice.created === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Property added successfully.</div> : null}
      {notice.updated === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Property changes saved.</div> : null}

      <RelatedQuotes quotes={quotes} createHref={`/properties/${id}/quotes/new`} />
      <RelatedJobs jobs={jobs} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card><CardHeader><h2 className="font-bold text-slate-950">Property Details</h2></CardHeader><CardContent className="space-y-5"><dl className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</dt><dd className="mt-1 text-sm font-semibold"><Link className="text-amber-800 hover:text-amber-700" href={`/customers/${property.customer.id}`}>{ownerName}</Link></dd></div><div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Property type</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{property.property_type || "Residential"}</dd></div><div className="sm:col-span-2 rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Full address</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{propertyAddress(property)}</dd></div></dl><dl className="grid gap-4 lg:grid-cols-2"><NotesCard title="Access notes" value={property.access_notes} /><NotesCard title="Outlet notes" value={property.outlet_notes} /><NotesCard title="Safety notes" value={property.safety_notes} /><NotesCard title="HOA notes" value={property.hoa_notes} /><div className="lg:col-span-2"><NotesCard title="General notes" value={property.notes} /></div></dl><div className="grid gap-1 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-2"><p>Created {formatDate(property.created_at)}</p><p className="sm:text-right">Updated {formatDate(property.updated_at)}</p></div></CardContent></Card>
        <Card><CardHeader><h2 className="font-bold text-slate-950">Next Steps</h2></CardHeader><CardContent className="space-y-3"><LinkButton href={`/properties/${id}/site-visits/new`} className="w-full"><Play className="mr-2 size-4" />Start Site Visit</LinkButton><p className="text-xs leading-5 text-slate-500">Record the appointment, budget, design preferences, and field notes.</p><LinkButton href={`/properties/${id}/edit`} variant="secondary" className="w-full"><Pencil className="mr-2 size-4" />Edit Property</LinkButton><LinkButton href={`/customers/${property.customer.id}`} variant="ghost" className="w-full"><ArrowLeft className="mr-2 size-4" />Back to {ownerName}</LinkButton></CardContent></Card>
      </div>

      <section aria-labelledby="property-visits-title"><div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="property-visits-title" className="text-xl font-bold text-slate-950">Site Visits</h2><p className="mt-1 text-sm text-slate-500">Appointments and design notes for this property.</p></div><LinkButton href={`/properties/${id}/site-visits/new`} size="sm"><CalendarPlus className="mr-2 size-4" />Start Site Visit</LinkButton></div>{siteVisits.length ? <div className="grid gap-4 lg:grid-cols-2">{siteVisits.map((visit) => <SiteVisitCard key={visit.id} visit={visit} showProperty={false} />)}</div> : <EmptyState compact icon={<CalendarPlus className="size-5" />} title="No site visits added for this property yet" description="Start a visit to capture the customer’s budget and display preferences." actionLabel="Start Site Visit" actionHref={`/properties/${id}/site-visits/new`} />}</section>

      <section aria-labelledby="property-measurements-title"><div className="mb-3"><h2 id="property-measurements-title" className="text-xl font-bold text-slate-950">Measurements</h2><p className="mt-1 text-sm text-slate-500">Recent measured zones across this property’s site visits.</p></div>{measurements.length ? <div className="grid gap-4 lg:grid-cols-2">{measurements.map((measurement) => <Card key={measurement.id}><CardContent className="space-y-3 p-4"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><Ruler className="size-5" /></span><div><h3 className="font-bold text-slate-950">{measurement.zone_name}</h3><p className="mt-1 text-sm text-slate-600">{measurement.measurement_type} · {Number(measurement.quantity).toLocaleString("en-US", { maximumFractionDigits: 2 })} {measurement.unit}</p><p className="mt-1 text-xs text-slate-500">{formatVisitDate(measurement.visit_date)} · {measurement.catalog_item?.name || "No catalog item"}</p></div></div><div className="grid grid-cols-2 gap-2"><LinkButton href={`/measurements/${measurement.id}`} variant="secondary" size="sm"><Eye className="mr-2 size-4" />View</LinkButton><LinkButton href={`/site-visits/${measurement.site_visit_id}`} variant="ghost" size="sm">View Site Visit</LinkButton></div></CardContent></Card>)}</div> : <EmptyState compact icon={<Ruler className="size-5" />} title="No measurements added for this property yet" description="Measurements will appear here after they are recorded during a site visit." />}</section>

      <section aria-labelledby="property-future-title"><h2 id="property-future-title" className="mb-3 text-xl font-bold text-slate-950">Coming Later</h2><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Photos", icon: Camera }, { label: "Quotes", icon: FileText }, { label: "Jobs", icon: Sparkles }].map(({ label, icon: Icon }) => <Card key={label} className="shadow-none"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon className="size-4" /></span><div><p className="text-sm font-bold text-slate-900">{label}</p><p className="text-xs text-slate-500">Coming later</p></div></CardContent></Card>)}</div></section>
      <FileSection organizationId={organization.id} relatedType="properties" relatedId={id} photoTypes={["Front of house", "Side of house", "Roofline", "Outlet", "Walkway", "Tree/Bush", "Safety issue", "Other"]} emptyText="No property photos yet. Add photos of the house, outlets, roofline, and access areas." />
    </div>
  );
}
