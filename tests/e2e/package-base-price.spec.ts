import { expect, test } from "@playwright/test";
import {
  cleanupConfirmedTestUser,
  createConfirmedTestUser,
  createPriorSeasonJobForPackageQuote,
  createRenewalQuoteAsUser,
  getJobMaterialAudit,
  getPackageQuoteAudit,
  getRenewalAudit,
  seedPackageBasePriceFixture,
  uniqueTestEmail,
} from "./support/supabase-admin";

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();
const ownerEmail = uniqueTestEmail(`${stamp}-package-price`, "primary");
const password = `Holiday!${stamp}`;

async function fillNamed(page: import("@playwright/test").Page, name: string, value: string) {
  await page.locator(`input[name="${name}"], textarea[name="${name}"]`).fill(value);
}

async function loginAndOnboard(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await fillNamed(page, "email", email);
  await fillNamed(page, "password", password);
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await fillNamed(page, "company_name", "Package Pricing E2E Co");
  await fillNamed(page, "phone", "724-555-0195");
  await fillNamed(page, "company_email", email);
  await fillNamed(page, "address", "Greensburg, Pennsylvania");
  await page.getByRole("button", { name: "Create Company" }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
}

test("fixed-price package adds one base line without double charging or material side effects", async ({ page }) => {
  let userId = "";
  try {
    userId = await createConfirmedTestUser(ownerEmail, password, "Package", "Owner");
    await loginAndOnboard(page, ownerEmail);
    const fixture = await seedPackageBasePriceFixture(userId, ownerEmail);

    await page.goto(`/quotes/new?customer_id=${fixture.customerId}&property_id=${fixture.propertyId}`);
    await page.locator('[name="package_id"]').selectOption(fixture.packageId);
    await page.locator('[name="package_id"]').selectOption("");
    await page.locator('[name="package_id"]').selectOption(fixture.packageId);
    await page.getByRole("button", { name: "Add Upgrade" }).click();
    await page.getByRole("button", { name: "Save Draft Quote" }).click();
    await expect(page).toHaveURL(/\/quotes\/[0-9a-f-]+\?created=1$/);
    const quoteId = new URL(page.url()).pathname.split("/")[2];

    let audit = await getPackageQuoteAudit(quoteId);
    const baseLines = audit.lines.filter((line) => line.catalog_item_id === null && line.unit === "package" && line.description === fixture.packageName);
    expect(baseLines).toHaveLength(1);
    expect(baseLines[0]).toMatchObject({ quantity: "1", unit_price: "995", multiplier: "1", line_total: "995", notes: "Package base price" });

    const includedLine = audit.lines.find((line) => line.description === "Post-season removal included");
    expect(includedLine).toMatchObject({ unit_price: "0", line_total: "0", notes: `Included with ${fixture.packageName}` });
    const upgradeLine = audit.lines.find((line) => line.description === fixture.upgradeItemName);
    expect(upgradeLine).toMatchObject({ unit_price: "125", line_total: "125", notes: "Optional paid upgrade" });
    expect(upgradeLine?.catalog_item_id).not.toBeNull();
    expect(audit.quote.subtotal).toBe("1120");
    expect(audit.quote.total).toBe("1120");

    await page.getByRole("link", { name: "Preview Proposal" }).first().click();
    await expect(page.getByRole("heading", { name: "Quote Proposal" })).toBeVisible();
    await expect(page.getByText(fixture.includedItemName, { exact: false })).toBeVisible();
    await expect(page.getByText("$1,120.00", { exact: true })).toBeVisible();

    await page.goto(`/quotes/${quoteId}/edit`);
    await page.getByRole("button", { name: "Save Quote Changes" }).click();
    await expect(page).toHaveURL(new RegExp(`/quotes/${quoteId}\\?updated=1$`));
    audit = await getPackageQuoteAudit(quoteId);
    expect(audit.lines.filter((line) => line.catalog_item_id === null && line.unit === "package" && line.description === fixture.packageName)).toHaveLength(1);
    expect(audit.quote.total).toBe("1120");

    const targetSeason = new Date().getFullYear();
    const jobId = await createPriorSeasonJobForPackageQuote(quoteId, targetSeason);
    await page.goto(`/jobs/${jobId}`);
    await page.getByRole("button", { name: "Generate Materials List" }).click();
    await expect(page).toHaveURL(new RegExp(`/jobs/${jobId}\\?materials=(generated|ready)$`));
    const materials = await getJobMaterialAudit(jobId);
    expect(materials.map((item) => item.description)).toEqual([fixture.upgradeItemName]);
    expect(materials[0].catalog_item_id).not.toBeNull();

    const renewal = await createRenewalQuoteAsUser(ownerEmail, password, jobId, targetSeason);
    expect(renewal.errorCode).toBeNull();
    expect(renewal.quoteId).not.toBeNull();
    const renewalAudit = await getRenewalAudit(renewal.quoteId!);
    expect(renewalAudit.quote.total).toBe("1120");
    expect(renewalAudit.lines.map((line) => ({ description: line.description, unit_price: line.unit_price, line_total: line.line_total })).sort((a, b) => a.description.localeCompare(b.description))).toEqual(
      audit.lines.map((line) => ({ description: line.description, unit_price: line.unit_price, line_total: line.line_total })).sort((a, b) => a.description.localeCompare(b.description)),
    );
    expect(renewalAudit.jobCount).toBe(0);
  } finally {
    if (userId) await cleanupConfirmedTestUser(userId, ownerEmail);
  }
});
