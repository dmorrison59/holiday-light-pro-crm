import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Building2, CalendarPlus, CreditCard, FileText, Mail, MapPin, Pencil, Phone, Plus, Route, Ruler } from "lucide-react";
import { DeleteCustomerForm } from "@/components/customers/delete-customer-form";
import { RelatedQuotes } from "@/components/quotes/related-quotes";
import { RelatedJobs } from "@/components/jobs/related-jobs";
import { CustomerPayments } from "@/components/payments/customer-payments";
import { FileSection } from "@/components/files/file-section";
import { SiteVisitCard } from "@/components/site-visits/site-visit-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireOrganization } from "@/lib/auth/current";
import { getCustomer } from "@/lib/customers";
import { customerName, formatDate, formatVisitDate, propertyAddress } from "@/lib/format";
import { getSiteVisitsForCustomer } from "@/lib/site-visits";
import { getMeasurementsForCustomer, summarizeMeasurements } from "@/lib/measurements";
import { getQuotesForCustomer } from "@/lib/quotes";
import { getJobsForCustomer } from "@/lib/jobs";
import { getPaymentsForCustomer } from "@/lib/payments";

function Detail({ label, value, icon: Icon }: { label: string; value?: string | null; icon: typeof Mail }) {
  return <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><Icon className="mt-0.5 size-4 shrink-0 text-slate-500" /><div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-900">{value || "Not provided"}</dd></div></div>;
}

const address = (street: string | null, city: string | null, state: string | null, zip: string | null) =>
  [street, [city, state].filter(Boolean).join(", "), zip].filter(Boolean).join(" ");

export default async function CustomerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const notice = await searchParams;
  const [customer, siteVisits, measurements, quotes, jobs, payments] = await Promise.all([getCustomer(organization.id, id), getSiteVisitsForCustomer(organization.id, id), getMeasurementsForCustomer(organization.id, id), getQuotesForCustomer(organization.id, id), getJobsForCustomer(organization.id, id), getPaymentsForCustomer(organization.id, id)]);
  if (!customer) notFound();
  const name = customerName(customer.first_name, customer.last_name);
  const billingAddress = address(customer.billing_street, customer.billing_city, customer.billing_state, customer.billing_zip) || customer.billing_address;
  const serviceAddress = address(customer.service_street, customer.service_city, customer.service_state, customer.service_zip) || (customer.service_same_as_billing ? billingAddress : null);
  const measurementSummary = summarizeMeasurements(measurements);
  const latestMeasuredVisit = siteVisits.find((visit) => measurements.some((measurement) => measurement.site_visit_id === visit.id));
  const measurementActionVisit = latestMeasuredVisit ?? siteVisits[0];

  return (
    <div className="space-y-7">
      <PageHeader title={name} description="Customer contact details, properties, and CRM history." actions={<div className="flex flex-wrap gap-2"><LinkButton href="/customers" variant="secondary"><ArrowLeft className="mr-2 size-4" />Customers</LinkButton><LinkButton href={`/customers/${id}/edit`}><Pencil className="mr-2 size-4" />Edit</LinkButton></div>} />
      {notice.created === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Customer added successfully.</div> : null}
      {notice.updated === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Customer changes saved.</div> : null}

      <RelatedQuotes quotes={quotes} createHref={`/customers/${id}/quotes/new`} showProperty />
      <RelatedJobs jobs={jobs} showProperty />
      <CustomerPayments payments={payments} jobs={jobs} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card><CardHeader className="flex flex-row items-center justify-between"><div><h2 className="font-bold text-slate-950">Customer Details</h2><p className="mt-1 text-sm text-slate-500">Added {formatDate(customer.created_at)}</p></div><StatusBadge status={customer.status} /></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Detail label="Phone" value={customer.phone} icon={Phone} /><Detail label="Email" value={customer.email} icon={Mail} /><Detail label="Billing address" value={billingAddress} icon={MapPin} /><Detail label="Service / install address" value={serviceAddress} icon={MapPin} /><Detail label="Lead source" value={customer.lead_source} icon={Route} /><div className="sm:col-span-2"><Detail label="Notes" value={customer.notes} icon={FileText} /></div><div className="sm:col-span-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2"><p>Created {formatDate(customer.created_at)}</p><p className="sm:text-right">Updated {formatDate(customer.updated_at)}</p></div></CardContent></Card>
        <Card><CardHeader><h2 className="font-bold text-slate-950">Customer Actions</h2></CardHeader><CardContent className="space-y-3"><LinkButton href={`/customers/${id}/site-visits/new`} className="w-full"><CalendarPlus className="mr-2 size-4" />Schedule Site Visit</LinkButton><LinkButton href={`/customers/${id}/properties/new`} variant="secondary" className="w-full"><Plus className="mr-2 size-4" />Add Property</LinkButton><LinkButton href={`/customers/${id}/edit`} variant="ghost" className="w-full"><Pencil className="mr-2 size-4" />Edit Customer</LinkButton><div className="border-t border-slate-100 pt-4"><p className="mb-3 text-xs leading-5 text-slate-500">Deleting also removes this customer’s properties and site visits. Future connected work may prevent deletion.</p><DeleteCustomerForm customerId={id} customerName={name} /></div></CardContent></Card>
      </div>

      <section aria-labelledby="properties-title">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="properties-title" className="text-xl font-bold text-slate-950">Properties</h2><p className="mt-1 text-sm text-slate-500">Homes and commercial locations connected to this customer.</p></div><LinkButton href={`/customers/${id}/properties/new`} size="sm"><Plus className="mr-2 size-4" />Add Property</LinkButton></div>
        {customer.properties.length ? <div className="grid gap-4 lg:grid-cols-2">{customer.properties.map((property) => <Card key={property.id}><CardContent className="space-y-4"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><Building2 className="size-5" /></span><div className="min-w-0"><h3 className="font-bold text-slate-950">{property.property_name || property.address_line_1}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{propertyAddress(property)}</p><p className="mt-1 text-xs text-slate-500">{property.property_type || "Residential"}{property.access_notes ? ` · ${property.access_notes}` : ""}</p></div></div><div className="grid grid-cols-2 gap-2"><LinkButton href={`/properties/${property.id}`} variant="secondary">View Property</LinkButton><LinkButton href={`/properties/${property.id}/edit`} variant="ghost">Edit</LinkButton></div></CardContent></Card>)}</div> : <EmptyState compact icon={<MapPin className="size-5" />} title="No properties added yet" description="Add the first location where this customer may need holiday lighting." actionLabel="Add Property" actionHref={`/customers/${id}/properties/new`} />}
      </section>

      <section aria-labelledby="site-visits-title"><div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="site-visits-title" className="text-xl font-bold text-slate-950">Site Visits</h2><p className="mt-1 text-sm text-slate-500">Field appointments and customer design conversations.</p></div><LinkButton href={`/customers/${id}/site-visits/new`} size="sm"><CalendarPlus className="mr-2 size-4" />Schedule Site Visit</LinkButton></div>{siteVisits.length ? <div className="grid gap-4 lg:grid-cols-2">{siteVisits.map((visit) => <SiteVisitCard key={visit.id} visit={visit} />)}</div> : <EmptyState compact icon={<CalendarPlus className="size-5" />} title="No site visits scheduled yet" description="Schedule a field appointment once this customer has a property." actionLabel="Schedule Site Visit" actionHref={`/customers/${id}/site-visits/new`} />}</section>

      <section aria-labelledby="customer-measurements-title"><div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="customer-measurements-title" className="text-xl font-bold text-slate-950">Recent Measurements</h2><p className="mt-1 text-sm text-slate-500">Quote-ready field measurements across this customer’s properties.</p></div><div className="flex flex-wrap gap-2">{measurementActionVisit ? <LinkButton href={`/site-visits/${measurementActionVisit.id}/measurements/new`} size="sm"><Plus className="mr-2 size-4" />Add Measurement</LinkButton> : <LinkButton href={`/customers/${id}/site-visits/new`} size="sm"><CalendarPlus className="mr-2 size-4" />Start Site Visit</LinkButton>}{latestMeasuredVisit ? <LinkButton href={`/site-visits/${latestMeasuredVisit.id}/quotes/new`} variant="secondary" size="sm"><FileText className="mr-2 size-4" />Create Quote</LinkButton> : null}</div></div>{measurements.length ? <><div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Card className="shadow-none"><CardContent className="p-3"><p className="text-xs font-semibold text-slate-500">Measured zones</p><p className="mt-1 text-xl font-extrabold text-slate-950">{measurementSummary.count}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-3"><p className="text-xs font-semibold text-slate-500">Roof + ridge</p><p className="mt-1 text-xl font-extrabold text-slate-950">{measurementSummary.rooflineFeet + measurementSummary.ridgeFeet} ft</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-3"><p className="text-xs font-semibold text-slate-500">Walkway + drive</p><p className="mt-1 text-xl font-extrabold text-slate-950">{measurementSummary.walkwayFeet + measurementSummary.drivewayFeet} ft</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-3"><p className="text-xs font-semibold text-slate-500">Trees + shrubs</p><p className="mt-1 text-xl font-extrabold text-slate-950">{measurementSummary.treeCount + measurementSummary.bushCount}</p></CardContent></Card></div><Card className="overflow-hidden"><div className="divide-y divide-slate-100">{measurements.map((measurement) => { const measuredProperty = customer.properties.find((property) => property.id === measurement.property_id); return <div key={measurement.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700"><Ruler className="size-4" /></span><div><p className="font-bold text-slate-950">{measurement.zone_name}</p><p className="mt-1 text-sm text-slate-600">{measurement.measurement_type} · {Number(measurement.quantity).toLocaleString("en-US", { maximumFractionDigits: 2 })} {measurement.unit}</p><p className="mt-1 text-xs text-slate-500">{measuredProperty?.property_name || measuredProperty?.address_line_1 || "Property"} · {formatVisitDate(measurement.visit_date)}{measurement.height_level ? ` · ${measurement.height_level}` : ""}</p>{measurement.notes ? <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-500">{measurement.notes}</p> : null}</div></div><div className="flex gap-2"><LinkButton href={`/site-visits/${measurement.site_visit_id}`} variant="ghost" size="sm">Visit</LinkButton><LinkButton href={`/measurements/${measurement.id}`} variant="secondary" size="sm">View</LinkButton></div></div>; })}</div></Card></> : <EmptyState compact icon={<Ruler className="size-5" />} title="No measurements yet" description="Start a site visit, then record rooflines, walkways, greenery, and other display zones." actionLabel={measurementActionVisit ? "Add Measurement" : "Start Site Visit"} actionHref={measurementActionVisit ? `/site-visits/${measurementActionVisit.id}/measurements/new` : `/customers/${id}/site-visits/new`} />}</section>

      <section aria-labelledby="future-work-title"><h2 id="future-work-title" className="mb-3 text-xl font-bold text-slate-950">Future Work</h2><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Quotes", icon: FileText }, { label: "Jobs", icon: BriefcaseBusiness }, { label: "Payments", icon: CreditCard }].map(({ label, icon: Icon }) => <Card key={label} className="shadow-none"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon className="size-4" /></span><div><p className="text-sm font-bold text-slate-900">{label}</p><p className="text-xs text-slate-500">Coming in a later task</p></div></CardContent></Card>)}</div></section>
      <FileSection organizationId={organization.id} relatedType="customers" relatedId={id} photoTypes={["Customer document", "Inspiration", "Other"]} emptyText="No customer files yet." />
    </div>
  );
}
