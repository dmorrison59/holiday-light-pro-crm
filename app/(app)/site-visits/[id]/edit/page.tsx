import { notFound } from "next/navigation";
import { SiteVisitForm } from "@/components/site-visits/site-visit-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { customerName } from "@/lib/format";
import { getSiteVisit, getSiteVisitOptions } from "@/lib/site-visits";

export default async function EditSiteVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization(); const { id } = await params;
  const [visit, options] = await Promise.all([getSiteVisit(organization.id, id), getSiteVisitOptions(organization.id)]); if (!visit) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Edit Site Visit" description={`Update the field notes for ${customerName(visit.customer.first_name, visit.customer.last_name)}.`} /><Card><CardContent className="p-5 sm:p-7"><SiteVisitForm options={options} visit={visit} fixedCustomerId={visit.customer_id} fixedPropertyId={visit.property_id} /></CardContent></Card></div>;
}
