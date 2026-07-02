"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPropertyAction, updatePropertyAction } from "@/app/actions/customers";
import { FormMessage } from "@/components/auth/form-fields";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyTypes } from "@/lib/crm-options";
import type { Property } from "@/types/database";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Property"}</Button>;
}

export function PropertyForm({ customerId, property }: { customerId: string; property?: Property }) {
  const editing = Boolean(property);
  const [state, action] = useActionState(editing ? updatePropertyAction : createPropertyAction, {});
  const cancelHref = property ? `/properties/${property.id}` : `/customers/${customerId}`;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="customer_id" value={customerId} />
      {property ? <input type="hidden" name="property_id" value={property.id} /> : null}
      <FormMessage error={state.error} />
      <FormField label="Property name"><Input name="property_name" defaultValue={property?.property_name ?? ""} placeholder="Johnson Residence" /></FormField>
      <FormField label="Address line 1" required><Input name="address_line_1" required autoComplete="address-line1" defaultValue={property?.address_line_1} /></FormField>
      <FormField label="Address line 2"><Input name="address_line_2" autoComplete="address-line2" defaultValue={property?.address_line_2 ?? ""} /></FormField>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="City"><Input name="city" autoComplete="address-level2" defaultValue={property?.city} /></FormField>
        <FormField label="State"><Input name="state" autoComplete="address-level1" defaultValue={property?.state} maxLength={2} className="uppercase" placeholder="PA" /></FormField>
        <FormField label="ZIP"><Input name="zip" autoComplete="postal-code" defaultValue={property?.zip} /></FormField>
      </div>
      <FormField label="Property type"><Select name="property_type" defaultValue={property?.property_type ?? "Residential"}>{propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}</Select></FormField>
      <div className="grid gap-5 lg:grid-cols-2">
        <FormField label="Access notes"><Textarea name="access_notes" defaultValue={property?.access_notes ?? ""} placeholder="Gate codes, parking, pets, or entry details." /></FormField>
        <FormField label="Outlet notes"><Textarea name="outlet_notes" defaultValue={property?.outlet_notes ?? ""} placeholder="Outlet locations and available circuits." /></FormField>
        <FormField label="Safety notes"><Textarea name="safety_notes" defaultValue={property?.safety_notes ?? ""} placeholder="Roof pitch, slopes, trees, or other hazards." /></FormField>
        <FormField label="HOA notes"><Textarea name="hoa_notes" defaultValue={property?.hoa_notes ?? ""} placeholder="Rules, approval requirements, or restrictions." /></FormField>
      </div>
      <FormField label="General notes"><Textarea name="notes" defaultValue={property?.notes ?? ""} /></FormField>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <LinkButton href={cancelHref} variant="secondary" size="lg" className="w-full sm:w-auto">Cancel</LinkButton>
        <SaveButton editing={editing} />
      </div>
    </form>
  );
}
