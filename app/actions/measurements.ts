"use server";

import { redirect } from "next/navigation";
import type { CrmActionState } from "@/app/actions/customers";
import { requireOrganization } from "@/lib/auth/current";
import { difficultyOptions, heightLevels, measurementTypes, measurementUnits } from "@/lib/crm-options";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const value = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const measurementTypeValues = new Set<string>(measurementTypes);
const unitValues = new Set<string>(measurementUnits);
const heightValues = new Set<string>(heightLevels);
const difficultyValues = new Set<string>(difficultyOptions.map((difficulty) => difficulty.label));

function measurementValues(formData: FormData) {
  const zoneName = value(formData, "zone_name");
  const measurementType = value(formData, "measurement_type");
  const quantity = Number(value(formData, "quantity"));
  const unit = value(formData, "unit");
  const heightLevel = value(formData, "height_level");
  const difficulty = value(formData, "difficulty");
  const difficultyMultiplier = Number(value(formData, "difficulty_multiplier"));
  if (!zoneName) return { error: "Zone name is required." } as const;
  if (!measurementTypeValues.has(measurementType)) return { error: "Choose a valid measurement type." } as const;
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Quantity must be greater than zero." } as const;
  if (!unitValues.has(unit)) return { error: "Choose a valid unit." } as const;
  if (heightLevel && !heightValues.has(heightLevel)) return { error: "Choose a valid height level." } as const;
  if (difficulty && !difficultyValues.has(difficulty)) return { error: "Choose a valid difficulty." } as const;
  if (!Number.isFinite(difficultyMultiplier) || difficultyMultiplier < 0) return { error: "Enter a valid difficulty multiplier." } as const;
  return { data: { zone_name: zoneName, measurement_type: measurementType, quantity: String(quantity), unit, height_level: heightLevel || null, difficulty: difficulty || null, difficulty_multiplier: String(difficultyMultiplier), catalog_item_id: value(formData, "catalog_item_id") || null, included_in_quote: formData.get("included_in_quote") === "on", notes: value(formData, "notes") || null } } as const;
}

export async function createMeasurementAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const siteVisitId = value(formData, "site_visit_id");
  if (!siteVisitId) return { error: "Site visit information is missing." };
  const parsed = measurementValues(formData); if ("error" in parsed) return { error: parsed.error };
  const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient();
  const { data: visit, error: visitError } = await supabase.from("site_visits").select("id, property_id, customer_id").eq("organization_id", organization.id).eq("id", siteVisitId).maybeSingle();
  if (visitError) return { error: "We could not check that site visit." }; if (!visit) return { error: "Site visit not found." };
  if (parsed.data.catalog_item_id) { const { data: catalogItem } = await supabase.from("catalog_items").select("id").eq("organization_id", organization.id).eq("id", parsed.data.catalog_item_id).eq("active", true).maybeSingle(); if (!catalogItem) return { error: "Choose an active catalog item or leave it unassigned." }; }
  const { count, error: countError } = await supabase.from("measurements").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("site_visit_id", siteVisitId);
  if (countError) return { error: "We could not check existing measurements." };
  const { data: measurement, error } = await supabase.from("measurements").insert({ ...parsed.data, organization_id: organization.id, site_visit_id: siteVisitId, property_id: visit.property_id }).select("id").single();
  if (error || !measurement) return { error: error?.message ?? "We could not save this measurement." };
  if ((count ?? 0) === 0) { const { error: statusError } = await supabase.from("customers").update({ status: "measured", updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", visit.customer_id).in("status", ["lead", "contacted", "site_visit_scheduled"]); if (statusError) { await supabase.from("measurements").delete().eq("organization_id", organization.id).eq("id", measurement.id); return { error: "We could not finish saving this measurement. Please try again." }; } }
  if (value(formData, "intent") === "add_another") redirect(`/site-visits/${siteVisitId}/measurements/new?added=1`);
  redirect(`/site-visits/${siteVisitId}?measurement=added`);
}

export async function updateMeasurementAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const measurementId = value(formData, "measurement_id"); if (!measurementId) return { error: "Measurement information is missing." };
  const parsed = measurementValues(formData); if ("error" in parsed) return { error: parsed.error };
  const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient();
  if (parsed.data.catalog_item_id) { const { data: catalogItem } = await supabase.from("catalog_items").select("id").eq("organization_id", organization.id).eq("id", parsed.data.catalog_item_id).eq("active", true).maybeSingle(); if (!catalogItem) return { error: "Choose an active catalog item or leave it unassigned." }; }
  const { data, error } = await supabase.from("measurements").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", measurementId).select("id").maybeSingle();
  if (error) return { error: error.message || "We could not update this measurement." }; if (!data) return { error: "Measurement not found." };
  redirect(`/measurements/${measurementId}?updated=1`);
}

export async function deleteMeasurementAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const measurementId = value(formData, "measurement_id"); if (!measurementId) return { error: "Measurement information is missing." };
  const { organization } = await requireOrganization(); const supabase = await createSupabaseServerClient();
  const { data: measurement, error: loadError } = await supabase.from("measurements").select("id, site_visit_id").eq("organization_id", organization.id).eq("id", measurementId).maybeSingle();
  if (loadError) return { error: "We could not check this measurement." }; if (!measurement) return { error: "Measurement not found." };
  const { error } = await supabase.from("measurements").delete().eq("organization_id", organization.id).eq("id", measurementId);
  if (error) return { error: "We could not delete this measurement." };
  redirect(`/site-visits/${measurement.site_visit_id}?measurement=deleted`);
}
