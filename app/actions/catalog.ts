"use server";

import { redirect } from "next/navigation";
import type { CrmActionState } from "@/app/actions/customers";
import { requireOrganization } from "@/lib/auth/current";
import { catalogCategories, catalogUnitTypes, pricingMethods } from "@/lib/crm-options";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const value = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const duplicateCatalogNameMessage = "A catalog item with this name already exists.";
const isDuplicateCatalogNameError = (error: { code?: string | null; message?: string | null }) =>
  error.code === "23505" && (error.message?.includes("catalog_items_org_name_uidx") ?? true);
const categoryValues = new Set<string>(catalogCategories); const pricingValues = new Set<string>(pricingMethods.map((item) => item.value)); const unitValues = new Set<string>(catalogUnitTypes);
function numberValue(formData: FormData, name: string): string | undefined;
function numberValue(formData: FormData, name: string, optional: true): string | null | undefined;
function numberValue(formData: FormData, name: string, optional = false) { const raw = value(formData, name); if (!raw && optional) return null; const number = Number(raw || 0); return Number.isFinite(number) && number >= 0 ? String(number) : undefined; }

function catalogValues(formData: FormData, legacy?: { category: string; pricing_method: string; unit_type: string }) {
  const name = value(formData, "name"); const category = value(formData, "category"); const pricingMethod = value(formData, "pricing_method"); const unitType = value(formData, "unit_type");
  const unitPrice = numberValue(formData, "unit_price"); const cost = numberValue(formData, "cost", true); const quantityAvailable = numberValue(formData, "quantity_available"); const quantityReserved = numberValue(formData, "quantity_reserved"); const reorderThreshold = numberValue(formData, "reorder_threshold");
  if (!name) return { error: "Item name is required." } as const; if (!category || (!categoryValues.has(category) && category !== legacy?.category)) return { error: "Choose a valid category." } as const; if (!pricingMethod || (!pricingValues.has(pricingMethod) && pricingMethod !== legacy?.pricing_method)) return { error: "Choose how this item is priced." } as const; if (!unitType || (!unitValues.has(unitType) && unitType !== legacy?.unit_type)) return { error: "Choose a valid unit type." } as const;
  if (unitPrice === undefined) return { error: "Unit price must be zero or greater." } as const; if (cost === undefined) return { error: "Cost must be zero or greater." } as const; if (quantityAvailable === undefined || quantityReserved === undefined || reorderThreshold === undefined) return { error: "Inventory quantities must be zero or greater." } as const;
  return { data: { name, category, description: value(formData, "description") || null, pricing_method: pricingMethod, unit_type: unitType, unit_price: unitPrice, cost, active: formData.get("active") === "on", customer_facing: formData.get("customer_facing") === "on", track_inventory: formData.get("track_inventory") === "on", quantity_available: quantityAvailable, quantity_reserved: quantityReserved, reorder_threshold: reorderThreshold, storage_location: value(formData, "storage_location") || null, notes: value(formData, "notes") || null } } as const;
}

export async function createCatalogItemAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> { const parsed = catalogValues(formData); if ("error" in parsed) return { error: parsed.error }; const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("catalog_items").insert({ ...parsed.data, organization_id: organization.id }).select("id").single(); if (error) return { error: isDuplicateCatalogNameError(error) ? duplicateCatalogNameMessage : "We could not save this catalog item." }; if (!data) return { error: "We could not save this catalog item." }; redirect(`/catalog/${data.id}?created=1`); }

export async function updateCatalogItemAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> { const itemId = value(formData, "catalog_item_id"); if (!itemId) return { error: "Catalog item information is missing." }; const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient(); const { data: existing, error: loadError } = await supabase.from("catalog_items").select("category, pricing_method, unit_type").eq("organization_id", organization.id).eq("id", itemId).maybeSingle(); if (loadError) return { error: "We could not check this catalog item." }; if (!existing) return { error: "Catalog item not found." }; const parsed = catalogValues(formData, existing); if ("error" in parsed) return { error: parsed.error }; const { data, error } = await supabase.from("catalog_items").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", itemId).select("id").maybeSingle(); if (error) return { error: isDuplicateCatalogNameError(error) ? duplicateCatalogNameMessage : "We could not update this catalog item." }; if (!data) return { error: "Catalog item not found." }; redirect(`/catalog/${itemId}?updated=1`); }

export async function toggleCatalogItemAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> { const itemId = value(formData, "catalog_item_id"); if (!itemId) return { error: "Catalog item information is missing." }; const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient(); const { data: item, error: loadError } = await supabase.from("catalog_items").select("id, active").eq("organization_id", organization.id).eq("id", itemId).maybeSingle(); if (loadError) return { error: "We could not check this catalog item." }; if (!item) return { error: "Catalog item not found." }; const { error } = await supabase.from("catalog_items").update({ active: !item.active, updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", itemId); if (error) return { error: "We could not change this item’s active status." }; redirect(`/catalog/${itemId}?status=${item.active ? "inactive" : "active"}`); }

export async function deleteCatalogItemAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> { const itemId = value(formData, "catalog_item_id"); if (!itemId) return { error: "Catalog item information is missing." }; const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient(); const checks = await Promise.all([supabase.from("measurements").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("catalog_item_id", itemId), supabase.from("quote_line_items").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("catalog_item_id", itemId), supabase.from("package_items").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("catalog_item_id", itemId)]); if (checks.some((check) => check.error)) return { error: "We could not check whether this item is in use." }; if (checks.some((check) => (check.count ?? 0) > 0)) return { error: "This item is already in use. Deactivate it instead of deleting it." }; const { data, error } = await supabase.from("catalog_items").delete().eq("organization_id", organization.id).eq("id", itemId).select("id").maybeSingle(); if (error) return { error: "We could not delete this catalog item." }; if (!data) return { error: "Catalog item not found." }; redirect("/catalog?deleted=1"); }

const starterCatalog = [
  ["C9 Warm White Roofline Lights", "Roofline Lights", "per_foot", "ft", 8, 2.5, true, true, 1000, 0, 200], ["C9 Multicolor Roofline Lights", "Roofline Lights", "per_foot", "ft", 9, 3, true, true, 800, 0, 150], ["Garland", "Garland", "per_foot", "ft", 12, 4, true, true, 300, 0, 50], ["36-inch Wreath", "Wreaths", "each", "each", 125, 45, true, true, 20, 0, 5], ["Walkway Stake Lights", "Walkway Lights", "per_foot", "ft", 5, 1.5, true, true, 600, 0, 100], ["Tree Wrap", "Tree Lights", "per_tree", "tree", 200, 60, true, false, 0, 0, 0], ["Bush Lights", "Bush Lights", "per_bush", "bush", 75, 20, true, false, 0, 0, 0], ["Timer", "Timers", "each", "each", 25, 10, true, true, 25, 0, 5], ["Extension Cord", "Extension Cords", "each", "each", 15, 6, false, true, 40, 0, 10], ["Clips", "Clips/Stakes", "each", "each", 0, 0.1, false, true, 3000, 0, 500], ["Storage Service", "Storage", "flat_fee", "service", 150, 0, true, false, 0, 0, 0], ["Takedown Service", "Takedown", "flat_fee", "service", 250, 0, true, false, 0, 0, 0],
] as const;

export async function loadStarterCatalogAction(_state: CrmActionState, _formData: FormData): Promise<CrmActionState> {
  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase.from("catalog_items").select("name").eq("organization_id", organization.id);
  if (existingError) return { error: "We could not check your existing catalog." };

  const existingNames = new Set((existing ?? []).map((item) => item.name.toLocaleLowerCase()));
  const rows = starterCatalog
    .filter(([name]) => !existingNames.has(name.toLocaleLowerCase()))
    .map(([name, category, pricing_method, unit_type, unit_price, cost, customer_facing, track_inventory, quantity_available, quantity_reserved, reorder_threshold]) => ({ organization_id: organization.id, name, category, pricing_method, unit_type, unit_price: String(unit_price), cost: String(cost), active: true, customer_facing, track_inventory, quantity_available: String(quantity_available), quantity_reserved: String(quantity_reserved), reorder_threshold: String(reorder_threshold) }));

  let added = 0;
  let skipped = starterCatalog.length - rows.length;
  for (const row of rows) {
    const { error } = await supabase.from("catalog_items").insert(row);
    if (!error) { added += 1; continue; }
    if (isDuplicateCatalogNameError(error)) { skipped += 1; continue; }
    return { error: "We could not load the starter catalog. Please try again." };
  }

  redirect(`/catalog?starter=${added ? "added" : "ready"}&added=${added}&skipped=${skipped}`);
}
