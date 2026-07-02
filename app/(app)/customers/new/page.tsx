import { CustomerForm } from "@/components/customers/customer-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Add Customer" };

export default function NewCustomerPage() {
  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Customer" description="Capture the contact details you need before visiting the property." /><Card><CardContent className="p-5 sm:p-7"><CustomerForm /></CardContent></Card></div>;
}
