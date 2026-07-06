"use server";

import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth/current";
import { customerStatuses, propertyTypes } from "@/lib/crm-options";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CrmActionState {
  error?: string;
}

const value = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const validEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const customerStatusValues = new Set<string>(customerStatuses.map((status) => status.value));
const propertyTypeValues = new Set<string>(propertyTypes);

function customerValues(formData: FormData) {
  const firstName = value(formData, "first_name");
  const lastName = value(formData, "last_name");
  const email = value(formData, "email");
  const status = value(formData, "status") || "lead";
  const serviceSameAsBilling = formData.get("service_same_as_billing") === "on";
  const billingStreet = value(formData, "billing_street");
  const billingCity = value(formData, "billing_city");
  const billingState = value(formData, "billing_state");
  const billingZip = value(formData, "billing_zip");
  const serviceStreet = serviceSameAsBilling ? billingStreet : value(formData, "service_street");
  const serviceCity = serviceSameAsBilling ? billingCity : value(formData, "service_city");
  const serviceState = serviceSameAsBilling ? billingState : value(formData, "service_state");
  const serviceZip = serviceSameAsBilling ? billingZip : value(formData, "service_zip");

  if (!firstName) return { error: "First name is required." } as const;
  if (!validEmail(email)) return { error: "Enter a valid email address." } as const;
  if (!customerStatusValues.has(status)) return { error: "Choose a valid customer status." } as const;
  if (billingZip && !/^\d{5}$/.test(billingZip)) return { error: "Enter a 5-digit billing ZIP code." } as const;
  if (!serviceSameAsBilling && (!serviceStreet || !serviceCity || !serviceState || !serviceZip)) return { error: "Complete the service address." } as const;
  if (serviceZip && !/^\d{5}$/.test(serviceZip)) return { error: "Enter a 5-digit service ZIP code." } as const;

  return {
    data: {
      first_name: firstName,
      last_name: lastName,
      phone: value(formData, "phone") || null,
      email: email || null,
      billing_street: billingStreet || null,
      billing_city: billingCity || null,
      billing_state: billingState || null,
      billing_zip: billingZip || null,
      service_same_as_billing: serviceSameAsBilling,
      service_street: serviceStreet || null,
      service_city: serviceCity || null,
      service_state: serviceState || null,
      service_zip: serviceZip || null,
      status,
      lead_source: value(formData, "lead_source") || null,
      notes: value(formData, "notes") || null,
    },
  } as const;
}

function propertyValues(formData: FormData) {
  const addressLine1 = value(formData, "address_line_1");
  const propertyType = value(formData, "property_type") || "Residential";

  if (!addressLine1) return { error: "Address line 1 is required." } as const;
  if (!propertyTypeValues.has(propertyType)) return { error: "Choose a valid property type." } as const;

  return {
    data: {
      property_name: value(formData, "property_name") || null,
      address_line_1: addressLine1,
      address_line_2: value(formData, "address_line_2") || null,
      city: value(formData, "city"),
      state: value(formData, "state"),
      zip: value(formData, "zip"),
      property_type: propertyType,
      access_notes: value(formData, "access_notes") || null,
      outlet_notes: value(formData, "outlet_notes") || null,
      safety_notes: value(formData, "safety_notes") || null,
      hoa_notes: value(formData, "hoa_notes") || null,
      notes: value(formData, "notes") || null,
    },
  } as const;
}

export async function createCustomerAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const parsed = customerValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").insert({ ...parsed.data, organization_id: organization.id }).select("id").single();

  if (error || !data) return { error: error?.message ?? "We could not save this customer." };
  redirect(`/customers/${data.id}?created=1`);
}

export async function updateCustomerAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const customerId = value(formData, "customer_id");
  if (!customerId) return { error: "Customer information is missing." };
  const parsed = customerValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", customerId).eq("organization_id", organization.id).select("id").maybeSingle();

  if (error) return { error: error.message || "We could not update this customer." };
  if (!data) return { error: "Customer not found." };
  redirect(`/customers/${customerId}?updated=1`);
}

export async function deleteCustomerAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const customerId = value(formData, "customer_id");
  if (!customerId) return { error: "Customer information is missing." };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").delete().eq("id", customerId).eq("organization_id", organization.id).select("id").maybeSingle();

  if (error) return { error: "This customer could not be deleted. They may be connected to other work." };
  if (!data) return { error: "Customer not found." };
  redirect("/customers?deleted=1");
}

export async function createPropertyAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const customerId = value(formData, "customer_id");
  if (!customerId) return { error: "Customer information is missing." };
  const parsed = propertyValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data: customer } = await supabase.from("customers").select("id").eq("id", customerId).eq("organization_id", organization.id).maybeSingle();
  if (!customer) return { error: "Customer not found." };

  const { data, error } = await supabase.from("properties").insert({ ...parsed.data, organization_id: organization.id, customer_id: customerId }).select("id").single();
  if (error || !data) return { error: error?.message ?? "We could not save this property." };
  redirect(`/properties/${data.id}?created=1`);
}

export async function updatePropertyAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const propertyId = value(formData, "property_id");
  if (!propertyId) return { error: "Property information is missing." };
  const parsed = propertyValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("properties").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", propertyId).eq("organization_id", organization.id).select("id").maybeSingle();

  if (error) return { error: error.message || "We could not update this property." };
  if (!data) return { error: "Property not found." };
  redirect(`/properties/${propertyId}?updated=1`);
}
