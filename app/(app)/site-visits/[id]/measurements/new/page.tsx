import { notFound } from "next/navigation";
import { MeasurementForm } from "@/components/measurements/measurement-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getActiveCatalogItems } from "@/lib/measurements";
import { getSiteVisit } from "@/lib/site-visits";

export default async function NewMeasurementPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ added?: string }> }) {
  const { organization } = await requireOrganization(); const { id } = await params; const notice = await searchParams;
  const [siteVisit, catalogItems] = await Promise.all([getSiteVisit(organization.id, id), getActiveCatalogItems(organization.id)]); if (!siteVisit) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Measurement" description="Record one property zone, then save or keep adding measurements." />{notice.added === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Measurement saved. Add the next zone below.</div> : null}<Card><CardContent className="p-5 sm:p-7"><MeasurementForm siteVisit={siteVisit} catalogItems={catalogItems} /></CardContent></Card></div>;
}
