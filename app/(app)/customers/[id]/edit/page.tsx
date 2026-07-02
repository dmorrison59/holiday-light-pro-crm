import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getCustomer } from "@/lib/customers";
import { customerName } from "@/lib/format";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const customer = await getCustomer(organization.id, id);
  if (!customer) notFound();
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${customerName(customer.first_name, customer.last_name)}`} description="Update customer contact details, status, and notes." /><Card><CardContent className="p-5 sm:p-7"><CustomerForm customer={customer} /></CardContent></Card></div>;
}
