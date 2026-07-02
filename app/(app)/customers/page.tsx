import Link from "next/link";
import { Eye, Pencil, Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireOrganization } from "@/lib/auth/current";
import { customerStatuses } from "@/lib/crm-options";
import { getCustomers } from "@/lib/customers";
import { customerName, formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; deleted?: string }> }) {
  const { organization } = await requireOrganization();
  const filters = await searchParams;
  const search = filters.q?.trim() ?? "";
  const status = customerStatuses.some((item) => item.value === filters.status) ? filters.status ?? "" : "";
  const customers = await getCustomers(organization.id, search, status);
  const filtering = Boolean(search || status);

  return (
    <div className="space-y-7">
      <PageHeader title="Customers" description="Manage homeowners and commercial clients." actions={<LinkButton href="/customers/new"><UserPlus className="mr-2 size-4" />Add Customer</LinkButton>} />
      {filters.deleted === "1" ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Customer deleted.</div> : null}

      <Card>
        <CardContent>
          <form method="get" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <label className="relative"><span className="sr-only">Search customers</span><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" /><Input name="q" defaultValue={search} className="pl-10" placeholder="Search name, phone, or email" /></label>
            <label><span className="sr-only">Filter by status</span><Select name="status" defaultValue={status}><option value="">All statuses</option>{customerStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></label>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          {filtering ? <div className="mt-3 flex items-center justify-between text-sm text-slate-500"><span>{customers.length} result{customers.length === 1 ? "" : "s"}</span><Link href="/customers" className="font-semibold text-amber-800 hover:text-amber-700">Clear filters</Link></div> : null}
        </CardContent>
      </Card>

      {customers.length ? (
        <Card className="overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Lead source</th><th className="px-5 py-3">Billing address</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => <tr key={customer.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-semibold text-slate-950">{customerName(customer.first_name, customer.last_name)}</td><td className="px-5 py-4"><div>{customer.phone || "No phone"}</div><div className="mt-1 text-xs text-slate-500">{customer.email || "No email"}</div></td><td className="px-5 py-4"><StatusBadge status={customer.status} /></td><td className="px-5 py-4 text-slate-600">{customer.lead_source || "—"}</td><td className="max-w-56 truncate px-5 py-4 text-slate-600">{customer.billing_address || "—"}</td><td className="px-5 py-4 text-slate-600">{formatDate(customer.created_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><LinkButton href={`/customers/${customer.id}`} size="sm" variant="secondary"><Eye className="mr-1.5 size-3.5" />View</LinkButton><LinkButton href={`/customers/${customer.id}/edit`} size="sm" variant="ghost"><Pencil className="mr-1.5 size-3.5" />Edit</LinkButton></div></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {customers.map((customer) => <div key={customer.id} className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{customerName(customer.first_name, customer.last_name)}</p><p className="mt-1 text-sm text-slate-500">{customer.phone || customer.email || "No contact details"}</p></div><StatusBadge status={customer.status} /></div><div className="grid gap-1 text-sm text-slate-600"><p>{customer.billing_address || "No billing address"}</p><p className="text-xs text-slate-500">Added {formatDate(customer.created_at)} · {customer.lead_source || "No lead source"}</p></div><div className="grid grid-cols-2 gap-2"><LinkButton href={`/customers/${customer.id}`} variant="secondary"><Eye className="mr-2 size-4" />View</LinkButton><LinkButton href={`/customers/${customer.id}/edit`} variant="ghost"><Pencil className="mr-2 size-4" />Edit</LinkButton></div></div>)}
          </div>
        </Card>
      ) : filtering ? <EmptyState icon={<Search className="size-5" />} title="No matching customers" description="Try a different name, phone, email, or status." actionLabel="Clear Filters" actionHref="/customers" /> : <EmptyState icon={<Users className="size-5" />} title="No customers yet" description="Add your first customer to begin building quotes and jobs." actionLabel="Add Customer" actionHref="/customers/new" />}
    </div>
  );
}
