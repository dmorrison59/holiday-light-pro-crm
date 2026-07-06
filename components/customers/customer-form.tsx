"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AddressAutofill } from "@mapbox/search-js-react";
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

interface AddressValue {
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
}

interface AutofillResponse {
  features: Array<{
    geometry: { coordinates: number[] };
    properties: {
      address_line1?: string;
      address_level1?: string;
      address_level2?: string;
      postcode?: string;
    };
  }>;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

function AddressFields({ prefix, value, onChange, required = false }: { prefix: "billing" | "service"; value: AddressValue; onChange: (value: AddressValue) => void; required?: boolean }) {
  const update = (field: keyof Pick<AddressValue, "street" | "city" | "state" | "zip">, nextValue: string) => onChange({ ...value, [field]: nextValue, latitude: null, longitude: null });
  const streetInput = <Input name={`${prefix}_street`} autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-line1`} value={value.street} onChange={(event) => update("street", event.target.value)} placeholder="100 Main Street" required={required} />;
  const handleRetrieve = (response: AutofillResponse) => {
    const feature = response.features[0];
    if (!feature) return;
    const [longitude, latitude] = feature.geometry.coordinates;
    onChange({
      street: feature.properties.address_line1 ?? value.street,
      city: feature.properties.address_level2 ?? "",
      state: feature.properties.address_level1 ?? "",
      zip: feature.properties.postcode?.slice(0, 5) ?? "",
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
    });
  };

  return <>
    <FormField label="Street" required={required}>{mapboxToken ? <AddressAutofill accessToken={mapboxToken} options={{ country: "US", language: "en" }} onRetrieve={handleRetrieve}>{streetInput}</AddressAutofill> : streetInput}</FormField>
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_100px_140px]">
      <FormField label="City" required={required}><Input name={`${prefix}_city`} autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-level2`} value={value.city} onChange={(event) => update("city", event.target.value)} required={required} /></FormField>
      <FormField label="State" required={required}><Input name={`${prefix}_state`} autoComplete={`${prefix === "billing" ? "billing" : "shipping"} address-level1`} value={value.state} onChange={(event) => update("state", event.target.value.toUpperCase())} maxLength={2} placeholder="PA" required={required} /></FormField>
      <FormField label="ZIP" required={required}><Input name={`${prefix}_zip`} autoComplete={`${prefix === "billing" ? "billing" : "shipping"} postal-code`} inputMode="numeric" pattern="[0-9]{5}" title="Enter a 5-digit ZIP code" value={value.zip} onChange={(event) => update("zip", event.target.value)} placeholder="15658" required={required} /></FormField>
    </div>
  </>;
}

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Customer"}</Button>;
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const editing = Boolean(customer);
  const [state, action] = useActionState(editing ? updateCustomerAction : createCustomerAction, {});
  const [serviceSameAsBilling, setServiceSameAsBilling] = useState(customer?.service_same_as_billing ?? true);
  const [billingAddress, setBillingAddress] = useState<AddressValue>({ street: customer?.billing_street ?? customer?.billing_address ?? "", city: customer?.billing_city ?? "", state: customer?.billing_state ?? "", zip: customer?.billing_zip ?? "", latitude: customer?.service_same_as_billing ? customer.latitude : null, longitude: customer?.service_same_as_billing ? customer.longitude : null });
  const [serviceAddress, setServiceAddress] = useState<AddressValue>({ street: customer?.service_street ?? "", city: customer?.service_city ?? "", state: customer?.service_state ?? "", zip: customer?.service_zip ?? "", latitude: customer?.service_same_as_billing === false ? customer.latitude : null, longitude: customer?.service_same_as_billing === false ? customer.longitude : null });
  const jobLocation = serviceSameAsBilling ? billingAddress : serviceAddress;
  const cancelHref = customer ? `/customers/${customer.id}` : "/customers";

  return (
    <form action={action} className="space-y-6">
      {customer ? <input type="hidden" name="customer_id" value={customer.id} /> : null}
      <input type="hidden" name="latitude" value={jobLocation.latitude ?? ""} />
      <input type="hidden" name="longitude" value={jobLocation.longitude ?? ""} />
      <FormMessage error={state.error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" required><Input name="first_name" required autoComplete="given-name" defaultValue={customer?.first_name} /></FormField>
        <FormField label="Last name" hint="Recommended"><Input name="last_name" autoComplete="family-name" defaultValue={customer?.last_name} /></FormField>
        <FormField label="Phone"><Input name="phone" type="tel" autoComplete="tel" defaultValue={customer?.phone ?? ""} placeholder="724-555-1234" /></FormField>
        <FormField label="Email"><Input name="email" type="email" autoComplete="email" defaultValue={customer?.email ?? ""} placeholder="customer@example.com" /></FormField>
      </div>
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-slate-900">Billing address</legend>
        <AddressFields prefix="billing" value={billingAddress} onChange={setBillingAddress} />
      </fieldset>
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-slate-900">Service / install address</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-800"><input name="service_same_as_billing" type="checkbox" checked={serviceSameAsBilling} onChange={(event) => setServiceSameAsBilling(event.target.checked)} className="size-5 accent-emerald-700" />Service address same as billing</label>
        {!serviceSameAsBilling ? <>
          <AddressFields prefix="service" value={serviceAddress} onChange={setServiceAddress} required />
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
