import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/customers/property-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getProperty } from "@/lib/customers";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const property = await getProperty(organization.id, id);
  if (!property) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${property.property_name || property.address_line_1}`} description="Update property details and field notes." /><Card><CardContent className="p-5 sm:p-7"><PropertyForm customerId={property.customer_id} property={property} /></CardContent></Card></div>;
}
