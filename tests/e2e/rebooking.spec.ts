import { expect, test } from "@playwright/test";
import {
  approveRenewalQuoteForScheduling,
  cancelRenewalJobWithRetainedInstallDate,
  cleanupConfirmedTestUser,
  createConfirmedTestUser,
  createRenewalQuoteAsUser,
  getOrganizationOperationalCounts,
  getRenewalAudit,
  seedRebookingFixture,
  seedRenewalJobWithActiveInstallEvent,
  uniqueTestEmail,
} from "./support/supabase-admin";

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();
const primaryEmail = uniqueTestEmail(`${stamp}-renew-primary`, "primary");
const secondaryEmail = uniqueTestEmail(`${stamp}-renew-secondary`, "secondary");
const password = `Holiday!${stamp}`;

async function fillNamed(page: import("@playwright/test").Page, name: string, value: string) {
  await page.locator(`input[name="${name}"], textarea[name="${name}"]`).fill(value);
}

async function loginAndOnboard(page: import("@playwright/test").Page, email: string, businessName: string) {
  await page.goto("/login");
  await fillNamed(page, "email", email);
  await fillNamed(page, "password", password);
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await fillNamed(page, "company_name", businessName);
  await fillNamed(page, "phone", "724-555-0147");
  await fillNamed(page, "company_email", email);
  await fillNamed(page, "address", "Greensburg, Pennsylvania");
  await page.getByRole("button", { name: "Create Company" }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
}

test("eligible prior job creates one isolated current-season draft renewal", async ({ page, context }) => {
  let primaryUserId = "";
  let secondaryUserId = "";
  try {
    primaryUserId = await createConfirmedTestUser(primaryEmail, password, "Renewal", "Owner");
    await loginAndOnboard(page, primaryEmail, "Renewal Primary Co");
    const fixture = await seedRebookingFixture(primaryUserId, primaryEmail);
    const countsBefore = await getOrganizationOperationalCounts(fixture.organizationId);

    await page.goto("/rebooking");
    await expect(page.getByRole("heading", { name: "Rebooking Center" })).toBeVisible();
    await expect(page.getByText(fixture.eligible.customerName, { exact: true })).toBeVisible();
    await expect(page.getByText(fixture.eligible.propertyLabel, { exact: true })).toBeVisible();
    for (const excludedName of fixture.excludedCustomerNames) await expect(page.getByText(excludedName, { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Create Renewal Quote" }).click();
    await expect(page).toHaveURL(/\/quotes\/[0-9a-f-]+\/edit\?renewal=created$/);
    const quoteId = new URL(page.url()).pathname.split("/")[2];
    const audit = await getRenewalAudit(quoteId);
    expect(audit.quote.status).toBe("draft");
    expect(audit.quote.renewal_source_job_id).toBe(fixture.eligible.sourceJobId);
    expect(audit.quote.renewal_season).toBe(fixture.season);
    expect(audit.quote.total).toBe(fixture.eligible.total);
    expect(audit.quote.discount).toBe(fixture.eligible.discount);
    expect(audit.quote.deposit_type).toBe(fixture.eligible.depositType);
    expect(audit.quote.deposit_value).toBe(fixture.eligible.depositValue);
    expect(audit.quote.terms).toBe(fixture.eligible.terms);
    expect(audit.quote.proposal_token).toBeNull();
    expect(audit.quote.proposal_sent_at).toBeNull();
    expect(audit.quote.approved_at).toBeNull();
    expect(audit.quote.declined_at).toBeNull();
    expect(audit.lines.map((line) => line.description).sort()).toEqual([...fixture.eligible.lineDescriptions].sort());
    expect(audit.jobCount).toBe(0);
    expect(audit.paymentCount).toBe(0);
    expect(audit.fileCount).toBe(0);
    expect(await getOrganizationOperationalCounts(fixture.organizationId)).toEqual(countsBefore);

    const [duplicateA, duplicateB] = await Promise.all([
      createRenewalQuoteAsUser(primaryEmail, password, fixture.eligible.sourceJobId, fixture.season),
      createRenewalQuoteAsUser(primaryEmail, password, fixture.eligible.sourceJobId, fixture.season),
    ]);
    expect(duplicateA.errorCode).toBeNull();
    expect(duplicateB.errorCode).toBeNull();
    expect(duplicateA.quoteId).toBe(quoteId);
    expect(duplicateB.quoteId).toBe(quoteId);

    await page.goto("/rebooking");
    await expect(page.getByRole("link", { name: "Continue Renewal Quote" })).toHaveAttribute("href", `/quotes/${quoteId}/edit`);

    await approveRenewalQuoteForScheduling(quoteId);
    await page.goto("/rebooking");
    let renewalRow = page.getByRole("row").filter({ hasText: fixture.eligible.customerName });
    await expect(renewalRow.getByText("Approved", { exact: true })).toBeVisible();
    await expect(renewalRow.getByText("Scheduled", { exact: true })).not.toBeVisible();

    const renewalJobId = await seedRenewalJobWithActiveInstallEvent(quoteId, fixture.season);
    await page.goto("/rebooking");
    renewalRow = page.getByRole("row").filter({ hasText: fixture.eligible.customerName });
    await expect(renewalRow.getByText("Scheduled", { exact: true })).toBeVisible();

    await cancelRenewalJobWithRetainedInstallDate(renewalJobId, fixture.season);
    await page.goto("/rebooking");
    renewalRow = page.getByRole("row").filter({ hasText: fixture.eligible.customerName });
    await expect(renewalRow.getByText("Approved", { exact: true })).toBeVisible();
    await expect(renewalRow.getByText("Scheduled", { exact: true })).not.toBeVisible();

    await context.clearCookies();
    secondaryUserId = await createConfirmedTestUser(secondaryEmail, password, "Other", "Owner");
    await loginAndOnboard(page, secondaryEmail, "Renewal Secondary Co");
    const crossTenant = await createRenewalQuoteAsUser(secondaryEmail, password, fixture.eligible.sourceJobId, fixture.season);
    expect(crossTenant.quoteId).toBeNull();
    expect(crossTenant.errorCode).not.toBeNull();
    await page.goto("/rebooking");
    await expect(page.getByText(fixture.eligible.customerName, { exact: true })).not.toBeVisible();
  } finally {
    if (secondaryUserId) await cleanupConfirmedTestUser(secondaryUserId, secondaryEmail);
    if (primaryUserId) await cleanupConfirmedTestUser(primaryUserId, primaryEmail);
  }
});
