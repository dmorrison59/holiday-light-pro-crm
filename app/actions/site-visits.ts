"use server";

import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth/current";
import { preferredColorOptions, siteVisitStyles } from "@/lib/crm-options";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CrmActionState } from "@/app/actions/customers";

const value = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const styleValues = new Set<string>(siteVisitStyles);
const colorValues = new Set<string>(preferredColorOptions);

function visitValues(formData: FormData) {
  const visitDate = value(formData, "visit_date");
  const preferredStyle = value(formData, "preferred_style");
  const preferredColors = formData.getAll("preferred_colors").map(String).filter((color) => colorValues.has(color));
  if (!visitDate || Number.isNaN(new Date(visitDate).getTime())) return { error: "Choose a valid visit date and time." } as const;
  if (preferredStyle && !styleValues.has(preferredStyle)) return { error: "Choose a valid preferred style." } as const;
  return { data: { visit_date: new Date(visitDate).toISOString(), budget_discussed: value(formData, "budget_discussed") || null, preferred_style: preferredStyle || null, preferred_colors: preferredColors, customer_present: value(formData, "customer_present") === "yes", notes: value(formData, "notes") || null } } as const;
}

export async function createSiteVisitAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const customerId = value(formData, "customer_id");
  const propertyId = value(formData, "property_id");
  if (!customerId || !propertyId) return { error: "Choose a customer and property." };
  const parsed = visitValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data: property, error: propertyError } = await supabase.from("properties").select("id, customer_id").eq("organization_id", organization.id).eq("id", propertyId).maybeSingle();
  if (propertyError) return { error: "We could not check that property." };
  if (!property || property.customer_id !== customerId) return { error: "That property is not connected to the selected customer." };

  const { data: visit, error } = await supabase.from("site_visits").insert({ ...parsed.data, organization_id: organization.id, customer_id: customerId, property_id: propertyId }).select("id").single();
  if (error || !visit) return { error: error?.message ?? "We could not save this site visit." };

  const { error: statusError } = await supabase.from("customers").update({ status: "site_visit_scheduled", updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", customerId).in("status", ["lead", "contacted"]);
  if (statusError) {
    await supabase.from("site_visits").delete().eq("organization_id", organization.id).eq("id", visit.id);
    return { error: "We could not finish scheduling this visit. Please try again." };
  }
  redirect(`/site-visits/${visit.id}?created=1`);
}

export async function updateSiteVisitAction(_state: CrmActionState, formData: FormData): Promise<CrmActionState> {
  const siteVisitId = value(formData, "site_visit_id");
  if (!siteVisitId) return { error: "Site visit information is missing." };
  const parsed = visitValues(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_visits").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("organization_id", organization.id).eq("id", siteVisitId).select("id").maybeSingle();
  if (error) return { error: error.message || "We could not update this site visit." };
  if (!data) return { error: "Site visit not found." };
  redirect(`/site-visits/${siteVisitId}?updated=1`);
}
