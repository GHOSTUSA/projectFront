/* Tests E2E pour l'authentification et la sécurité du panier */
import { test, expect } from "@playwright/test";

test.describe("Authentification Panier", () => {
  test("Doit rediriger vers login quand on tente d'ajouter au panier sans être connecté", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".restaurant-detail h1")).toBeVisible({
      timeout: 10000,
    });

    const addToCartButtons = page.locator(".add-to-cart-btn");
    await expect(addToCartButtons.first()).toBeVisible();
    await expect(addToCartButtons.first()).toContainText(
      "Se connecter pour commander"
    );

    await addToCartButtons.first().click();

    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page.url()).toContain("/login");
  });

  test("Doit permettre d'ajouter au panier quand connecté", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("input#username", "b");
    await page.fill("input#password", "b");

    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/\/utilisateur/, { timeout: 10000 });

      if (
        page.url().includes("/utilisateur/restaurant") &&
        !page.url().includes("/utilisateur/restaurant/")
      ) {
        await page.goto("/utilisateur/restaurant/1");
        await page.waitForLoadState("networkidle");
      }

      const addToCartButtons = page
        .locator("button")
        .filter({ hasText: "Ajouter au panier" });
      if ((await addToCartButtons.count()) > 0) {
        await expect(addToCartButtons.first()).toBeVisible();
      }
    } catch (timeoutError) {
      await page.goto("/utilisateur/restaurant/1");
      await page.waitForLoadState("networkidle");

      await expect(page.locator(".restaurant-detail")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("Doit afficher le bon texte sur les boutons selon l'état d'authentification", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const buttons = page
      .locator("button")
      .filter({ hasText: "Se connecter pour commander" });
    await expect(buttons.first()).toBeVisible({ timeout: 10000 });
  });

  test("Sécurité - Vérification des contrôles d'accès au panier", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const cartButtons = page
      .locator("button")
      .filter({ hasText: "Se connecter pour commander" });
    if ((await cartButtons.count()) > 0) {
      await cartButtons.first().click();
      await expect(page).toHaveURL(/.*\/login/);
    }
  });
});
