import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { cleanupConfirmedTestUser, createConfirmedTestUser, uniqueTestEmail } from "./support/supabase-admin";

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();
const ownerEmail = uniqueTestEmail(stamp, "primary");
const secondOwnerEmail = uniqueTestEmail(stamp, "secondary");
const customerEmail = uniqueTestEmail(stamp, "customer");
const password = `Holiday!${stamp}`;

function diagnostics(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`);
  });
  return async () => {
    await testInfo.attach("browser-console-errors", { body: consoleErrors.join("\n") || "None", contentType: "text/plain" });
    await testInfo.attach("failed-network-requests", { body: failedRequests.join("\n") || "None", contentType: "text/plain" });
  };
}

async function fillNamed(page: Page, name: string, value: string) {
  await page.locator(`input[name="${name}"], textarea[name="${name}"]`).fill(value);
}

async function loginAndOnboard(page: Page, email: string, businessName: string) {
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
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
  await expect(page.getByRole("main")).toBeVisible();
  const sidebar = page.getByRole("complementary");
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByText(businessName, { exact: true })).toBeVisible();
}

async function addMeasurement(page: Page, visitUrl: string, zone: string, type: string, quantity: string, catalogSearch: string) {
  await page.goto(`${visitUrl}/measurements/new`);
  await fillNamed(page, "zone_name", zone);
  await page.locator('[name="measurement_type"]').selectOption(type);
  await fillNamed(page, "quantity", quantity);
  const combo = page.getByRole("combobox", { name: /^Catalog item/ });
  await combo.fill(catalogSearch);
  const option = page.getByRole("option", { name: new RegExp(catalogSearch, "i") });
  if (await option.count()) await option.click();
  await fillNamed(page, "notes", "Professional installation; seasonal maintenance; labeled takedown and storage.");
  await page.getByRole("button", { name: "Save Measurement" }).click();
  await expect(page).toHaveURL(
    new RegExp(`${visitUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?.*)?$`),
  );
}

test("first-time holiday lighting business completes customer-to-schedule workflow with tenant isolation", async ({ page, context }, testInfo) => {
  const attachDiagnostics = diagnostics(page, testInfo);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("e2eClickCount")) sessionStorage.setItem("e2eClickCount", "0");
    document.addEventListener("click", () => sessionStorage.setItem("e2eClickCount", String(Number(sessionStorage.getItem("e2eClickCount") ?? 0) + 1)), true);
  });
  const stageMetrics: Array<{ stage: string; durationMs: number }> = [];
  const stage = async (name: string, body: () => Promise<void>) => test.step(name, async () => {
    const started = Date.now();
    try { await body(); } finally { stageMetrics.push({ stage: name, durationMs: Date.now() - started }); }
  });
  let primaryUserId = "";
  let secondaryUserId = "";
  let customerUrl = "";
  try {
    await stage("Create confirmed owner and onboard Johnson’s Holiday Lighting", async () => {
      primaryUserId = await createConfirmedTestUser(ownerEmail, password, "Mark", "Johnson");
      await loginAndOnboard(page, ownerEmail, "Johnson’s Holiday Lighting");
    });

    await stage("Load required starter pricing and create warm-white package", async () => {
      await page.goto("/catalog");
      const starter = page
        .getByRole("main")
        .locator("header")
        .getByRole("button", { name: "Load Starter Catalog", exact: true });
      if (await starter.count()) await starter.click();
      await expect(
        page.getByRole("table").getByText("C9 Warm White Roofline Lights", { exact: true }),
      ).toBeVisible();
      await page.goto("/packages/new");
      await fillNamed(page, "name", "Warm-white C9 roofline package");
      await fillNamed(page, "description", "Warm-white C9 roofline, installation, seasonal maintenance, takedown, and storage.");
      await fillNamed(page, "base_price", "1850");
      await fillNamed(page, "recommended_budget_min", "1850");
      await fillNamed(page, "recommended_budget_max", "3200");
      await page.getByRole("button", { name: "Add Package", exact: true }).click();
      await expect(page).toHaveURL(/\/packages\/[0-9a-f-]+/);
    });

    await stage("Create Sarah Miller and her Latrobe property", async () => {
      await page.goto("/customers/new");
      await fillNamed(page, "first_name", "Sarah");
      await fillNamed(page, "last_name", "Miller");
      await fillNamed(page, "phone", "724-555-0182");
      await fillNamed(page, "email", customerEmail);
      await page.getByRole("combobox", { name: "Street", exact: true }).fill("1427 Pine Ridge Drive");
      await fillNamed(page, "billing_city", "Latrobe");
      await fillNamed(page, "billing_state", "PA");
      await fillNamed(page, "billing_zip", "15650");
      await fillNamed(page, "notes", "Warm-white C9 display; installation, maintenance, takedown, and storage requested.");
      await page.getByRole("button", { name: "Add Customer" }).click();
      await expect(page).toHaveURL(/\/customers\/[0-9a-f-]+/);
      customerUrl = new URL(page.url()).pathname;
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${customerUrl}(?:\\?.*)?$`));
      await expect(page.getByRole("heading", { name: "Sarah Miller", exact: true })).toBeVisible();
      await page
        .locator('section[aria-labelledby="properties-title"]')
        .getByRole("link", { name: "Add Property", exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`${customerUrl}/properties/new$`));
      await expect(page.getByRole("heading", { name: "Add Property", exact: true })).toBeVisible();
      await fillNamed(page, "property_name", "Miller Residence");
      await page.getByRole("combobox", { name: /^Address line 1/ }).fill("1427 Pine Ridge Drive");
      await fillNamed(page, "city", "Latrobe");
      await fillNamed(page, "state", "PA");
      await fillNamed(page, "zip", "15650");
      await fillNamed(page, "outlet_notes", "Exterior GFCI outlet near garage; timer required.");
      await page.getByRole("button", { name: "Add Property" }).click();
      await expect(page).toHaveURL(/\/properties\/[0-9a-f-]+/);
    });

    let visitUrl = "";
    await stage("Create site visit and realistic measurements", async () => {
      const propertyUrl = new URL(page.url()).pathname;
      await page.goto(`${propertyUrl}/site-visits/new`);
      await fillNamed(page, "visit_date", "2026-10-10T10:00");
      await fillNamed(page, "budget_discussed", "$2,000–$3,200");
      await page.getByRole("button", { name: "Save Site Visit" }).click();
      await expect(page).toHaveURL(/\/site-visits\/[0-9a-f-]+/);
      visitUrl = new URL(page.url()).pathname;
      await addMeasurement(page, visitUrl, "Main roofline", "Roofline", "168", "C9 Warm White");
      await addMeasurement(page, visitUrl, "Garage outline", "Roofline", "42", "C9 Warm White");
      await addMeasurement(page, visitUrl, "Front shrubs", "Shrub", "4", "Bush Lights");
      await addMeasurement(page, visitUrl, "Front wreaths", "Wreath", "2", "36-inch Wreath");
    });

    let quoteUrl = "";
    await stage("Create quote from package and measurements", async () => {
      await page.goto(`${visitUrl}/quotes/new`);
      const packageOption = page
        .locator('[name="package_id"] option')
        .filter({ hasText: "Warm-white C9 roofline package" });
      await page.locator('[name="package_id"]').selectOption(await packageOption.getAttribute("value") ?? "");
      for (const button of await page.getByRole("button", { name: "Add to Quote" }).all()) await button.click();
      await fillNamed(page, "customer_notes", "Includes installation, seasonal maintenance, takedown, and storage.");
      await page.getByRole("button", { name: "Save Draft Quote" }).click();
      await expect(page).toHaveURL(/\/quotes\/[0-9a-f-]+/);
      quoteUrl = new URL(page.url()).pathname;
      await expect(page.getByText("Sarah Miller · Miller Residence", { exact: true })).toBeVisible();
    });

    await stage("Generate, view, and approve customer proposal", async () => {
      const generate = page.getByRole("button", { name: "Generate Proposal Link" });
      if (await generate.count()) await generate.click();
      await page
        .getByRole("main")
        .locator("header")
        .getByRole("link", { name: "Preview Proposal", exact: true })
        .click();
      await expect(page.getByText("Authenticated proposal preview")).toBeVisible();
      const customerLink = page.getByRole("link", { name: "Open Customer Link" });
      const href = await customerLink.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href!);
      await fillNamed(page, "customer_name", "Sarah Miller");
      await fillNamed(page, "customer_email", customerEmail);
      await page.locator('[name="approval_confirmed"]').check();
      await page.getByRole("button", { name: "Approve Proposal" }).click();
      await expect(page.getByText("Proposal approved. Thank you.", { exact: true })).toBeVisible();
      await page.goto(quoteUrl);
      await expect(page.getByText("approved", { exact: true })).toBeVisible();
    });

    let jobUrl = "";
    await stage("Convert approved quote and schedule installation and takedown", async () => {
      await page.getByRole("link", { name: "Convert to Job" }).click();
      await fillNamed(page, "install_date", "2026-11-14");
      await fillNamed(page, "install_time_window", "8–11 AM");
      await fillNamed(page, "takedown_date", "2027-01-09");
      await fillNamed(page, "takedown_time_window", "9 AM–Noon");
      await fillNamed(page, "storage_notes", "Label roofline, garage, shrubs, and wreaths; store in customer bins.");
      await page.getByRole("button", { name: "Create Job" }).click();
      await expect(page).toHaveURL(/\/jobs\/[0-9a-f-]+/);
      jobUrl = new URL(page.url()).pathname;
      await expect(page.getByRole("link", { name: "Sarah Miller", exact: true })).toBeVisible();
      await expect(page.getByText("2026-11-14", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("2027-01-09", { exact: true }).first()).toBeVisible();
      await page.goto("/schedule?view=upcoming");
      await expect(page.getByRole("heading", { name: "Schedule", exact: true })).toBeVisible();

      const installSection = page
        .getByRole("heading", { name: /November 14, 2026$/ })
        .locator("..");
      await expect(installSection.getByText("Install", { exact: true })).toBeVisible();
      await expect(installSection.getByText("Sarah Miller", { exact: true })).toBeVisible();
      await expect(installSection.getByText("Miller Residence", { exact: true })).toBeVisible();
      await expect(installSection.getByRole("link", { name: "Job", exact: true })).toBeVisible();

      const takedownSection = page
        .getByRole("heading", { name: /January 9, 2027$/ })
        .locator("..");
      await expect(takedownSection.getByText("Takedown", { exact: true })).toBeVisible();
      await expect(takedownSection.getByText("Sarah Miller", { exact: true })).toBeVisible();
      await expect(takedownSection.getByText("Miller Residence", { exact: true })).toBeVisible();
      await expect(takedownSection.getByRole("link", { name: "Job", exact: true })).toBeVisible();
      expect(jobUrl).toBeTruthy();
    });

    await stage("Verify a second business cannot access the first business records", async () => {
      await context.clearCookies();
      secondaryUserId = await createConfirmedTestUser(secondOwnerEmail, password, "Alex", "Owner");
      await loginAndOnboard(page, secondOwnerEmail, "Evergreen Holiday Lighting");
      await page.goto(customerUrl);
      await expect(page.getByText("Sarah Miller")).not.toBeVisible();
      await expect(page.getByText(/not found|could not find/i)).toBeVisible();
    });
  } finally {
    const clickCount = await page.evaluate(() => Number(sessionStorage.getItem("e2eClickCount") ?? 0)).catch(() => -1);
    await testInfo.attach("workflow-metrics", { body: JSON.stringify({ clickCount, stages: stageMetrics }, null, 2), contentType: "application/json" });
    await attachDiagnostics();
    const cleanupErrors: string[] = [];
    if (secondaryUserId) await cleanupConfirmedTestUser(secondaryUserId, secondOwnerEmail).catch((error) => cleanupErrors.push(String(error)));
    if (primaryUserId) await cleanupConfirmedTestUser(primaryUserId, ownerEmail).catch((error) => cleanupErrors.push(String(error)));
    if (cleanupErrors.length) await testInfo.attach("cleanup-errors", { body: cleanupErrors.join("\n"), contentType: "text/plain" });
  }
});
