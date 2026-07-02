import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogItem } from "@/types/database";

export interface CatalogSummary { total: number; active: number; customerFacing: number; tracked: number; lowStock: number; }

export const catalogNumbers = (item: CatalogItem) => {
  const unitPrice = Number(item.unit_price || 0); const cost = Number(item.cost || 0); const available = Number(item.quantity_available || 0); const reserved = Number(item.quantity_reserved || 0); const threshold = Number(item.reorder_threshold || 0); const remaining = available - reserved;
  return { unitPrice, cost, margin: unitPrice - cost, available, reserved, threshold, remaining, lowStock: item.track_inventory && remaining <= threshold };
};

export const summarizeCatalog = (items: CatalogItem[]): CatalogSummary => ({ total: items.length, active: items.filter((item) => item.active).length, customerFacing: items.filter((item) => item.customer_facing).length, tracked: items.filter((item) => item.track_inventory).length, lowStock: items.filter((item) => catalogNumbers(item).lowStock).length });

export async function getCatalogItems(organizationId: string, filters: { search?: string; category?: string; active?: string; customerFacing?: string; tracked?: string; lowStock?: boolean } = {}) {
  const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("catalog_items").select("*").eq("organization_id", organizationId).order("name");
  if (error) throw new Error("We could not load your catalog. Please try again.");
  const allItems = data ?? []; let items = allItems;
  const needle = filters.search?.trim().toLocaleLowerCase(); if (needle) items = items.filter((item) => item.name.toLocaleLowerCase().includes(needle));
  if (filters.category) items = items.filter((item) => item.category === filters.category);
  if (filters.active === "active") items = items.filter((item) => item.active); if (filters.active === "inactive") items = items.filter((item) => !item.active);
  if (filters.customerFacing === "yes") items = items.filter((item) => item.customer_facing); if (filters.customerFacing === "no") items = items.filter((item) => !item.customer_facing);
  if (filters.tracked === "yes") items = items.filter((item) => item.track_inventory); if (filters.tracked === "no") items = items.filter((item) => !item.track_inventory);
  if (filters.lowStock) items = items.filter((item) => catalogNumbers(item).lowStock);
  return { items, allItems, summary: summarizeCatalog(allItems) };
}

export async function getCatalogItem(organizationId: string, catalogItemId: string) {
  const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("catalog_items").select("*").eq("organization_id", organizationId).eq("id", catalogItemId).maybeSingle();
  if (error) throw new Error("We could not load that catalog item."); return data;
}

export const pricingMethodLabel = (value: string) => ({ per_foot: "Per foot", each: "Each", per_tree: "Per tree", per_bush: "Per bush", per_window: "Per window", flat_fee: "Flat fee", hourly: "Hourly", package: "Package", custom: "Custom", per_unit: "Per unit" }[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
