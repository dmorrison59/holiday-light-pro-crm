"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth/current";
import { currentRenewalSeason } from "@/lib/rebooking";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RenewalQuoteActionState = { error?: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createRenewalQuoteAction(
  _state: RenewalQuoteActionState,
  formData: FormData,
): Promise<RenewalQuoteActionState> {
  const sourceJobId = String(formData.get("source_job_id") ?? "").trim();
  if (!uuid.test(sourceJobId)) return { error: "The prior job could not be identified." };

  const { organization } = await requireOrganization();
  const season = currentRenewalSeason();
  const supabase = await createSupabaseServerClient();
  const { data: quoteId, error } = await supabase.rpc("create_renewal_quote", {
    p_source_job_id: sourceJobId,
    p_renewal_season: season,
  });

  if (error || !quoteId) {
    console.error("[rebooking] renewal creation failed", {
      organization_id: organization.id,
      source_job_id: sourceJobId,
      season,
      code: error?.code,
    });
    if (error?.code === "42883" || error?.code === "PGRST202") return { error: "The renewal database migration has not been applied." };
    return { error: "This job is no longer eligible for a renewal quote." };
  }

  revalidatePath("/rebooking");
  revalidatePath("/quotes");
  redirect(`/quotes/${quoteId}/edit?renewal=created`);
}
