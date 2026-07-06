"use client";

import { useActionState, useState } from "react";
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
  const [serviceSameAsBilling, setServiceSameAsBilling] = useState(customer?.service_same_as_billing ?? true);
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
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-slate-900">Billing address</legend>
        <FormField label="Street"><Input name="billing_street" autoComplete="billing street-address" defaultValue={customer?.billing_street ?? customer?.billing_address ?? ""} placeholder="100 Main Street" /></FormField>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_100px_140px]">
          <FormField label="City"><Input name="billing_city" autoComplete="billing address-level2" defaultValue={customer?.billing_city ?? ""} /></FormField>
          <FormField label="State"><Input name="billing_state" autoComplete="billing address-level1" defaultValue={customer?.billing_state ?? ""} maxLength={2} placeholder="PA" /></FormField>
          <FormField label="ZIP"><Input name="billing_zip" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{5}" title="Enter a 5-digit ZIP code" defaultValue={customer?.billing_zip ?? ""} placeholder="15658" /></FormField>
        </div>
      </fieldset>
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-slate-900">Service / install address</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-800"><input name="service_same_as_billing" type="checkbox" checked={serviceSameAsBilling} onChange={(event) => setServiceSameAsBilling(event.target.checked)} className="size-5 accent-emerald-700" />Service address same as billing</label>
        {!serviceSameAsBilling ? <>
          <FormField label="Street" required><Input name="service_street" autoComplete="shipping street-address" defaultValue={customer?.service_street ?? ""} required /></FormField>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_100px_140px]">
            <FormField label="City" required><Input name="service_city" autoComplete="shipping address-level2" defaultValue={customer?.service_city ?? ""} required /></FormField>
            <FormField label="State" required><Input name="service_state" autoComplete="shipping address-level1" defaultValue={customer?.service_state ?? ""} maxLength={2} required /></FormField>
            <FormField label="ZIP" required><Input name="service_zip" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}" title="Enter a 5-digit ZIP code" defaultValue={customer?.service_zip ?? ""} required /></FormField>
          </div>
        </> : null}
      </fieldset>
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
