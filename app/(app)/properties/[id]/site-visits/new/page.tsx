import { notFound } from "next/navigation";
import { SiteVisitForm } from "@/components/site-visits/site-visit-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getProperty } from "@/lib/customers";
import { customerName } from "@/lib/format";
import { getSiteVisitOptions } from "@/lib/site-visits";

export default async function NewPropertySiteVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization(); const { id } = await params;
  const [property, options] = await Promise.all([getProperty(organization.id, id), getSiteVisitOptions(organization.id)]);
  if (!property) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Start Site Visit" description={`Schedule a visit for ${customerName(property.customer.first_name, property.customer.last_name)} at ${property.property_name || property.address_line_1}.`} /><Card><CardContent className="p-5 sm:p-7"><SiteVisitForm options={options} fixedCustomerId={property.customer_id} fixedPropertyId={property.id} /></CardContent></Card></div>;
}
