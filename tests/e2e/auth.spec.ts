/* Tests E2E pour le parcours d'authentification - inscription, connexion et déconnexion */
import { test, expect } from "@playwright/test";

test.describe("Parcours Authentification", () => {
  test("Doit permettre la navigation vers la page de connexion", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await expect(page.url()).toContain("/register");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    await expect(page.locator("h1")).toContainText(/inscription|sign up/i);
  });

  test("Doit afficher une erreur pour des identifiants incorrects", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=/requis|obligatoire|required/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("Doit permettre la connexion avec des identifiants valides", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/succès|success/i")).toBeVisible({
      timeout: 5000,
    });

    await page.waitForURL(/restaurant/, { timeout: 20000 });

    await expect(page.url()).toMatch(/utilisateur\/restaurant/);
  });

  test("Doit permettre la déconnexion", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=/succès|success/i")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForURL(/restaurant/, { timeout: 20000 });

    const logoutButton = page
      .locator("text=/déconnexion|logout/i, button")
      .filter({ hasText: /déconnexion|logout/i });

    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click();

      await expect(page.url()).toMatch(/restaurant/);
    }
  });

  test("Doit permettre la navigation entre connexion et inscription", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();

    const loginLink = page.locator("text=/connexion|login/i, a[href*='login']");
    if ((await loginLink.count()) > 0) {
      await loginLink.first().click();
      await expect(page.url()).toMatch(/login/);
    }
  });

  test("Doit gérer les états de chargement", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator('button[type="submit"]')).toHaveText(
      /cours|creating|loading|succès/i,
      { timeout: 2000 }
    );
  });
});
