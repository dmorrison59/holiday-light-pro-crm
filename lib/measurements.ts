import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteVisit, type SiteVisitRecord } from "@/lib/site-visits";
import type { CatalogItem, Measurement } from "@/types/database";

export type MeasurementCatalogItem = Pick<CatalogItem, "id" | "name" | "category" | "description" | "pricing_method" | "unit_type" | "unit_price">;

export interface MeasurementListItem extends Measurement {
  catalog_item: MeasurementCatalogItem | null;
  visit_date?: string | null;
}

export interface MeasurementRecord extends MeasurementListItem {
  site_visit: SiteVisitRecord;
}

export interface MeasurementSummary {
  count: number;
  rooflineFeet: number;
  garlandFeet: number;
  walkwayFeet: number;
  wreathCount: number;
  treeCount: number;
  bushCount: number;
}

async function attachCatalogItems(organizationId: string, measurements: Measurement[]): Promise<MeasurementListItem[]> {
  const catalogIds = [...new Set(measurements.map((measurement) => measurement.catalog_item_id).filter((id): id is string => Boolean(id)))];
  if (!catalogIds.length) return measurements.map((measurement) => ({ ...measurement, catalog_item: null }));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("catalog_items").select("id, name, category, description, pricing_method, unit_type, unit_price").eq("organization_id", organizationId).in("id", catalogIds);
  if (error) throw new Error("We could not load catalog items for these measurements.");
  const catalog = new Map((data ?? []).map((item) => [item.id, item]));
  return measurements.map((measurement) => ({ ...measurement, catalog_item: measurement.catalog_item_id ? catalog.get(measurement.catalog_item_id) ?? null : null }));
}

export async function getMeasurementsForSiteVisit(organizationId: string, siteVisitId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("measurements").select("*").eq("organization_id", organizationId).eq("site_visit_id", siteVisitId).order("created_at");
  if (error) throw new Error("We could not load measurements for this site visit.");
  return attachCatalogItems(organizationId, data ?? []);
}

export async function getMeasurementsForProperty(organizationId: string, propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("measurements").select("*").eq("organization_id", organizationId).eq("property_id", propertyId).order("created_at", { ascending: false }).limit(12);
  if (error) throw new Error("We could not load measurements for this property.");
  const records = await attachCatalogItems(organizationId, data ?? []);
  if (!records.length) return records;
  const visitIds = [...new Set(records.map((measurement) => measurement.site_visit_id))];
  const { data: visits, error: visitError } = await supabase.from("site_visits").select("id, visit_date").eq("organization_id", organizationId).in("id", visitIds);
  if (visitError) throw new Error("We could not load measurement visit dates.");
  const visitDates = new Map((visits ?? []).map((visit) => [visit.id, visit.visit_date]));
  return records.map((measurement) => ({ ...measurement, visit_date: visitDates.get(measurement.site_visit_id) ?? null }));
}

export async function getMeasurementsForCustomer(organizationId: string, customerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: properties, error } = await supabase.from("properties").select("id").eq("organization_id", organizationId).eq("customer_id", customerId);
  if (error) throw new Error("We could not load customer measurements.");
  const propertyIds = (properties ?? []).map((property) => property.id);
  if (!propertyIds.length) return [];
  const { data, error: measurementError } = await supabase.from("measurements").select("*").eq("organization_id", organizationId).in("property_id", propertyIds).order("created_at", { ascending: false }).limit(12);
  if (measurementError) throw new Error("We could not load customer measurements.");
  const records = await attachCatalogItems(organizationId, data ?? []);
  if (!records.length) return records;
  const visitIds = [...new Set(records.map((measurement) => measurement.site_visit_id))];
  const { data: visits, error: visitError } = await supabase.from("site_visits").select("id, visit_date").eq("organization_id", organizationId).in("id", visitIds);
  if (visitError) throw new Error("We could not load measurement visit dates.");
  const visitDates = new Map((visits ?? []).map((visit) => [visit.id, visit.visit_date]));
  return records.map((measurement) => ({ ...measurement, visit_date: visitDates.get(measurement.site_visit_id) ?? null }));
}

export async function getMeasurement(organizationId: string, measurementId: string): Promise<MeasurementRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("measurements").select("*").eq("organization_id", organizationId).eq("id", measurementId).maybeSingle();
  if (error) throw new Error("We could not load that measurement.");
  if (!data) return null;
  const [measurement] = await attachCatalogItems(organizationId, [data]);
  const siteVisit = await getSiteVisit(organizationId, data.site_visit_id);
  if (!siteVisit || siteVisit.property_id !== data.property_id) return null;
  return { ...measurement, site_visit: siteVisit };
}

export async function getActiveCatalogItems(organizationId: string): Promise<MeasurementCatalogItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("catalog_items").select("id, name, category, description, pricing_method, unit_type, unit_price").eq("organization_id", organizationId).eq("active", true).order("name");
  if (error) throw new Error("We could not load catalog items.");
  return data ?? [];
}

export function summarizeMeasurements(measurements: Measurement[]): MeasurementSummary {
  const total = (predicate: (measurement: Measurement) => boolean) => measurements.filter(predicate).reduce((sum, measurement) => sum + Number(measurement.quantity || 0), 0);
  return {
    count: measurements.length,
    rooflineFeet: total((item) => ["Roofline", "Peak/Gable"].includes(item.measurement_type) && item.unit === "ft"),
    garlandFeet: total((item) => item.measurement_type === "Garland Area" && item.unit === "ft"),
    walkwayFeet: total((item) => item.measurement_type === "Walkway" && item.unit === "ft"),
    wreathCount: total((item) => item.measurement_type === "Wreath"),
    treeCount: total((item) => item.measurement_type === "Tree"),
    bushCount: total((item) => item.measurement_type === "Bush"),
  };
}
