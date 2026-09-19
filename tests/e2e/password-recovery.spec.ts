import { expect, test } from "@playwright/test";

test("password recovery screens are available without sending an email", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");

  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Log In" })).toHaveAttribute("href", "/login");

  await page.goto("/auth/callback?next=/reset-password");
  await expect(page).toHaveURL(/\/forgot-password\?error=invalid-or-expired$/);
  await expect(page.getByText("That recovery link is invalid, expired, or has already been used.")).toBeVisible();

  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Recovery link expired" })).toBeVisible();
  await expect(page.getByText("Request a new recovery email to continue securely.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Request New Recovery Email" })).toHaveAttribute("href", "/forgot-password");
});
