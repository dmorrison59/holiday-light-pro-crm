"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PricingActionState {
  error?: string;
  success?: string;
}

const priceFields = [
  "roofline_price", "ridge_line_price", "walkway_price", "driveway_price", "garland_price",
  "wreath_price", "tree_price", "shrub_price", "peak_gable_price", "custom_labor_hourly_rate",
  "removal_price", "storage_price", "minimum_job_price",
] as const;

export async function savePricingSettingsAction(_state: PricingActionState, formData: FormData): Promise<PricingActionState> {
  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();

  if (String(formData.get("intent") ?? "") === "reset") {
    const { error } = await supabase.from("organization_pricing_settings").delete().eq("organization_id", organization.id);
    if (error) return { error: "We could not reset your pricing settings." };
    revalidatePath("/settings");
    revalidatePath("/quotes");
    return { success: "Pricing reset to starter defaults." };
  }

  const prices: Record<string, string | null> = {};
  for (const field of priceFields) {
    const raw = String(formData.get(field) ?? "").trim();
    if (!raw) { prices[field] = null; continue; }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return { error: "Prices must be valid numbers that are zero or greater." };
    prices[field] = String(parsed);
  }

  const { error } = await supabase.from("organization_pricing_settings").upsert({
    organization_id: organization.id,
    ...prices,
    removal_included: formData.get("removal_included") === "on",
    storage_included: formData.get("storage_included") === "on",
    updated_at: new Date().toISOString(),
  }, { onConflict: "organization_id" });
  if (error) return { error: "We could not save your pricing settings. Apply the pricing settings migration, then try again." };
  revalidatePath("/settings");
  revalidatePath("/quotes");
  return { success: "Quote pricing saved." };
}
