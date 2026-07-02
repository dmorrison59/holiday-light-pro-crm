import { SiteVisitForm } from "@/components/site-visits/site-visit-form";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getSiteVisitOptions } from "@/lib/site-visits";

export const metadata = { title: "Add Site Visit" };

export default async function NewSiteVisitPage() {
  const { organization } = await requireOrganization();
  const options = await getSiteVisitOptions(organization.id);
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Site Visit" description="Choose the customer and property, then record the appointment details." />{options.customers.length && options.properties.length ? <Card><CardContent className="p-5 sm:p-7"><SiteVisitForm options={options} /></CardContent></Card> : <EmptyState title="Add a customer and property first" description="Add a customer and property before creating a site visit." actionLabel="Go to Customers" actionHref="/customers" />}</div>;
}
