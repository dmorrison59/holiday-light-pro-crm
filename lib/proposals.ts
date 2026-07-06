import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Organization, Quote, QuoteLineItem } from "@/types/database";

export interface ProposalData {
  quote: Pick<Quote, "id" | "quote_number" | "status" | "quote_date" | "expiration_date" | "subtotal" | "discount" | "total" | "deposit_required" | "balance_due" | "customer_notes" | "terms" | "proposal_token" | "proposal_viewed_at" | "proposal_sent_at" | "approved_at" | "declined_at" | "customer_approval_name" | "customer_approval_email" | "customer_decline_reason">;
  company: Pick<Organization, "name" | "phone" | "email" | "website" | "address" | "logo_url">;
  customer: { first_name: string; last_name: string; phone: string | null; email: string | null; billing_address: string | null; billing_street: string | null; billing_city: string | null; billing_state: string | null; billing_zip: string | null };
  property: { property_name: string | null; address_line_1: string; address_line_2: string | null; city: string; state: string; zip: string; property_type: string | null };
  siteVisit: { preferred_style: string | null; preferred_colors: string[] } | null;
  package: { name: string; description: string | null; includedItems: Array<{ name: string; quantity: string; unit: string; notes: string | null }> } | null;
  lineItems: Array<Pick<QuoteLineItem, "id" | "description" | "quantity" | "unit" | "unit_price" | "line_total" | "notes">>;
}

const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const validProposalToken = (token: string) => tokenPattern.test(token);

export async function ensureProposalToken(organizationId: string, quoteId: string) {
  const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("proposal_token").eq("organization_id", organizationId).eq("id", quoteId).maybeSingle(); if (error) throw new Error("We could not prepare this proposal."); if (!data) return null; if (data.proposal_token) return data.proposal_token; const proposalToken = crypto.randomUUID(); const { data: updated, error: updateError } = await supabase.from("quotes").update({ proposal_token: proposalToken, updated_at: new Date().toISOString() }).eq("organization_id", organizationId).eq("id", quoteId).is("proposal_token", null).select("proposal_token").maybeSingle(); if (updateError) throw new Error("We could not generate a proposal link."); if (updated?.proposal_token) return updated.proposal_token; const { data: raced } = await supabase.from("quotes").select("proposal_token").eq("organization_id", organizationId).eq("id", quoteId).maybeSingle(); return raced?.proposal_token ?? null;
}

async function assembleProposal(quote: Quote): Promise<ProposalData | null> {
  const supabase = await createSupabaseServerClient();
  const [company, customer, property, visit, packageResult, lines] = await Promise.all([
    supabase.from("organizations").select("name, phone, email, website, address, logo_url").eq("id", quote.organization_id).maybeSingle(),
    supabase.from("customers").select("first_name, last_name, phone, email, billing_address, billing_street, billing_city, billing_state, billing_zip").eq("organization_id", quote.organization_id).eq("id", quote.customer_id).maybeSingle(),
    supabase.from("properties").select("property_name, address_line_1, address_line_2, city, state, zip, property_type").eq("organization_id", quote.organization_id).eq("id", quote.property_id).maybeSingle(),
    quote.site_visit_id ? supabase.from("site_visits").select("preferred_style, preferred_colors").eq("organization_id", quote.organization_id).eq("id", quote.site_visit_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    quote.package_id ? supabase.from("packages").select("id, name, description").eq("organization_id", quote.organization_id).eq("id", quote.package_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("quote_line_items").select("id, description, quantity, unit, unit_price, line_total, notes").eq("organization_id", quote.organization_id).eq("quote_id", quote.id).eq("customer_visible", true).order("created_at"),
  ]);
  if (company.error || customer.error || property.error || visit.error || packageResult.error || lines.error || !company.data || !customer.data || !property.data) return null;
  let packageData: ProposalData["package"] = null;
  if (packageResult.data) { const { data: packageItems, error: packageItemsError } = await supabase.from("package_items").select("catalog_item_id, quantity, unit, notes").eq("organization_id", quote.organization_id).eq("package_id", packageResult.data.id).eq("included", true); if (packageItemsError) return null; const catalogIds = [...new Set((packageItems ?? []).map((item) => item.catalog_item_id))]; const { data: catalog, error: catalogError } = catalogIds.length ? await supabase.from("catalog_items").select("id, name").eq("organization_id", quote.organization_id).in("id", catalogIds) : { data: [], error: null }; if (catalogError) return null; const names = new Map((catalog ?? []).map((item) => [item.id, item.name])); packageData = { name: packageResult.data.name, description: packageResult.data.description, includedItems: (packageItems ?? []).flatMap((item) => { const name = names.get(item.catalog_item_id); return name ? [{ name, quantity: item.quantity, unit: item.unit, notes: item.notes }] : []; }) }; }
  const safeQuote = { id: quote.id, quote_number: quote.quote_number, status: quote.status, quote_date: quote.quote_date, expiration_date: quote.expiration_date, subtotal: quote.subtotal, discount: quote.discount, total: quote.total, deposit_required: quote.deposit_required, balance_due: quote.balance_due, customer_notes: quote.customer_notes, terms: quote.terms, proposal_token: quote.proposal_token, proposal_viewed_at: quote.proposal_viewed_at, proposal_sent_at: quote.proposal_sent_at, approved_at: quote.approved_at, declined_at: quote.declined_at, customer_approval_name: quote.customer_approval_name, customer_approval_email: quote.customer_approval_email, customer_decline_reason: quote.customer_decline_reason };
  return { quote: safeQuote, company: company.data, customer: customer.data, property: property.data, siteVisit: visit.data, package: packageData, lineItems: lines.data ?? [] };
}

export async function getProposalForQuote(organizationId: string, quoteId: string) { const token = await ensureProposalToken(organizationId, quoteId); if (!token) return null; const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("organization_id", organizationId).eq("id", quoteId).maybeSingle(); if (error) throw new Error("We could not load this proposal."); return data ? assembleProposal(data) : null; }
export async function getPublicProposal(token: string) { if (!validProposalToken(token)) return null; const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("quotes").select("*").eq("proposal_token", token).maybeSingle(); if (error || !data) return null; if (data.status === "sent") { const now = new Date().toISOString(); const { data: viewed } = await supabase.from("quotes").update({ status: "viewed", proposal_viewed_at: data.proposal_viewed_at ?? now, updated_at: now }).eq("id", data.id).eq("organization_id", data.organization_id).eq("status", "sent").select("*").maybeSingle(); if (viewed) return assembleProposal(viewed); } return assembleProposal(data); }
