import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogItem, Package, PackageItem } from "@/types/database";

export type PackageCatalogItem = Pick<CatalogItem, "id" | "name" | "category" | "description" | "pricing_method" | "unit_type" | "unit_price">;
export interface PackageItemRecord extends PackageItem { catalog_item: PackageCatalogItem; }
export interface PackageRecord extends Package { items: PackageItemRecord[]; includedCount: number; addonCount: number; estimatedRetailValue: number; }
export interface PackageListRecord extends Package { includedCount: number; addonCount: number; }

export async function getPackages(organizationId: string, filters: { search?: string; active?: string; sort?: string } = {}) {
  const supabase = await createSupabaseServerClient();
  const [{ data: packages, error }, { data: items, error: itemError }] = await Promise.all([
    supabase.from("packages").select("*").eq("organization_id", organizationId),
    supabase.from("package_items").select("package_id, included, optional_addon").eq("organization_id", organizationId),
  ]);
  if (error || itemError) throw new Error("We could not load packages.");
  const counts = new Map<string, { included: number; addons: number }>();
  for (const item of items ?? []) { const current = counts.get(item.package_id) ?? { included: 0, addons: 0 }; if (item.included) current.included += 1; if (item.optional_addon) current.addons += 1; counts.set(item.package_id, current); }
  let records: PackageListRecord[] = (packages ?? []).map((item) => ({ ...item, includedCount: counts.get(item.id)?.included ?? 0, addonCount: counts.get(item.id)?.addons ?? 0 }));
  const search = filters.search?.trim().toLocaleLowerCase();
  if (search) records = records.filter((item) => item.name.toLocaleLowerCase().includes(search));
  if (filters.active === "active") records = records.filter((item) => item.active);
  if (filters.active === "inactive") records = records.filter((item) => !item.active);
  records.sort(filters.sort === "price_asc" ? (a, b) => Number(a.base_price) - Number(b.base_price) : filters.sort === "price_desc" ? (a, b) => Number(b.base_price) - Number(a.base_price) : (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  return records;
}

export async function getPackage(organizationId: string, packageId: string): Promise<PackageRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data: packageRow, error } = await supabase.from("packages").select("*").eq("organization_id", organizationId).eq("id", packageId).maybeSingle();
  if (error) throw new Error("We could not load that package.");
  if (!packageRow) return null;
  const { data: itemRows, error: itemError } = await supabase.from("package_items").select("*").eq("organization_id", organizationId).eq("package_id", packageId).order("created_at");
  if (itemError) throw new Error("We could not load package items.");
  const catalogIds = [...new Set((itemRows ?? []).map((item) => item.catalog_item_id))];
  let catalog = new Map<string, PackageCatalogItem>();
  if (catalogIds.length) {
    const { data: catalogRows, error: catalogError } = await supabase.from("catalog_items").select("id, name, category, description, pricing_method, unit_type, unit_price").eq("organization_id", organizationId).in("id", catalogIds);
    if (catalogError) throw new Error("We could not load package catalog items.");
    catalog = new Map((catalogRows ?? []).map((item) => [item.id, item]));
  }
  const records = (itemRows ?? []).flatMap((item) => { const catalogItem = catalog.get(item.catalog_item_id); return catalogItem ? [{ ...item, catalog_item: catalogItem }] : []; });
  const included = records.filter((item) => item.included);
  return { ...packageRow, items: records, includedCount: included.length, addonCount: records.filter((item) => item.optional_addon).length, estimatedRetailValue: included.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price_override ?? item.catalog_item.unit_price), 0) };
}

export async function getPackageItem(organizationId: string, packageId: string, packageItemId: string) {
  const packageRecord = await getPackage(organizationId, packageId);
  if (!packageRecord) return null;
  return { packageRecord, item: packageRecord.items.find((item) => item.id === packageItemId) ?? null };
}
