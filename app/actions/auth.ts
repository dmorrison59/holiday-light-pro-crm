"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
}

const readRequired = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequired(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter both your email and password." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? "We could not log you in. Check your details." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: "You are signed in, but your company profile could not be loaded." };
  }

  redirect(profile ? "/dashboard" : "/onboarding");
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = readRequired(formData, "first_name");
  const lastName = readRequired(formData, "last_name");
  const email = readRequired(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!firstName || !lastName || !email || !password) {
    return { error: "Complete every required field." };
  }
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      ...(origin ? { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` } : {}),
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "We could not create your account." };
  }

  if (!data.session) {
    redirect(
      "/login?message=Check%20your%20email%20to%20confirm%20your%20account%2C%20then%20log%20in.",
    );
  }

  redirect("/onboarding");
}

export async function onboardingAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const companyName = readRequired(formData, "company_name");
  const firstName = readRequired(formData, "first_name");
  const lastName = readRequired(formData, "last_name");
  const phone = readRequired(formData, "phone");
  const email = readRequired(formData, "company_email");
  const website = readRequired(formData, "website");
  const address = readRequired(formData, "address");

  if (!companyName || !firstName || !lastName) {
    return { error: "Company name, first name, and last name are required." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Log in and try again." };

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfileError) return { error: "We could not check your account setup." };
  if (existingProfile) redirect("/dashboard");

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: companyName,
      phone: phone || null,
      email: email || null,
      website: website || null,
      address: address || null,
    })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return { error: organizationError?.message ?? "We could not create your company." };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: user.id,
    organization_id: organization.id,
    first_name: firstName,
    last_name: lastName,
    role: "owner",
  });

  if (profileError) {
    // Avoid leaving an orphan organization if the second onboarding step fails.
    await supabase.from("organizations").delete().eq("id", organization.id);
    return { error: profileError.message || "We could not finish your company profile." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
