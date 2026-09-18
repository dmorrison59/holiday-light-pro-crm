"use server";

import { redirect } from "next/navigation";
import type { CrmActionState } from "@/app/actions/customers";
import { requireOrganization } from "@/lib/auth/current";
import { ensureProposalToken, validProposalToken } from "@/lib/proposals";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const value = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

async function updateCustomer(
  organizationId: string,
  customerId: string,
  status: "quote_sent" | "approved"
) {
  const supabase = await createSupabaseServerClient();
  const allowed =
    status === "quote_sent"
      ? ["lead", "contacted", "site_visit_scheduled", "measured"]
      : ["lead", "contacted", "site_visit_scheduled", "measured", "quote_sent"];

  await supabase
    .from("customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .eq("id", customerId)
    .in("status", allowed);
}

export async function generateProposalLinkAction(
  _state: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  const quoteId = value(formData, "quote_id");
  if (!quoteId) return { error: "Quote information is missing." };

  const { organization } = await requireOrganization();
  try {
    const token = await ensureProposalToken(organization.id, quoteId);
    if (!token) return { error: "Quote not found." };
  } catch {
    return { error: "We could not generate the proposal link." };
  }

  redirect(`/quotes/${quoteId}?proposal=ready`);
}

export async function markProposalSentAction(
  _state: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  const quoteId = value(formData, "quote_id");
  if (!quoteId) return { error: "Quote information is missing." };

  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();

  let token: string | null;
  try {
    token = await ensureProposalToken(organization.id, quoteId);
  } catch {
    return { error: "We could not prepare the proposal link." };
  }
  if (!token) return { error: "Quote not found." };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("quotes")
    .update({ status: "sent", proposal_sent_at: now, updated_at: now })
    .eq("organization_id", organization.id)
    .eq("id", quoteId)
    .in("status", ["draft", "sent", "viewed"])
    .select("customer_id")
    .maybeSingle();

  if (error) return { error: "We could not mark this proposal as sent." };
  if (!data) return { error: "Approved, declined, or expired proposals cannot be marked sent." };

  await updateCustomer(organization.id, data.customer_id, "quote_sent");
  redirect(`/quotes/${quoteId}?status=sent`);
}

export async function approveProposalAction(
  _state: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  const token = value(formData, "proposal_token");
  const name = value(formData, "customer_name");
  const email = value(formData, "customer_email");

  if (!validProposalToken(token)) return { error: "Proposal not found." };
  if (!name) return { error: "Enter your name to approve this proposal." };
  if (formData.get("approval_confirmed") !== "on") {
    return { error: "Confirm that you approve this proposal." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("approve_public_proposal", {
    p_token: token,
    p_name: name,
    p_email: email || null,
  });

  if (error || !data?.ok) {
    return { error: data?.error ?? "We could not approve this proposal. Please contact the installer." };
  }

  redirect(`/proposal/${token}?decision=approved`);
}

export async function declineProposalAction(
  _state: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  const token = value(formData, "proposal_token");
  const reason = value(formData, "decline_reason");

  if (!validProposalToken(token)) return { error: "Proposal not found." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("decline_public_proposal", {
    p_token: token,
    p_reason: reason || null,
  });

  if (error || !data?.ok) {
    return { error: data?.error ?? "We could not decline this proposal. Please contact the installer." };
  }

  redirect(`/proposal/${token}?decision=declined`);
}