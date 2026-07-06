import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { crmDateKey } from "@/lib/format";
import type { Customer, Property, SiteVisit } from "@/types/database";

export type VisitCustomer = Pick<Customer, "id" | "first_name" | "last_name">;
export type VisitProperty = Pick<Property, "id" | "customer_id" | "property_name" | "address_line_1" | "address_line_2" | "city" | "state" | "zip" | "access_notes" | "outlet_notes">;

export interface SiteVisitRecord extends SiteVisit {
  customer: VisitCustomer;
  property: VisitProperty;
}

export interface SiteVisitOptions {
  customers: VisitCustomer[];
  properties: VisitProperty[];
}

async function attachVisitRecords(organizationId: string, visits: SiteVisit[]): Promise<SiteVisitRecord[]> {
  if (!visits.length) return [];
  const supabase = await createSupabaseServerClient();
  const customerIds = [...new Set(visits.map((visit) => visit.customer_id))];
  const propertyIds = [...new Set(visits.map((visit) => visit.property_id))];
  const [customersResult, propertiesResult] = await Promise.all([
    supabase.from("customers").select("id, first_name, last_name").eq("organization_id", organizationId).in("id", customerIds),
    supabase.from("properties").select("id, customer_id, property_name, address_line_1, address_line_2, city, state, zip, access_notes, outlet_notes").eq("organization_id", organizationId).in("id", propertyIds),
  ]);
  if (customersResult.error || propertiesResult.error) throw new Error("We could not load site visit details. Please try again.");

  const customers = new Map((customersResult.data ?? []).map((customer) => [customer.id, customer]));
  const properties = new Map((propertiesResult.data ?? []).map((property) => [property.id, property]));
  return visits.flatMap((visit) => {
    const customer = customers.get(visit.customer_id);
    const property = properties.get(visit.property_id);
    return customer && property ? [{ ...visit, customer, property }] : [];
  });
}

export async function getSiteVisits(organizationId: string, filters: { search?: string; date?: string; customerPresent?: string } = {}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("site_visits").select("*").eq("organization_id", organizationId);
  if (filters.customerPresent === "yes") query = query.eq("customer_present", true);
  if (filters.customerPresent === "no") query = query.eq("customer_present", false);
  const { data, error } = await query.order("visit_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error("We could not load site visits. Please try again.");

  let records = await attachVisitRecords(organizationId, data ?? []);
  if (filters.date) records = records.filter((visit) => visit.visit_date && crmDateKey(visit.visit_date) === filters.date);
  const needle = filters.search?.trim().toLocaleLowerCase();
  if (needle) records = records.filter((visit) => [visit.customer.first_name, visit.customer.last_name, visit.property.property_name, visit.property.address_line_1, visit.property.city, visit.property.state].filter(Boolean).join(" ").toLocaleLowerCase().includes(needle));
  return records;
}

export async function getSiteVisit(organizationId: string, siteVisitId: string): Promise<SiteVisitRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_visits").select("*").eq("organization_id", organizationId).eq("id", siteVisitId).maybeSingle();
  if (error) throw new Error("We could not load that site visit. Please try again.");
  if (!data) return null;
  return (await attachVisitRecords(organizationId, [data]))[0] ?? null;
}

export async function getSiteVisitsForCustomer(organizationId: string, customerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_visits").select("*").eq("organization_id", organizationId).eq("customer_id", customerId).order("visit_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error("We could not load this customer’s site visits.");
  return attachVisitRecords(organizationId, data ?? []);
}

export async function getSiteVisitsForProperty(organizationId: string, propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_visits").select("*").eq("organization_id", organizationId).eq("property_id", propertyId).order("visit_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error("We could not load this property’s site visits.");
  return attachVisitRecords(organizationId, data ?? []);
}

export async function getSiteVisitOptions(organizationId: string): Promise<SiteVisitOptions> {
  const supabase = await createSupabaseServerClient();
  const [customersResult, propertiesResult] = await Promise.all([
    supabase.from("customers").select("id, first_name, last_name").eq("organization_id", organizationId).order("first_name"),
    supabase.from("properties").select("id, customer_id, property_name, address_line_1, address_line_2, city, state, zip, access_notes, outlet_notes").eq("organization_id", organizationId).order("address_line_1"),
  ]);
  if (customersResult.error || propertiesResult.error) throw new Error("We could not load customers and properties for this visit.");
  return { customers: customersResult.data ?? [], properties: propertiesResult.data ?? [] };
}
