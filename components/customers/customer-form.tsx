"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import { FormField } from "@/components/customers/form-field";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { customerStatuses } from "@/lib/crm-options";
import type { Customer } from "@/types/database";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Customer"}</Button>;
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const editing = Boolean(customer);
  const [state, action] = useActionState(editing ? updateCustomerAction : createCustomerAction, {});
  const cancelHref = customer ? `/customers/${customer.id}` : "/customers";

  return (
    <form action={action} className="space-y-6">
      {customer ? <input type="hidden" name="customer_id" value={customer.id} /> : null}
      <FormMessage error={state.error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" required><Input name="first_name" required autoComplete="given-name" defaultValue={customer?.first_name} /></FormField>
        <FormField label="Last name" hint="Recommended"><Input name="last_name" autoComplete="family-name" defaultValue={customer?.last_name} /></FormField>
        <FormField label="Phone"><Input name="phone" type="tel" autoComplete="tel" defaultValue={customer?.phone ?? ""} placeholder="724-555-1234" /></FormField>
        <FormField label="Email"><Input name="email" type="email" autoComplete="email" defaultValue={customer?.email ?? ""} placeholder="customer@example.com" /></FormField>
      </div>
      <FormField label="Billing address"><Input name="billing_address" autoComplete="street-address" defaultValue={customer?.billing_address ?? ""} placeholder="100 Main Street, Ligonier, PA 15658" /></FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Status" required><Select name="status" required defaultValue={customer?.status ?? "lead"}>{customerStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</Select></FormField>
        <FormField label="Lead source"><Input name="lead_source" defaultValue={customer?.lead_source ?? ""} placeholder="Website, referral, yard sign…" /></FormField>
      </div>
      <FormField label="Notes"><Textarea name="notes" defaultValue={customer?.notes ?? ""} placeholder="Lighting preferences, budget, timing, or other useful details." /></FormField>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <LinkButton href={cancelHref} variant="secondary" size="lg" className="w-full sm:w-auto">Cancel</LinkButton>
        <SaveButton editing={editing} />
      </div>
    </form>
  );
}
