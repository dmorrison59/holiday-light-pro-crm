import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizationPricingSettings } from "@/types/database";

export async function getOrganizationPricingSettings(organizationId: string): Promise<OrganizationPricingSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("organization_pricing_settings").select("*").eq("organization_id", organizationId).maybeSingle();
  if (error) throw new Error("We could not load quote pricing settings.");
  return data;
}
