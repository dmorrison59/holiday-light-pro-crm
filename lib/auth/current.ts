import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export interface CurrentAuthContext {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(userId?: string) {
  const supabase = await createSupabaseServerClient();
  const resolvedUserId = userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!resolvedUserId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", resolvedUserId)
    .maybeSingle();

  return data;
}

export async function getCurrentOrganization(profile?: Profile | null) {
  const resolvedProfile = profile ?? (await getCurrentProfile());
  if (!resolvedProfile) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", resolvedProfile.organization_id)
    .maybeSingle();

  return data;
}

export async function getCurrentAuthContext(): Promise<CurrentAuthContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null, organization: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("We could not load your company information. Please try again.");
  }

  if (!profile) return { user, profile: null, organization: null };

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (organizationError) {
    throw new Error("We could not load your company information. Please try again.");
  }

  return { user, profile, organization };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOrganization() {
  const context = await getCurrentAuthContext();
  if (!context.user) redirect("/login");
  if (!context.profile || !context.organization) redirect("/onboarding");

  return {
    user: context.user,
    profile: context.profile,
    organization: context.organization,
  };
}
