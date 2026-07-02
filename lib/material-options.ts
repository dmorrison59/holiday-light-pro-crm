import type { CatalogItem, JobMaterial } from "@/types/database";
export const materialStatuses = ["Needed", "Reserved", "Loaded", "Used", "Returned", "Missing", "Canceled"] as const;
export type MaterialCatalogLink = Pick<CatalogItem, "id" | "name" | "unit_type" | "track_inventory" | "quantity_available" | "quantity_reserved" | "storage_location">;
export interface MaterialRecord extends JobMaterial { catalog_item: MaterialCatalogLink | null; }
export type MaterialCatalogChoice = Pick<CatalogItem, "id" | "name" | "category" | "description" | "pricing_method" | "unit_type" | "unit_price" | "storage_location">;
