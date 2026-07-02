import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/customers/property-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getCustomer } from "@/lib/customers";
import { customerName } from "@/lib/format";

export default async function NewPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const customer = await getCustomer(organization.id, id);
  if (!customer) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Property" description={`Add a service location for ${customerName(customer.first_name, customer.last_name)}.`} /><Card><CardContent className="p-5 sm:p-7"><PropertyForm customerId={id} /></CardContent></Card></div>;
}
