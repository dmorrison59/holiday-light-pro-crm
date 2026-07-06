import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { quoteStatuses, type QuoteStatus } from "@/lib/quote-options";
import type { CatalogItem, Customer, OrganizationPricingSettings, Package, PackageItem, Property, Quote, QuoteLineItem, SiteVisit, Measurement } from "@/types/database";

export { quoteStatuses, type QuoteStatus };
export type QuoteCustomer = Pick<Customer, "id" | "first_name" | "last_name">;
export type QuoteProperty = Pick<Property, "id" | "customer_id" | "property_name" | "address_line_1" | "address_line_2" | "city" | "state" | "zip">;
export type QuoteCatalogItem = Pick<CatalogItem, "id" | "name" | "category" | "description" | "pricing_method" | "unit_type" | "unit_price" | "active">;
export interface QuotePackageItem extends PackageItem { catalog_item: QuoteCatalogItem; }
export interface QuoteBuilderPackage extends Package { items: QuotePackageItem[]; }
export interface QuoteBuilderMeasurement extends Measurement { catalog_item: QuoteCatalogItem | null; }
export interface QuoteBuilderData { customers: QuoteCustomer[]; properties: QuoteProperty[]; siteVisits: SiteVisit[]; measurements: QuoteBuilderMeasurement[]; catalogItems: QuoteCatalogItem[]; packages: QuoteBuilderPackage[]; pricingSettings: OrganizationPricingSettings | null; }
export interface QuoteRecord extends Quote { customer: QuoteCustomer; property: QuoteProperty; site_visit: SiteVisit | null; package: Package | null; line_items: QuoteLineItem[]; }
export interface QuoteListRecord extends Quote { customer: QuoteCustomer; property: QuoteProperty; package: Pick<Package, "id" | "name"> | null; }

export async function getQuoteBuilderData(organizationId: string): Promise<QuoteBuilderData> {
  const supabase = await createSupabaseServerClient();
  const [customersResult, propertiesResult, visitsResult, measurementsResult, catalogResult, packagesResult, packageItemsResult, pricingResult] = await Promise.all([
    supabase.from("customers").select("id, first_name, last_name").eq("organization_id", organizationId).order("last_name"),
    supabase.from("properties").select("id, customer_id, property_name, address_line_1, address_line_2, city, state, zip").eq("organization_id", organizationId).order("address_line_1"),
    supabase.from("site_visits").select("*").eq("organization_id", organizationId).order("visit_date", { ascending: false }),
    supabase.from("measurements").select("*").eq("organization_id", organizationId).order("created_at"),
    supabase.from("catalog_items").select("id, name, category, description, pricing_method, unit_type, unit_price, active").eq("organization_id", organizationId).order("name"),
    supabase.from("packages").select("*").eq("organization_id", organizationId).eq("active", true).order("display_order"),
    supabase.from("package_items").select("*").eq("organization_id", organizationId),
    supabase.from("organization_pricing_settings").select("*").eq("organization_id", organizationId).maybeSingle(),
  ]);
  if ([customersResult, propertiesResult, visitsResult, measurementsResult, catalogResult, packagesResult, packageItemsResult, pricingResult].some((result) => result.error)) throw new Error("We could not load the quote builder.");
  const catalog = new Map((catalogResult.data ?? []).map((item) => [item.id, item]));
  const measurements = (measurementsResult.data ?? []).map((item) => ({ ...item, catalog_item: item.catalog_item_id ? catalog.get(item.catalog_item_id) ?? null : null }));
  const packageItems = packageItemsResult.data ?? [];
  const packages = (packagesResult.data ?? []).map((item) => ({ ...item, items: packageItems.filter((packageItem) => packageItem.package_id === item.id).flatMap((packageItem) => { const catalogItem = catalog.get(packageItem.catalog_item_id); return catalogItem ? [{ ...packageItem, catalog_item: catalogItem }] : []; }) }));
  return { customers: customersResult.data ?? [], properties: propertiesResult.data ?? [], siteVisits: visitsResult.data ?? [], measurements, catalogItems: (catalogResult.data ?? []).filter((item) => item.active), packages, pricingSettings: pricingResult.data };
}

async function attachQuoteRelations(organizationId: string, quotes: Quote[]): Promise<QuoteListRecord[]> {
  if (!quotes.length) return [];
  const supabase = await createSupabaseServerClient(); const customerIds = [...new Set(quotes.map((item) => item.customer_id))]; const propertyIds = [...new Set(quotes.map((item) => item.property_id))]; const packageIds = [...new Set(quotes.map((item) => item.package_id).filter((id): id is string => Boolean(id)))];
  const [customers, properties, packages] = await Promise.all([supabase.from("customers").select("id, first_name, last_name").eq("organization_id", organizationId).in("id", customerIds), supabase.from("properties").select("id, customer_id, property_name, address_line_1, address_line_2, city, state, zip").eq("organization_id", organizationId).in("id", propertyIds), packageIds.length ? supabase.from("packages").select("id, name").eq("organization_id", organizationId).in("id", packageIds) : Promise.resolve({ data: [], error: null })]);
  if (customers.error || properties.error || packages.error) throw new Error("We could not load quote details."); const customerMap = new Map((customers.data ?? []).map((item) => [item.id, item])); const propertyMap = new Map((properties.data ?? []).map((item) => [item.id, item])); const packageMap = new Map((packages.data ?? []).map((item) => [item.id, item]));
  return quotes.flatMap((item) => { const customer = customerMap.get(item.customer_id); const property = propertyMap.get(item.property_id); return customer && property ? [{ ...item, customer, property, package: item.package_id ? packageMap.get(item.package_id) ?? null : null }] : []; });
}

export async function getQuotes(organizationId: string, filters: { search?: string; status?: string } = {}) {
  const supabase = await createSupabaseServerClient(); let query = supabase.from("quotes").select("*").eq("organization_id", organizationId); if (filters.status) query = query.eq("status", filters.status); const { data, error } = await query.order("quote_date", { ascending: false }).order("created_at", { ascending: false }); if (error) throw new Error("We could not load quotes."); let records = await attachQuoteRelations(organizationId, data ?? []); const search = filters.search?.trim().toLocaleLowerCase(); if (search) records = records.filter((item) => [item.quote_number, item.customer.first_name, item.customer.last_name, item.property.property_name, item.property.address_line_1, item.property.city].filter(Boolean).join(" ").toLocaleLowerCase().includes(search)); return records;
}
export async function getQuotesForCustomer(organizationId: string, customerId: string) { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("organization_id", organizationId).eq("customer_id", customerId).order("quote_date", { ascending: false }); if (error) throw new Error("We could not load customer quotes."); return attachQuoteRelations(organizationId, data ?? []); }
export async function getQuotesForProperty(organizationId: string, propertyId: string) { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("organization_id", organizationId).eq("property_id", propertyId).order("quote_date", { ascending: false }); if (error) throw new Error("We could not load property quotes."); return attachQuoteRelations(organizationId, data ?? []); }
export async function getQuotesForSiteVisit(organizationId: string, siteVisitId: string) { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("organization_id", organizationId).eq("site_visit_id", siteVisitId).order("quote_date", { ascending: false }); if (error) throw new Error("We could not load site visit quotes."); return attachQuoteRelations(organizationId, data ?? []); }

export async function getQuote(organizationId: string, quoteId: string): Promise<QuoteRecord | null> { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("organization_id", organizationId).eq("id", quoteId).maybeSingle(); if (error) throw new Error("We could not load that quote."); if (!data) return null; const [record] = await attachQuoteRelations(organizationId, [data]); if (!record) return null; const [lineItems, visit, packageResult] = await Promise.all([supabase.from("quote_line_items").select("*").eq("organization_id", organizationId).eq("quote_id", quoteId).order("created_at"), data.site_visit_id ? supabase.from("site_visits").select("*").eq("organization_id", organizationId).eq("id", data.site_visit_id).maybeSingle() : Promise.resolve({ data: null, error: null }), data.package_id ? supabase.from("packages").select("*").eq("organization_id", organizationId).eq("id", data.package_id).maybeSingle() : Promise.resolve({ data: null, error: null })]); if (lineItems.error || visit.error || packageResult.error) throw new Error("We could not load quote details."); return { ...record, site_visit: visit.data, package: packageResult.data, line_items: lineItems.data ?? [] }; }
