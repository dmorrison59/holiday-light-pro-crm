import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MaterialRecord } from "@/lib/material-options";

export async function getJobMaterials(organizationId: string, jobId: string): Promise<MaterialRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("job_materials").select("*").eq("organization_id", organizationId).eq("job_id", jobId).order("created_at");
  if (error) throw new Error("We couldn’t load the materials checklist. Run the job materials migration if it has not been applied.");
  const ids = [...new Set((data ?? []).map((item) => item.catalog_item_id).filter((id): id is string => Boolean(id)))];
  const { data: catalog, error: catalogError } = ids.length ? await supabase.from("catalog_items").select("id, name, unit_type, track_inventory, quantity_available, quantity_reserved, storage_location").eq("organization_id", organizationId).in("id", ids) : { data: [], error: null };
  if (catalogError) throw new Error("We couldn’t load linked inventory details.");
  const map = new Map((catalog ?? []).map((item) => [item.id, item]));
  return (data ?? []).map((item) => ({ ...item, catalog_item: item.catalog_item_id ? map.get(item.catalog_item_id) ?? null : null }));
}

export async function getMaterial(organizationId: string, jobId: string, materialId: string) { const materials = await getJobMaterials(organizationId, jobId); return materials.find((item) => item.id === materialId) ?? null; }
export async function getMaterialFormData(organizationId: string) { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("catalog_items").select("id, name, category, description, pricing_method, unit_type, unit_price, storage_location").eq("organization_id", organizationId).eq("active", true).order("name"); if (error) throw new Error("We couldn’t load catalog choices."); return data ?? []; }
