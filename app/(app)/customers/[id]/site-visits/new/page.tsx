import { notFound } from "next/navigation";
import { SiteVisitForm } from "@/components/site-visits/site-visit-form";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getCustomer } from "@/lib/customers";
import { customerName } from "@/lib/format";
import { getSiteVisitOptions } from "@/lib/site-visits";

export default async function NewCustomerSiteVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization(); const { id } = await params;
  const [customer, allOptions] = await Promise.all([getCustomer(organization.id, id), getSiteVisitOptions(organization.id)]);
  if (!customer) notFound();
  const name = customerName(customer.first_name, customer.last_name);
  const options = { customers: allOptions.customers.filter((item) => item.id === id), properties: allOptions.properties.filter((property) => property.customer_id === id) };
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Schedule Site Visit" description={`Choose a property and schedule a field appointment for ${name}.`} />{options.properties.length ? <Card><CardContent className="p-5 sm:p-7"><SiteVisitForm options={options} fixedCustomerId={id} fixedPropertyId={options.properties.length === 1 ? options.properties[0].id : undefined} /></CardContent></Card> : <EmptyState title="No properties available" description="Add a property for this customer before scheduling a site visit." actionLabel="Add Property" actionHref={`/customers/${id}/properties/new`} />}</div>;
}
