import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Customer, Property } from "@/types/database";

export interface CustomerWithProperties extends Customer {
  properties: Property[];
}

export interface PropertyWithCustomer extends Property {
  customer: Pick<Customer, "id" | "first_name" | "last_name">;
}

export async function getCustomers(organizationId: string, search = "", status = "") {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("customers").select("*").eq("organization_id", organizationId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error("We could not load your customers. Please try again.");

  const needle = search.trim().toLocaleLowerCase();
  if (!needle) return data;

  return data.filter((customer) =>
    [customer.first_name, customer.last_name, customer.phone, customer.email]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(needle),
  );
}

export async function getCustomer(organizationId: string, customerId: string): Promise<CustomerWithProperties | null> {
  const supabase = await createSupabaseServerClient();
  const [customerResult, propertiesResult] = await Promise.all([
    supabase.from("customers").select("*").eq("organization_id", organizationId).eq("id", customerId).maybeSingle(),
    supabase.from("properties").select("*").eq("organization_id", organizationId).eq("customer_id", customerId).order("created_at", { ascending: true }),
  ]);

  if (customerResult.error || propertiesResult.error) {
    throw new Error("We could not load that customer. Please try again.");
  }
  if (!customerResult.data) return null;

  return { ...customerResult.data, properties: propertiesResult.data ?? [] };
}

export async function getProperty(organizationId: string, propertyId: string): Promise<PropertyWithCustomer | null> {
  const supabase = await createSupabaseServerClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw new Error("We could not load that property. Please try again.");
  if (!property) return null;

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("organization_id", organizationId)
    .eq("id", property.customer_id)
    .maybeSingle();

  if (customerError) throw new Error("We could not load that property. Please try again.");
  if (!customer) return null;

  return { ...property, customer };
}
