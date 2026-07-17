import { createClient } from "@supabase/supabase-js";
import { requiredTestEnvironment } from "./test-env";

const TEST_EMAIL_PREFIX = "hlcrm-e2e-";

function adminClient() {
  const env = requiredTestEnvironment();
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

export function uniqueTestEmail(runId: string, owner: "primary" | "secondary" | "customer") {
  const { emailDomain } = requiredTestEnvironment();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(emailDomain)) throw new Error("E2E_TEST_EMAIL_DOMAIN must be a valid domain controlled or reserved for testing.");
  return `${TEST_EMAIL_PREFIX}${owner}-${runId}@${emailDomain}`;
}

export async function createConfirmedTestUser(email: string, password: string, firstName: string, lastName: string) {
  if (!email.startsWith(TEST_EMAIL_PREFIX)) throw new Error("Refusing to create an Admin API user without the E2E email prefix.");
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, e2e_test: true, e2e_suite: "holiday-lights-crm" },
  });
  if (error || !data.user) throw new Error(`Test user creation failed: ${error?.message ?? "no user returned"}`);
  return data.user.id;
}

export async function cleanupConfirmedTestUser(userId: string, expectedEmail: string) {
  if (!expectedEmail.startsWith(TEST_EMAIL_PREFIX)) throw new Error("Refusing cleanup without the E2E email prefix.");
  const supabase = adminClient();
  const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError) throw new Error(`Unable to verify E2E cleanup user: ${userError.message}`);
  const user = userResult.user;
  if (!user || user.email !== expectedEmail || user.user_metadata?.e2e_test !== true || user.user_metadata?.e2e_suite !== "holiday-lights-crm") {
    throw new Error("Refusing cleanup because the user lacks the required E2E identity markers.");
  }
  const { data: profile, error: profileError } = await supabase.from("profiles").select("organization_id").eq("user_id", userId).maybeSingle();
  if (profileError) throw new Error(`Unable to inspect E2E organization cleanup: ${profileError.message}`);
  if (profile?.organization_id) {
    const { error: organizationError } = await supabase.from("organizations").delete().eq("id", profile.organization_id);
    if (organizationError) throw new Error(`Unable to delete the marked E2E organization: ${organizationError.message}`);
  }
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) throw new Error(`Unable to delete the marked E2E user: ${deleteError.message}`);
}
