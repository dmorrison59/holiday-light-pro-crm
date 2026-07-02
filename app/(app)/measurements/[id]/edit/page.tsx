import { notFound } from "next/navigation";
import { MeasurementForm } from "@/components/measurements/measurement-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getActiveCatalogItems, getMeasurement } from "@/lib/measurements";

export default async function EditMeasurementPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization(); const { id } = await params;
  const [measurement, catalogItems] = await Promise.all([getMeasurement(organization.id, id), getActiveCatalogItems(organization.id)]); if (!measurement) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${measurement.zone_name}`} description="Update the zone, quantity, difficulty, product, or field notes." /><Card><CardContent className="p-5 sm:p-7"><MeasurementForm siteVisit={measurement.site_visit} catalogItems={catalogItems} measurement={measurement} /></CardContent></Card></div>;
}
