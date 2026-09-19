import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
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

export async function seedRequiredCatalogItems(userId: string, expectedEmail: string) {
  if (!expectedEmail.startsWith(TEST_EMAIL_PREFIX)) throw new Error("Refusing E2E catalog setup without the test email prefix.");
  const supabase = adminClient();
  const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError) throw new Error(`Unable to verify E2E catalog user: ${userError.message}`);
  const user = userResult.user;
  if (!user || user.email !== expectedEmail || user.user_metadata?.e2e_test !== true || user.user_metadata?.e2e_suite !== "holiday-lights-crm") {
    throw new Error("Refusing catalog setup because the user lacks the required E2E identity markers.");
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("organization_id").eq("user_id", userId).single();
  if (profileError || !profile?.organization_id) throw new Error(`Unable to find the E2E organization: ${profileError?.message ?? "no organization returned"}`);

  const requiredItems = [
    { name: "C9 Warm White Roofline Lights", category: "Roofline Lights", pricing_method: "per_foot", unit_type: "ft", unit_price: "12", cost: "2.5", customer_facing: true, track_inventory: true, quantity_available: "1000", reorder_threshold: "200" },
    { name: "Bush Lights", category: "Bush Lights", pricing_method: "per_bush", unit_type: "bush", unit_price: "75", cost: "20", customer_facing: true, track_inventory: false, quantity_available: "0", reorder_threshold: "0" },
    { name: "36-inch Wreath", category: "Wreaths", pricing_method: "each", unit_type: "each", unit_price: "85", cost: "45", customer_facing: true, track_inventory: true, quantity_available: "20", reorder_threshold: "5" },
  ];
  const { data: existing, error: existingError } = await supabase.from("catalog_items").select("name").eq("organization_id", profile.organization_id).in("name", requiredItems.map((item) => item.name));
  if (existingError) throw new Error(`Unable to verify E2E catalog items: ${existingError.message}`);
  const existingNames = new Set((existing ?? []).map((item) => item.name));
  const rows = requiredItems.filter((item) => !existingNames.has(item.name)).map((item) => ({ ...item, organization_id: profile.organization_id, active: true, quantity_reserved: "0" }));
  if (rows.length) {
    const { error } = await supabase.from("catalog_items").insert(rows);
    if (error) throw new Error(`Unable to create required E2E catalog items: ${error.message}`);
  }
}

type PublicProposalFixture = {
  quoteId: string;
  token: string;
  customerId: string;
  propertyId: string;
  organizationId: string;
  companyName: string;
  customerName: string;
  internalMarker: string;
};

async function verifiedTestOrganization(userId: string, expectedEmail: string) {
  if (!expectedEmail.startsWith(TEST_EMAIL_PREFIX)) throw new Error("Refusing E2E proposal setup without the test email prefix.");
  const supabase = adminClient();
  const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError) throw new Error(`Unable to verify E2E proposal user: ${userError.message}`);
  const user = userResult.user;
  if (!user || user.email !== expectedEmail || user.user_metadata?.e2e_test !== true || user.user_metadata?.e2e_suite !== "holiday-lights-crm") {
    throw new Error("Refusing proposal setup because the user lacks the required E2E identity markers.");
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("organization_id").eq("user_id", userId).single();
  if (profileError || !profile?.organization_id) throw new Error(`Unable to find the E2E organization: ${profileError?.message ?? "no organization returned"}`);
  return { supabase, organizationId: profile.organization_id };
}

export async function seedPublicProposalFixture(
  userId: string,
  expectedEmail: string,
  companyName: string,
  customerFirstName: string,
): Promise<PublicProposalFixture> {
  const { supabase, organizationId } = await verifiedTestOrganization(userId, expectedEmail);
  const token = randomUUID();
  const internalMarker = `internal-${randomUUID()}`;
  const customerName = `${customerFirstName} Proposal`;

  const { data: customer, error: customerError } = await supabase.from("customers").insert({
    organization_id: organizationId,
    first_name: customerFirstName,
    last_name: "Proposal",
    email: expectedEmail,
    billing_street: "101 Public Test Lane",
    billing_city: "Greensburg",
    billing_state: "PA",
    billing_zip: "15601",
    status: "quote_sent",
  }).select("id").single();
  if (customerError || !customer) throw new Error(`Unable to create proposal customer: ${customerError?.message ?? "no customer returned"}`);

  const { data: property, error: propertyError } = await supabase.from("properties").insert({
    organization_id: organizationId,
    customer_id: customer.id,
    property_name: `${customerFirstName} Test Property`,
    address_line_1: "101 Public Test Lane",
    city: "Greensburg",
    state: "PA",
    zip: "15601",
  }).select("id").single();
  if (propertyError || !property) throw new Error(`Unable to create proposal property: ${propertyError?.message ?? "no property returned"}`);

  const { data: quote, error: quoteError } = await supabase.from("quotes").insert({
    organization_id: organizationId,
    customer_id: customer.id,
    property_id: property.id,
    quote_number: `E2E-${token.slice(0, 8).toUpperCase()}`,
    status: "sent",
    quote_date: "2026-09-17",
    expiration_date: "2027-09-17",
    subtotal: "1250",
    discount: "0",
    total: "1250",
    deposit_required: "625",
    deposit_type: "percentage",
    deposit_value: "50",
    balance_due: "625",
    customer_notes: "Public proposal fixture",
    internal_notes: internalMarker,
    proposal_token: token,
    proposal_sent_at: new Date().toISOString(),
  }).select("id").single();
  if (quoteError || !quote) throw new Error(`Unable to create proposal quote: ${quoteError?.message ?? "no quote returned"}`);

  const { error: lineError } = await supabase.from("quote_line_items").insert({
    organization_id: organizationId,
    quote_id: quote.id,
    description: `${customerFirstName} customer-visible lights`,
    quantity: "100",
    unit: "ft",
    unit_price: "12.5",
    multiplier: "1",
    line_total: "1250",
    customer_visible: true,
    notes: "Customer-safe line item",
  });
  if (lineError) throw new Error(`Unable to create proposal line item: ${lineError.message}`);

  return { quoteId: quote.id, token, customerId: customer.id, propertyId: property.id, organizationId, companyName, customerName, internalMarker };
}

export async function seedCrossTenantProposalFixture(
  userId: string,
  expectedEmail: string,
  foreignCustomerId: string,
  foreignPropertyId: string,
) {
  const { supabase, organizationId } = await verifiedTestOrganization(userId, expectedEmail);
  const token = randomUUID();
  const { data, error } = await supabase.from("quotes").insert({
    organization_id: organizationId,
    customer_id: foreignCustomerId,
    property_id: foreignPropertyId,
    quote_number: `E2E-CROSS-${token.slice(0, 8).toUpperCase()}`,
    status: "sent",
    quote_date: "2026-09-17",
    expiration_date: "2027-09-17",
    subtotal: "100",
    discount: "0",
    total: "100",
    deposit_required: "50",
    deposit_type: "percentage",
    deposit_value: "50",
    balance_due: "50",
    proposal_token: token,
  }).select("id").single();
  if (error || !data) throw new Error(`Unable to create cross-tenant proposal fixture: ${error?.message ?? "no quote returned"}`);
  return { quoteId: data.id, token };
}

export async function getProposalStatus(quoteId: string) {
  const supabase = adminClient();
  const { data, error } = await supabase.from("quotes").select("status").eq("id", quoteId).single();
  if (error || !data) throw new Error(`Unable to read proposal status: ${error?.message ?? "no quote returned"}`);
  return data.status;
}

type RebookingSource = {
  sourceJobId: string;
  sourceQuoteId: string;
  customerName: string;
  propertyLabel: string;
  total: string;
  discount: string;
  depositType: string;
  depositValue: string;
  terms: string;
  lineDescriptions: string[];
};

export type RebookingFixture = {
  organizationId: string;
  season: number;
  eligible: RebookingSource;
  excludedCustomerNames: string[];
};

export async function seedRebookingFixture(userId: string, expectedEmail: string): Promise<RebookingFixture> {
  const { supabase, organizationId } = await verifiedTestOrganization(userId, expectedEmail);
  const season = new Date().getUTCFullYear();
  const previousSeason = season - 1;

  async function createSource(
    label: string,
    jobStatus: string,
    sourceSeason: number,
    completedEvent: boolean,
    withSideEffects = false,
  ): Promise<RebookingSource> {
    const token = randomUUID();
    const customerName = `${label} Customer`;
    const propertyLabel = `${label} Property`;
    const { data: customer, error: customerError } = await supabase.from("customers").insert({
      organization_id: organizationId,
      first_name: label,
      last_name: "Customer",
      email: expectedEmail,
      status: "active_customer",
    }).select("id").single();
    if (customerError || !customer) throw new Error(`Unable to create ${label} customer: ${customerError?.message ?? "no customer returned"}`);

    const { data: property, error: propertyError } = await supabase.from("properties").insert({
      organization_id: organizationId,
      customer_id: customer.id,
      property_name: propertyLabel,
      address_line_1: `${sourceSeason} Renewal Test Lane`,
      city: "Greensburg",
      state: "PA",
      zip: "15601",
    }).select("id").single();
    if (propertyError || !property) throw new Error(`Unable to create ${label} property: ${propertyError?.message ?? "no property returned"}`);

    const { data: quote, error: quoteError } = await supabase.from("quotes").insert({
      organization_id: organizationId,
      customer_id: customer.id,
      property_id: property.id,
      quote_number: `E2E-RENEW-${token.slice(0, 8).toUpperCase()}`,
      status: "approved",
      quote_date: `${sourceSeason}-09-01`,
      expiration_date: `${sourceSeason}-09-15`,
      subtotal: "1450",
      discount: "50",
      total: "1400",
      deposit_required: "420",
      deposit_type: "percentage",
      deposit_value: "30",
      balance_due: "980",
      customer_notes: "Reuse the prior warm-white layout.",
      terms: "Renewal fixture terms remain editable.",
      internal_notes: "Prior-season renewal fixture.",
    }).select("id").single();
    if (quoteError || !quote) throw new Error(`Unable to create ${label} quote: ${quoteError?.message ?? "no quote returned"}`);

    const lineDescriptions = [`${label} roofline`, `${label} wreath service`];
    const { error: linesError } = await supabase.from("quote_line_items").insert([
      { organization_id: organizationId, quote_id: quote.id, description: lineDescriptions[0], quantity: "100", unit: "ft", unit_price: "12.5", multiplier: "1", line_total: "1250", customer_visible: true, notes: "Historical roofline price" },
      { organization_id: organizationId, quote_id: quote.id, description: lineDescriptions[1], quantity: "2", unit: "each", unit_price: "100", multiplier: "1", line_total: "200", customer_visible: true, notes: "Historical wreath price" },
    ]);
    if (linesError) throw new Error(`Unable to create ${label} quote lines: ${linesError.message}`);

    const { data: job, error: jobError } = await supabase.from("jobs").insert({
      organization_id: organizationId,
      customer_id: customer.id,
      property_id: property.id,
      quote_id: quote.id,
      job_number: `E2E-JOB-${token.slice(0, 8).toUpperCase()}`,
      status: jobStatus,
      install_date: `${sourceSeason}-11-15`,
      payment_status: "paid",
      storage_notes: "Prior-season bins are labeled by roof section.",
    }).select("id").single();
    if (jobError || !job) throw new Error(`Unable to create ${label} job: ${jobError?.message ?? "no job returned"}`);

    if (completedEvent) {
      const { error } = await supabase.from("schedule_events").insert({ organization_id: organizationId, customer_id: customer.id, property_id: property.id, job_id: job.id, event_type: "install", event_date: `${sourceSeason}-11-15`, status: "completed", notes: "Completed source install" });
      if (error) throw new Error(`Unable to create ${label} completion event: ${error.message}`);
    }

    if (withSideEffects) {
      const results = await Promise.all([
        supabase.from("job_materials").insert({ organization_id: organizationId, job_id: job.id, description: "Prior-season labeled light set", quantity: "100", unit: "ft", reserved_quantity: "0", used_quantity: "100", returned_quantity: "100", status: "Returned", source: "E2E source", storage_location: "Bin E2E" }),
        supabase.from("payments").insert({ organization_id: organizationId, customer_id: customer.id, job_id: job.id, quote_id: quote.id, amount: "1400", payment_type: "final", status: "paid", payment_date: `${sourceSeason}-12-01T12:00:00Z` }),
        supabase.from("files").insert({ organization_id: organizationId, related_type: "jobs", related_id: job.id, file_url: `${organizationId}/jobs/${job.id}/e2e-source.jpg`, storage_path: `${organizationId}/jobs/${job.id}/e2e-source.jpg`, file_name: "e2e-source.jpg", file_type: "image", mime_type: "image/jpeg", description: "Source job fixture only" }),
      ]);
      const sideEffectError = results.find((result) => result.error)?.error;
      if (sideEffectError) throw new Error(`Unable to create rebooking side-effect fixture: ${sideEffectError.message}`);
    }

    return { sourceJobId: job.id, sourceQuoteId: quote.id, customerName, propertyLabel, total: "1400", discount: "50", depositType: "percentage", depositValue: "30", terms: "Renewal fixture terms remain editable.", lineDescriptions };
  }

  const eligible = await createSource("Eligible", "stored", previousSeason, true, true);
  const canceled = await createSource("Canceled", "canceled", previousSeason, true);
  const currentSeason = await createSource("Current", "complete", season, true);
  const incomplete = await createSource("Incomplete", "approved", previousSeason, false);
  return { organizationId, season, eligible, excludedCustomerNames: [canceled.customerName, currentSeason.customerName, incomplete.customerName] };
}

export async function createRenewalQuoteAsUser(email: string, password: string, sourceJobId: string, season: number) {
  if (!email.startsWith(TEST_EMAIL_PREFIX)) throw new Error("Refusing renewal RPC login without the E2E email prefix.");
  const env = requiredTestEnvironment();
  const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } });
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Unable to sign in for renewal RPC coverage: ${signInError.message}`);
  const { data, error } = await supabase.rpc("create_renewal_quote", { p_source_job_id: sourceJobId, p_renewal_season: season });
  return { quoteId: data as string | null, errorCode: error?.code ?? null };
}

export async function getRenewalAudit(quoteId: string) {
  const supabase = adminClient();
  const { data: quote, error: quoteError } = await supabase.from("quotes").select("*").eq("id", quoteId).single();
  if (quoteError || !quote) throw new Error(`Unable to load renewal quote: ${quoteError?.message ?? "no quote returned"}`);
  const [lines, jobs, payments, files] = await Promise.all([
    supabase.from("quote_line_items").select("description, quantity, unit, unit_price, multiplier, line_total, customer_visible, notes").eq("quote_id", quoteId).order("created_at"),
    supabase.from("jobs").select("id").eq("quote_id", quoteId),
    supabase.from("payments").select("id").eq("quote_id", quoteId),
    supabase.from("files").select("id").eq("related_id", quoteId),
  ]);
  const error = [lines.error, jobs.error, payments.error, files.error].find(Boolean);
  if (error) throw new Error(`Unable to audit renewal side effects: ${error.message}`);
  return { quote, lines: lines.data ?? [], jobCount: jobs.data?.length ?? 0, paymentCount: payments.data?.length ?? 0, fileCount: files.data?.length ?? 0 };
}

export async function getOrganizationOperationalCounts(organizationId: string) {
  const supabase = adminClient();
  const tables = ["jobs", "schedule_events", "job_materials", "payments", "files"] as const;
  const results = await Promise.all(tables.map((table) => supabase.from(table).select("id", { count: "exact", head: true }).eq("organization_id", organizationId)));
  const error = results.find((result) => result.error)?.error;
  if (error) throw new Error(`Unable to count renewal side effects: ${error.message}`);
  return Object.fromEntries(tables.map((table, index) => [table, results[index].count ?? 0])) as Record<(typeof tables)[number], number>;
}

export async function approveRenewalQuoteForScheduling(quoteId: string) {
  const supabase = adminClient();
  const { error } = await supabase.from("quotes").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", quoteId);
  if (error) throw new Error(`Unable to approve renewal fixture: ${error.message}`);
}

export async function seedRenewalJobWithActiveInstallEvent(quoteId: string, season: number) {
  const supabase = adminClient();
  const { data: quote, error: quoteError } = await supabase.from("quotes").select("organization_id, customer_id, property_id").eq("id", quoteId).single();
  if (quoteError || !quote) throw new Error(`Unable to load renewal quote for scheduling: ${quoteError?.message ?? "no quote returned"}`);
  const token = randomUUID();
  const { data: job, error: jobError } = await supabase.from("jobs").insert({
    organization_id: quote.organization_id,
    customer_id: quote.customer_id,
    property_id: quote.property_id,
    quote_id: quoteId,
    job_number: `E2E-RENEW-JOB-${token.slice(0, 8).toUpperCase()}`,
    status: "approved",
    install_date: null,
    payment_status: "unpaid",
  }).select("id").single();
  if (jobError || !job) throw new Error(`Unable to create renewal scheduling job: ${jobError?.message ?? "no job returned"}`);
  const { error: eventError } = await supabase.from("schedule_events").insert({
    organization_id: quote.organization_id,
    customer_id: quote.customer_id,
    property_id: quote.property_id,
    job_id: job.id,
    event_type: "install",
    event_date: `${season}-11-15`,
    status: "scheduled",
    notes: "Active renewal install fixture",
  });
  if (eventError) throw new Error(`Unable to create renewal install event: ${eventError.message}`);
  return job.id;
}

export async function cancelRenewalJobWithRetainedInstallDate(jobId: string, season: number) {
  const supabase = adminClient();
  const { error } = await supabase.from("jobs").update({ status: "canceled", install_date: `${season}-11-15` }).eq("id", jobId);
  if (error) throw new Error(`Unable to cancel renewal fixture job: ${error.message}`);
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
