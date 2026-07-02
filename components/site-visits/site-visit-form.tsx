"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createSiteVisitAction, updateSiteVisitAction } from "@/app/actions/site-visits";
import { FormMessage } from "@/components/auth/form-fields";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { preferredColorOptions, siteVisitStyles } from "@/lib/crm-options";
import { customerName, propertyAddress, toDateTimeLocal } from "@/lib/format";
import type { SiteVisitRecord, SiteVisitOptions } from "@/lib/site-visits";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Save Site Visit"}</Button>;
}

export function SiteVisitForm({ options, visit, fixedCustomerId, fixedPropertyId }: { options: SiteVisitOptions; visit?: SiteVisitRecord; fixedCustomerId?: string; fixedPropertyId?: string }) {
  const editing = Boolean(visit);
  const firstProperty = fixedPropertyId ? options.properties.find((property) => property.id === fixedPropertyId) : options.properties[0];
  const initialCustomerId = visit?.customer_id ?? fixedCustomerId ?? firstProperty?.customer_id ?? options.customers[0]?.id ?? "";
  const initialPropertyId = visit?.property_id ?? fixedPropertyId ?? options.properties.find((property) => property.customer_id === initialCustomerId)?.id ?? "";
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [state, action] = useActionState(editing ? updateSiteVisitAction : createSiteVisitAction, {});
  const availableProperties = options.properties.filter((property) => property.customer_id === customerId);
  const selectedProperty = options.properties.find((property) => property.id === propertyId);
  const fixedCustomer = options.customers.find((customer) => customer.id === initialCustomerId);
  const fixedProperty = options.properties.find((property) => property.id === initialPropertyId);
  const cancelHref = visit ? `/site-visits/${visit.id}` : fixedPropertyId ? `/properties/${fixedPropertyId}` : fixedCustomerId ? `/customers/${fixedCustomerId}` : "/site-visits";

  return (
    <form action={action} className="space-y-6">
      {visit ? <input type="hidden" name="site_visit_id" value={visit.id} /> : null}
      <FormMessage error={state.error} />
      {editing || fixedCustomerId ? <input type="hidden" name="customer_id" value={initialCustomerId} /> : <FormField label="Customer" required><Select name="customer_id" value={customerId} onChange={(event) => { const nextCustomer = event.target.value; setCustomerId(nextCustomer); setPropertyId(options.properties.find((property) => property.customer_id === nextCustomer)?.id ?? ""); }} required>{options.customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer.first_name, customer.last_name)}</option>)}</Select></FormField>}
      {editing || fixedPropertyId ? <input type="hidden" name="property_id" value={initialPropertyId} /> : <FormField label="Property" required>{availableProperties.length ? <Select name="property_id" value={propertyId} onChange={(event) => setPropertyId(event.target.value)} required>{availableProperties.map((property) => <option key={property.id} value={property.id}>{property.property_name || propertyAddress(property)}</option>)}</Select> : <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This customer has no properties. Add a property before scheduling a visit.</div>}</FormField>}
      {editing || fixedCustomerId || fixedPropertyId ? <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-sm font-semibold text-slate-900">{fixedCustomer ? customerName(fixedCustomer.first_name, fixedCustomer.last_name) : customerName(visit!.customer.first_name, visit!.customer.last_name)}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Property</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedProperty ? selectedProperty.property_name || propertyAddress(selectedProperty) : visit!.property.property_name || propertyAddress(visit!.property)}</p></div></div> : null}

      <FormField label="Visit date and time" required><Input name="visit_date" type="datetime-local" required defaultValue={toDateTimeLocal(visit?.visit_date)} /></FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Budget discussed"><Input name="budget_discussed" list="budget-ranges" defaultValue={visit?.budget_discussed ?? ""} placeholder="$1,500–$2,000" /><datalist id="budget-ranges"><option value="$1,000–$1,500" /><option value="$1,500–$2,000" /><option value="$2,000+" /><option value="Not discussed" /></datalist></FormField>
        <FormField label="Preferred style"><Select name="preferred_style" defaultValue={visit?.preferred_style ?? ""}><option value="">Not selected</option>{siteVisitStyles.map((style) => <option key={style} value={style}>{style}</option>)}</Select></FormField>
      </div>
      <fieldset><legend className="text-sm font-semibold text-slate-800">Preferred colors</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{preferredColorOptions.map((color) => <label key={color} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"><input name="preferred_colors" value={color} type="checkbox" defaultChecked={visit?.preferred_colors.includes(color)} className="size-4 accent-amber-500" />{color}</label>)}</div></fieldset>
      <FormField label="Customer present"><Select name="customer_present" defaultValue={visit?.customer_present ? "yes" : "no"}><option value="yes">Yes</option><option value="no">No</option></Select></FormField>
      <FormField label="Visit notes"><Textarea name="notes" defaultValue={visit?.notes ?? ""} className="min-h-40" placeholder="Customer preferences, display ideas, timing, budget, and anything to remember for measurements or quoting." /></FormField>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><LinkButton href={cancelHref} variant="secondary" size="lg" className="w-full sm:w-auto">Cancel</LinkButton><SaveButton editing={editing} /></div>
    </form>
  );
}
